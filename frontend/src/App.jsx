import React, { useState } from "react";
import { Route, Routes, Navigate, useLocation } from "react-router-dom";
import { Toaster } from 'react-hot-toast';
import Login from "./pages/Login/Login";
import Sidebar from "./components/Sidebar/Sidebar";
import Navbar from "./components/Navbar/Navbar";
import Dashboard from "./pages/Dashboard/Dashboard";

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const url = "http://localhost:4000";

  const location = useLocation();
  const hideLayout = location.pathname === "/login";

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      {/* <AuthProvider> */}
        {!hideLayout && <Sidebar sidebarOpen={sidebarOpen} />}
        <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
          {!hideLayout && (
            <Navbar toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
          )}
          <main
            style={{
              padding: hideLayout ? "0" : "1rem",
              flex: 1,
              overflowY: "auto",
              scrollbarWidth: "none",
            }}
          >
            <Toaster toastOptions={{ className: 'bg-light text-dark border shadow-sm rounded', duration: 2000, style: { padding: '10px 15px', fontSize: '0.9rem', }, }} />
            <Routes>
               {/* <Route path="*" element={<Navigate to="/login" replace />} /> */}
              <Route path="/login" element={<Login url={url} />} />
              {/*<Route path="/dashboard" element={<PrivateRoute roles={["admin"]}> <Dashboard url={url} /> </PrivateRoute>} /> */}
              <Route path="/dashboard" element={<Dashboard url={url} />} />
            </Routes>
          </main>
        </div>
      {/* </AuthProvider> */}
    </div>
  );
}

export default App;
