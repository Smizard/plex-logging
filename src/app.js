const express = require('express')
const { Client } = require('tplink-smarthome-api');
const multer = require('multer');

const approvedClients = {
    'idifl20vxca': true,
    'dt98qp3q68mvw2rhy9yijrbp': true,
};

var upload = multer({ dest: '../temp/' });

var app = express();
app.post('/', upload.single('thumb'), (req, res, next)=>{
    res.sendStatus(200);
    
    var payload = JSON.parse(req.body.payload);
    console.log(payload);
    run(payload);
});
app.listen(12035);

async function run(payload) {
    if (!approvedClients[payload.Player.uuid]) {
	return;
    }
    const client = new Client();
    const device = await client.getDevice({host: '192.168.1.85'});

    switch (payload.event) {
        case 'media.play':
        case 'media.resume': {
	    device.setPowerState(false);
	    break;
        }
        case 'media.stop':
        case 'media.pause': {
	    device.setPowerState(true);
	    break;
        }
    }
}
