import React, { useEffect, useState } from "react";
import "./Members.css";
import axios from "axios";
import { assets } from "../../assets/assets";
import { useNavigate } from "react-router-dom";

const Members = ({ url }) => {
  const [members, setMembers] = useState([]);

  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const res = await axios.get(`${url}/api/user/members`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setMembers(res.data);
      } catch (err) {
        console.error("Error fetching members:", err);
      }
    };
    fetchMembers();
  }, [url]);

  const handleMemberClick = (id) => {
    navigate(`/member-list/${id}/member-receipts`);
  };

  return (
    <>
      <div className="bread">Members</div>

      <div className="row g-2 mb-4 px-2 mt-2">
        <div className="col-md-2 col-6">
          <label className="form-label">Member Name:</label>
          <input
            className="form-control"
            placeholder="Enter Member Name"
            // value={filters.invoiceNumber}
            // onChange={(e) =>
            //   setFilters({ ...filters, invoiceNumber: e.target.value })
            // }
          />
        </div>
        <div className="col-md-2 col-6">
          <label className="form-label">Mobile Number:</label>
          <input
            className="form-control"
            placeholder="Enter Mobile Number"
            type="number"
            // value={filters.customerName}
            // onChange={(e) =>
            //   setFilters({ ...filters, customerName: e.target.value })
            // }
          />
        </div>
      </div>

      <div className="my-3">
        <div className="members row">
          {members.map((member, index) => (
            <div
            key={member._id}
              className="col-6 col-sm-6 col-md-2"
              onClick={() => handleMemberClick(member._id)}
            >
              <div className="card text-bg-light mb-3 text-center">
                <div className="card-header d-flex flex-column align-items-center">
                  <img
                    src={`${url}${member.profilePic}`}
                    width={70}
                    alt=""
                    className="rounded-circle"
                  />
                  <b>{member.memberName}</b>
                  <div className="text-primary">{member.mobile}</div>
                </div>
                <div className="card-body align-items-center">
                  <p className="card-text red">
                    Assigned Pad No. : <br />{" "}
                    <b className="text-black">1, 2, 3, 4, 5, 6</b>
                  </p>
                  <p className="card-text red">
                    Receipt Count : <br /> <b className="text-black">150</b>
                  </p>
                  <p className="card-text red">
                    Total Collection : <br />{" "}
                    <b className="text-black">₹ 10,00,000</b>
                  </p>
                </div>
                <div
                  className="card-header d-flex justify-content-between align-items-center"
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                >
                  <div className="form-check form-switch">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      role="switch"
                      title="Change Status"
                      checked={member.status}
                      onClick={(e) => {
                        e.stopPropagation();
                      }}
                      style={{ cursor: "pointer" }}
                    />
                  </div>
                  <button className="op-btn" title="Edit">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      height="24px"
                      viewBox="0 -960 960 960"
                      width="24px"
                      fill="green"
                    >
                      <path d="M200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h357l-80 80H200v560h560v-278l80-80v358q0 33-23.5 56.5T760-120H200Zm280-360ZM360-360v-170l367-367q12-12 27-18t30-6q16 0 30.5 6t26.5 18l56 57q11 12 17 26.5t6 29.5q0 15-5.5 29.5T897-728L530-360H360Zm481-424-56-56 56 56ZM440-440h56l232-232-28-28-29-28-231 231v57Zm260-260-29-28 29 28 28 28-28-28Z" />
                    </svg>
                  </button>
                  <button className="op-btn" title="Change Password">
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
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default Members;
