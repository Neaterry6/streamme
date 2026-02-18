const jwt = require("jsonwebtoken");

module.exports = (io) => {
  io.on("connection", (socket) => {
    console.log("A user connected");

    // Authenticate with JWT
    socket.on("authenticate", (token) => {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        socket.user = decoded;
        console.log(`User authenticated: ${decoded.username}`);
      } catch (err) {
        console.error("Invalid token:", err.message);
        socket.disconnect();
      }
    });

    // Text messages
    socket.on("chat message", (msg) => {
      if (!socket.user) return socket.emit("error", "Not authenticated");

      const messageObj = {
        username: socket.user.username,
        text: msg,
        timestamp: new Date().toISOString(),
      };

      io.emit("chat message", messageObj);
    });

    // Image messages
    socket.on("chat image", (imgData) => {
      if (!socket.user) return socket.emit("error", "Not authenticated");

      const messageObj = {
        username: socket.user.username,
        image: imgData,
        timestamp: new Date().toISOString(),
      };

      io.emit("chat image", messageObj);
    });

    // Voice messages
    socket.on("chat voice", (voiceData) => {
      if (!socket.user) return socket.emit("error", "Not authenticated");

      const messageObj = {
        username: socket.user.username,
        voice: voiceData,
        timestamp: new Date().toISOString(),
      };

      io.emit("chat voice", messageObj);
    });

    socket.on("disconnect", () => {
      console.log("A user disconnected");
    });
  });
};