import axios from "axios";
import React from "react";
import { useState } from "react";
import { useEffect } from "react";
import "./InvitedMandal.css";
import Pagination from "../../components/Pagination/Pagination";
import { useContext } from "react";
import { AuthContext } from "../../context/AuthContext";

const InvitedMandals = ({ url }) => {
  const [mandals, setMandals] = useState([]);
  const token = localStorage.getItem("token");
  const {user} = useContext(AuthContext)
  const [downloading, setDownloading] = useState(false);

  const [filters, setFilters] = useState({
    mandalName: "",
    contactPerson: "",
    address: "",
    mobile: "",
    exportExcel: "",
    page: 1,
    limit: 50,
  });

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const fetchMandals = async () => {
      try {
        const params = new URLSearchParams();

        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== "") {
            params.append(key, String(value).trim());
          }
        });
        const res = await axios.get(
          `${url}/api/invitedmandal?${params.toString()}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setMandals(res.data.mandals);
        setCurrentPage(res.data.page || 1);
        setTotalPages(res.data.pages || 1);
      } catch (err) {
        console.error("Error fetching mandals:", err);
      }
    };
    fetchMandals();
  }, [url, filters]);

  const handlePageChange = (page) => {
    setFilters((prev) => ({ ...prev, page }));
  };

  const handleLimitChange = (limit) => {
    setFilters((prev) => ({ ...prev, limit }));
  };

  const handleDownloadExcel = async () => {
    setDownloading(true);
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          params.append(key, String(value).trim());
        }
      });

      params.append("exportExcel", "true");

      const res = await axios.get(
        `${url}/api/invitedmandal?${params.toString()}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          responseType: "blob", // important for binary data
        }
      );

      // Create a link to download the file
      const blob = new Blob([res.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const link = document.createElement("a");
      link.href = window.URL.createObjectURL(blob);
      link.download = `InvitedMandals.xlsx`;
      link.click();
    } catch (err) {
      console.error(err);
      toast.error("Failed to download Excel");
    } finally {
      setDownloading(false);
    }
  };

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
            value={filters.mandalName}
            onChange={(e) =>
              setFilters({ ...filters, mandalName: e.target.value })
            }
          />
        </div>
        <div className="col-md-2 col-6">
          <label className="form-label">Address:</label>
          <input
            type="text"
            className="form-control"
            placeholder="Enter Address"
            value={filters.address}
            onChange={(e) =>
              setFilters({ ...filters, address: e.target.value })
            }
          />
        </div>
        <div className="col-md-2 col-6">
          <label className="form-label">Contact Person:</label>
          <input
            className="form-control"
            placeholder="Enter Contact Person"
            value={filters.contactPerson}
            onChange={(e) =>
              setFilters({ ...filters, contactPerson: e.target.value })
            }
          />
        </div>
        <div className="col-md-2 col-6">
          <label className="form-label">Mobile Number:</label>
          <input
            type="number"
            className="form-control"
            placeholder="Enter Mobile No."
            value={filters.mobile}
            onChange={(e) => setFilters({ ...filters, mobile: e.target.value })}
          />
        </div>
        {user?.type !== "member" && (
          <div className="col-md-1 col-2 align-self-end text-center">
            <button
              className="btn btn-sm btn-success"
              onClick={handleDownloadExcel}
              title="Download Excel"
              disabled={downloading}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                height="24px"
                viewBox="0 -960 960 960"
                width="24px"
                fill="white"
              >
                <path d="m720-120 160-160-56-56-64 64v-167h-80v167l-64-64-56 56 160 160ZM560 0v-80h320V0H560ZM240-160q-33 0-56.5-23.5T160-240v-560q0-33 23.5-56.5T240-880h280l240 240v121h-80v-81H480v-200H240v560h240v80H240Zm0-80v-560 560Z" />
              </svg>
            </button>
          </div>
        )}
      </div>

      <div className="Mandal rounded my-3">
        <table className="table align-middle table-striped table-hover my-0">
          <thead className="table-success">
            <tr>
              <th>#</th>
              <th>Mandal Name</th>
              <th>Contact Person</th>
              <th>Mobile Number</th>
              <th>Address</th>
              <th>Date & Time</th>
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
                <th>{(filters.page - 1) * filters.limit + index + 1}</th>
                <th>{mandal.mandalName}</th>
                <td>{mandal.contactPerson}</td>
                <td>{mandal.mobile || "-"}</td>
                <td>{mandal.address}</td>
                <td className="small">
                  {new Date(mandal.createdAt).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Pagination
        limit={filters.limit}
        handleLimitChange={handleLimitChange}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />
    </>
  );
};

export default InvitedMandals;
