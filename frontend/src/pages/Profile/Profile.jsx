import React, { useContext, useEffect, useState } from "react";
import "./Profile.css";
import { AuthContext } from "../../context/AuthContext";
import axios from "axios";
import Swal from "sweetalert2";

const Profile = ({ url }) => {
  const { user } = useContext(AuthContext);
  const [member, setMember] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const res = await axios.get(`${url}/api/user/my-member`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setMember(res.data);
        setEditData({
          memberName: res.data.memberName,
          mobile: res.data.mobile,
          address: res.data.address,
        });
      } catch (err) {
        console.error("Error fetching members:", err);
      }
    };
    fetchMembers();
  }, [url]);

  const handleSave = async () => {
    try {

      if (editData.mobile && editData.mobile.length < 10) {
        return Swal.fire("Error!", "Mobile number must be 10 digits long", "error");
      }

      const res = await axios.put(`${url}/api/user/update-profile`, editData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setMember(res.data.user);
      setIsEditing(false);
      Swal.fire("Success!", "Profile updated successfully", "success");
    } catch (err) {
      Swal.fire(
        "Error!",
        err.response?.data?.message || "Failed to update",
        "error"
      );
    }
  };

  return (
    <>
      <div className="bread">User Profile</div>
      <div className="profile rounded mt-3">
        <div className="profile-container">
          <div className="head d-flex align-items-center justify-content-between">
            <img src={`${url}${user?.profilePic}`} width={80} alt="User Icon" />
            <div className="text-end">
              <h1>Jai Shree Shyam 🙏🏻</h1>
              {isEditing ? (
                <input
                  type="text"
                  className="form-control"
                  value={editData.memberName}
                  onChange={(e) =>
                    setEditData({ ...editData, memberName: e.target.value })
                  }
                />
              ) : (
                <h2>{member?.memberName}</h2>
              )}
            </div>
          </div>
          <hr />

          <p>
            Username: <b>{user?.username}</b>
            <hr />
          </p>

          <p className="d-flex align-items-center gap-1">
            Mobile:
            {isEditing ? (
              <input
                type="text"
                className="form-control"
                value={editData.mobile}
                onChange={(e) =>
                  setEditData({ ...editData, mobile: e.target.value })
                }
              />
            ) : (
              <b>{member?.mobile}</b>
            )}
          </p>
          <hr />

          <p className="d-flex align-items-center gap-1">
            Address:
            {isEditing ? (
              <input
                type="text"
                className="form-control"
                value={editData.address}
                onChange={(e) =>
                  setEditData({ ...editData, address: e.target.value })
                }
              />
            ) : (
              <b>{member?.address}</b>
            )}
          </p>
          <hr />

          <p>
            Pads Assigned:{" "}
            <b>
              {member?.padsAssigned?.length
                ? member.padsAssigned.join(", ")
                : "-"}
            </b>
            <hr />
          </p>

          <p>
            Receipt Count: <b>{member?.receiptCount || "0"}</b>
            <hr />
          </p>

          <p>
            Total Collection:{" "}
            <b>₹ {member.totalAmount?.toLocaleString("en-IN") || "0"}</b>
            <hr />
          </p>

          {user?.type === "admin" && (
            <p>
              <div className="form-check form-switch">
                <label className="form-check-label">Add Receipt Status</label>
                <input
                  className="form-check-input"
                  type="checkbox"
                  role="switch"
                  title="Change Status"
                  style={{ cursor: "pointer" }}
                />
              </div>
              <hr />
            </p>
          )}

          {isEditing ? (
            <div className="d-flex gap-2">
              <button className="btn btn-success" onClick={handleSave}>
                Save
              </button>
              <button
                className="btn btn-secondary"
                onClick={() => setIsEditing(false)}
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              className="btn btn-primary d-flex align-items-center justify-content-between gap-2"
              onClick={() => setIsEditing(true)}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                height="20px"
                viewBox="0 -960 960 960"
                width="20px"
                fill="white"
              >
                <path d="M200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h357l-80 80H200v560h560v-278l80-80v358q0 33-23.5 56.5T760-120H200Zm280-360ZM360-360v-170l367-367q12-12 27-18t30-6q16 0 30.5 6t26.5 18l56 57q11 12 17 26.5t6 29.5q0 15-5.5 29.5T897-728L530-360H360Zm481-424-56-56 56 56ZM440-440h56l232-232-28-28-29-28-231 231v57Zm260-260-29-28 29 28 28 28-28-28Z" />
              </svg>
              Edit Profile
            </button>
          )}
        </div>
      </div>
    </>
  );
};

export default Profile;
