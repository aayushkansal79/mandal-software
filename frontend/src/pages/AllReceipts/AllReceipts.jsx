import React, { useEffect, useState } from "react";
import "./AllReceipts.css";
import axios from "axios";

const AllReceipts = ({url}) => {

    const [receipts, setReceipts] = useState([]);
    const token = localStorage.getItem("token");

    useEffect(() => {
        const fetchReceipts = async () => {
          try {
            const res = await axios.get(`${url}/api/receipt`, {
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
          <label className="form-label">Donor Name:</label>
          <input
            className="form-control"
            placeholder="Enter Donor Name"
            // value={filters.customerName}
            // onChange={(e) =>
            //   setFilters({ ...filters, customerName: e.target.value })
            // }
          />
        </div>
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
          <label className="form-label">Donor Name:</label>
          <input
            className="form-control"
            placeholder="Enter Donor Name"
            // value={filters.customerName}
            // onChange={(e) =>
            //   setFilters({ ...filters, customerName: e.target.value })
            // }
          />
        </div>
      </div>

      <div className="AllReceipts rounded my-3">
        <table className="table align-middle table-striped table-hover my-0">
          <thead className="table-primary">
            <tr>
              <th scope="col">#</th>
              <th scope="col">Member Name</th>
              <th scope="col">Name</th>
              <th scope="col">Amount</th>
              <th scope="col">Mobile No.</th>
              <th scope="col">Address</th>
            </tr>
          </thead>
          <tbody className="table-group-divider">
            {receipts.map((receipt, index) => (
              <tr key={receipt._id}>
                <th>{receipt.receiptNumber}</th>
                <td>{receipt.memberName}</td>
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

export default AllReceipts;
