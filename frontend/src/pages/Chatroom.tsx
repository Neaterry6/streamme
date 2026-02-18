import React, { useState, useEffect } from "react";
import { io } from "socket.io-client";

const socket = io(); // connects to backend at localhost:5000 via proxy

const Chatroom: React.FC = () => {
  const [messages, setMessages] = useState<string[]>([]);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    // Listen for incoming messages
    socket.on("chatMessage", (message: string) => {
      setMessages(prev => [...prev, message]);
    });

    // Cleanup listener on unmount
    return () => {
      socket.off("chatMessage");
    };
  }, []);

  const sendMessage = () => {
    if (msg.trim() !== "") {
      socket.emit("chatMessage", msg);
      setMsg("");
    }
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h2>StreamMe Chatroom</h2>
      <div
        style={{
          border: "1px solid #ccc",
          height: "300px",
          overflowY: "scroll",
          marginBottom: "1rem",
          padding: "0.5rem",
          backgroundColor: "#111",
          color: "#fff"
        }}
      >
        {messages.map((m, i) => (
          <div key={i} style={{ marginBottom: "0.5rem" }}>
            {m}
          </div>
        ))}
      </div>
      <input
        type="text"
        value={msg}
        onChange={e => setMsg(e.target.value)}
        placeholder="Type a message..."
        style={{ marginRight: "0.5rem", padding: "0.5rem" }}
      />
      <button onClick={sendMessage} style={{ padding: "0.5rem 1rem" }}>
        Send
      </button>
    </div>
  );
};

export default Chatroom;
