import React, { useContext, useEffect, useState } from "react";
import "./MemberList.css";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import toast from "react-hot-toast";
import Swal from "sweetalert2";

const MemberList = ({ url }) => {
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
  return (
    <>
      <div className="bread">Member Profiles</div>

      <div className="MemberReceipt rounded my-3">
        <table className="table align-middle table-striped table-hover my-0">
          <thead className="table-info">
            <tr>
              <th></th>
              <th scope="col">Member</th>
              <th scope="col">Member Details</th>
              {user.type === "admin" && <th scope="col">Type</th>}
            </tr>
          </thead>
          <tbody className="table-group-divider">
            {members
            .filter(member => member.memberName !== 'Admin')
            .map((member, index) => (
              <tr key={index}>
                <td>
                  <img
                    className="rounded-circle"
                    src={`${url}${member.profilePic}`}
                    height={70}
                    width={70}
                    alt=""
                  />
                </td>
                <th style={{ color: "#6d0616" }}>{member.memberName} <br /> <span className="text-primary">{member.role}</span></th>
                <td className="text-start"><b>Mobile:</b> {member.mobile} <br /> <b>Address:</b> {member.address}</td>
                {user.type === "admin" && (
                  <td style={{ width: "130px" }}>
                    {member.type !== "admin" ? (
                      <select className="form-select" value={member.type}>
                        <option value="admin">Admin</option>
                        <option value="subadmin">Sub Admin</option>
                        <option value="member">Member</option>
                      </select>
                    ) : (
                      <span className="text-success">{member.type}</span>
                    )}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default MemberList;
