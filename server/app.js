const cv = require('opencv4nodejs');
const path = require('path');
const express = require('express');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const cors = require('cors');
const _ = require('lodash');

const streams = [
    {
        id: 0,
        poster: '/stream/0/poster',
        name: 'Reef Lagoon'
    }
];

const hls_link = "https://manifest.googlevideo.com/api/manifest/hls_playlist/expire/1602064394/ei/qjt9X9-YE8-AsfIPrZSa2AY/ip/98.207.8.218/id/1nWGig6pQ7Q.1/itag/96/source/yt_live_broadcast/requiressl/yes/ratebypass/yes/live/1/goi/160/sgoap/gir%3Dyes%3Bitag%3D140/sgovp/gir%3Dyes%3Bitag%3D137/hls_chunk_host/r2---sn-n4v7knlk.googlevideo.com/playlist_duration/30/manifest_duration/30/vprv/1/playlist_type/DVR/initcwndbps/17400/mh/18/mm/44/mn/sn-n4v7knlk/ms/lva/mv/m/mvi/2/pl/21/dover/11/keepalive/yes/fexp/23915654/mt/1602042675/disable_polymer/true/sparams/expire,ei,ip,id,itag,source,requiressl,ratebypass,live,goi,sgoap,sgovp,playlist_duration,manifest_duration,vprv,playlist_type/sig/AOq0QJ8wRgIhALxnfi0XZLZjFeNtO96eDCq5DSKWhw3PFp9rckmsMDz-AiEA7oF-Ia2UnGoQb67yceQrF0-0t0BzXG6LAPuoJfFH6UM%3D/lsparams/hls_chunk_host,initcwndbps,mh,mm,mn,ms,mv,mvi,pl/lsig/AG3C_xAwRgIhAKgvEYHDORRpHb9Mycnx0PlQTXHkHfhSyoNTlS1Kba45AiEAl3FvBvAdHhAymuRWMYOaMNwYVVsTNNYtVVh3cgnD0n8%3D/playlist/index.m3u8";
const wCap = new cv.VideoCapture(hls_link);//0);//"/home/nightrider/Videos/mashup.mp4");

const FPS = 30;

wCap.set(cv.CAP_PROP_FRAME_WIDTH, 1920);
wCap.set(cv.CAP_PROP_FRAME_HEIGHT, 1080);

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});
app.use(cors());
app.get('/streams', function(req, res) {
	_.each(streams, function (stream) {
		frame = wCap.read();
		//cv.imshow('thumbnail', frame);
		//cv.waitKey(0);
		const frameMat = new cv.Mat(frame, cv.CV_8UC3);
		frame = frame.resize(200, 1920);
		const frameEnc = cv.imencode('.jpg', frame).toString('base64');
		streams[stream.id].poster = frameEnc
	});
	res.json(streams);
});
app.get('/stream/:id/data', function(req, res) {
    const id = parseInt(req.params.id, 10);
    res.json(streams[id]);
});
app.get('/stream/:id/poster', function(req, res) {
    //thumbsupply.generateThumbnail(`assets/${req.params.id}.mp4`)
    //.then(thumb => res.sendFile(thumb))
		const frame = wCap.read();
		const frameEnc = cv.imencode('.jpg', frame).toString('base64');
		//cv.imshow('thumbnail', frame);
		//cv.waitKey(0);
		res.send(`data:image/jpeg;base64,${frameEnc}`);
});

setInterval(() => {
  const frame = wCap.read();
  const frameEnc = cv.imencode('.jpg', frame).toString('base64');
	
  io.emit('image', frameEnc);
}, 1000 / FPS)

server.listen(5000);
app.listen(4000, function() {
	console.log('Listening on port 4000!');
});
