import React, { useState, useContext, useEffect } from "react";
import axios from "axios";
import "./OtherIncome.css";
import toast from "react-hot-toast";
import Loader from "../../components/Loader/Loader";
import { AuthContext } from "../../context/AuthContext";
import Pagination from "../../components/Pagination/Pagination";

const OtherIncome = ({ url }) => {
  const token = localStorage.getItem("token");
  const { user } = useContext(AuthContext);

  const [formData, setFormData] = useState({
    description: "",
    amount: "",
    mobile: "",
  });
  const [loading, setLoading] = useState(false);
  const [openIncomeModel, setOpenIncomeModel] = useState(false);
  const [income, setIncome] = useState([]);
  const [editIndex, setEditIndex] = useState(null);
  const [editData, setEditData] = useState({});

  const [filters, setFilters] = useState({
    description: "",
    amount: "",
    mobile: "",
    year: "",
    page: 1,
    limit: 50,
    exportExcel: "",
  });

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (!formData.description || !formData.amount) {
        toast.error("Please fill in all required fields");
        setLoading(false);
        return;
      }

      if (formData.mobile && formData.mobile.length !== 10) {
        toast.error("Mobile number must be 10 digits");
        setLoading(false);
        return;
      }

      await axios.post(`${url}/api/other-income`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Other Income added successfully!");
      setFormData({
        description: "",
        amount: "",
        mobile: "",
      });
    } catch (err) {
      console.error("Error adding other income:", err);
      toast.error(err.response?.data?.message || "Error adding other income");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchOtherIncome = async () => {
      try {
        const params = new URLSearchParams();

        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== "") {
            params.append(key, String(value).trim());
          }
        });
        const res = await axios.get(
          `${url}/api/other-income?${params.toString()}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setIncome(res.data.incomes);
        setTotalPages(res.data.pages || 1);
        setCurrentPage(res.data.page || 1);
      } catch (err) {
        console.error("Error fetching other income:", err);
      }
    };
    fetchOtherIncome();
  }, [url, filters]);

  const handlePageChange = (page) => {
    setFilters((prev) => ({ ...prev, page }));
  };

  const handleLimitChange = (limit) => {
    setFilters((prev) => ({ ...prev, limit }));
  };

  const handleDownloadExcel = async () => {
    // setDownloading(true);
    setLoading(true);
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          params.append(key, String(value).trim());
        }
      });

      params.append("exportExcel", "true");

      const res = await axios.get(
        `${url}/api/other-income?${params.toString()}`,
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
      link.download = `Other_Income_${
        filters.year || new Date().getFullYear()
      }.xlsx`;
      link.click();
      toast.success("Other Income exported successfully!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to download Excel");
    } finally {
      // setDownloading(false);
      setLoading(false);
    }
  };

  const handleSave = async (id) => {
    setLoading(true);
    try {
      if (editData.mobile && editData.mobile.length !== 10) {
        toast.error("Mobile number must be 10 digits");
        setLoading(false);
        return;
      }

      const res = await axios.put(`${url}/api/other-income/${id}`, editData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const updatedIncome = res.data.data;

      if (!updatedIncome || !updatedIncome._id) {
        throw new Error("Invalid response from server");
      }

      setIncome((prev) =>
        prev.map((r) => (r._id === id ? { ...r, ...updatedIncome } : r))
      );

      toast.success(`Income updated successfully`);
      setEditIndex(null);
      setEditData({});
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to update income");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="bread">Other Income</div>

      <div className="row g-1 mb-1 px-2 mt-1 align-items-end">
        <div className="col-md-2 col-6">
          <label className="form-label">Name:</label>
          <input
            className="form-control"
            placeholder="Enter Name"
            value={filters.description}
            onChange={(e) =>
              setFilters({ ...filters, description: e.target.value })
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
        {user?.type !== "member" && (
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
        )}
        <div className="col-md-2 col-4">
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
          <>
            <div className="col-md-1 col-2">
              <button className="btn btn-success" onClick={handleDownloadExcel}>
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
            <div className="mt-3 text-end">
              <button
                className="btn btn-primary"
                onClick={() => setOpenIncomeModel(true)}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  height="24px"
                  viewBox="0 -960 960 960"
                  width="24px"
                  fill="white"
                >
                  <path d="M440-440H200v-80h240v-240h80v240h240v80H520v240h-80v-240Z" />
                </svg>
                <span>Add Other Income</span>
              </button>
            </div>
          </>
        )}
      </div>

      <div className="AllReceipts rounded my-3">
        <table className="table align-middle table-striped table-hover my-0">
          <thead className="table-primary">
            <tr>
              <th>#</th>
              <th scope="col">Name</th>
              <th scope="col" className="text-end">
                Amount
              </th>
              {user?.type !== "member" && (
                <>
                  <th scope="col">Mobile No.</th>
                  <th scope="col">Date & Time</th>
                </>
              )}
              {user?.type === "admin" && <th>Actions</th>}
            </tr>
          </thead>
          <tbody className="table-group-divider">
            {income.length === 0 && (
              <tr>
                <td
                  colSpan={user?.type !== "member" ? 8 : 3}
                  className="text-center"
                >
                  No Other Income Found
                </td>
              </tr>
            )}
            {income.map((income, index) => (
              <tr key={income._id}>
                <th>{(filters.page - 1) * filters.limit + index + 1}</th>
                <th>
                  {editIndex === index ? (
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      value={editData.description}
                      onChange={(e) =>
                        setEditData({
                          ...editData,
                          description: e.target.value,
                        })
                      }
                    />
                  ) : (
                    income.description
                  )}
                </th>
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
                    `₹ ${income.amount}`
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
                        income.mobile || "-"
                      )}
                    </td>
                    <td className="small">
                      {new Date(income.updatedAt).toLocaleString("en-IN")}
                    </td>
                  </>
                )}
                {user?.type === "admin" && (
                  <td>
                    {editIndex === index ? (
                      <div className="d-flex gap-2">
                        <button
                          className="btn btn-success btn-sm small"
                          onClick={() => handleSave(income._id)}
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
                          setEditData(income);
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

      {openIncomeModel && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h5 style={{ color: "#6d0616" }}>Add Other Income</h5>
            <form className="row g-3 rounded">
              <div className="col-md-6">
                <label className="form-label">Name*</label>
                <input
                  type="text"
                  name="description"
                  value={formData.description}
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
                  min={0}
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
                  placeholder="Enter Mobile No."
                />
              </div>
            </form>
            <div className="d-flex justify-content-end gap-2 mt-3">
              <button
                className="btn btn-secondary"
                onClick={() => setOpenIncomeModel(false)}
              >
                Cancel
              </button>
              <button className="btn btn-success" onClick={handleSubmit}>
                Submit
              </button>
            </div>
          </div>
        </div>
      )}

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

export default OtherIncome;
