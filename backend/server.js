// backend/server.js
const express = require("express");
const axios = require("axios");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const session = require("express-session");
const http = require("http");
const socketIo = require("socket.io");
const path = require("path");
const { Innertube } = require("youtubei.js");

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const BASE_URL = "https://api.qasimdev.dpdns.org";
const API_KEY = "qasim-dev"; // your key

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({ secret: "streamme-secret", resave: false, saveUninitialized: true }));
app.use(express.static(path.join(__dirname, "public")));

// MongoDB setup
mongoose.connect("mongodb://localhost:27017/streamme", { useNewUrlParser: true, useUnifiedTopology: true });

const UserSchema = new mongoose.Schema({
  username: String,
  password: String
});
const User = mongoose.model("User", UserSchema);

// YouTube client
let yt;
(async () => {
  yt = await Innertube.create();
})();

// Routes
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Signup
app.post("/signup", async (req, res) => {
  const { username, password } = req.body;
  const hashed = await bcrypt.hash(password, 10);
  const user = new User({ username, password: hashed });
  await user.save();
  req.session.user = user;
  res.redirect("/home");
});

// Login
app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username });
  if (user && await bcrypt.compare(password, user.password)) {
    req.session.user = user;
    res.redirect("/home");
  } else {
    res.send("Invalid credentials");
  }
});

// Home
app.get("/home", (req, res) => {
  if (!req.session.user) return res.redirect("/");
  res.sendFile(path.join(__dirname, "public", "home.html"));
});

// YouTube search (youtubei.js)
app.get("/api/youtube/search", async (req, res) => {
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

// YouTube download (QasimDev API)
app.get("/api/youtube/download", async (req, res) => {
  const videoUrl = req.query.url;
  const response = await axios.get(`${BASE_URL}/youtube?url=${videoUrl}&apikey=${API_KEY}`);
  res.json(response.data);
});

// Music search/download
app.get("/api/music", async (req, res) => {
  const query = req.query.query;
  const response = await axios.get(`${BASE_URL}/spotify?query=${query}&apikey=${API_KEY}`);
  res.json(response.data);
});

// Social media download
app.get("/api/social", async (req, res) => {
  const postUrl = req.query.url;
  const response = await axios.get(`${BASE_URL}/social?url=${postUrl}&apikey=${API_KEY}`);
  res.json(response.data);
});

// Lyrics (placeholder, will connect to your lyrics API later)
app.get("/api/lyrics", async (req, res) => {
  const song = req.query.song;
  // Example: call your lyrics API here
  res.json({ song, lyrics: "Lyrics will be fetched from your API" });
});

// Chatroom with Socket.IO
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("chatMessage", (msg) => {
    io.emit("chatMessage", msg); // broadcast to all
  });

  socket.on("imageUpload", (imgData) => {
    io.emit("imageUpload", imgData);
  });

  socket.on("voiceNote", (audioData) => {
    io.emit("voiceNote", audioData);
  });
});

// Server
server.listen(5000, () => console.log("StreamMe backend running on http://localhost:5000"));
