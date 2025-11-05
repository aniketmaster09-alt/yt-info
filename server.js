import express from "express";
import { exec } from "child_process";
import cors from "cors";

const app = express();
app.use(cors());

app.get("/", (req, res) => {
  res.send("Server is running");
});

// Main route to get YouTube formats
app.get("/formats", (req, res) => {
  const videoUrl = req.query.url;
  if (!videoUrl) return res.status(400).json({ error: "No URL provided" });

  const command = `yt-dlp -J "${videoUrl}"`;

  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error("Error:", stderr);
      return res.status(500).json({ error: "Failed to fetch video info" });
    }

    try {
      const json = JSON.parse(stdout);
      const formats = json.formats.map(f => ({
        itag: f.format_id,
        ext: f.ext,
        resolution: f.resolution || `${f.height || "?"}p`,
        fps: f.fps || null,
        filesize: f.filesize ? `${(f.filesize / (1024 * 1024)).toFixed(2)} MB` : "N/A"
      }));
      res.json(formats);
    } catch (err) {
      console.error("Parse error:", err);
      res.status(500).json({ error: "Invalid JSON from yt-dlp" });
    }
  });
});

const PORT = process.env.PORT || 3000;
const HOST = '0.0.0.0'; // 👈 important for Replit!

app.listen(PORT, HOST, () => {
  console.log(`✅ Server running on http://${HOST}:${PORT}`);
});
