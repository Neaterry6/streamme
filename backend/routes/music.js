const express = require("express");
const axios = require("axios");

const router = express.Router();
const BASE_URL = "https://api.qasimdev.dpdns.org";
const API_KEY = "qasim-dev";

router.get("/", async (req, res) => {
  try {
    const { platform, trackId } = req.query;
    if (!platform || !trackId) {
      return res.status(400).json({ error: "Platform and trackId required" });
    }

    const response = await axios.get(`${BASE_URL}/music?platform=${platform}&id=${trackId}&apikey=${API_KEY}`);
    res.json(response.data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
