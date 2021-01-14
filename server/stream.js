/*
 *  Child process for a video file stream 
 */

process.on('message', (message) => {
  if (message.cmd == 'START') {
    console.log(`[Stream id: ${message.stream.id}] Child process received START message`);
    
    const stream = message.stream;

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

    // youtube-dl variables
    var hls_link = null;
    const height = 1080;
    const width = 1920;
    const FPS = 30;

    // most useful for handling when youtube-dl fails
    process.on('unhandledRejection', (reason, p) => {
      console.error('Unhandled Rejection at:', p, 'reason:', reason)
      process.exit(1)
    });

    app.use(express.json({
      limit: "50mb"
    })); // to support JSON-encoded bodies, see: https://stackoverflow.com/questions/5710358/how-to-retrieve-post-query-parameters
    app.use(express.urlencoded({
      extended: true,
      limit: "50mb"
    })); // to support URL-encoded bodies, see: https://stackoverflow.com/questions/5710358/how-to-retrieve-post-query-parameters
    app.use(cors()); // to support CORS

    const server = http.createServer(app);
    const io = require('socket.io')(server);

    /*
     * Initialize stream depending on type of stream
     */
    if (stream.type === "stream") {
      /* 
       * Initialize youtube livestream stream
       *
       * Extract the HLS link for the youtube livestream so that we can intercept it.	
       * We need to extract this automatically since the hls link will expire after few hours. 
       * NOTE: if this throws an error on startup on a consistent basis, then likely we need update youtube-dl.  Can try `npm install youtube-dl` from /share/front-end/server/
      */
      ydl.exec(stream.url, ['--format=96', '-g'], {}, (err, output) => {
        if (err) throw err

        console.log('\nyoutube-dl finished HLS link extraction:');
        console.log(output.join('\n'));
        console.log('\n');
        hls_link = output[0];
        stream.vCap = new cv.VideoCapture(hls_link);//0);//"/home/nightrider/Videos/mashup.mp4");
        stream.vCap.set(cv.CAP_PROP_FRAME_WIDTH, width);
        stream.vCap.set(cv.CAP_PROP_FRAME_HEIGHT, height);

        // emit captured livestream video frame-by-frame and emit each frame at specified interval using socket.io 
        setInterval(() => {
          try {
            // read raw frame
            stream.frame = stream.vCap.read();
            stream.frameCount += 1;
            
            // encode frame for efficient transfer to clients
            // 
            // NOTE: This first 'if' condition is a jank fix to a problem I dont' fully understand: we reset the capture every 140 
            // frames because otherwise the capture errors out and stalls for several seconds approximately every 148th frame 
            // (not exactly 148 it seems, so that's why we modulo 140).  frame.empty sets to true when this stall behavior happens.  
            // Originally, we would only check for that condition before resetting the capture.  Even though the capture behavior can 
            // be reset if frame.empty is detected, the stalling causes a noticeably long delay.  This is why we also rely on 
            // modulo'ing every 140 frames to preempt the stall behavior.  The video stream is noticeably smoother using the approach.
            if (stream.frameCount % 140 == 0 || stream.frame.empty) { 
              stream.vCap.reset();
              stream.frame = stream.vCap.read();
            } else {
              /* 
               * Encoding and emition are expensive in processing power and the reasons why we must move each stream to its own 
               * process.
               */
              stream.frameEncoded = cv.imencode('.jpg', stream.frame).toString('base64');
              //stream.frameEncoded = cv.imencode('.jpg', stream.frame);
              
              // emit frame
              io.emit(`stream-${stream.id}-image`, stream.frameEncoded);
            }
          } catch (error) {
            console.log(error);
          } 
        }, Math.ceil(1000 / FPS))
      });
    } else if (stream.type === "file") {
      /*
       * Initialize video file stream
       */
      stream.vCap = new cv.VideoCapture(__dirname + stream.url);
      stream.vCap.set(cv.CAP_PROP_FRAME_WIDTH, width);
      stream.vCap.set(cv.CAP_PROP_FRAME_HEIGHT, height);

      // emit captured livestream video frame-by-frame and emit each frame at specified interval using socket.io 
      setInterval(() => {
        try {
          // read raw frame
          stream.frame = stream.vCap.read();
          stream.frameCount += 1;
          
          // encode frame for efficient transfer to clients
          // 
          // NOTE: the stream is supplied by a recording, so we just loop to beginning when we detect the end of the file
          if (stream.frame.empty) { 
            stream.vCap.reset();
            stream.frame = stream.vCap.read();
          } else {
            /* 
             * Encoding and emition are expensive in processing power and the reasons why we must move each stream to its own 
             * process.
             */
            stream.frameEncoded = cv.imencode('.jpg', stream.frame).toString('base64');
            //stream.frameEncoded = cv.imencode('.jpg', stream.frame);
            
            // emit frame
            io.emit(`stream-${stream.id}-image`, stream.frameEncoded);
          }
        } catch (error) {
          console.log(error);
        } 
      }, Math.ceil(1000 / FPS))
    }
      
    /* 
     * Ports:
     * 	HTTP Server: port defined by passed-in stream object
    */
    server.listen(stream.port, process.env.REACT_APP_SERVER_IP, () => {
      console.log(`HTTP Server listening on ${process.env.REACT_APP_SERVER_IP}:${stream.port}!`);
    });
  }
});
