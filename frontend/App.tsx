import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./src/pages/Login";
import Signup from "./src/pages/Signup";
import Chatroom from "./src/pages/Chatroom";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/chatroom" element={<Chatroom />} />
      </Routes>
    </BrowserRouter>
  );
}
