import React, { useContext, useState } from "react";
import axios from "axios";
import "./AddMember.css";
import { toast } from "react-hot-toast";
import { AuthContext } from "../../context/AuthContext";
import Loader from "../../components/Loader/Loader";

const AddMember = ({ url }) => {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    memberName: "",
    mobile: "",
    address: "",
    role: "Member",
    type: "member",
  });
  const [loading, setLoading] = useState(false);

  const [profilePic, setProfilePic] = useState(null); // NEW state for profile pic

  const { user } = useContext(AuthContext);
  const token = localStorage.getItem("token");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setProfilePic(e.target.files[0]); // Store the selected file
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (
        !formData.username ||
        !formData.password ||
        !formData.memberName ||
        !formData.mobile ||
        !formData.address ||
        !formData.role ||
        !formData.type
      ) {
        toast.error("Please fill in all fields");
        setLoading(false);
        return;
      }

      if (formData.password.length < 6) {
        toast.error("Password must be at least 6 characters");
        setLoading(false);
        return;
      }

      if (formData.mobile.length !== 10) {
        toast.error("Mobile number must be 10 digits");
        setLoading(false);
        return;
      }

      // Prepare FormData for file upload
      const payload = new FormData();
      payload.append("username", formData.username);
      payload.append("password", formData.password);
      payload.append("memberName", formData.memberName);
      payload.append("mobile", formData.mobile);
      payload.append("address", formData.address);
      payload.append("role", formData.role);
      payload.append("type", formData.type);
      payload.append("mandal", user?.mandal);
      payload.append("mandalId", user?.mandalId);

      if (profilePic) {
        payload.append("profilePic", profilePic);
      }

      const res = await axios.post(`${url}/api/user/register`, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      toast.success(res.data.message || "Member created successfully");

      // Reset form
      setFormData({
        username: "",
        password: "",
        memberName: "",
        mobile: "",
        address: "",
        role: "Member",
        type: "member",
      });
      setProfilePic(null);
    } catch (err) {
      toast.error(err.response?.data?.message || "Error creating member");
    } finally{
      setLoading(false);
    }
  };

  return (
    <>
      <div className="bread">Add Member</div>

      <form
        className="addmember row g-3 my-3 mx-1 rounded"
        onSubmit={handleSubmit}
        encType="multipart/form-data"
      >
        <div className="col-md-6">
          <label className="form-label">Username</label>
          <input
            type="text"
            name="username"
            className="form-control"
            placeholder="Enter Username"
            value={formData.username}
            onChange={handleChange}
            required
          />
        </div>

        <div className="col-md-6">
          <label className="form-label">Password</label>
          <input
            type="password"
            name="password"
            className="form-control"
            placeholder="Enter Password"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </div>

        <div className="col-md-6">
          <label className="form-label">Member Name</label>
          <input
            type="text"
            name="memberName"
            className="form-control"
            placeholder="Enter Member Name"
            value={formData.memberName}
            onChange={handleChange}
            required
          />
        </div>

        <div className="col-md-6">
          <label className="form-label">Mobile Number</label>
          <input
            type="text"
            name="mobile"
            className="form-control"
            placeholder="Enter Mobile Number"
            value={formData.mobile}
            onChange={handleChange}
            required
          />
        </div>

        <div className="col-12">
          <label className="form-label">Address</label>
          <textarea
            name="address"
            className="form-control"
            placeholder="Enter Address"
            rows="2"
            value={formData.address}
            onChange={handleChange}
            required
          ></textarea>
        </div>

        <div className="col-md-4">
          <label className="form-label">Role</label>
          <select
            name="role"
            className="form-select"
            value={formData.role}
            onChange={handleChange}
            required
          >
            <option value="Member">Member</option>
            <option value="Office">Office</option>
            <option value="Trustee">Trustee</option>
            <option value="Secretary">Secretary</option>
            <option value="Vice Treasurer">Vice Treasurer</option>
            <option value="Treasurer">Treasurer</option>
            <option value="Vice President">Vice President</option>
            <option value="President">President</option>
            <option value="Founder">Founder</option>
          </select>
        </div>

        <div className="col-md-4">
          <label className="form-label">Type</label>
          <select
            name="type"
            className="form-select"
            value={formData.type}
            onChange={handleChange}
            required
          >
            <option value="member">Member</option>
            <option value="subadmin">Sub Admin</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        <div className="col-md-4">
          <label className="form-label">Profile Picture</label>
          <input
            type="file"
            name="profilePic"
            className="form-control"
            onChange={handleFileChange}
            accept="image/*"
          />
        </div>

        <div className="col-12">
          <button type="submit" className="btn btn-primary">
            Create Member
          </button>
        </div>
      </form>

      {loading && <Loader />}
    </>
  );
};

export default AddMember;
