import React from "react";
import "./AddMember.css";

const AddMember = () => {
  return (
    <>
      <div className="bread">Add Member</div>

      <form className="addmember row g-3 mt-3 mb-3 mx-1 rounded">
        <div className="col-md-6">
          <label className="form-label">Username</label>
          <input
            type="text"
            className="form-control"
            placeholder="Enter Username"
          />
        </div>
        <div className="col-md-6">
          <label className="form-label">Password</label>
          <input
            type="password"
            className="form-control"
            placeholder="Enter Password"
          />
        </div>
        <div className="col-md-6">
          <label className="form-label">Member Name</label>
          <input
            type="text"
            className="form-control"
            placeholder="Enter Member Name"
          />
        </div>
        <div className="col-md-6">
          <label className="form-label">Mobile Number</label>
          <input
            type="text"
            className="form-control"
            placeholder="Enter Mobile Number"
          />
        </div>
        {/* <div className="col-12">
          <label className="form-label">
            Address
          </label>
          <input
          type="text"
          className="form-control"
          placeholder="Enter Address"
          />
          </div> */}
        <div class="form-floating">
          <label className="form-label">
            Address
          </label>
          <textarea
            className="form-control"
            placeholder="Leave a comment here"
            id="floatingTextarea"
          ></textarea>
          <label htmlFor="floatingTextarea">Address</label>
        </div>
        <div className="col-md-4">
          <label className="form-label">Role</label>
          <select className="form-select">
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
