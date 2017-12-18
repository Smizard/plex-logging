const express = require('express')
const { Client } = require('tplink-smarthome-api');
const multer = require('multer');
const config = require('./config.json');
const upload = multer({ dest: '../temp/' });
const fs = require('fs');
const mysql = require('mysql');

const con = mysql.createConnection({
    host: "localhost",
    user: "plexLogger",
    password: "loggerpassword",
    database: "plexlogtest"
});

var app = express();
app.post('/', upload.single('thumb'), (req, res, next)=>{
    res.sendStatus(200);

    var payload = JSON.parse(req.body.payload);

    logEvent(payload);
    changeLights(payload).catch((err)=>{console.log(err)});
});
app.listen(12035);
console.log("Listening");

con.connect((err) => {
    if (err) {
	throw err;
    }
    console.log("DB Connected");
});

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
    var metadata = payload.Metadata;
    switch (metadata.type) {
    case 'movie':
	insertMovie(metadata);
	break;
    }
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
	"ON DUPLICATE KEY UPDATE Rating=" +
	metadata.rating + ", LastUpdate=CURRENT_TIMESTAMP";
    con.query(sql, (err, result) => {
	if (err) {
	    throw err;
	}
	console.log("INSERT RESULT" + JSON.stringify(result));
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
