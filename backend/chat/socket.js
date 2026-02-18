const jwt = require("jsonwebtoken");
const Message = require("../model/Message");
const User = require("../model/User"); // assuming you have User model

module.exports = (io) => {
  const onlineUsers = new Set();

  io.on("connection", async (socket) => {
    console.log("A user connected");

    // Authenticate
    socket.on("authenticate", async (token) => {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        socket.user = decoded;

        // Add to online users
        onlineUsers.add(decoded.username);
        io.emit("online users", Array.from(onlineUsers));

        // Send chat history (latest 50)
        const history = await Message.find()
          .sort({ timestamp: -1 })
          .limit(50);
        socket.emit("chat history", history.reverse());

        io.emit("user online", {
          username: decoded.username,
          profilePic: decoded.profilePic || "https://n.uguu.se/UttreQqr.jpg"
        });
      } catch (err) {
        console.error("Invalid token:", err.message);
        socket.disconnect();
      }
    });

    // Typing
    socket.on("typing", () => {
      if (socket.user) {
        socket.broadcast.emit("typing", { username: socket.user.username });
      }
    });

    // Normal text message
    socket.on("chat message", async (text) => {
      if (!socket.user) return socket.emit("error", "Not authenticated");

      const message = new Message({
        username: socket.user.username,
        profilePic: socket.user.profilePic || "https://n.uguu.se/UttreQqr.jpg",
        text,
        timestamp: new Date()
      });

      await message.save();
      io.emit("chat message", message);
    });

    // Image upload (base64)
    socket.on("chat image", async (imgData) => {
      if (!socket.user) return;

      const message = new Message({
        username: socket.user.username,
        profilePic: socket.user.profilePic || "https://n.uguu.se/UttreQqr.jpg",
        image: imgData,
        timestamp: new Date()
      });

      await message.save();
      io.emit("chat message", message); // unify under chat message
    });

    // Voice message (base64)
    socket.on("chat voice", async (voiceData) => {
      if (!socket.user) return;

      const message = new Message({
        username: socket.user.username,
        profilePic: socket.user.profilePic || "https://n.uguu.se/UttreQqr.jpg",
        voice: voiceData,
        timestamp: new Date()
      });

      await message.save();
      io.emit("chat message", message);
    });

    // Edit message
    socket.on("edit message", async ({ id, text }) => {
      if (!socket.user) return;

      const message = await Message.findById(id);
      if (!message || message.username !== socket.user.username) return;

      message.text = text;
      message.edited = true;
      await message.save();

      io.emit("message edited", { id, text });
    });

    // Delete message
    socket.on("delete message", async (id) => {
      if (!socket.user) return;

      const message = await Message.findById(id);
      if (!message || message.username !== socket.user.username) return;

      await Message.deleteOne({ _id: id });
      io.emit("message deleted", id);
    });

    // Add reaction
    socket.on("reaction", async ({ messageId, emoji }) => {
      if (!socket.user) return;

      io.emit("reaction", {
        messageId,
        username: socket.user.username,
        emoji
      });

      // Optional: persist reaction in DB
      await Message.findByIdAndUpdate(messageId, {
        $push: { reactions: { username: socket.user.username, emoji } }
      });
    });

    // Pin message
    socket.on("pin message", (msg) => {
      io.emit("pinned message", msg);
      // You can also save pinned message in DB / Redis if needed
    });

    // Mark message as seen (basic broadcast version)
    socket.on("message seen", ({ messageId }) => {
      if (socket.user) {
        io.emit("message seen", {
          messageId,
          username: socket.user.username
        });
      }
    });

    // Private message (very basic – no rooms yet)
    socket.on("private message", async ({ to, text }) => {
      if (!socket.user) return;

      const message = new Message({
        username: socket.user.username,
        profilePic: socket.user.profilePic || "https://n.uguu.se/UttreQqr.jpg",
        text: `[DM to ${to}] ${text}`,
        timestamp: new Date(),
        isPrivate: true,
        to
      });

      await message.save();

      // Send only to sender and receiver (requires user-to-socket mapping)
      // For simplicity broadcasting for now – improve with rooms or user socket map
      io.emit("chat message", message);
    });

    // Disconnect
    socket.on("disconnect", () => {
      if (socket.user) {
        onlineUsers.delete(socket.user.username);
        io.emit("online users", Array.from(onlineUsers));
        io.emit("user offline", { username: socket.user.username });
      }
      console.log("A user disconnected");
    });
  });
};