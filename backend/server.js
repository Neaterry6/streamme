// backend/server.js
const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const http = require("http");
const socketIo = require("socket.io");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({ secret: "streamme-secret", resave: false, saveUninitialized: true }));
app.use(express.static(path.join(__dirname, "public")));

// MongoDB setup
mongoose.connect("mongodb://localhost:27017/streamme", { useNewUrlParser: true, useUnifiedTopology: true });

// Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/youtube", require("./routes/youtube"));
app.use("/api/music", require("./routes/music"));
app.use("/api/social", require("./routes/social"));
app.use("/api/lyrics", require("./routes/lyrics"));

// Chatroom
require("./chat/socket")(io);

// Server
server.listen(5000, () => console.log("StreamMe backend running on http://localhost:5000"));
