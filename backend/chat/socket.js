module.exports = (io) => {
  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    // Text chat
    socket.on("chatMessage", (msg) => {
      io.emit("chatMessage", msg);
    });

    // Image uploads
    socket.on("imageUpload", (imgData) => {
      io.emit("imageUpload", imgData);
    });

    // Voice notes
    socket.on("voiceNote", (audioData) => {
      io.emit("voiceNote", audioData);
    });

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
    });
  });
};
