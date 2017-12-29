const express = require('express')
const { Client } = require('tplink-smarthome-api');
const multer = require('multer');
const config = require('./config.json');
const db_config = require('./db_config.json');
const upload = multer({ dest: '../temp/' });
const fs = require('fs');
const mysql = require('mysql');

var con;

var app = express();
app.post('/', upload.single('thumb'), (req, res, next)=>{
    res.sendStatus(200);

    var payload = JSON.parse(req.body.payload);

    logEvent(payload);
    changeLights(payload).catch((err)=>{console.log(err)});
});
app.listen(12035);
console.log("Listening");
handleDisconnect();

function handleDisconnect() {
    con = mysql.createConnection(db_config);
    con.connect(function(err) {
	if(err) {
	    console.log("DB CONNECTION ERROR: " +  err);
	    setTimeout(handleDisconnect, 2000);
	}
	console.log("DB Connected");
    });
    con.on('error', (err) => {
	console.log("DB ERROR: " + err);
	if(err.code === 'PROTOCOL_CONNECTION_LOST') {
	    handleDisconnect();
	} else {
	    throw err;
	}
    });
}

var map = {};

function logEvent(payload) {
    var event = payload.event;
    var key = payload.Account.id + payload.Player.uuid;
    var watchLogArray = map[key] || [];
    switch(event) {
    case 'media.play':
	// Clear data just in case.
	watchLogArray = [];
	watchLogArray.push(new Date());
	watchLogArray.push(0);
	break;
    case 'media.resume':
	watchLogArray[0] = new Date();
	break;
    case 'media.pause':
	watchLogArray[1] += new Date() - watchLogArray[0];
	break;
    case 'media.stop':
	watchLogArray[1] += new Date() - watchLogArray[0];
	// TODO: PUT IN DATABASE

	watchLogArray = [];
	break;
    case 'media.scrobbled':
	watchLogArray.push(true);
	watchLogArray.push(new Data());
	break;
    }

    console.log(watchLogArray);
    map[key] = watchLogArray;
    
    handleDB(payload);
    
    console.log("Timestamp:\t" + new Date());
    console.log("Event Type:\t" + event);
    console.log("Account Title:\t" + payload.Account.title);
    console.log("Player Title:\t" + payload.Player.title);
    console.log("Media Title:\t" + payload.Metadata.title);
}

function handleDB(payload) {
    insertUser(payload.Account);
    insertPlayer(payload.Player);
    
    var metadata = payload.Metadata;    
    switch (metadata.type) {
    case 'movie':
	insertMovie(metadata);
	break;
    case 'episode':
	insertShow(metadata);
	break;
    }
}

function insertUser(account) {
    var sql = "INSERT INTO Users " +
	"(ID, Title) " +
	"VALUES(?, ?)" +
	"ON DUPLICATE KEY UPDATE LastUpdate=CURRENT_TIMESTAMP";
    con.query(sql, [account.id, account.title], (err, result) => {
	if (err) throw err;
    });
}

function insertPlayer(player) {
    var sql = "INSERT INTO Players " +
	"(ID, Title) " +
	"VALUES(?, ?)" +
	"ON DUPLICATE KEY UPDATE Title=?, LastUpdate=CURRENT_TIMESTAMP";
    con.query(sql, [player.uuid, player.title, player.title], (err, result) => {
	if (err) {
	    throw err;
	}
    });
}

function insertMovie(metadata) {
    var sql = "INSERT INTO Movies " +
	"(ID, Title, Duration, Year, Rating, ContentRating) " +
	"VALUES(?, ?, ?, ?, ?, ?)" +
	"ON DUPLICATE KEY UPDATE " +
	"Rating=?," +
	"LastUpdate=CURRENT_TIMESTAMP";
    con.query(sql, [parseGUID(metadata.guid), metadata.title, metadata.duration, metadata.year, metadata.rating, metadata.contentRating, metadata.rating], (err, result) => {
	if (err) throw err;
    });
}

function insertShow(metadata) {
    var sql = "INSERT INTO TVShows " +
	"(ID, Title, Year, Rating, ContentRating) " +
	"VALUES(?, ?, ?, ?, ?) " +
	"ON DUPLICATE KEY UPDATE " +
	"Rating=?, LastUpdate=CURRENT_TIMESTAMP";
    con.query(sql, [parseGUID(metadata.guid), metadata.grandparentTitle, metadata.year, metadata.rating, metadata.contentRating, metadata.rating], (err, result) => {
	if (err) throw err;
    });
    
    sql = "INSERT INTO Episodes " +
	"(Season, TSID, Title, Episode)" +
	"VALUES(?, ?, ?, ?) " +
	"ON DUPLICATE KEY UPDATE " +
	"LastUpdate=CURRENT_TIMESTAMP";
    con.query(sql, [metadata.parentIndex, parseGUID(metadata.guid), metadata.title, metadata.index], (err, result) => {
	if (err) throw err;
    });
}

function parseGUID(id) {
    var res = id.match(/(:\/\/)([0-9a-zA-Z]+)(\?|\/)/);
    return res[2];
}

async function changeLights(payload) {
    if (!config.AprovedClients[payload.Player.uuid]) {
	console.log("LIGHTS NOT APPROVED");
	return;
    }
    
    const client = new Client();
    const device = await client.getDevice({host: config.Host});

    switch (payload.event) {
    case 'media.play':
    case 'media.resume':
	device.setPowerState(false);
	console.log("Lights :: OFF");
	break;
    case 'media.stop':
    case 'media.pause':
	device.setPowerState(true);
	console.log("Lights :: ON");
	break;
    }
}

