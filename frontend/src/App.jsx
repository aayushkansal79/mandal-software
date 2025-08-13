import React, { useState } from "react";
import { Route, Routes, Navigate, useLocation } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./context/AuthContext";
import Login from "./pages/Login/Login";
import Sidebar from "./components/Sidebar/Sidebar";
import Navbar from "./components/Navbar/Navbar";
import Dashboard from "./pages/Dashboard/Dashboard";
import AddMember from "./pages/AddMember/AddMember";
import Members from "./pages/Members/Members";
import Footer from "./components/Footer/Footer";
import MemberReceipt from "./pages/MemberReceipt/MemberReceipt";
import AddReceipt from "./pages/AddReceipt/AddReceipt";
import AllReceipts from "./pages/AllReceipts/AllReceipts";
import AssignPad from "./pages/AssignPad/AssignPad";
import MandalForm from "./pages/Mandal/Mandal";
import PrivateRoute from "./context/PrivateRoute";
import MyReceipts from "./pages/MyReceipts/MyReceipts";

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  // const url = "http://localhost:4000";
  const url = "https://mandal-software.onrender.com";

  const location = useLocation();
  const hideLayout = location.pathname === "/login";

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      <AuthProvider>
      {!hideLayout && <Sidebar sidebarOpen={sidebarOpen} />}
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        {!hideLayout && (
          <Navbar toggleSidebar={() => setSidebarOpen(!sidebarOpen)} url={url} />
        )}
        <main
          style={{
            padding: hideLayout ? "0" : "1rem",
            flex: 1,
            overflowY: "auto",
            scrollbarWidth: "none",
            paddingBottom: "90px"
          }}
        >
          <Toaster
            toastOptions={{
              className: "bg-dark text-light border shadow-sm rounded",
              duration: 2000,
              style: { padding: "10px 15px", fontSize: "0.9rem" },
            }}
          />
          <Routes>
            <Route path="*" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<Login url={url} />} />
            <Route path="/dashboard" element={<PrivateRoute roles={["admin", "subadmin", "member"]}> <Dashboard url={url} /> </PrivateRoute>} />
            <Route path="/mandal" element={<PrivateRoute roles={["admin"]}> <MandalForm url={url} /> </PrivateRoute>} />
            <Route path="/add-member" element={<PrivateRoute roles={["admin"]}> <AddMember url={url} /> </PrivateRoute>} />
            <Route path="/member-list" element={<PrivateRoute roles={["admin", "subadmin", "member"]}> <Members url={url} /> </PrivateRoute>} />
            <Route path="/member-list/:id/member-receipts" element={<PrivateRoute roles={["admin", "subadmin", "member"]}> <MemberReceipt url={url} /> </PrivateRoute>} />
            <Route path="/assign-pad" element={<PrivateRoute roles={["admin"]}> <AssignPad url={url} /> </PrivateRoute>} />
            <Route path="/add-receipt" element={<PrivateRoute roles={["admin", "subadmin", "member"]}> <AddReceipt url={url} /> </PrivateRoute>} />
            <Route path="/receipt-list" element={<PrivateRoute roles={["admin", "subadmin", "member"]}> <AllReceipts url={url} /> </PrivateRoute>} />
            <Route path="/my-receipts" element={<PrivateRoute roles={["admin", "subadmin", "member"]}> <MyReceipts url={url} /> </PrivateRoute>} />
          </Routes>
        </main>
        {!hideLayout && (
          <Footer />
        )}
      </div>
      </AuthProvider>
    </div>
  );
}

export default App;
