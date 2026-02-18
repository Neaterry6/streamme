import React, { useEffect, useState } from "react";
import logo from "../assets/logo.png"; // StreamMe logo

const LoadingScreen: React.FC = () => {
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setFadeOut(true), 2500); // 2.5s splash
    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        backgroundColor: "#000",
        color: "#fff",
        transition: "opacity 1s ease",
        opacity: fadeOut ? 0 : 1,
      }}
    >
      <img src={logo} alt="StreamMe Logo" style={{ width: "160px", marginBottom: "20px" }} />
      <h1 style={{ fontFamily: "sans-serif", fontSize: "2rem", color: "#e50914" }}>
        StreamMe
      </h1>
      <p style={{ fontSize: "1rem", color: "#aaa" }}>Loading your experience...</p>
    </div>
  );
};

export default LoadingScreen;
