// backend/chat/socket.js
module.exports = (io) => {
  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    socket.on("chatMessage", (msg) => {
      io.emit("chatMessage", msg);
    });

    socket.on("imageUpload", (imgData) => {
      io.emit("imageUpload", imgData);
    });

    socket.on("voiceNote", (audioData) => {
      io.emit("voiceNote", audioData);
    });
  });
};
