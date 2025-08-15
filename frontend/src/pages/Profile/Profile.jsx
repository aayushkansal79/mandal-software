import React, { useContext, useEffect, useState } from "react";
import "./Profile.css";
import { AuthContext } from "../../context/AuthContext";
import axios from "axios";
import Swal from "sweetalert2";

const Profile = ({ url }) => {
  const { user } = useContext(AuthContext);
  const [member, setMember] = useState({});
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const res = await axios.get(`${url}/api/user/my-member`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setMember(res.data);
        console.log(res.data);
      } catch (err) {
        console.error("Error fetching members:", err);
      }
    };
    fetchMembers();
  }, [url]);

  return (
    <>
      <div className="bread">User Profile</div>
      <div className="profile rounded mt-3">
        <div className="profile-container">
          <div className="head d-flex align-items-center justify-content-between">
            <img src={`${url}${user?.profilePic}`} width={80} alt="User Icon" />
            <div>
              <h1>Jai Shree Shyam 🙏🏻</h1>
              <h2>{user?.memberName}</h2>
            </div>
          </div>
          <hr />
          <p>
            Username: <b>{user?.username}</b>
            <hr />
          </p>
          <p>
            Mobile: <b>{user?.mobile}</b>
            <hr />
          </p>
          <p>
            Address: <b>{user.address}</b>
            <hr />
          </p>
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
            Total Amount:{" "}
            <b>₹ {member.totalAmount?.toLocaleString("en-IN") || "0"}</b>
            <hr />
          </p>

          {user?.type === "admin" && (
            <>
              <div className="form-check form-switch">
                <label className="form-label">Add Receipt Status</label>
                <input
                  className="form-check-input"
                  type="checkbox"
                  role="switch"
                  title="Change Status"
                  //   checked={member.status}
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                  style={{ cursor: "pointer" }}
                />
              </div>
              <hr />
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default Profile;
