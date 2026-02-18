import { useEffect, useState } from "react";
import io from "socket.io-client";
import { useAuth } from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";

const socket = io(import.meta.env.VITE_API_URL.replace("/api", ""));

interface ChatMessage {
  username: string;
  text?: string;
  image?: string;
  voice?: string;
  timestamp: string;
}

export default function Chatroom() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Authenticate socket with JWT
    socket.emit("authenticate", localStorage.getItem("token"));

    socket.on("chat message", (msg: ChatMessage) => {
      setMessages((prev) => [...prev, msg]);
    });

    socket.on("chat image", (msg: ChatMessage) => {
      setMessages((prev) => [...prev, msg]);
    });

    socket.on("chat voice", (msg: ChatMessage) => {
      setMessages((prev) => [...prev, msg]);
    });

    return () => {
      socket.off("chat message");
      socket.off("chat image");
      socket.off("chat voice");
    };
  }, []);

  const sendMessage = () => {
    if (!input.trim()) return;
    socket.emit("chat message", input);
    setInput("");
  };

  const sendImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      socket.emit("chat image", reader.result);
    };
    reader.readAsDataURL(file);
  };

  const sendVoice = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      socket.emit("chat voice", reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div style={{ padding: "20px" }}>
      <header style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px" }}>
        <h2>Welcome, {user?.username}</h2>
        <button onClick={handleLogout}>Logout</button>
      </header>

      <div style={{ border: "1px solid #ccc", padding: "10px", height: "300px", overflowY: "auto" }}>
        {messages.map((m, i) => (
          <div key={i} style={{ marginBottom: "10px" }}>
            <strong>{m.username}</strong>:{" "}
            {m.text && <span>{m.text}</span>}
            {m.image && <img src={m.image} alt="chat-img" style={{ maxWidth: "200px", display: "block" }} />}
            {m.voice && <audio controls src={m.voice} />}
            <small style={{ display: "block", color: "#888" }}>
              {new Date(m.timestamp).toLocaleTimeString()}
            </small>
          </div>
        ))}
      </div>

      <div style={{ marginTop: "10px" }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message..."
          style={{ width: "60%", marginRight: "10px" }}
        />
        <button onClick={sendMessage}>Send</button>
        <input type="file" accept="image/*" onChange={sendImage} style={{ marginLeft: "10px" }} />
        <input type="file" accept="audio/*" onChange={sendVoice} style={{ marginLeft: "10px" }} />
      </div>
    </div>
  );
}