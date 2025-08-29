import axios from "axios";
import React from "react";
import { useState } from "react";
import { useEffect } from "react";
import "./InvitedMandal.css";
import Pagination from "../../components/Pagination/Pagination";
import { useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import toast from "react-hot-toast";

const InvitedMandals = ({ url }) => {
  const [mandals, setMandals] = useState([]);
  const [editIndex, setEditIndex] = useState(null);
  const [editData, setEditData] = useState({});
  const token = localStorage.getItem("token");
  const { user } = useContext(AuthContext);
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
          responseType: "blob",
        }
      );

      const blob = new Blob([res.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const link = document.createElement("a");
      link.href = window.URL.createObjectURL(blob);
      link.download = `InvitedMandals.xlsx`;
      link.click();
      toast.success("Mandal List exported successfully!")
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Failed to download Excel");
    } finally {
      setDownloading(false);
    }
  };

  const handleSave = async (id) => {
    try {
      await axios.patch(`${url}/api/invitedmandal/${id}`, editData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setMandals((prev) =>
        prev.map((m) => (m._id === id ? { ...m, ...editData } : m))
      );
      toast.success("Mandal updated successfully!")
      setEditIndex(null);
    } catch (err) {
      console.error("Error updating mandal:", err);
      toast.error(err?.response?.data?.message || "Failed to update mandal");
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
              {/* <th>Date & Time</th> */}
              <th>Edit</th>
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
                <th>
                  {editIndex === index ? (
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      value={editData.mandalName}
                      onChange={(e) =>
                        setEditData({
                          ...editData,
                          mandalName: e.target.value,
                        })
                      }
                    />
                  ) : (
                    mandal.mandalName
                  )}
                </th>
                <td>
                  {editIndex === index ? (
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      value={editData.contactPerson}
                      onChange={(e) =>
                        setEditData({
                          ...editData,
                          contactPerson: e.target.value,
                        })
                      }
                    />
                  ) : (
                    mandal.contactPerson
                  )}
                </td>
                <td>
                  {editIndex === index ? (
                    <input
                      type="number"
                      className="form-control form-control-sm"
                      value={editData.mobile}
                      onChange={(e) =>
                        setEditData({
                          ...editData,
                          mobile: e.target.value,
                        })
                      }
                    />
                  ) : (
                    mandal.mobile || "-"
                  )}
                </td>
                <td>
                  {editIndex === index ? (
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      value={editData.address}
                      onChange={(e) =>
                        setEditData({
                          ...editData,
                          address: e.target.value,
                        })
                      }
                    />
                  ) : (
                    mandal.address
                  )}
                </td>
                {/* <td className="small">
                  {new Date(mandal.createdAt).toLocaleString()}
                </td> */}
                {user?.type !== "member" && (
                  <td>
                    {editIndex === index ? (
                      <div className="d-flex gap-2">
                        <button
                          className="btn btn-success btn-sm small"
                          onClick={() => handleSave(mandal._id)}
                          title="Save"
                        >
                          Save
                        </button>
                        <button
                          className="btn btn-secondary btn-sm small"
                          onClick={() => setEditIndex(null)}
                          title="Cancel"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        className="op-btn"
                        onClick={() => {
                          setEditIndex(index);
                          setEditData(mandal);
                        }}
                        title="Edit"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          height="24px"
                          viewBox="0 -960 960 960"
                          width="24px"
                          fill="red"
                        >
                          <path d="M200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h357l-80 80H200v560h560v-278l80-80v358q0 33-23.5 56.5T760-120H200Zm280-360ZM360-360v-170l367-367q12-12 27-18t30-6q16 0 30.5 6t26.5 18l56 57q11 12 17 26.5t6 29.5q0 15-5.5 29.5T897-728L530-360H360Zm481-424-56-56 56 56ZM440-440h56l232-232-28-28-29-28-231 231v57Zm260-260-29-28 29 28 28 28-28-28Z" />
                        </svg>
                      </button>
                    )}
                  </td>
                )}
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
