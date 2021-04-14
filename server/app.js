// environment variables
const dotenv = require('dotenv').config({path: __dirname + '/.env'});
const dotenvExpand = require('dotenv-expand');
dotenvExpand(dotenv);

// miscellaneous
const fs = require('fs');
const cv = require('opencv4nodejs');
const path = require('path');
const express = require('express');
const app = express();
const http = require('http');
const cors = require('cors');
const ydl = require('youtube-dl');
const _ = require('lodash');
const axios = require('axios').default;
const { fork } = require('child_process');

var streams = require('./streams.json');

// youtube-dl variables
var hls_link = null;
const height = 1080;
const width = 1920;
const FPS = 30;

// socket.io is slow for multiple streams at same FPS, so we slow the second stream down TODO: fix this problem
const FPS_reduction = 1; 

// most useful for handling when youtube-dl fails
process.on('unhandledRejection', (reason, p) => {
  console.error('Unhandled Rejection at:', p, 'reason:', reason)
  process.exit(1)
});

// initialize video file streams
// this saves time when requesting thumbnails for the streams
console.log('Initializing streams for thumbnails');
_.each(streams, function (stream) {
  if (stream.type === "stream") {
    ydl.exec(stream.url, ['--format=96', '-g'], {}, (err, output) => {
      if (err) throw err

      console.log('\nyoutube-dl finished HLS link extraction:');
      console.log(output.join('\n'));
      console.log('\n');
      hls_link = output[0];
      stream.vCap = new cv.VideoCapture(hls_link);//0);//"/home/nightrider/Videos/mashup.mp4");
      stream.vCap.set(cv.CAP_PROP_FRAME_WIDTH, width);
      stream.vCap.set(cv.CAP_PROP_FRAME_HEIGHT, height);
    });
  } else if (stream.type === "file") {
    stream.vCap = new cv.VideoCapture(__dirname + stream.url);
    stream.vCap.set(cv.CAP_PROP_FRAME_WIDTH, width);
    stream.vCap.set(cv.CAP_PROP_FRAME_HEIGHT, height);
  }
});

// create directories to hold user feedback
console.log('Initializing feedback directories');
const feedback_dir = "./feedback";
const predict_one_feedback_dir = path.join(feedback_dir, "predict-one");

if (!fs.existsSync(feedback_dir)) {
  fs.mkdirSync(feedback_dir);
}
if (!fs.existsSync(predict_one_feedback_dir)) {
  fs.mkdirSync(predict_one_feedback_dir);
}

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

// GET, /streams
app.get('/streams', function(req, res) {
  var frame = null;
  var frameEnc = null;
	_.each(streams, function (stream) {
    if (stream.type === "stream") {
      frame = stream.vCap.read();
      frame = frame.resize(1080, 1920);
      frameEnc = cv.imencode('.jpg', frame).toString('base64');
      streams[stream.id].poster = frameEnc;
    } else if (stream.type === "file") {
      frame = stream.vCap.read();
      frame = frame.resize(1080, 1920);
      frameEnc = cv.imencode('.jpg', frame).toString('base64');
      streams[stream.id].poster = frameEnc;
    }
	});
	res.json(streams);
});

// GET, /stream/:id/data
app.get('/stream/:id/data', function(req, res) {
  const id = parseInt(req.params.id, 10);
  res.json(streams[id]);
});

//// GET, /stream/:id/poster
//app.get('/stream/:id/poster', function(req, res) {
//  //thumbsupply.generateThumbnail(`assets/${req.params.id}.mp4`)
//  //.then(thumb => res.sendFile(thumb))
//  const frame = vCap.read();
//  const frameEnc = cv.imencode('.jpg', frame).toString('base64');
//  //cv.imshow('thumbnail', frame);
//  //cv.waitKey(0);
//  res.send(`data:image/jpeg;base64,${frameEnc}`);
//});

