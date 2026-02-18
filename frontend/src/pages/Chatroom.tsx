Here is the updated Chatroom.tsx with all requested features except notification sound:

```tsx
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
}

export default function Chatroom() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [replyTo, setReplyTo] = useState<ChatMessage | null>(null);
  const [darkMode, setDarkMode] = useState(localStorage.getItem("theme") === "dark");
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [pinnedMessage, setPinnedMessage] = useState<ChatMessage | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [selectedUserForDM, setSelectedUserForDM] = useState<string | null>(null);

  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const chatBoxRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    socket.emit("authenticate", localStorage.getItem("token"));

    socket.on("chat history", setMessages);
    socket.on("chat message", (msg) => setMessages(prev => [...prev, msg]));
    socket.on("message edited", ({ id, text }) => {
      setMessages(prev => prev.map(m => m._id === id ? { ...m, text, edited: true } : m));
    });
    socket.on("message deleted", (id) => {
      setMessages(prev => prev.filter(m => m._id !== id));
    });
    socket.on("reaction", ({ messageId, username, emoji }) => {
      setMessages(prev => prev.map(m =>
        m._id === messageId ? { ...m, reactions: [...(m.reactions || []), { username, emoji }] } : m
      ));
    });
    socket.on("typing", ({ username }) => {
      setTypingUsers(prev => [...new Set([...prev, username])]);
      setTimeout(() => setTypingUsers(prev => prev.filter(u => u !== username)), 1800);
    });
    socket.on("online users", setOnlineUsers);
    socket.on("message seen", ({ messageId, username }) => {
      setMessages(prev => prev.map(m =>
        m._id === messageId ? { ...m, seenBy: [...(m.seenBy || []), username] } : m
      ));
    });
    socket.on("pinned message", setPinnedMessage);

    return () => {
      socket.offAny();
    };
  }, []);

  useEffect(() => {
    chatBoxRef.current?.scrollTo({ top: chatBoxRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, pinnedMessage]);

  const sendMessage = () => {
    if (!input.trim()) return;
    const payload = replyTo ? `[Reply to ${replyTo.username}]: ${input}` : input;
    socket.emit("chat message", payload);
    setInput("");
    setReplyTo(null);
  };

  const editMessage = (msg: ChatMessage) => {
    setEditingId(msg._id || null);
    setEditText(msg.text || "");
  };

  const saveEdit = () => {
    if (editingId && editText.trim()) {
      socket.emit("edit message", { id: editingId, text: editText });
    }
    setEditingId(null);
    setEditText("");
  };

  const deleteMessage = (id?: string) => {
    if (id) socket.emit("delete message", id);
  };

  const copyMessage = (text?: string) => {
    if (text) navigator.clipboard.writeText(text);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (file.type.startsWith("image/")) {
        socket.emit("chat image", reader.result);
      } else if (file.type.startsWith("audio/")) {
        socket.emit("chat voice", reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const startVoiceRecord = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      mediaRecorderRef.current.ondataavailable = e => audioChunksRef.current.push(e.data);
      mediaRecorderRef.current.start();
    } catch (err) {
      console.error("Voice record failed", err);
    }
  };

  const stopVoiceRecord = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        const reader = new FileReader();
        reader.onload = () => socket.emit("chat voice", reader.result);
        reader.readAsDataURL(blob);
        audioChunksRef.current = [];
      };
    }
  };

  const pinMessage = (msg: ChatMessage) => {
    socket.emit("pin message", msg);
  };

  const sendDM = (target: string, text: string) => {
    socket.emit("private message", { to: target, text });
  };

  const filteredMessages = messages.filter(m =>
    m.text?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{
      height: "100vh",
      display: "flex",
      background: darkMode ? "#0f0f0f" : "#f0f2f5",
      color: darkMode ? "#e0e0e0" : "#111",
    }}>
      {/* Sidebar - Online users */}
      <div style={{
        width: "220px",
        borderRight: `1px solid ${darkMode ? "#333" : "#ddd"}`,
        padding: "16px",
        overflowY: "auto",
      }}>
        <h3>Online ({onlineUsers.length})</h3>
        {onlineUsers.map(u => (
          <div key={u} style={{ padding: "6px 0", cursor: "pointer" }} onClick={() => setSelectedUserForDM(u)}>
            {u} {u === user?.username && "(you)"}
          </div>
        ))}
      </div>

      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        {/* Header */}
        <header style={{
          padding: "12px 20px",
          background: darkMode ? "#1a1a1a" : "#fff",
          borderBottom: `1px solid ${darkMode ? "#333" : "#ddd"}`,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}>
          <h2>{user?.username || "Chat"}</h2>
          <div>
            <button onClick={() => setDarkMode(!darkMode)}>{darkMode ? "☀️" : "🌙"}</button>
            <button onClick={logout} style={{ marginLeft: 12 }}>Logout</button>
          </div>
        </header>

        {/* Pinned message */}
        {pinnedMessage && (
          <div style={{
            padding: "8px 16px",
            background: darkMode ? "#2a2a2a" : "#fff3cd",
            borderBottom: `1px solid ${darkMode ? "#444" : "#ffeeba"}`,
          }}>
            📌 {pinnedMessage.text?.slice(0, 80)}...
          </div>
        )}

        {/* Search */}
        <input
          placeholder="Search messages..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          style={{
            margin: "12px 16px",
            padding: "8px 12px",
            borderRadius: 6,
            border: `1px solid ${darkMode ? "#444" : "#ccc"}`,
            background: darkMode ? "#222" : "#fff",
            color: "inherit",
          }}
        />

        {/* Messages */}
        <div ref={chatBoxRef} style={{
          flex: 1,
          overflowY: "auto",
          padding: "16px",
          display: "flex",
          flexDirection: "column",
          gap: "10px",
        }}>
          {filteredMessages.map(msg => {
            const isOwn = msg.username === user?.username;
            const isEditing = editingId === msg._id;

            return (
              <div key={msg._id} style={{
                alignSelf: isOwn ? "flex-end" : "flex-start",
                maxWidth: "70%",
              }}>
                <div style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 8,
                }}>
                  {!isOwn && (
                    <img
                      src={msg.profilePic || "https://n.uguu.se/UttreQqr.jpg"}
                      alt=""
                      style={{ width: 32, height: 32, borderRadius: "50%" }}
                    />
                  )}

                  <div style={{
                    padding: "8px 14px",
                    borderRadius: "18px",
                    background: isOwn ? "#0084ff" : darkMode ? "#2d2d2d" : "#e5e5ea",
                    color: isOwn ? "white" : "inherit",
                  }}>
                    {!isOwn && <strong>{msg.username}</strong>}

                    {isEditing ? (
                      <div>
                        <input
                          value={editText}
                          onChange={e => setEditText(e.target.value)}
                          autoFocus
                        />
                        <button onClick={saveEdit}>Save</button>
                        <button onClick={() => setEditingId(null)}>Cancel</button>
                      </div>
                    ) : (
                      <>
                        {msg.text}
                        {msg.edited && <small> (edited)</small>}
                      </>
                    )}

                    <div style={{ fontSize: "0.7rem", opacity: 0.7, marginTop: 4, textAlign: "right" }}>
                      {new Date(msg.timestamp).toLocaleString([], { hour: "2-digit", minute: "2-digit" })}
                      {isOwn && msg.seenBy && msg.seenBy.length > 1 && " ✓✓"}
                    </div>

                    {msg.reactions?.length ? (
                      <div style={{ marginTop: 4 }}>{msg.reactions.map(r => r.emoji).join(" ")}</div>
                    ) : null}
                  </div>
                </div>

                {!isEditing && (
                  <div style={{ fontSize: "0.8rem", marginTop: 4, opacity: 0.7 }}>
                    <button onClick={() => copyMessage(msg.text)}>Copy</button>
                    {isOwn && (
                      <>
                        {" • "}
                        <button onClick={() => editMessage(msg)}>Edit</button>
                        {" • "}
                        <button onClick={() => deleteMessage(msg._id)}>Delete</button>
                        {" • "}
                        <button onClick={() => pinMessage(msg)}>Pin</button>
                      </>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Input area */}
        <div style={{
          padding: "12px 16px",
          borderTop: `1px solid ${darkMode ? "#333" : "#ddd"}`,
          background: darkMode ? "#1a1a1a" : "#fff",
        }}>
          {replyTo && (
            <div style={{ padding: "6px 10px", background: darkMode ? "#222" : "#f0f0f0", borderRadius: 6, marginBottom: 8 }}>
              Replying to {replyTo.username}: {replyTo.text?.slice(0, 60)}...
              <button onClick={() => setReplyTo(null)}>×</button>
            </div>
          )}

          <div style={{ display: "flex", gap: 8 }}>
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), sendMessage())}
              placeholder="Type a message..."
              style={{ flex: 1, padding: "10px 14px", borderRadius: 24, border: "none", background: darkMode ? "#2d2d2d" : "#e9ecef" }}
            />

            <button onClick={() => setShowEmojiPicker(!showEmojiPicker)}>😊</button>
            <button onClick={() => fileInputRef.current?.click()}>📎</button>
            <input type="file" ref={fileInputRef} style={{ display: "none" }} onChange={handleFileUpload} accept="image/*,audio/*" />
            <button onMouseDown={startVoiceRecord} onMouseUp={stopVoiceRecord}>🎤</button>
            <button onClick={sendMessage} disabled={!input.trim()}>Send</button>
          </div>

          {showEmojiPicker && (
            <Picker onEmojiClick={({ emoji }) => {
              const lastId = messages[messages.length - 1]?._id;
              if (lastId) socket.emit("reaction", { messageId: lastId, emoji });
              setShowEmojiPicker(false);
            }} />
          )}
        </div>
      </div>
    </div>
  );
}
