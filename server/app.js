const cv = require('opencv4nodejs');
const path = require('path');
const express = require('express');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const cors = require('cors');
const ydl = require('youtube-dl');
const _ = require('lodash');
const axios = require('axios').default;

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
const frame_reduction_factor = 0.7 // factor by which frame is reduced from 1920x1080 on FE

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

app.use(express.json({
  limit: "50mb"
})); // to support JSON-encoded bodies, see: https://stackoverflow.com/questions/5710358/how-to-retrieve-post-query-parameters
app.use(express.urlencoded({
  extended: true,
  limit: "50mb"
})); // to support URL-encoded bodies, see: https://stackoverflow.com/questions/5710358/how-to-retrieve-post-query-parameters
app.use(cors()); // to support CORS

//app.get('/', (req, res) => {
//    res.sendFile(path.join(__dirname, 'index.html'));
//});
app.get('/streams', function(req, res) {
	_.each(streams, function (stream) {
		frame = wCap.read();
    console.log(frame);
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

// POST, predict/one
app.post('/predict/one', async function(req, res) {
  try {
    // resize image to original size and convert base64 encoded string data to Mat for use with opencv: https://github.com/justadudewhohacks/opencv4nodejs
    base64_data = req.body.frame.data.replace('data:image/jpeg;base64','');
    frame_buffer = Buffer.from(base64_data, 'base64');
    cv_frame = cv.imdecode(frame_buffer);
		cv_frame = cv_frame.resize(1080, 1920); // resize to original frame size (front-end alters size to fit page)
  
    // scale coordinates of selection to match original 1920x1080 frame instead of downsized frame in FE
    // round to nearest integer
    rect_coords_adjusted = {
      x: Math.round(req.body.rect.x * (1 / frame_reduction_factor)),
      y: Math.round(req.body.rect.y * (1 / frame_reduction_factor)),
      h: Math.round(req.body.rect.h * (1 / frame_reduction_factor)),
      w: Math.round(req.body.rect.w * (1 / frame_reduction_factor))
    };

    x1 = rect_coords_adjusted.x; 
    y1 = rect_coords_adjusted.y;
    x2 = rect_coords_adjusted.x + rect_coords_adjusted.w;
    y2 = rect_coords_adjusted.y + rect_coords_adjusted.h;

    // grab selection based on rect from frame
    selection_img = cv_frame.getRegion(new cv.Rect(x1, y1, rect_coords_adjusted.w, rect_coords_adjusted.h));
    
    // base64 encode to transmit over network
		const selection_enc = cv.imencode('.jpg', selection_img).toString('base64'); 

    // send request to model api
    const json_payload = {
      K: req.body.frame.K, 
      id: req.body.frame.id, 
      height: rect_coords_adjusted.h, 
      width: rect_coords_adjusted.w, 
      depth: req.body.frame.depth,
      image: selection_enc 
    };
    const model_response = await axios.post('http://localhost:8000/eval', json_payload);

    // return model api response
    res.json(model_response.data);
  } catch (error) {
    console.error(error);
  }
});

// GET, simple route for testing model api
app.get('/quote', async function(req, res) {
  try {
    const response = await axios.get('http://localhost:8000/quote');
    console.log(response);
    res.json(response['data']);
  } catch (error) {
    console.error(error);
  }
});

/* 
Ports:
	React client: 3000 (implicit when running 'nodemon app' from client directory)
	Express app: 4000
	http server: 5000
  Model api server: 8000
*/
server.listen(5000, () => {
	console.log('Server listening on port 5000!');
});
app.listen(4000, () => {
	console.log('App listening on port 4000!');
});
