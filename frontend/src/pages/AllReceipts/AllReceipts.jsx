import React, { useContext, useEffect, useState } from "react";
import "./AllReceipts.css";
import axios from "axios";
import { AuthContext } from "../../context/AuthContext";
import toast from "react-hot-toast";
import Loader from "../../components/Loader/Loader";
import Pagination from "../../components/Pagination/Pagination";

const AllReceipts = ({ url }) => {
  const [receipts, setReceipts] = useState([]);
  const [editIndex, setEditIndex] = useState(null);
  const [editData, setEditData] = useState({});
  const token = localStorage.getItem("token");
  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const [filters, setFilters] = useState({
    receiptNumber: "",
    amount: "",
    memberName: "",
    name: "",
    mobile: "",
    year: "",
    page: 1,
    limit: 50,
    exportExcel: "",
  });

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const fetchReceipts = async () => {
      try {
        const params = new URLSearchParams();

        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== "") {
            params.append(key, String(value).trim());
          }
        });
        const res = await axios.get(`${url}/api/receipt?${params.toString()}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setReceipts(res.data.receipts);
        setTotalPages(res.data.pages || 1);
        setCurrentPage(res.data.page || 1);
      } catch (err) {
        console.error("Error fetching receipts:", err);
      }
    };
    fetchReceipts();
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

      const res = await axios.get(`${url}/api/receipt?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: "blob",
      });

      const blob = new Blob([res.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const link = document.createElement("a");
      link.href = window.URL.createObjectURL(blob);
      link.download = `Receipts_${
        filters.year || new Date().getFullYear()
      }.xlsx`;
      link.click();
    } catch (err) {
      console.error(err);
      toast.error("Failed to download Excel");
    } finally {
      setDownloading(false);
    }
  };

  const exportReceipts = async () => {
    setDownloading(true);
    try {
      const res = await axios.get(
        `${url}/api/receipt/export-groups?year=${
          filters.year || new Date().getFullYear()
        }`,
        {
          headers: { Authorization: `Bearer ${token}` },
          responseType: "blob",
        }
      );

      const blob = new Blob([res.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const downloadLink = document.createElement("a");
      downloadLink.href = window.URL.createObjectURL(blob);
      downloadLink.download = `Receipts_${
        filters.year || new Date().getFullYear()
      }_Groups.xlsx`;
      downloadLink.click();

      toast.success("Receipts (Grouped) exported successfully!");
    } catch (error) {
      console.error("Error exporting receipts:", error);
      toast.error(
        error?.response?.data?.message || "Failed to export grouped receipts"
      );
    } finally {
      setDownloading(false);
    }
  };

  const handleSave = async (id) => {
    setLoading(true);
    try {
      const res = await axios.patch(
        `${url}/api/receipt/admin/${id}`,
        editData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const updatedReceipt = res.data.updatedReceipt;

      if (!updatedReceipt || !updatedReceipt._id) {
        throw new Error("Invalid response from server");
      }

      setReceipts((prev) =>
        prev.map((r) => (r._id === id ? { ...r, ...updatedReceipt } : r))
      );

      toast.success(`Receipt updated successfully`);
      setEditIndex(null);
      setEditData({});
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to update receipt");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="bread">All Receipts</div>

      <div className="row g-1 mb-1 px-2 mt-1">
        <div className="col-md-2 col-6">
          <label className="form-label">Receipt Number:</label>
          <input
            className="form-control"
            placeholder="Enter Receipt No."
            type="number"
            value={filters.receiptNumber}
            onChange={(e) =>
              setFilters({ ...filters, receiptNumber: e.target.value })
            }
          />
        </div>
        <div className="col-md-2 col-6">
          <label className="form-label">Amount Category:</label>
          <select
            className="form-select"
            value={filters.amount}
            onChange={(e) => setFilters({ ...filters, amount: e.target.value })}
          >
            <option value="">Select Amount</option>
            <option value="1100">₹ 1100 &gt;=</option>
            <option value="5100">₹ 5100 &gt;=</option>
            <option value="11000">₹ 11000 &gt;=</option>
            <option value="21000">₹ 21000 &gt;=</option>
            <option value="51000">₹ 51000 &gt;=</option>
            <option value="100000">₹ 100000 &gt;=</option>
          </select>
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
        {user?.type !== "member" && (
          <>
            <div className="col-md-2 col-6">
              <label className="form-label">Donor Name:</label>
              <input
                className="form-control"
                placeholder="Enter Donor Name"
                value={filters.name}
                onChange={(e) =>
                  setFilters({ ...filters, name: e.target.value })
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
                onChange={(e) =>
                  setFilters({ ...filters, mobile: e.target.value })
                }
              />
            </div>
          </>
        )}
        <div className="col-md-1 col-4">
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
        {user?.type !== "member" && (
          <div className="col-md-1 col-2 align-self-end d-flex justify-content-around">
            <button
              className="btn btn-sm btn-success"
              onClick={handleDownloadExcel}
              title="Download All Receipts Excel"
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
            <button
              className="btn btn-sm btn-warning"
              onClick={exportReceipts}
              title="Download Pad wise Excel"
              disabled={downloading}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                height="24px"
                viewBox="0 -960 960 960"
                width="24px"
                fill="black"
              >
                <path d="M300-80q-58 0-99-41t-41-99v-520q0-58 41-99t99-41h500v600q-25 0-42.5 17.5T740-220q0 25 17.5 42.5T800-160v80H300Zm-60-267q14-7 29-10t31-3h20v-440h-20q-25 0-42.5 17.5T240-740v393Zm160-13h320v-440H400v440Zm-160 13v-453 453Zm60 187h373q-6-14-9.5-28.5T660-220q0-16 3-31t10-29H300q-26 0-43 17.5T240-220q0 26 17 43t43 17Z" />
              </svg>
            </button>
          </div>
        )}
      </div>

      <div className="AllReceipts rounded my-3">
        <table className="table align-middle table-striped table-hover my-0">
          <thead className="table-primary">
            <tr>
              <th scope="col">Receipt No.</th>
              <th scope="col">Member Name</th>
              {user?.type !== "member" && <th scope="col">Name</th>}
              <th scope="col" className="text-end">
                Amount
              </th>
              {user?.type !== "member" && (
                <>
                  <th scope="col">Mobile No.</th>
                  <th scope="col">Address</th>
                  <th scope="col">Date & Time</th>
                </>
              )}
              {user?.type === "admin" && <th>Actions</th>}
            </tr>
          </thead>
          <tbody className="table-group-divider">
            {receipts.length === 0 && (
              <tr>
                <td
                  colSpan={user?.type !== "member" ? 8 : 3}
                  className="text-center"
                >
                  No Receipts Found
                </td>
              </tr>
            )}
            {receipts.map((receipt, index) => (
              <tr key={receipt._id}>
                <th>
                  {editIndex === index ? (
                    <input
                      type="number"
                      className="form-control form-control-sm"
                      value={editData.receiptNumber}
                      onChange={(e) =>
                        setEditData({
                          ...editData,
                          receiptNumber: e.target.value,
                        })
                      }
                    />
                  ) : (
                    receipt.receiptNumber
                  )}
                </th>
                <td>{receipt.memberName}</td>
                {user?.type !== "member" && (
                  <td>
                    {editIndex === index ? (
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        value={editData.name}
                        onChange={(e) =>
                          setEditData({ ...editData, name: e.target.value })
                        }
                      />
                    ) : (
                      receipt.name
                    )}
                  </td>
                )}
                <th className="text-success text-end">
                  {editIndex === index ? (
                    <input
                      type="number"
                      className="form-control form-control-sm"
                      value={editData.amount}
                      onChange={(e) =>
                        setEditData({ ...editData, amount: e.target.value })
                      }
                    />
                  ) : (
                    `₹ ${receipt.amount}`
                  )}
                </th>
                {user?.type !== "member" && (
                  <>
                    <td>
                      {editIndex === index ? (
                        <input
                          type="number"
                          className="form-control form-control-sm"
                          value={editData.mobile ?? ""}
                          onChange={(e) =>
                            setEditData({ ...editData, mobile: e.target.value })
                          }
                        />
                      ) : (
                        receipt.mobile || "-"
                      )}
                    </td>
                    <td>
                      {editIndex === index ? (
                        <input
                          type="text"
                          className="form-control form-control-sm"
                          value={editData.address ?? ""}
                          onChange={(e) =>
                            setEditData({
                              ...editData,
                              address: e.target.value,
                            })
                          }
                        />
                      ) : (
                        receipt.address || "-"
                      )}
                    </td>
                    <td className="small">
                      {new Date(receipt.updatedAt).toLocaleString("en-IN")}
                    </td>
                  </>
                )}
                {user?.type === "admin" && (
                  <td>
                    {editIndex === index ? (
                      <div className="d-flex gap-2">
                        <button
                          className="btn btn-success btn-sm small"
                          onClick={() => handleSave(receipt._id)}
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
                          setEditData(receipt);
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

      {loading && <Loader />}
    </>
  );
};

export default AllReceipts;
