import { useEffect, useState, useRef } from "react";
import io from "socket.io-client";
import { useAuth } from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import Picker from "emoji-picker-react";

const socket = io(import.meta.env.VITE_API_URL.replace("/api", ""));

interface ChatMessage {
  _id?: string;
  username: string;
  profilePic?: string;
  text?: string;
  image?: string;
  voice?: string;
  replyTo?: string;
  reactions?: { username: string; emoji: string }[];
  timestamp: string;
}

export default function Chatroom() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [replyTo, setReplyTo] = useState<ChatMessage | null>(null);
  const [darkMode, setDarkMode] = useState(localStorage.getItem("theme") === "dark");
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const chatBoxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    socket.emit("authenticate", localStorage.getItem("token"));

    socket.on("chat history", (history: ChatMessage[]) => setMessages(history));
    socket.on("chat message", (msg: ChatMessage) => setMessages((prev) => [...prev, msg]));
    socket.on("chat image", (msg: ChatMessage) => setMessages((prev) => [...prev, msg]));
    socket.on("chat voice", (msg: ChatMessage) => setMessages((prev) => [...prev, msg]));
    socket.on("reply", (msg: ChatMessage) => setMessages((prev) => [...prev, msg]));
    socket.on("reaction", ({ messageId, username, emoji }) => {
      setMessages((prev) =>
        prev.map((m) =>
          m._id === messageId
            ? { ...m, reactions: [...(m.reactions || []), { username, emoji }] }
            : m
        )
      );
    });
    socket.on("typing", ({ username }) => {
      setTypingUsers((prev) => [...new Set([...prev, username])]);
      setTimeout(() => {
        setTypingUsers((prev) => prev.filter((u) => u !== username));
      }, 2000);
    });

    return () => {
      socket.off("chat history");
      socket.off("chat message");
      socket.off("chat image");
      socket.off("chat voice");
      socket.off("reply");
      socket.off("reaction");
      socket.off("typing");
    };
  }, []);

  const sendMessage = () => {
    if (!input.trim()) return;
    socket.emit("chat message", replyTo ? `[Reply to ${replyTo.username}]: ${input}` : input);
    setInput("");
    setReplyTo(null);
  };

  const handleTyping = () => {
    socket.emit("typing");
  };

  const sendReaction = (messageId: string, emoji: string) => {
    socket.emit("reaction", { messageId, emoji });
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const toggleTheme = () => {
    const newTheme = darkMode ? "light" : "dark";
    setDarkMode(!darkMode);
    localStorage.setItem("theme", newTheme);
  };

  return (
    <div style={{
      padding: "20px",
      backgroundColor: darkMode ? "#121212" : "#f5f5f5",
      color: darkMode ? "#fff" : "#000",
      height: "100vh"
    }}>
      <header style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px" }}>
        <h2>Welcome, {user?.username}</h2>
        <div>
          <button onClick={toggleTheme}>{darkMode ? "Light Mode" : "Dark Mode"}</button>
          <button onClick={handleLogout}>Logout</button>
        </div>
      </header>

      <div
        ref={chatBoxRef}
        style={{
          border: "1px solid #333",
          borderRadius: "8px",
          padding: "10px",
          height: "70vh",
          overflowY: "auto",
          backgroundColor: darkMode ? "#1e1e1e" : "#fff"
        }}
      >
        {messages.map((m, i) => (
          <div key={i} style={{ marginBottom: "15px", display: "flex", alignItems: "flex-start" }}>
            <div style={{ position: "relative" }}>
              <img
                src={m.profilePic || "https://n.uguu.se/UttreQqr.jpg"}
                alt="avatar"
                style={{ width: "40px", height: "40px", borderRadius: "50%", marginRight: "10px" }}
              />
              <span style={{
                position: "absolute",
                bottom: 0,
                right: 5,
                width: "10px",
                height: "10px",
                borderRadius: "50%",
                backgroundColor: "#0f0"
              }}></span>
            </div>
            <div>
              <div style={{ fontWeight: "bold", color: darkMode ? "#e50914" : "#007bff" }}>{m.username}</div>
              {m.text && <div style={{ background: darkMode ? "#2a2a2a" : "#eee", padding: "8px", borderRadius: "6px" }}>{m.text}</div>}
              {m.image && <img src={m.image} alt="chat-img" style={{ maxWidth: "200px", borderRadius: "6px" }} />}
              {m.voice && <audio controls src={m.voice} />}
              {m.replyTo && <small style={{ color: "#888" }}>Reply to: {m.replyTo}</small>}
              <small style={{ display: "block", color: "#888" }}>
                {new Date(m.timestamp).toLocaleTimeString()}
              </small>
              <div style={{ marginTop: "5px" }}>
                <button onClick={() => setReplyTo(m)}>Reply</button>
                <button onClick={() => setShowEmojiPicker(!showEmojiPicker)}>React</button>
                {m.reactions && (
                  <div>
                    {m.reactions.map((r, idx) => (
                      <span key={idx}>{r.emoji} ({r.username}) </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {replyTo && (
        <div style={{ background: "#333", padding: "5px", marginTop: "10px", borderRadius: "6px" }}>
          Replying to <strong>{replyTo.username}</strong>: {replyTo.text}
          <button onClick={() => setReplyTo(null)} style={{ marginLeft: "10px" }}>Cancel</button>
        </div>
      )}

      <div style={{ marginTop: "10px", display: "flex", alignItems: "center" }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleTyping}
          placeholder="Type a message..."
          style={{ flex: 1, marginRight: "10px", padding: "8px", borderRadius: "6px", border: "none" }}
        />
        <button onClick={sendMessage}>Send</button>
      </div>

      {showEmojiPicker && (
        <Picker
          onEmojiClick={(event, emojiObject) => {
            sendReaction(messages[messages.length - 1]?._id || "", emojiObject.emoji);
            setShowEmojiPicker(false);
          }}
        />
      )}

      {typingUsers.length > 0 && (
        <p style={{ color: "#aaa", marginTop: "5px" }}>{typingUsers.join(", ")} is typing...</p>
      )}
    </div>
  );
}