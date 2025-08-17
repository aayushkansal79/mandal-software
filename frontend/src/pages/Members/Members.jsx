import React, { useContext, useEffect, useState } from "react";
import "./Members.css";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import toast from "react-hot-toast";
import Swal from "sweetalert2";

const Members = ({ url }) => {
  const [members, setMembers] = useState([]);

  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const { user } = useContext(AuthContext);

  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    userId: "",
    memberName: "",
    password: "",
  });

  const [filters, setFilters] = useState({
    memberName: "",
    mobile: "",
    year: "",
  });

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const params = new URLSearchParams();

        Object.entries(filters).forEach(([key, value]) => {
          if (value && value.trim()) {
            params.append(key, value.trim());
          }
        });
        const res = await axios.get(
          `${url}/api/user/members?${params.toString()}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setMembers(res.data);
      } catch (err) {
        console.error("Error fetching members:", err);
      }
    };
    fetchMembers();
  }, [url, filters]);

  const handleToggleStatus = async (member) => {
    try {
      const res = await axios.patch(
        `${url}/api/user/toggle-status/${member._id}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setMembers((prev) =>
        prev.map((m) =>
          m._id === member._id ? { ...m, status: res.data.status } : m
        )
      );

      toast.success(res.data.message);
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to change status.");
    }
  };

  const openPasswordModal = (userId, memberName) => {
    setPasswordData({ userId, memberName, password: "" });
    setShowPasswordModal(true);
  };

  const handlePasswordChange = async () => {
    if (!passwordData.password) {
      toast.error("Password cannot be empty");
      return;
    }

    if (passwordData.password.length < 8) {
      toast.error("New password must be at least 8 characters long.");
      return;
    }

    const result = await Swal.fire({
      title: `Change password for ${passwordData.memberName}?`,
      text: "This action cannot be undone.",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, Change",
    });

    if (!result.isConfirmed) return;

    try {
      const res = await axios.put(
        `${url}/api/user/admin-change-password/${passwordData.userId}`,
        { newPassword: passwordData.password },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      Swal.fire({
        icon: "success",
        title: "Password Changed",
        text: res.data.message,
        timer: 2000,
        showConfirmButton: false,
      });
      setShowPasswordModal(false);
      setPasswordData({ userId: "", memberName: "", password: "" });
    } catch (error) {
      console.error(error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.response?.data?.message || "Failed to change password.",
      });
    }
  };

  const handleMemberClick = (id) => {
    navigate(`/member-records/${id}/member-receipts`);
  };

  return (
    <>
      <div className="bread">Member Records</div>

      <div className="row g-2 mb-4 px-2 mt-2">
        <div className="col-md-2 col-6">
          <label className="form-label">Member Name:</label>
          <input
            className="form-control"
            placeholder="Enter Member Name"
            value={filters.memberName}
            onChange={(e) =>
              setFilters({ ...filters, memberName: e.target.value })
            }
          />
        </div>
        <div className="col-md-2 col-6">
          <label className="form-label">Mobile Number:</label>
          <input
            className="form-control"
            placeholder="Enter Mobile No."
            type="number"
            value={filters.mobile}
            onChange={(e) => setFilters({ ...filters, mobile: e.target.value })}
          />
        </div>
        <div className="col-md-2 col-6">
          <label className="form-label">Year:</label>
          <select
            className="form-select"
            value={filters.year}
            onChange={(e) => setFilters({ ...filters, year: e.target.value })}
          >
            {Array.from(
              { length: new Date().getFullYear() - 2025 + 1 },
              (_, i) => new Date().getFullYear() - i
            ).map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="my-3">
        <div className="members row g-2 g-md-3">
          {members.map((member, index) => (
            <div
              key={member._id}
              className="col-6 col-sm-6 col-md-2"
              onClick={() => handleMemberClick(member._id)}
            >
              <div className="card text-bg-light text-center">
                <div className="card-header d-flex flex-column align-items-center">
                  <img
                    src={`${url}${member.profilePic}`}
                    width={70}
                    height={70}
                    alt=""
                    className="rounded-circle"
                  />
                  <b>{member.memberName.split(" ").slice(0, 2).join(" ")}</b>
                  <div className="text-primary">{member.mobile}</div>
                </div>
                <div className="card-body align-items-center">
                  <p className="card-text red">
                    Assigned Pad No. : <br />{" "}
                    <b className="text-black">
                      {member.padsAssigned.join(", ") || "-"}
                    </b>
                  </p>
                  <p className="card-text red">
                    Receipt Count : <br />{" "}
                    <b className="text-black">{member.receiptCount}</b>
                  </p>
                  <p className="card-text red">
                    Total Collection : <br />{" "}
                    <b className="text-black">
                      ₹ {member.totalAmount?.toLocaleString("en-IN")}
                    </b>
                  </p>
                </div>
                {user?.type === "admin" && (
                  <div
                    className="card-header d-flex justify-content-between align-items-center"
                    onClick={(e) => {
                      e.stopPropagation();
                    }}
                  >
                    {member.type !== "admin" ? (
                      <div className="form-check form-switch">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          role="switch"
                          title="Change Status"
                          checked={member.status}
                          onChange={() => handleToggleStatus(member)}
                          style={{ cursor: "pointer" }}
                        />
                      </div>
                    ) : (
                      <div></div>
                    )}
                    <button
                      className="op-btn"
                      title="Change Password"
                      onClick={() =>
                        openPasswordModal(member._id, member.memberName)
                      }
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        height="24px"
                        viewBox="0 -960 960 960"
                        width="24px"
                        fill="green"
                      >
                        <path d="M80-200v-80h800v80H80Zm46-242-52-30 34-60H40v-60h68l-34-58 52-30 34 58 34-58 52 30-34 58h68v60h-68l34 60-52 30-34-60-34 60Zm320 0-52-30 34-60h-68v-60h68l-34-58 52-30 34 58 34-58 52 30-34 58h68v60h-68l34 60-52 30-34-60-34 60Zm320 0-52-30 34-60h-68v-60h68l-34-58 52-30 34 58 34-58 52 30-34 58h68v60h-68l34 60-52 30-34-60-34 60Z" />
                      </svg>
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {showPasswordModal && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h5 style={{ color: "#6d0616" }}>
              Change {passwordData.memberName.split(" ")[0]}'s Password
            </h5>
            <div className="form-group mb-4 text-start">
              <div className="input-group">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="Enter new password"
                  value={passwordData.password}
                  onChange={(e) =>
                    setPasswordData({
                      ...passwordData,
                      password: e.target.value,
                    })
                  }
                  className="form-control"
                />
                <button
                  type="button"
                  className="btn border py-0 px-2"
                  onClick={() => setShowPassword((prev) => !prev)}
                >
                  {showPassword ? (
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
            <div className="d-flex justify-content-end gap-2">
              <button
                className="btn btn-secondary"
                onClick={() => setShowPasswordModal(false)}
              >
                Cancel
              </button>
              <button
                className="btn btn-success"
                onClick={handlePasswordChange}
              >
                Change Password
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Members;