// GET, /predict/num-classes 
app.get('/predict/num-classes', async function(req, res) {
  try {
    const response = await axios.get(`http://${process.env.REACT_APP_MODEL_SERVER_IP}:${process.env.REACT_APP_MODEL_SERVER_PORT}/num-classes`);
    res.json(response.data);
  } catch (error) {
    console.error(error);
  }
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
    const frame_reduction_factor = req.body.frame.height / 1080;
    rect_coords_adjusted = {
      x: Math.round(req.body.rect.x * (1 / frame_reduction_factor)),
      y: Math.round(req.body.rect.y * (1 / frame_reduction_factor)),
      h: Math.round(req.body.rect.h * (1 / frame_reduction_factor)),
      w: Math.round(req.body.rect.w * (1 / frame_reduction_factor))
    };

    // Need to switch start and end coordinates of rect in case the h or w is negative.  
    // This can happen if the rect is drawing from right-to-left instead of left-to-right.
    if (rect_coords_adjusted.w < 0) {
      rect_coords_adjusted.x = rect_coords_adjusted.x + rect_coords_adjusted.w;
      rect_coords_adjusted.w = Math.abs(rect_coords_adjusted.w);
    } 
    if (rect_coords_adjusted.h < 0) {
      rect_coords_adjusted.y = rect_coords_adjusted.y + rect_coords_adjusted.h;
      rect_coords_adjusted.h = Math.abs(rect_coords_adjusted.h);
    } 

    // grab selection based on rect from frame
    selection_img = cv_frame.getRegion(new cv.Rect(rect_coords_adjusted.x, rect_coords_adjusted.y, rect_coords_adjusted.w, rect_coords_adjusted.h));
    
    // base64 encode to transmit over network
		const selection_enc = cv.imencode('.jpg', selection_img).toString('base64'); 

    // send request to model api
    const json_payload = {
      K: req.body.frame.K, 
      id: req.body.frame.id, 
      height: rect_coords_adjusted.h, 
      width: rect_coords_adjusted.w, 
      depth: req.body.frame.depth,
      image: selection_enc, 
      model: req.body.model 
    };
    const model_response = await axios.post(`http://${process.env.REACT_APP_MODEL_SERVER_IP}:${process.env.REACT_APP_MODEL_SERVER_PORT}/predict`, json_payload);

    // return model api response
    res.json(model_response.data);
  } catch (error) {
    console.error(error);
  }
});

// POST, find
app.post('/find', async function(req, res) {
  try {
    // resize image to original size and convert base64 encoded string data to Mat for use with opencv: https://github.com/justadudewhohacks/opencv4nodejs
    base64_data = req.body.frame.data.replace('data:image/jpeg;base64','');
    frame_buffer = Buffer.from(base64_data, 'base64');
    cv_frame = cv.imdecode(frame_buffer);
		cv_frame = cv_frame.resize(1080, 1920); // resize to original frame size (front-end alters size to fit page)
    
    // base64 encode to transmit over network
		const cv_frame_enc = cv.imencode('.jpg', cv_frame).toString('base64'); 

    // send request to model api
    const json_payload = {
      id: req.body.frame.id, 
      image: cv_frame_enc, // base64 encode to transmit over network
      model: req.body.model 
    };
    const model_response = await axios.post(`http://${process.env.REACT_APP_MODEL_SERVER_IP}:${process.env.REACT_APP_MODEL_SERVER_PORT}/find`, json_payload);

    // return model api response
    res.json(model_response.data);
  } catch (error) {
    console.error(error);
  }
});

