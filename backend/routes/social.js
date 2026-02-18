// backend/routes/social.js
const express = require("express");
const axios = require("axios");

const router = express.Router();
const BASE_URL = "https://api.qasimdev.dpdns.org";
const API_KEY = "qasim-dev";

router.get("/", async (req, res) => {
  const postUrl = req.query.url;
  const response = await axios.get(`${BASE_URL}/social?url=${postUrl}&apikey=${API_KEY}`);
  res.json(response.data);
});

module.exports = router;
