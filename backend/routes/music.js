// backend/routes/music.js
const express = require("express");
const axios = require("axios");

const router = express.Router();
const BASE_URL = "https://api.qasimdev.dpdns.org";
const API_KEY = "qasim-dev";

router.get("/", async (req, res) => {
  const query = req.query.query;
  const response = await axios.get(`${BASE_URL}/spotify?query=${query}&apikey=${API_KEY}`);
  res.json(response.data);
});

module.exports = router;
