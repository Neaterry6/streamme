import { useEffect, useState, useRef } from "react";
import io from "socket.io-client";
import { useAuth } from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import Picker from "emoji-picker-react";

const socket = io(import.meta.env.VITEAPIURL.replace("/api", ""));

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
  edited?: boolean;
  seenBy?: string[];
  room?: string;
  isPrivate?: boolean;
}

export default function Chatroom() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [replyTo, setReplyTo] = useState<ChatMessage | null>(null);
  const [darkMode, setDarkMode] = useState(localStorage.getItem("theme") === "dark");
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const [currentDMRoom, setCurrentDMRoom] = useState<string | null>(null);
  const [selectedDMUser, setSelectedDMUser] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [pinnedMessage, setPinnedMessage] = useState<ChatMessage | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");

  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const chatBoxRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    socket.emit("authenticate", localStorage.getItem("token"));

    socket.on("chat history", setMessages);
    socket.on("chat message", (msg) => setMessages((prev) => [...prev, msg]));
    socket.on("private message", (msg) => setMessages((prev) => [...prev, msg]));
    socket.on("message edited", ({ id, text }) =>
      setMessages((prev) => prev.map((m) => (m._id === id ? { ...m, text, edited: true } : m)))
    );
    socket.on("message deleted", (id) =>
      setMessages((prev) => prev.filter((m) => m._id !== id))
    );
    socket.on("reaction", ({ messageId, username, emoji }) =>
      setMessages((prev) =>
        prev.map((m) =>
          m._id === messageId ? { ...m, reactions: [...(m.reactions || []), { username, emoji }] } : m
        )
      )
    );
    socket.on("typing", ({ username }) => {
      setTypingUsers((prev) => [...new Set([...prev, username])]);
      setTimeout(() => setTypingUsers((prev) => prev.filter((u) => u !== username)), 1800);
    });
    socket.on("online users", setOnlineUsers);
    socket.on("pinned message", setPinnedMessage);
    socket.on("dm invite", ({ from, room }) => {
      const participants = [user?.username || "", from].sort();
      const expected = `\( {participants[0]}--with-- \){participants[1]}`;
      if (room === expected) {
        socket.emit("start dm", { to: from });
        setCurrentDMRoom(room);
        setSelectedDMUser(from);
      }
    });

    return () => socket.offAny();
  }, [user]);

  useEffect(() => {
    chatBoxRef.current?.scrollTo({ top: chatBoxRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const startDM = (target: string) => {
    if (target === user?.username) return;
    const participants = [user?.username || "", target].sort();
    const room = `\( {participants[0]}--with-- \){participants[1]}`;
    socket.emit("start dm", { to: target });
    setCurrentDMRoom(room);
    setSelectedDMUser(target);
  };

  const sendMessage = () => {
    if (!input.trim() || !user) return;
    if (currentDMRoom) {
      socket.emit("private message", { room: currentDMRoom, text: input });
    } else {
      const payload = replyTo ? `[Reply to ${replyTo.username}]: ${input}` : input;
      socket.emit("chat message", payload);
    }
    setInput("");
    setReplyTo(null);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    const reader = new FileReader();
    reader.onload = () => {
      const data = reader.result as string;
      if (file.type.startsWith("image/")) {
        if (currentDMRoom) {
          socket.emit("private message", { room: currentDMRoom, image: data });
        } else {
          socket.emit("chat image", data);
        }
      } else if (file.type.startsWith("audio/")) {
        if (currentDMRoom) {
          socket.emit("private message", { room: currentDMRoom, voice: data });
        } else {
          socket.emit("chat voice", data);
        }
      }
    };
    reader.readAsDataURL(file);
  };

  const addReaction = (messageId: string) => {
    const emoji = prompt("Emoji:") || "👍";
    socket.emit("reaction", { messageId, emoji });
  };

  const exitDM = () => {
    setCurrentDMRoom(null);
    setSelectedDMUser(null);
  };

  return (
    <div style={{ height: "100vh", display: "flex", background: darkMode ? "#0f0f0f" : "#f0f2f5" }}>
      <div style={{ width: 220, borderRight: `1px solid ${darkMode ? "#333" : "#ddd"}`, padding: 16, overflowY: "auto" }}>
        <h3>Online ({onlineUsers.length})</h3>
        {onlineUsers.map((u) => (
          <div
            key={u}
            onClick={() => startDM(u)}
            style={{ padding: "6px 0", cursor: "pointer", color: u === selectedDMUser ? "#0d6efd" : "inherit", fontWeight: u === selectedDMUser ? 600 : 400 }}
          >
            {u} {u === user?.username && "(you)"}
          </div>
        ))}
      </div>

      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <header style={{ padding: "12px 20px", background: darkMode ? "#1a1a1a" : "#fff", borderBottom: `1px solid ${darkMode ? "#333" : "#ddd"}`, display: "flex", justifyContent: "space-between" }}>
          <h2>{currentDMRoom ? `DM • ${selectedDMUser}` : user?.username || "Chat"}</h2>
          <div>
            <button onClick={() => setDarkMode(!darkMode)}>{darkMode ? "☀️" : "🌙"}</button>
            {currentDMRoom && <button onClick={exitDM} style={{ marginLeft: 12 }}>Public</button>}
            <button onClick={logout} style={{ marginLeft: 12 }}>Logout</button>
          </div>
        </header>

        {pinnedMessage && <div style={{ padding: "8px 16px", background: darkMode ? "#2a2a2a" : "#fff3cd" }}>📌 {pinnedMessage.text?.slice(0, 80)}...</div>}

        <input placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={{ margin: "12px 16px", padding: "8px 12px", borderRadius: 6, border: `1px solid ${darkMode ? "#444" : "#ccc"}`, background: darkMode ? "#222" : "#fff" }} />

        <div ref={chatBoxRef} style={{ flex: 1, overflowY: "auto", padding: "16px", display: "flex", flexDirection: "column", gap: "10px" }}>
          {messages
            .filter((m) => (currentDMRoom ? m.room === currentDMRoom : !m.room))
            .filter((m) => m.text?.toLowerCase().includes(searchTerm.toLowerCase()))
            .map((msg) => {
              const isOwn = msg.username === user?.username;
              return (
                <div key={msg._id} style={{ alignSelf: isOwn ? "flex-end" : "flex-start", maxWidth: "70%" }}>
                  <div style={{ padding: "8px 14px", borderRadius: "18px", background: isOwn ? "#0084ff" : darkMode ? "#2d2d2d" : "#e5e5ea", color: isOwn ? "white" : "inherit" }}>
                    {!isOwn && <strong>{msg.username}</strong>}
                    {msg.text}
                    {msg.image && <img src={msg.image} alt="img" style={{ maxWidth: "180px", borderRadius: 8, marginTop: 6 }} />}
                    {msg.voice && <audio controls src={msg.voice} style={{ marginTop: 6 }} />}
                    <div style={{ fontSize: "0.7rem", opacity: 0.7, marginTop: 4, textAlign: "right" }}>
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      {isOwn && msg.seenBy?.length > 1 && " ✓✓"}
                    </div>
                    {msg.reactions?.length > 0 && <div style={{ marginTop: 4 }}>{msg.reactions.map((r) => r.emoji).join(" ")}</div>}
                  </div>
                  <div style={{ fontSize: "0.8rem", marginTop: 4, opacity: 0.7 }}>
                    <button onClick={() => msg._id && addReaction(msg._id)}>React</button>
                  </div>
                </div>
              );
            })}
        </div>

        <div style={{ padding: "12px 16px", borderTop: `1px solid ${darkMode ? "#333" : "#ddd"}`, background: darkMode ? "#1a1a1a" : "#fff" }}>
          <div style={{ display: "flex", gap: 8 }}>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), sendMessage())}
              placeholder={currentDMRoom ? "Private message..." : "Type a message..."}
              style={{ flex: 1, padding: "10px 14px", borderRadius: 24, border: "none", background: darkMode ? "#2d2d2d" : "#e9ecef" }}
            />
            <button onClick={() => setShowEmojiPicker(!showEmojiPicker)}>😊</button>
            <button onClick={() => fileInputRef.current?.click()}>📎</button>
            <input type="file" ref={fileInputRef} style={{ display: "none" }} onChange={handleFileUpload} accept="image/*,audio/*" />
            <button onClick={sendMessage}>Send</button>
          </div>
          {showEmojiPicker && (
            <Picker
              onEmojiClick={({ emoji }) => {
                const lastMsg = messages[messages.length - 1];
                if (lastMsg?._id) socket.emit("reaction", { messageId: lastMsg._id, emoji });
                setShowEmojiPicker(false);
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
} 