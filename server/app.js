const cv = require('opencv4nodejs');
const path = require('path');
const express = require('express');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const cors = require('cors');
const ydl = require('youtube-dl');
const _ = require('lodash');

const streams = [
    {
        id: 0,
        poster: '/stream/0/poster',
        name: 'Reef Lagoon'
    }
];

var hls_link = null;
var wCap = null;
var frame = null;
var frameEncoded = null;
const height = 1080;
const width = 1920;
const FPS = 30;
const youtube_url = "https://www.youtube.com/watch?v=1nWGig6pQ7Q&feature=emb_title&ab_channel=CaliforniaAcademyofSciences";

/* Extract the HLS link for the youtube livestream so that we can intercept it.
	We need to extract this automatically since the hls link will expire after few hours. */
ydl.exec(youtube_url, ['--format=96', '-g'], {}, (err, output) => {
	if (err) throw err

	console.log('\nyoutube-dl finished HLS link extraction:');
	console.log(output.join('\n'));
	console.log('\n');
	hls_link = output[0];
	wCap = new cv.VideoCapture(hls_link);//0);//"/home/nightrider/Videos/mashup.mp4");
	wCap.set(cv.CAP_PROP_FRAME_WIDTH, width);
	wCap.set(cv.CAP_PROP_FRAME_HEIGHT, height);

	// emit captured livestream video frame-by-frame and emit each frame at specified interval using socket.io 
	setInterval(() => {
		// read raw frame
		frame = wCap.read();

		// encode frame for efficient transfer to clients
		frameEncoded = cv.imencode('.jpg', frame).toString('base64');
		
		// emit frame
		io.emit('image', frameEncoded);
	}, 1000 / FPS)
});

//app.get('/', (req, res) => {
//    res.sendFile(path.join(__dirname, 'index.html'));
//});
app.use(cors());
app.get('/streams', function(req, res) {
	_.each(streams, function (stream) {
		frame = wCap.read();
		//cv.imshow('thumbnail', frame);
		//cv.waitKey(0);
		const frameMat = new cv.Mat(frame, cv.CV_8UC3);
		frame = frame.resize(1080, 1920);
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

server.listen(5000, () => {
	console.log('Server listening on port 5000!');
});
app.listen(4000, () => {
	console.log('App listening on port 4000!');
});
