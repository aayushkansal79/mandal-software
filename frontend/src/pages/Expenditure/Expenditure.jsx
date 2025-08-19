import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import "./Expenditure.css";
import { AuthContext } from "../../context/AuthContext";
import toast from "react-hot-toast";
import Loader from "../../components/Loader/Loader";

const ExpenseManager = ({ url }) => {
  const [expenses, setExpenses] = useState([{ field: "", amount: "" }]);
  const [allExpenses, setAllExpenses] = useState([]);
  const [editIndex, setEditIndex] = useState(null);
  const [editData, setEditData] = useState({ field: "", amount: "" });
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [currentPayment, setCurrentPayment] = useState({
    payAmount: "",
    paymentMethod: "",
  });
  const [selectedExpenseId, setSelectedExpenseId] = useState(null);

  const token = localStorage.getItem("token");
  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const [filters, setFilters] = useState({
    year: "",
    exportExcel: "",
  });

  // Fetch all expenses
  useEffect(() => {
    fetchExpenses();
  }, [url, filters]);

  const fetchExpenses = async () => {
    try {
      const params = new URLSearchParams();

      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          params.append(key, String(value).trim());
        }
      });
      const res = await axios.get(
        `${url}/api/expenditure?${params.toString()}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setAllExpenses(res.data);
    } catch (err) {
      console.error(err);
    }
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
        `${url}/api/expenditure?${params.toString()}`,
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
      link.download = `Expenses_${
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

  const handleChange = (index, field, value) => {
    const newExpenses = [...expenses];
    newExpenses[index][field] = value;
    setExpenses(newExpenses);

    if (
      index === expenses.length - 1 &&
      newExpenses[index].field &&
      newExpenses[index].amount
    ) {
      setExpenses([...newExpenses, { field: "", amount: "" }]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const filteredExpenses = expenses.filter(
        (exp) => exp.field && exp.amount
      );

      await axios.post(
        `${url}/api/expenditure`,
        { expenses: filteredExpenses },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Expenses added successfully");
      fetchExpenses();
      setExpenses([{ field: "", amount: "" }]);
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to add expenses");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (index, exp) => {
    setEditIndex(index);
    setEditData({ field: exp.field, amount: exp.amount, _id: exp._id });
  };

  const handleEditChange = (field, value) => {
    setEditData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async (id) => {
    setLoading(true);
    try {
      const res = await axios.patch(
        `${url}/api/expenditure/${id}`,
        { field: editData.field, amount: editData.amount },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setAllExpenses((prev) =>
        prev.map((exp) => (exp._id === id ? res.data.updated : exp))
      );

      toast.success("Expense updated successfully");
      setEditIndex(null);
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to update expense");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setEditIndex(null);
    setEditData({ field: "", amount: "" });
  };

  const openPaymentModal = (expenseId, field) => {
    setSelectedExpenseId(expenseId);
    setShowPaymentModal(true);
  };

  const handlePaymentChange = (e) => {
    const { name, value } = e.target;
    setCurrentPayment((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddPayment = async () => {
    if (!currentPayment.payAmount || !currentPayment.paymentMethod) {
      toast.error("Please provide both amount and payment method.");
      return;
    }

    try {
      setLoading(true);
      await axios.patch(
        `${url}/api/expenditure/payment/${selectedExpenseId}`,
        {
          payment: {
            payAmount: currentPayment.payAmount,
            paymentMethod: currentPayment.paymentMethod,
          },
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      toast.success("Payment added successfully!");
      fetchExpenses();
      setCurrentPayment({ payAmount: "", paymentMethod: "" });
      setShowPaymentModal(false);
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to add payment");
    } finally {
      setLoading(false);
    }
  };

  const totalAmount = allExpenses.reduce((sum, exp) => sum + exp.amount, 0);

  return (
    <>
      <div className="bread">Expenditure</div>
      {user?.type === "admin" && (
        <form className="addreceipt g-3 my-3 rounded" onSubmit={handleSubmit}>
          {expenses.map((exp, index) => (
            <div key={index} className="row mb-2 align-items-center gy-0 gx-1">
              <div className="col-md-3 col-6">
                <label className="form-label">Expense Detail</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Enter Detail"
                  value={exp.field}
                  onChange={(e) => handleChange(index, "field", e.target.value)}
                />
              </div>
              <div className="col-md-3 col-6">
                <label className="form-label">Expense Amount</label>
                <input
                  type="number"
                  className="form-control"
                  placeholder="Enter Amount"
                  min={0}
                  value={exp.amount}
                  onChange={(e) =>
                    handleChange(index, "amount", e.target.value)
                  }
                />
              </div>
            </div>
          ))}

          <div className="col-12 mt-3">
            <button type="submit" className="btn btn-primary">
              Add Expense
            </button>
          </div>
        </form>
      )}

      <div className="d-flex align-items-end justify-content-between px-2 mt-2">
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
        <div>
          <button
            className="btn btn-sm btn-success px-3"
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
      </div>

      {/* Expense Table */}
      <div className="Expenditure rounded my-3">
        <table className="table align-middle table-striped table-hover my-0">
          <thead className="table-success">
            <tr>
              <th>#</th>
              <th>Expense Detail</th>
              <th className="text-end">Payments Done</th>
              <th></th>
              <th className="text-end">Amount</th>
              <th>Date & Time</th>
              {user?.type === "admin" && <th>Edit</th>}
            </tr>
          </thead>
          <tbody className="table-group-divider">
            {allExpenses.length === 0 && (
              <tr>
                <td colSpan="5" className="text-center">
                  No Expenses Found
                </td>
              </tr>
            )}
            {allExpenses.map((exp, index) => (
              <tr key={exp._id}>
                <th>{index + 1}</th>
                <th className="text-primary">
                  {editIndex === index ? (
                    <input
                      type="text"
                      className="form-control"
                      value={editData.field}
                      onChange={(e) =>
                        handleEditChange("field", e.target.value)
                      }
                    />
                  ) : (
                    exp.field
                  )}
                </th>
                <td className="text-end">
                  <div>
                    {exp.payments?.map((payment) => (
                      <div>
                        {payment.paymentMethod} - ₹{" "}
                        {payment.payAmount?.toLocaleString("en-IN")}
                      </div>
                    ))}
                  </div>
                </td>
                <th>
                  <button
                    className="op-btn"
                    onClick={() => openPaymentModal(exp._id, exp.field)}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      height="24px"
                      viewBox="0 -960 960 960"
                      width="24px"
                      fill="green"
                    >
                      <path d="M440-440H200v-80h240v-240h80v240h240v80H520v240h-80v-240Z" />
                    </svg>
                  </button>
                </th>
                <th className="text-danger text-end">
                  {editIndex === index ? (
                    <input
                      type="number"
                      className="form-control"
                      value={editData.amount}
                      onChange={(e) =>
                        handleEditChange("amount", e.target.value)
                      }
                    />
                  ) : (
                    `₹ ${exp.amount.toLocaleString("en-IN")}`
                  )}
                </th>
                <td className="small">
                  {new Date(exp.updatedAt).toLocaleString("en-IN")}
                </td>
                {user?.type === "admin" && (
                  <td>
                    {editIndex === index ? (
                      <>
                        <button
                          className="btn btn-success btn-sm me-2 small"
                          onClick={() => handleSave(exp._id)}
                        >
                          Save
                        </button>
                        <button
                          className="btn btn-secondary btn-sm small"
                          onClick={handleCancel}
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <button
                        className="op-btn"
                        onClick={() => handleEdit(index, exp)}
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
            <tr>
              <th className="text-success">Total</th>
              <th></th>
              <th className="text-success text-end">
                ₹ {totalAmount.toLocaleString("en-IN")}
              </th>
              <th></th>
              {user?.type === "admin" && <th></th>}
            </tr>
          </tbody>
        </table>
      </div>

      {showPaymentModal && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h5 style={{ color: "#6d0616" }}>
              Add Payment for{" "}
              {allExpenses.find((exp) => exp._id === selectedExpenseId)
                ?.field || "Expense"}
            </h5>
            <div className="row mb-4 text-start">
              <div className="col-6">
                <label className="form-label">Amount</label>
                <input
                  type="number"
                  className="form-control"
                  name="payAmount"
                  value={currentPayment.payAmount}
                  onChange={handlePaymentChange}
                  placeholder="Enter amount"
                />
              </div>
              <div className="col-6">
                <label className="form-label">Payment Method</label>
                <select
                  className="form-select"
                  name="paymentMethod"
                  value={currentPayment.paymentMethod}
                  onChange={handlePaymentChange}
                >
                  <option value="">Select Method</option>
                  <option value="Cash">Cash</option>
                  <option value="UPI">UPI</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
            <div className="d-flex justify-content-end gap-2">
              <button
                className="btn btn-secondary"
                onClick={() => setShowPaymentModal(false)}
              >
                Cancel
              </button>
              <button className="btn btn-success" onClick={handleAddPayment}>
                Add Payment
              </button>
            </div>
          </div>
        </div>
      )}

      {loading && <Loader />}
    </>
  );
};

export default ExpenseManager;
