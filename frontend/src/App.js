import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "sonner";
import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import "@/App.css";

function App() {
  return (
    <div className="App ambient-bg noise min-h-screen">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
      <Toaster
        theme="dark"
        position="bottom-center"
        toastOptions={{
          style: {
            background: "rgba(20, 20, 24, 0.95)",
            border: "1px solid rgba(255, 255, 255, 0.12)",
            color: "#efece5",
            backdropFilter: "blur(14px)",
            fontFamily: "'Bricolage Grotesque', sans-serif",
            borderRadius: "999px",
            padding: "10px 18px",
          },
        }}
      />
    </div>
  );
}

export default App;
