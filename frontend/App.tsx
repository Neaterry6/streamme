import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./src/pages/Login";
import Signup from "./src/pages/Signup";
import Chatroom from "./src/pages/Chatroom";
import ProtectedRoute from "./src/components/ProtectedRoute";
import LoadingScreen from "./src/components/LoadingScreen";
import { useAuth } from "./src/hooks/useAuth";

export default function App() {
  const { loading } = useAuth();

  // Show branded loading screen while checking token
  if (loading) return <LoadingScreen />;

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route
          path="/chatroom"
          element={
            <ProtectedRoute>
              <Chatroom />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
