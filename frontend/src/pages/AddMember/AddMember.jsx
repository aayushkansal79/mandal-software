import React from "react";
import "./AddMember.css";

const AddMember = () => {
  return (
    <>
      <div className="bread">Add Member</div>

      <form className="addmember row g-3 my-4 mx-1 rounded">
        <div className="col-md-6">
          <label className="form-label">Username</label>
          <input
            type="text"
            className="form-control"
            placeholder="Enter Username"
            required
          />
        </div>
        <div className="col-md-6">
          <label className="form-label">Password</label>
          <input
            type="password"
            className="form-control"
            placeholder="Enter Password"
            required
          />
        </div>
        <div className="col-md-6">
          <label className="form-label">Member Name</label>
          <input
            type="text"
            className="form-control"
            placeholder="Enter Member Name"
            required
          />
        </div>
        <div className="col-md-6">
          <label className="form-label">Mobile Number</label>
          <input
            type="text"
            className="form-control"
            placeholder="Enter Mobile Number"
            required
          />
        </div>
        <div className="col-12">
          <label className="form-label">Address</label>
          <textarea
            className="form-control"
            placeholder="Enter Address"
            rows="3"
            required
          ></textarea>
        </div>
        <div className="col-md-4">
          <label className="form-label">Role</label>
          <select className="form-select" required>
            <option value="member" selected>
              Member
            </option>
            <option value="subadmin">Sub Admin</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        <div className="col-12">
          <button type="submit" className="btn btn-primary">
            Create Member
          </button>
        </div>
      </form>
    </>
  );
};

export default AddMember;
