const express = require("express");
const app = express();
const fs = require("fs");
const cors = require('cors');

/* app.get("/", function (req, res) {
  res.sendFile(__dirname + "/index.html");
}); */

var corsOptions = {
  origins: ["https://neontoon.mn/","http://localhost:5000"],
  optionsSuccessStatus: 200 // For legacy browser support
}
  
app.use(cors(corsOptions));

app.get("/video/:type/:name/:size", function (req, res) {
  const {type, name, size} = req.params;
  const allowed = ['http://localhost/', 'https://neontoon.mn/', 'https://www.neontoon.mn/'];
  if(!allowed.includes(req.headers.referer)) return res.status(403).send("Хандах эрхгүй!");
  const range = req.headers.range;
  if (!range) {
    res.status(400).send("Requires Range header");
  }

  // get video stats (about 61MB)
  const videoPath = `../videos/${type}/${name}_${size}.mp4`;
  const videoSize = fs.statSync(videoPath).size;
  console.log('videoSize', videoSize);
  // Parse Range
  // Example: "bytes=32324-"
  const CHUNK_SIZE = 10 ** 6; // 1MB
  const start = Number(range.replace(/\D/g, ""));
  const end = Math.min(start + CHUNK_SIZE, videoSize - 1);

  // Create headers
  const contentLength = end - start + 1;
  const headers = {
    "Content-Range": `bytes ${start}-${end}/${videoSize}`,
    "Accept-Ranges": "bytes",
    "Content-Length": contentLength,
    "Content-Type": "video/mp4",
  };

  // HTTP Status 206 for Partial Content
  res.writeHead(206, headers);

  // create video read stream for this particular chunk
  const videoStream = fs.createReadStream(videoPath, { start, end });

  // Stream the video chunk to the client
  videoStream.pipe(res);
});

app.listen(8000, function () {
  console.log("Listening on port 8000!");
});
