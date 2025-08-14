import React, { useEffect, useState } from "react";
import "./AllPads.css";
import axios from "axios";

const AllPads = ({url}) => {

    const [pads, setPads] = useState([]);
    const token = localStorage.getItem("token");

    useEffect(() => {
        const fetchPads = async () => {
          try {
            const res = await axios.get(`${url}/api/receiptbook/pads`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            setPads(res.data);
            console.log("Pads fetched:", res.data);
          } catch (err) {
            console.error("Error fetching pads:", err);
          }
        };
        fetchPads();
      }, [url]);

  return (
    <>
      <div className="bread">All Pads</div>

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
              <th scope="col">Amount</th>
            </tr>
          </thead>
          <tbody className="table-group-divider">
            {pads.map((pad, index) => (
              <tr key={pad._id}>
                <th>{pad.padNumber}</th>
                <td>{pad.memberName}</td>
                <th className="text-success">₹ {pad.totalAmount}</th>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default AllPads;
