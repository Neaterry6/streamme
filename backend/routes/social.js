const express = require("express");
const router = express.Router();
const apiClient = require("../utils/apiClient");
const authMiddleware = require("../utils/authMiddleware");

router.get("/", authMiddleware, async (req, res) => {
  try {
    const postUrl = req.query.url;
    if (!postUrl) return res.status(400).json({ error: "URL required" });

    const response = await apiClient.get("/social", { params: { url: postUrl } });
    res.json(response.data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;