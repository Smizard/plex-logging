const express = require('express')
const { Client } = require('tplink-smarthome-api');
const multer = require('multer');
const config = require('./config.json');
const db_config = require('./db_config.json');
const upload = multer({ dest: '../temp/' });
const fs = require('fs');
const mysql = require('mysql');

var con;

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

//con.connect((err) => {
//    if (err) {
//	throw err;
//    }
//    console.log("DB Connected");
//});

function logEvent(payload) {
    handleDB(payload);
    
    console.log("Timestamp:\t" + new Date());
    console.log("Event Type:\t" + payload.event);
    console.log("Account Title:\t" + payload.Account.title);
    console.log("Player Title:\t" + payload.Player.title);
    console.log("Media Title:\t" + payload.Metadata.title);
//    console.log("Metadata:\t" + JSON.stringify(payload.Metadata));
}

function handleDB(payload) {
    insertUser(payload.Account);
    insertPlayer(payload.Player);
    
    var metadata = payload.Metadata;    
    switch (metadata.type) {
    case 'movie':
	insertMovie(metadata);
	break;
    }
}

function insertUser(account) {
    var sql = "INSERT INTO Users " +
	"(ID, Title) " +
	"VALUES(" + account.id +
	", '" + account.title + "')" +
	"ON DUPLICATE KEY UPDATE LastUpdate=CURRENT_TIMESTAMP";
    con.query(sql, (err, result) => {
	if (err) {
	    throw err;
	}
	console.log("INSERT RESULT: " + JSON.stringify(result));
    });
}

function insertPlayer(player) {
    var sql = "INSERT INTO Players " +
	"(ID, Title) " +
	"VALUES('" + player.uuid +
	"', '" + player.title + "') " +
	"ON DUPLICATE KEY UPDATE Title='" + player.title + "'";
    con.query(sql, (err, result) => {
	if (err) {
	    throw err;
	}
	console.log("INSERT RESULT: " + JSON.stringify(result));
    });
}

function insertMovie(metadata) {
    var sql = "INSERT INTO Movies " +
	"(ID, Title, Duration, Year, Rating, ContentRating) " +
	"VALUES('" + parseGUID(metadata.guid) +
	"','" + metadata.title +
	"', " + metadata.duration +
	", " + metadata.year +
	", " + metadata.rating +
	", '" + metadata.contentRating + "') " +
	"ON DUPLICATE KEY UPDATE " +
	"Rating=" + metadata.rating + ", " +
	"LastUpdate=CURRENT_TIMESTAMP";
    con.query(sql, (err, result) => {
	if (err) {
	    throw err;
	}
	console.log("INSERT RESULT: " + JSON.stringify(result));
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