// POST, predict/one/feedback
app.post('/predict/one/feedback', async function(req, res) {
  try {
    // resize image to original size and convert base64 encoded string data to Mat for use with opencv: https://github.com/justadudewhohacks/opencv4nodejs
    base64_data = req.body.frame.data.replace('data:image/jpeg;base64','');
    frame_buffer = Buffer.from(base64_data, 'base64');
    cv_frame = cv.imdecode(frame_buffer);
		cv_frame = cv_frame.resize(1080, 1920); // resize to original frame size (front-end alters size to fit page)
  
    // scale coordinates of selection to match original 1920x1080 frame instead of downsized frame in FE
    // round to nearest integer
    const frame_reduction_factor = req.body.frame.height / 1080;
    rect_coords_adjusted = {
      x: Math.round(req.body.rect.x * (1 / frame_reduction_factor)),
      y: Math.round(req.body.rect.y * (1 / frame_reduction_factor)),
      h: Math.round(req.body.rect.h * (1 / frame_reduction_factor)),
      w: Math.round(req.body.rect.w * (1 / frame_reduction_factor))
    };

    // Need to switch start and end coordinates of rect in case the h or w is negative.  
    // This can happen if the rect is drawing from right-to-left instead of left-to-right.
    if (rect_coords_adjusted.w < 0) {
      rect_coords_adjusted.x = rect_coords_adjusted.x + rect_coords_adjusted.w;
      rect_coords_adjusted.w = Math.abs(rect_coords_adjusted.w);
    } 
    if (rect_coords_adjusted.h < 0) {
      rect_coords_adjusted.y = rect_coords_adjusted.y + rect_coords_adjusted.h;
      rect_coords_adjusted.h = Math.abs(rect_coords_adjusted.h);
    } 

    // grab selection based on rect from frame
    selection_img = cv_frame.getRegion(new cv.Rect(rect_coords_adjusted.x, rect_coords_adjusted.y, rect_coords_adjusted.w, rect_coords_adjusted.h));

    // save user feedback and image selection
    user_info = req.body.user;
    feedback = req.body.feedback;

    img_out_path = path.join(predict_one_feedback_dir, `./${req.body.frame.timestamp}.jpg`);
    log_out_path = path.join(predict_one_feedback_dir, `./${req.body.frame.timestamp}.txt`);

    feedback_str = `name: ${user_info.name}\n` + 
      `email: ${user_info.email}\n` + 
      `model_is_correct: ${feedback.model_is_correct}\n` + 
      `model_choice: ${feedback.model_choice}\n` +
      `user_choice: ${feedback.user_choice}`;

    fs.writeFile(log_out_path, feedback_str, (err) => {
      if (err) {
        return console.log(err);
      }
      console.log("predict/one/feedback:user response saved");
    });
    cv.imwriteAsync(img_out_path, selection_img, (err) => {
      if (err) {
        return console.log(err);
      }
      console.log("predict/one/feedback:user image saved");
    });
    
    res.json({status: 'success'});
  } catch (error) {
    console.error(error);
  }
});

// GET, simple route for testing model api
app.get('/quote', async function(req, res) {
  try {
    const response = await axios.get(`http://${process.env.REACT_APP_MODEL_SERVER_IP}:${process.env.REACT_APP_MODEL_SERVER_PORT}/quote`);
    res.json(response['data']);
  } catch (error) {
    console.error(error);
  }
});

const server = http.createServer(app);
const io = require('socket.io')(server);

/*
 * Create streams in child processes.
 * It was found that multiple streams in a process would cause the cpu core that the process runs on, to be overburdened.  
 * This was mostly due to encoding and transmission of each frame.
 * This caused the stream to stutter and run slowly.
 * By running each stream in its own process, the streams run more smoothly.
 */
console.log('Initializing streams in child processes');
var children = [];
_.each(streams, function (stream) {
  const child = fork(__dirname + '/stream');
  children.push(child);

  child.on('message', (message) => {
    console.log('Received message from child process: ' + message);
  });

  message = {
    cmd: 'START',
    stream: stream
  }
  child.send(message);
});

/*
 * Kill all child processes on exit
 */
process.on('exit', function() {
  console.log('killing', children.length, 'child processes');
  children.forEach(function(child) {
    child.kill();
  });
});
  
/* 
 * Ports:
 * 	React Client: 80 (PROD) or 3000 (DEV) 
 * 	Express App: 4000
 * 	HTTP Servers (streams): start at 5000
 * 	Model API Server: 8000
*/
app.listen(process.env.REACT_APP_EXPRESS_SERVER_PORT, process.env.REACT_APP_SERVER_IP, () => {
	console.log(`Express App listening on port ${process.env.REACT_APP_SERVER_IP}:${process.env.REACT_APP_EXPRESS_SERVER_PORT}!`);
});
