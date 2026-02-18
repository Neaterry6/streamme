const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const http = require("http");
const { Server } = require("socket.io");

dotenv.config();

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL
      ? process.env.FRONTEND_URL.split(",")
      : ["http://localhost:5173", "http://localhost:3000"],
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL
    ? process.env.FRONTEND_URL.split(",")
    : ["http://localhost:5173", "http://localhost:3000"],
  credentials: true
}));
app.use(express.json({ limit: "50mb" }));      // allow bigger payloads for base64
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Routes
app.use("/api/auth",   require("./routes/auth"));
app.use("/api/youtube", require("./routes/youtube"));
app.use("/api/music",   require("./routes/music"));
app.use("/api/social",  require("./routes/social"));

// Health check
app.get("/health", (req, res) => res.status(200).json({ status: "ok" }));

// Socket.IO
require("./chat/socket")(io);

// MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch(err => {
    console.error("MongoDB connection failed:", err);
    process.exit(1);
  });

// Error handler (basic)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Internal Server Error" });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});