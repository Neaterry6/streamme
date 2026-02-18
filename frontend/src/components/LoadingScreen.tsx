import React, { useEffect, useState } from "react";

const LoadingScreen: React.FC = () => {
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setFadeOut(true), 2500);
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
      {/* Your external logo URL */}
      <img
        src="https://n.uguu.se/UttreQqr.jpg"
        alt="StreamMe Logo"
        style={{ width: "160px", marginBottom: "20px", borderRadius: "8px" }}
      />
      <h1 style={{ fontFamily: "sans-serif", fontSize: "2rem", color: "#e50914" }}>
        StreamMe
      </h1>
      <p style={{ fontSize: "1rem", color: "#aaa" }}>Loading your experience...</p>
      {/* Optional spinner */}
      <div
        style={{
          marginTop: "20px",
          width: "40px",
          height: "40px",
          border: "4px solid #e50914",
          borderTop: "4px solid transparent",
          borderRadius: "50%",
          animation: "spin 1s linear infinite",
        }}
      />
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
};

export default LoadingScreen;