const express = require("express");
const router = express.Router();
const apiClient = require("../utils/apiClient");
const authMiddleware = require("../utils/authMiddleware");

router.get("/", authMiddleware, async (req, res) => {
  try {
    const { platform, trackId } = req.query;
    if (!platform || !trackId) {
      return res.status(400).json({ error: "Platform and trackId required" });
    }

    const response = await apiClient.get("/music", { params: { platform, id: trackId } });
    res.json(response.data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;