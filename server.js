const express = require("express");
const { execFile } = require("child_process");

const app = express();

app.get("/formats", (req, res) => {
  const url = req.query.url;
  if (!url) return res.status(400).send("Missing ?url");

  const args = ["-J", url];
  const process = execFile("yt-dlp", args, { maxBuffer: 1024 * 1024 * 10 }, (error, stdout, stderr) => {
    if (error) {
      return res.status(500).send(stderr || error.message);
    }
    try {
      const info = JSON.parse(stdout);
      const formats = info.formats.map(f => ({
        itag: f.format_id,
        ext: f.ext,
        resolution: f.resolution,
        fps: f.fps,
        filesizeMB: f.filesize ? (f.filesize / 1024 / 1024).toFixed(2) : "?",
        vcodec: f.vcodec,
        acodec: f.acodec,
        url: f.url
      }));
      res.json(formats);
    } catch (e) {
      res.status(500).send("Parse error: " + e.message);
    }
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Server running on port " + PORT));
