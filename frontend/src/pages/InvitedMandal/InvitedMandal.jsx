import axios from "axios";
import React from "react";
import { useState } from "react";
import { useEffect } from "react";
import "./InvitedMandal.css";

const InvitedMandals = ({ url }) => {
  const [mandals, setMandals] = useState([]);
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchMandals = async () => {
      try {
        const params = new URLSearchParams();

        // Object.entries(filters).forEach(([key, value]) => {
        //   if (value && value.trim()) {
        //     params.append(key, value.trim());
        //   }
        // });
        const res = await axios.get(
          `${url}/api/invitedmandal?${params.toString()}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setMandals(res.data);
      } catch (err) {
        console.error("Error fetching mandals:", err);
      }
    };
    fetchMandals();
  }, [url]);
  return (
    <>
      <div className="bread">Invited Mandals</div>

      <div className="row g-2 mb-4 px-2 mt-2">
        <div className="col-md-2 col-6">
          <label className="form-label">Mandal Name:</label>
          <input
            type="text"
            className="form-control"
            placeholder="Enter Mandal Name"
            // value={filters.mandalName}
            // onChange={(e) =>
            //   setFilters({ ...filters, mandalName: e.target.value })
            // }
          />
        </div>
        <div className="col-md-2 col-6">
          <label className="form-label">Address:</label>
          <input
            type="text"
            className="form-control"
            placeholder="Enter Address"
            // value={filters.address}
            // onChange={(e) =>
            //   setFilters({ ...filters, address: e.target.value })
            // }
          />
        </div>
        <div className="col-md-2 col-6">
          <label className="form-label">Contact Person:</label>
          <input
            className="form-control"
            placeholder="Enter Contact Person"
            // value={filters.contactPerson}
            // onChange={(e) =>
            //   setFilters({ ...filters, contactPerson: e.target.value })
            // }
          />
        </div>
        <div className="col-md-2 col-6">
          <label className="form-label">Mobile Number:</label>
          <input
            type="number"
            className="form-control"
            placeholder="Enter Mobile No."
            // value={filters.mobileNumber}
            // onChange={(e) =>
            //   setFilters({ ...filters, mobileNumber: e.target.value })
            // }
          />
        </div>
      </div>

      <div className="Mandal rounded my-3">
        <table className="table align-middle table-striped table-hover my-0">
          <thead className="table-success">
            <tr>
              <th>#</th>
              <th>Mandal Name</th>
              <th>Contact Person</th>
              <th>Mobile</th>
              <th>Address</th>
            </tr>
          </thead>
          <tbody className="table-group-divider">
            {mandals.length === 0 && (
              <tr>
                <td colSpan="5" className="text-center">
                  No Mandals Found
                </td>
              </tr>
            )}
            {mandals.map((mandal, index) => (
              <tr key={mandal._id}>
                <th>{index + 1}</th>
                <th>{mandal.mandalName}</th>
                <td>{mandal.contactPerson}</td>
                <td>{mandal.mobile || "-"}</td>
                <td>{mandal.address}</td>
            </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default InvitedMandals;
