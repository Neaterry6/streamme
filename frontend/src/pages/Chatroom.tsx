import { useEffect, useState } from "react";
import io from "socket.io-client";
import { useAuth } from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";

const socket = io(import.meta.env.VITE_API_URL.replace("/api", ""));

export default function Chatroom() {
  const [messages, setMessages] = useState<string[]>([]);
  const [input, setInput] = useState("");
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    socket.on("chat message", (msg: string) => {
      setMessages((prev) => [...prev, msg]);
    });
    return () => {
      socket.off("chat message");
    };
  }, []);

  const sendMessage = () => {
    if (!input.trim()) return;
    // prepend username to message
    socket.emit("chat message", `${user?.username || "Anonymous"}: ${input}`);
    setInput("");
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
          <p key={i}>{m}</p>
        ))}
      </div>

      <div style={{ marginTop: "10px" }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message..."
          style={{ width: "80%", marginRight: "10px" }}
        />
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
}