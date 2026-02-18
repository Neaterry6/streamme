const jwt = require("jsonwebtoken");
const Message = require("../model/Message");

module.exports = (io) => {
  const onlineUsers = new Set();

  io.on("connection", async (socket) => {
    console.log("A user connected");

    // Authenticate & join online status
    socket.on("authenticate", async (token) => {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        socket.user = decoded;

        onlineUsers.add(decoded.username);
        io.emit("online users", Array.from(onlineUsers));

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

    // Public text message
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

    // Image
    socket.on("chat image", async (imgData) => {
      if (!socket.user) return;
      const message = new Message({
        username: socket.user.username,
        profilePic: socket.user.profilePic || "https://n.uguu.se/UttreQqr.jpg",
        image: imgData,
        timestamp: new Date()
      });
      await message.save();
      io.emit("chat message", message);
    });

    // Voice
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

    // Start / join DM room
    socket.on("start dm", ({ to }) => {
      if (!socket.user || to === socket.user.username) return;

      const participants = [socket.user.username, to].sort();
      const room = `\( {participants[0]}--with-- \){participants[1]}`;

      socket.join(room);

      // Tell the other person to join if online
      socket.to(to).emit("dm invite", {
        from: socket.user.username,
        room
      });
    });

    // Send private message
    socket.on("private message", async ({ room, text, image, voice }) => {
      if (!socket.user) return;

      const message = new Message({
        username: socket.user.username,
        profilePic: socket.user.profilePic || "https://n.uguu.se/UttreQqr.jpg",
        text,
        image,
        voice,
        timestamp: new Date(),
        room,
        isPrivate: true
      });

      await message.save();

      io.to(room).emit("private message", message);
    });

    // Edit
    socket.on("edit message", async ({ id, text }) => {
      if (!socket.user) return;
      const msg = await Message.findById(id);
      if (!msg || msg.username !== socket.user.username) return;

      msg.text = text;
      msg.edited = true;
      await msg.save();

      io.emit("message edited", { id, text });
    });

    // Delete
    socket.on("delete message", async (id) => {
      if (!socket.user) return;
      const msg = await Message.findById(id);
      if (!msg || msg.username !== socket.user.username) return;

      await Message.deleteOne({ _id: id });
      io.emit("message deleted", id);
    });

    // Reaction
    socket.on("reaction", async ({ messageId, emoji }) => {
      if (!socket.user) return;
      io.emit("reaction", {
        messageId,
        username: socket.user.username,
        emoji
      });
      await Message.findByIdAndUpdate(messageId, {
        $push: { reactions: { username: socket.user.username, emoji } }
      });
    });

    // Pin (broadcast only – no persistence here)
    socket.on("pin message", (msg) => {
      io.emit("pinned message", msg);
    });

    // Seen
    socket.on("message seen", ({ messageId }) => {
      if (socket.user) {
        io.emit("message seen", {
          messageId,
          username: socket.user.username
        });
      }
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