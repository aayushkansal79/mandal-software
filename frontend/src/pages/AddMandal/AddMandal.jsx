import axios from "axios";
import React from "react";
import { useState } from "react";
import toast from "react-hot-toast";

const AddMandal = ({url}) => {
  const [loading, setLoading] = useState(false);
  const token = localStorage.getItem("token");

  const [formData, setFormData] = useState({
    mandalName: "",
    contactPerson: "",
    mobile: "",
    address: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (
        formData.mandalName === "" ||
        formData.address === "" ||
        formData.contactPerson === "" ||
        formData.mobile === ""
      ) {
        toast.error("Please fill in all fields");
        setLoading(false);
        return;
      }

      if (formData.mobile.length !== 10 ) {
        toast.error("Mobile number must be 10 digits");
        setLoading(false);
        return;
      }

      const res = await axios.post(`${url}/api/invitedmandal`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success(res.data.message || "Mandal added successfully!");
      setFormData({
        mandalName: "",
        contactPerson: "",
        mobile: "",
        address: "",
      });
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to add mandal.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="bread">Add Mandal</div>

      <form
        className="addmember row g-3 my-3 mx-1 rounded"
        onSubmit={handleSubmit}
        encType="multipart/form-data"
      >
        <div className="col-md-6">
          <label className="form-label">Mandal Name*</label>
          <textarea
            name="mandalName"
            className="form-control"
            placeholder="Enter Mandal Name"
            rows="2"
            value={formData.mandalName}
            onChange={handleChange}
            required
          ></textarea>
        </div>

        <div className="col-md-6">
          <label className="form-label">Mandal Address*</label>
          <textarea
            name="address"
            className="form-control"
            placeholder="Enter Mandal Address"
            rows="2"
            value={formData.address}
            onChange={handleChange}
            required
          ></textarea>
        </div>

        <div className="col-md-6">
          <label className="form-label">Contact Person Name</label>
          <input
            type="text"
            name="contactPerson"
            className="form-control"
            placeholder="Enter Contact Person"
            value={formData.contactPerson}
            onChange={handleChange}
            required
          />
        </div>

        <div className="col-md-6">
          <label className="form-label">Mobile Number</label>
          <input
            type="number"
            name="mobile"
            className="form-control"
            placeholder="Enter Mobile Number"
            value={formData.mobile}
            onChange={handleChange}
            required
          />
        </div>

        <div className="col-12">
          <button type="submit" className="btn btn-primary">
            Add Mandal
          </button>
        </div>
      </form>
    </>
  );
};

export default AddMandal;
