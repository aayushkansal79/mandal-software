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

  const [filters, setFilters] = useState({
    receiptNumber: "",
    amount: "",
    memberName: "",
    name: "",
    mobile: "",
    year: "",
    // page: 1,
    // limit: 25,
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
        setReceipts(res.data);
        // setTotalPages(res.data.pages || 1);
        // setCurrentPage(res.data.page || 1);
      } catch (err) {
        console.error("Error fetching receipts:", err);
      }
    };
    fetchReceipts();
  }, [url, filters]);

  // const handlePageChange = (page) => {
  //   setFilters((prev) => ({ ...prev, page }));
  // };

  // const handleLimitChange = (limit) => {
  //   setFilters((prev) => ({ ...prev, limit }));
  // };

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
      setEditData({}); // reset after save
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

      {user !== "member" && (
        <div className="row g-2 mb-4 px-2 mt-2">
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
              onChange={(e) =>
                setFilters({ ...filters, amount: e.target.value })
              }
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
          <div className="col-md-2 col-6">
            <label className="form-label">Donor Name:</label>
            <input
              className="form-control"
              placeholder="Enter Donor Name"
              value={filters.name}
              onChange={(e) => setFilters({ ...filters, name: e.target.value })}
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
      )}

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
                        >
                          Save
                        </button>
                        <button
                          className="btn btn-secondary btn-sm small"
                          onClick={() => setEditIndex(null)}
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

      {/* <Pagination
        limit={filters.limit}
        handleLimitChange={handleLimitChange}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      /> */}
      
      {loading && <Loader />}
    </>
  );
};

export default AllReceipts;
