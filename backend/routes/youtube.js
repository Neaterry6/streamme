const express = require("express");
const router = express.Router();
const { Innertube } = require("youtubei.js");
const authMiddleware = require("../utils/authMiddleware");

router.get("/", authMiddleware, async (req, res) => {
  try {
    const url = req.query.url;
    if (!url) return res.status(400).json({ error: "YouTube URL required" });

    const yt = await Innertube.create();
    const videoInfo = await yt.getInfo(url);

    res.json({
      title: videoInfo.basic_info.title,
      author: videoInfo.basic_info.author,
      lengthSeconds: videoInfo.basic_info.length_seconds,
      formats: videoInfo.streaming_data.adaptive_formats
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;