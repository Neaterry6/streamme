const express = require("express");
const router = express.Router();

// Placeholder for lyrics integration
router.get("/", async (req, res) => {
  try {
    const { song, artist } = req.query;
    if (!song || !artist) {
      return res.status(400).json({ error: "Song and artist required" });
    }

    // TODO: integrate Genius API, Musixmatch, or other lyrics provider
    res.json({
      message: `Lyrics request received for ${song} by ${artist}`
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
