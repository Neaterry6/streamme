// backend/routes/youtube.js
const express = require("express");
const axios = require("axios");
const { Innertube } = require("youtubei.js");

const router = express.Router();
const BASE_URL = "https://api.qasimdev.dpdns.org";
const API_KEY = "qasim-dev";

let yt;
(async () => {
  yt = await Innertube.create();
})();

// Search
router.get("/search", async (req, res) => {
  const query = req.query.q;
  const results = await yt.search(query);
  const videos = results.videos.map(v => ({
    id: v.id,
    title: v.title.text,
    thumbnail: v.thumbnail[0].url,
    views: v.view_count,
    duration: v.duration,
    author: v.author.name
  }));
  res.json(videos);
});

// Download
router.get("/download", async (req, res) => {
  const videoUrl = req.query.url;
  const response = await axios.get(`${BASE_URL}/youtube?url=${videoUrl}&apikey=${API_KEY}`);
  res.json(response.data);
});

module.exports = router;
