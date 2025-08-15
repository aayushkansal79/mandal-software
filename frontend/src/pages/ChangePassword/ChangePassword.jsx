import axios from "axios";
import "./ChangePassword.css";
import React, { useState } from "react";
import Swal from "sweetalert2";
import toast from "react-hot-toast";

const ChangePassword = ({ url }) => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [showCurrPassword, setShowCurrPassword] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem("token");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!currentPassword || !newPassword) {
      toast.error("Please fill in all fields.");
      return;
    }

    if (newPassword && newPassword.length < 6) {
      toast.error("New password must be at least 6 characters long.");
      return;
    }

    const result = await Swal.fire({
      title: "Confirm Password Change",
      text: "Are you sure you want to change your password?",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, Change",
      cancelButtonText: "Cancel",
    });

    if (!result.isConfirmed) return;

    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      const res = await axios.put(
        `${url}/api/user/change-password`,
        { currentPassword, newPassword },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      await Swal.fire({
        icon: "success",
        title: "Password Changed",
        text: res.data.message,
        timer: 2000,
        showConfirmButton: false,
      });

      setCurrentPassword("");
      setNewPassword("");
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: err.response?.data?.message || "Failed to change password.",
      });
    } finally {
      setLoading(false);
    }
  };
  return (
    <>
      <div className="bread">Change Password</div>

      <form className="change-password mt-3 rounded" onSubmit={handleSubmit}>
        <div className="form-group mb-4 text-start">
          <label>Current Password</label>
          <div className="input-group">
            <input
              placeholder="Enter Old Password"
              className="form-control"
              type={showCurrPassword ? "text" : "password"}
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
            <button
              type="button"
              className="btn border py-0 px-2"
              onClick={() => setShowCurrPassword((prev) => !prev)}
            >
              {showCurrPassword ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  height="20px"
                  viewBox="0 -960 960 960"
                  width="20px"
                  fill="#000000"
                >
                  <path d="m644-428-58-58q9-47-27-88t-93-32l-58-58q17-8 34.5-12t37.5-4q75 0 127.5 52.5T660-500q0 20-4 37.5T644-428Zm128 126-58-56q38-29 67.5-63.5T832-500q-50-101-143.5-160.5T480-720q-29 0-57 4t-55 12l-62-62q41-17 84-25.5t90-8.5q151 0 269 83.5T920-500q-23 59-60.5 109.5T772-302Zm20 246L624-222q-35 11-70.5 16.5T480-200q-151 0-269-83.5T40-500q21-53 53-98.5t73-81.5L56-792l56-56 736 736-56 56ZM222-624q-29 26-53 57t-41 67q50 101 143.5 160.5T480-280q20 0 39-2.5t39-5.5l-36-38q-11 3-21 4.5t-21 1.5q-75 0-127.5-52.5T300-500q0-11 1.5-21t4.5-21l-84-82Zm319 93Zm-151 75Z" />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  height="20px"
                  viewBox="0 -960 960 960"
                  width="20px"
                  fill="#000000"
                >
                  <path d="M480-320q75 0 127.5-52.5T660-500q0-75-52.5-127.5T480-680q-75 0-127.5 52.5T300-500q0 75 52.5 127.5T480-320Zm0-72q-45 0-76.5-31.5T372-500q0-45 31.5-76.5T480-608q45 0 76.5 31.5T588-500q0 45-31.5 76.5T480-392Zm0 192q-146 0-266-81.5T40-500q54-137 174-218.5T480-800q146 0 266 81.5T920-500q-54 137-174 218.5T480-200Zm0-300Zm0 220q113 0 207.5-59.5T832-500q-50-101-144.5-160.5T480-720q-113 0-207.5 59.5T128-500q50 101 144.5 160.5T480-280Z" />
                </svg>
              )}
            </button>
          </div>
        </div>
        <div className="form-group mb-4 text-start">
          <label>New Password</label>
          <div className="input-group">
            <input
              placeholder="Enter New Password"
              className="form-control"
              type={showNewPassword ? "text" : "password"}
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
            <button
              type="button"
              className="btn border py-0 px-2"
              onClick={() => setShowNewPassword((prev) => !prev)}
            >
              {showNewPassword ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  height="20px"
                  viewBox="0 -960 960 960"
                  width="20px"
                  fill="#000000"
                >
                  <path d="m644-428-58-58q9-47-27-88t-93-32l-58-58q17-8 34.5-12t37.5-4q75 0 127.5 52.5T660-500q0 20-4 37.5T644-428Zm128 126-58-56q38-29 67.5-63.5T832-500q-50-101-143.5-160.5T480-720q-29 0-57 4t-55 12l-62-62q41-17 84-25.5t90-8.5q151 0 269 83.5T920-500q-23 59-60.5 109.5T772-302Zm20 246L624-222q-35 11-70.5 16.5T480-200q-151 0-269-83.5T40-500q21-53 53-98.5t73-81.5L56-792l56-56 736 736-56 56ZM222-624q-29 26-53 57t-41 67q50 101 143.5 160.5T480-280q20 0 39-2.5t39-5.5l-36-38q-11 3-21 4.5t-21 1.5q-75 0-127.5-52.5T300-500q0-11 1.5-21t4.5-21l-84-82Zm319 93Zm-151 75Z" />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  height="20px"
                  viewBox="0 -960 960 960"
                  width="20px"
                  fill="#000000"
                >
                  <path d="M480-320q75 0 127.5-52.5T660-500q0-75-52.5-127.5T480-680q-75 0-127.5 52.5T300-500q0 75 52.5 127.5T480-320Zm0-72q-45 0-76.5-31.5T372-500q0-45 31.5-76.5T480-608q45 0 76.5 31.5T588-500q0 45-31.5 76.5T480-392Zm0 192q-146 0-266-81.5T40-500q54-137 174-218.5T480-800q146 0 266 81.5T920-500q-54 137-174 218.5T480-200Zm0-300Zm0 220q113 0 207.5-59.5T832-500q-50-101-144.5-160.5T480-720q-113 0-207.5 59.5T128-500q50 101 144.5 160.5T480-280Z" />
                </svg>
              )}
            </button>
          </div>
        </div>
        <button
          type="submit"
          className="change-btn btn btn-primary"
          disabled={loading}
        >
          {loading ? "Updating..." : "Change Password"}
        </button>
      </form>
    </>
  );
};

export default ChangePassword;
