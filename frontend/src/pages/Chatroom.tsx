import { useEffect, useState } from "react";
import io from "socket.io-client";

const socket = io(import.meta.env.VITE_API_URL.replace("/api", ""));

export default function Chatroom() {
  const [messages, setMessages] = useState<string[]>([]);
  const [input, setInput] = useState("");

  useEffect(() => {
    socket.on("chat message", (msg: string) => {
      setMessages((prev) => [...prev, msg]);
    });
    return () => {
      socket.off("chat message");
    };
  }, []);

  const sendMessage = () => {
    socket.emit("chat message", input);
    setInput("");
  };

  return (
    <div>
      <h2>Chatroom</h2>
      <div>
        {messages.map((m, i) => <p key={i}>{m}</p>)}
      </div>
      <input value={input} onChange={(e) => setInput(e.target.value)} />
      <button onClick={sendMessage}>Send</button>
    </div>
  );
}