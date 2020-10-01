const cv = require('opencv4nodejs');
const path = require('path');
const express = require('express');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);

const hls_link = "https://manifest.googlevideo.com/api/manifest/hls_playlist/expire/1601591413/ei/FQR2X6zYHIjIkgaZ-IWADg/ip/98.207.8.218/id/1nWGig6pQ7Q.1/itag/96/source/yt_live_broadcast/requiressl/yes/ratebypass/yes/live/1/goi/160/sgoap/gir%3Dyes%3Bitag%3D140/sgovp/gir%3Dyes%3Bitag%3D137/hls_chunk_host/r2---sn-n4v7knlk.googlevideo.com/playlist_duration/30/manifest_duration/30/vprv/1/playlist_type/DVR/initcwndbps/15600/mh/18/mm/44/mn/sn-n4v7knlk/ms/lva/mv/m/mvi/2/pl/21/dover/11/keepalive/yes/fexp/23915654/mt/1601569648/disable_polymer/true/sparams/expire,ei,ip,id,itag,source,requiressl,ratebypass,live,goi,sgoap,sgovp,playlist_duration,manifest_duration,vprv,playlist_type/sig/AOq0QJ8wRQIgPdQQnlewQ8nug_KmOD4vtYwZMmBHY520THPwJQ6IJBMCIQDfP55cQMAOm5oA7Xmm1j9uCozIwMXQoQ_SW47A138Q9A%3D%3D/lsparams/hls_chunk_host,initcwndbps,mh,mm,mn,ms,mv,mvi,pl/lsig/AG3C_xAwRAIgSqgKS5VfWD-tVzok2t_GTmNMpWvoIbu2t80u90JbTAICIAlZWRz4oDlgUYZToo32A_IvqrZVLX7sIcfLwoL-Tvjq/playlist/index.m3u8";
const wCap = new cv.VideoCapture(hls_link);//0);//"/home/nightrider/Videos/mashup.mp4");

wCap.set(cv.CAP_PROP_FRAME_WIDTH, 1920);
wCap.set(cv.CAP_PROP_FRAME_HEIGHT, 1080);

const FPS = 30;

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

setInterval(() => {
  const frame = wCap.read();
  const frameEnc = cv.imencode('.jpg', frame).toString('base64');

  io.emit('image', frameEnc);
}, 1000 / FPS)

server.listen(3000);
