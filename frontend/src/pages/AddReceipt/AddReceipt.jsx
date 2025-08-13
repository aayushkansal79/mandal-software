import React, { useState, useContext } from "react";
import axios from "axios";
import "./AddReceipt.css";
import toast from "react-hot-toast";

const AddReceipt = ({ url }) => {
  const token = localStorage.getItem("token");

  const [formData, setFormData] = useState({
    receiptNumber: "",
    name: "",
    amount: "",
    mobile: "",
    address: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!formData.receiptNumber || !formData.name || !formData.amount) {
        toast.error("Please fill in all required fields");
        return;
      }

      if (formData.mobile && formData.mobile.length !== 10) {
        toast.error("Mobile number must be 10 digits");
        return;
      }

      await axios.post(`${url}/api/receipt`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Receipt added successfully!");
      setFormData({
        receiptNumber: "",
        name: "",
        amount: "",
        mobile: "",
        address: "",
      });
    } catch (err) {
      console.error("Error adding receipt:", err);
      toast.error(err.response?.data?.message || "Error adding receipt");
    }
  };

  return (
    <>
      <div className="bread">Add Receipt</div>
      <form
        onSubmit={handleSubmit}
        className="addreceipt row g-3 my-3 mx-1 rounded"
      >
        <div className="col-md-6">
          <label className="form-label">Receipt Number*</label>
          <input
            type="number"
            name="receiptNumber"
            value={formData.receiptNumber}
            onChange={handleChange}
            className="form-control"
            placeholder="Enter Receipt Number"
            required
          />
        </div>
        <div className="col-md-6">
          <label className="form-label">Name*</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="form-control"
            placeholder="Enter Name"
            required
          />
        </div>
        <div className="col-md-6">
          <label className="form-label">Amount (₹)*</label>
          <input
            type="number"
            name="amount"
            value={formData.amount}
            onChange={handleChange}
            className="form-control"
            placeholder="Enter Amount"
            required
          />
        </div>
        <div className="col-md-6">
          <label className="form-label">Mobile Number</label>
          <input
            type="number"
            name="mobile"
            value={formData.mobile}
            onChange={handleChange}
            className="form-control"
            placeholder="Enter Mobile Number"
          />
        </div>
        <div className="col-12">
          <label className="form-label">Address</label>
          <input
            type="text"
            name="address"
            value={formData.address}
            onChange={handleChange}
            className="form-control"
            placeholder="Enter Address"
          />
        </div>
        <div className="disc">(*) Required fields</div>
        <div className="col-12">
          <button type="submit" className="btn btn-primary">
            Add Receipt
          </button>
        </div>
      </form>
    </>
  );
};

export default AddReceipt;
