const cv = require('opencv4nodejs');
const path = require('path');
const express = require('express');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);

const hls_link = "https://manifest.googlevideo.com/api/manifest/hls_playlist/expire/1601548587/ei/y1x1X73MDduKkgb1vLawCg/ip/98.207.8.218/id/1nWGig6pQ7Q.1/itag/96/source/yt_live_broadcast/requiressl/yes/ratebypass/yes/live/1/goi/160/sgoap/gir%3Dyes%3Bitag%3D140/sgovp/gir%3Dyes%3Bitag%3D137/hls_chunk_host/r2---sn-n4v7knlk.googlevideo.com/playlist_duration/30/manifest_duration/30/vprv/1/playlist_type/DVR/initcwndbps/17490/mh/18/mm/44/mn/sn-n4v7knlk/ms/lva/mv/m/mvi/2/pl/21/dover/11/keepalive/yes/fexp/23915654/mt/1601526861/disable_polymer/true/sparams/expire,ei,ip,id,itag,source,requiressl,ratebypass,live,goi,sgoap,sgovp,playlist_duration,manifest_duration,vprv,playlist_type/sig/AOq0QJ8wRAIgUlhYB60-8itB7yDNK2sUiFLkZF6y_i_GLCKDZogVfnUCIC4HZjl2lhSsbRZIYqBGKpWj0kgCTR3eFdbUyCcg_F_C/lsparams/hls_chunk_host,initcwndbps,mh,mm,mn,ms,mv,mvi,pl/lsig/AG3C_xAwRQIhANQ5rhODnDGHZUa-ofdSjKg2QfXZdgIhTxYRtXGGm9JmAiA4shKOPXWCwgs2SNpguoVfd1hu7T4xNK8SueE00B8Ejw%3D%3D/playlist/index.m3u8";
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
