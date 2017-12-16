const express = require('express')
const { Client } = require('tplink-smarthome-api');
const multer = require('multer');
const config = require('./config.json');
const upload = multer({ dest: '../temp/' });
const fs = require('fs');

var app = express();
app.post('/', upload.single('thumb'), (req, res, next)=>{
    res.sendStatus(200);

    var payload = JSON.parse(req.body.payload);
    console.log("Timestamp:\t" + new Date());
    console.log("Event Type:\t" + payload.event);
    console.log("Account Title:\t" + payload.Account.title);
    console.log("Player Title:\t" + payload.Player.title);
    console.log("Media Title:\t" + payload.Metadata.title);
    
//    fs.appendFile("request.log", JSON.stringify(payload), function(err) {
//	if (err) {
//	    return console.log(err);
//	}
//    });

    run(payload).catch((err)=>{console.log(err)});
});
app.listen(12035);

async function run(payload) {
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
