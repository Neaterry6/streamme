`js
const jwt = require("jsonwebtoken");
const Message = require("../model/Message");

module.exports = (io) => {
  io.on("connection", async (socket) => {
    console.log("A user connected");

    // Send initial batch (latest 50 messages)
    const history = await Message.find().sort({ timestamp: -1 }).limit(50);
    socket.emit("chat history", history.reverse());

    socket.on("authenticate", (token) => {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        socket.user = decoded;
        console.log(User authenticated: ${decoded.username});
        io.emit("user online", { username: decoded.username, profilePic: decoded.profilePic || "https://n.uguu.se/UttreQqr.jpg" });
      } catch (err) {
        console.error("Invalid token:", err.message);
        socket.disconnect();
      }
    });

    // Typing indicator
    socket.on("typing", () => {
      if (socket.user) {
        socket.broadcast.emit("typing", { username: socket.user.username });
      }
    });

    // Text messages
    socket.on("chat message", async (msg) => {
      if (!socket.user) return socket.emit("error", "Not authenticated");

      const messageObj = new Message({
        username: socket.user.username,
        profilePic: socket.user.profilePic || "https://n.uguu.se/UttreQqr.jpg",
        text: msg
      });
      await messageObj.save();

      io.emit("chat message", messageObj);
    });

    // Image messages
    socket.on("chat image", async (imgData) => {
      if (!socket.user) return socket.emit("error", "Not authenticated");

      const messageObj = new Message({
        username: socket.user.username,
        profilePic: socket.user.profilePic || "https://n.uguu.se/UttreQqr.jpg",
        image: imgData
      });
      await messageObj.save();

      io.emit("chat image", messageObj);
    });

    // Voice messages
    socket.on("chat voice", async (voiceData) => {
      if (!socket.user) return socket.emit("error", "Not authenticated");

      const messageObj = new Message({
        username: socket.user.username,
        profilePic: socket.user.profilePic || "https://n.uguu.se/UttreQqr.jpg",
        voice: voiceData
      });
      await messageObj.save();

      io.emit("chat voice", messageObj);
    });

    // Reply to message
    socket.on("reply", async ({ messageId, replyText }) => {
      if (!socket.user) return socket.emit("error", "Not authenticated");

      const replyObj = {
        username: socket.user.username,
        profilePic: socket.user.profilePic || "https://n.uguu.se/UttreQqr.jpg",
        text: replyText,
        replyTo: messageId,
        timestamp: new Date().toISOString()
      };

      io.emit("reply", replyObj);
    });

    // Reaction to message
    socket.on("reaction", async ({ messageId, emoji }) => {
      if (!socket.user) return socket.emit("error", "Not authenticated");

      io.emit("reaction", {
        messageId,
        username: socket.user.username,
        emoji,
      });
    });

    socket.on("disconnect", () => {
      if (socket.user) {
        io.emit("user offline", { username: socket.user.username });
      }
      console.log("A user disconnected");
    });
  });
};
`