const express = require("express");
const router = express.Router();
const apiClient = require("../utils/apiClient");
const authMiddleware = require("../utils/authMiddleware");

router.get("/", authMiddleware, async (req, res) => {
  try {
    const { song, artist } = req.query;
    if (!song || !artist) {
      return res.status(400).json({ error: "Song and artist required" });
    }

    const response = await apiClient.get("/lyrics", { params: { song, artist } });
    res.json(response.data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;