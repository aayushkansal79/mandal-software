import React, { useEffect, useState } from "react";
import "./MyReceipts.css";
import axios from "axios";

const MyReceipts = ({url}) => {

    const [receipts, setReceipts] = useState([]);
    const token = localStorage.getItem("token");

    useEffect(() => {
        const fetchReceipts = async () => {
          try {
            const res = await axios.get(`${url}/api/receipt/member`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            setReceipts(res.data);
          } catch (err) {
            console.error("Error fetching receipts:", err);
          }
        };
        fetchReceipts();
      }, [url]);

  return (
    <>
      <div className="bread">All Receipts</div>

      <div className="row g-2 mb-4 px-2 mt-2">
        <div className="col-md-2 col-6">
          <label className="form-label">Receipt Number:</label>
          <input
            className="form-control"
            placeholder="Enter Receipt Number"
            type="number"
            // value={filters.invoiceNumber}
            // onChange={(e) =>
            //   setFilters({ ...filters, invoiceNumber: e.target.value })
            // }
          />
        </div>
        <div className="col-md-2 col-6">
          <label className="form-label">Amount Category:</label>
          <select className="form-select">
            <option value="">Select Amount</option>
            <option value="1100">&gt;= ₹ 1100</option>
            <option value="5100">&gt;= ₹ 5100</option>
            <option value="11000">&gt;= ₹ 11000</option>
            <option value="21000">&gt;= ₹ 21000</option>
            <option value="51000">&gt;= ₹ 51000</option>
            <option value="100000">&gt;= ₹ 100000</option>
          </select>
        </div>
        <div className="col-md-2 col-6">
          <label className="form-label">Donor Name:</label>
          <input
            className="form-control"
            placeholder="Enter Donor Name"
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

      <div className="AllReceipts rounded my-3">
        <table className="table align-middle table-striped table-hover my-0">
          <thead className="table-danger">
            <tr>
              <th scope="col">Receipt No.</th>
              <th scope="col">Name</th>
              <th scope="col">Amount</th>
              <th scope="col">Mobile No.</th>
              <th scope="col">Address</th>
            </tr>
          </thead>
          <tbody className="table-group-divider">
            {receipts.length === 0 && (
              <tr>
                <td colSpan="5" className="text-center">
                  No Receipts Found
                </td>
              </tr>
            )}
            {receipts.map((receipt, index) => (
              <tr key={receipt._id}>
                <th>{receipt.receiptNumber}</th>
                <td>{receipt.name}</td>
                <th className="text-success">₹ {receipt.amount}</th>
                <td>{receipt.mobile || "-"}</td>
                <td>{receipt.address || "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default MyReceipts;
