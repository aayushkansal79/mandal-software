import React, { useEffect, useState } from "react";
import "./AllPads.css";
import axios from "axios";

const AllPads = ({ url }) => {
  const [pads, setPads] = useState([]);
  const token = localStorage.getItem("token");

  const [filters, setFilters] = useState({
    padNumber: "",
    memberName: "",
    year: "",
  });

  useEffect(() => {
    const fetchPads = async () => {
      try {
        const params = new URLSearchParams();

        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== "") {
            params.append(key, String(value).trim());
          }
        });
        const res = await axios.get(`${url}/api/receiptbook/pads?${params.toString()}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setPads(res.data);
        console.log("Pads fetched:", res.data);
      } catch (err) {
        console.error("Error fetching pads:", err);
      }
    };
    fetchPads();
  }, [url, filters]);

  return (
    <>
      <div className="bread">All Pads</div>

      <div className="row g-2 mb-4 px-2 mt-2">
        <div className="col-md-2 col-6">
          <label className="form-label">Pad Number:</label>
          <input
            type="number"
            className="form-control"
            placeholder="Enter Pad Number"
            value={filters.padNumber}
            onChange={(e) =>
              setFilters({ ...filters, padNumber: e.target.value })
            }
          />
        </div>
        <div className="col-md-2 col-6">
          <label className="form-label">Member Name:</label>
          <input
            className="form-control"
            placeholder="Enter Member Name"
            value={filters.memberName}
            onChange={(e) =>
              setFilters({ ...filters, memberName: e.target.value })
            }
          />
        </div>
        <div className="col-md-2 col-6">
          <label className="form-label">Year:</label>
          <select
            className="form-select"
            value={filters.year}
            onChange={(e) => setFilters({ ...filters, year: e.target.value })}
          >
            {Array.from(
              { length: new Date().getFullYear() - 2025 + 1 },
              (_, i) => new Date().getFullYear() - i
            ).map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="AllReceipts rounded my-3">
        <table className="table align-middle table-striped table-hover my-0">
          <thead className="table-primary">
            <tr>
              <th scope="col">Pad No.</th>
              <th scope="col">Member Name</th>
              <th scope="col">Amount</th>
            </tr>
          </thead>
          <tbody className="table-group-divider">
            {pads.length === 0 && (
              <tr>
                <td colSpan="3" className="text-center">
                  No Pads Found
                </td>
              </tr>
            )}
            {pads.map((pad, index) => (
              <tr key={pad._id}>
                <th>{pad.padNumber}</th>
                <td>{pad.memberName}</td>
                <th className="text-success">
                  ₹ {pad.totalAmount.toLocaleString("en-IN")}
                </th>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default AllPads;
