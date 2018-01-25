const express = require('express')
const multer = require('multer');
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
});
app.listen(12035);
console.log("Listening: 12035");
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
    handleDB(payload);
    
    var timestamp = new Date();
    var event = payload.event;
    var key = payload.Account.id + payload.Player.uuid;
    var watchLogArray = map[key] || {};
    switch(event) {
    case 'media.play':
	// Clear data just in case.
	watchLogArray = {};
	watchLogArray.startTime = timestamp;
	watchLogArray.lastTime = timestamp;
	watchLogArray.duration = 0;
	break;
    case 'media.resume':
	if (!watchLogArray.startTime) {
	    watchLogArray.startTime = timestamp;
	}
	if (watchLogArray.duration < 0 || isNaN(watchLogArray.duration)) {
	    watchLogArray.duration = 0;
	}
	watchLogArray.lastTime = timestamp;
	break;
    case 'media.pause':
	watchLogArray.duration += timestamp - watchLogArray.lastTime;
	break;
    case 'media.stop':
	watchLogArray.duration += timestamp - watchLogArray.lastTime;

	if (watchLogArray.startTime && !isNaN(watchLogArray.duration)) {
	    handleWatches(watchLogArray, payload);	    
	}

	console.log(watchLogArray);
	watchLogArray = {};
	break;
    case 'media.scrobble':
	watchLogArray.scrobbled = true;
	break;
    }

    console.log(watchLogArray);
    map[key] = watchLogArray;
    
    
    console.log("Timestamp:\t" + timestamp);
    console.log("Event Type:\t" + event);
    console.log("Account Title:\t" + payload.Account.title);
    console.log("Player Title:\t" + payload.Player.title);
    console.log("Media Title:\t" + payload.Metadata.title);
}

function handleWatches(watchLogArray, payload) {
    switch (payload.Metadata.type) {
    case 'movie':
	var sql = "INSERT INTO MovieWatches " +
		"(StartTime, UID, MID, PID, Duration, Scrobbled) " +
		"VALUES(?, ?, ?, ?, ?, ?)";
	    con.query(sql, [watchLogArray.startTime, payload.Account.id, parseGUID(payload.Metadata.guid), payload.Player.uuid, watchLogArray.duration, watchLogArray.scrobbled], (err, result) => {
		if (err) throw err;
	    });
	break;
    case 'episode':
	var sql = "INSERT INTO TVShowWatches " +
		"(StartTime, UID, TSID, PID, EID, Duration, Scrobbled) " +
		"VALUES(?, ?, ?, ?, ?, ?, ?)";
	con.query(sql, [watchLogArray.startTime, payload.Account.id, parseGUID(payload.Metadata.guid), payload.Player.uuid, payload.Metadata.index, watchLogArray.duration, watchLogArray.scrobbled], (err, result) => {
		if (err) throw err;
	});
	break;
    }
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
	"VALUES(?, ?) " +
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
	"VALUES(?, ?, ?, ?, ?, ?) " +
	"ON DUPLICATE KEY UPDATE " +
	"Rating=?, " +
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
	"(Season, TSID, Title, Episode) " +
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

