// backend/routes/lyrics.js
const express = require("express");

const router = express.Router();

// Placeholder: connect to your lyrics API later
router.get("/", async (req, res) => {
  const song = req.query.song;
  res.json({ song, lyrics: "Lyrics will be fetched from your API" });
});

module.exports = router;
