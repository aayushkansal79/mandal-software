import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import "./Expenditure.css";
import { AuthContext } from "../../context/AuthContext";

const ExpenseManager = ({ url }) => {
  const [expenses, setExpenses] = useState([{ field: "", amount: "" }]);
  const [allExpenses, setAllExpenses] = useState([]);

  const token = localStorage.getItem("token");
  const { user } = useContext(AuthContext);

  // Fetch all expenses
  useEffect(() => {
    fetchExpenses();
  }, []);

  const fetchExpenses = async () => {
    try {
      const res = await axios.get(`${url}/api/expenditure`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAllExpenses(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleChange = (index, field, value) => {
    const newExpenses = [...expenses];
    newExpenses[index][field] = value;
    setExpenses(newExpenses);

    // If editing the last row and it has data → add a new empty row
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
    try {
      // Remove empty rows before sending
      const filteredExpenses = expenses.filter(
        (exp) => exp.field && exp.amount
      );

      await axios.post(
        `${url}/api/expenditure`,
        { expenses: filteredExpenses },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      fetchExpenses();
      setExpenses([{ field: "", amount: "" }]);
    } catch (err) {
      console.error(err);
    }
  };

  const totalAmount = allExpenses.reduce((sum, exp) => sum + exp.amount, 0);

  return (
    <div>
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

      {/* Expense Table */}
      <div className="Expenditure rounded my-3">
        <table className="table align-middle table-striped table-hover my-0">
          <thead className="table-success">
            <tr>
              <th>#</th>
              <th>Expense Detail</th>
              <th className="text-end">Amount</th>
            </tr>
          </thead>
          <tbody className="table-group-divider">
            {allExpenses.length === 0 && (
              <tr>
                <td colSpan="3" className="text-center">
                  No Expenses Found
                </td>
              </tr>
            )}
            {allExpenses.map((exp, index) => (
              <tr key={index}>
                <th>{index + 1}</th>
                <th className="text-primary">{exp.field}</th>
                <th className="text-danger text-end">
                  ₹ {exp.amount.toLocaleString("en-IN")}
                </th>
              </tr>
            ))}
            <tr>
              <th className="text-success">Total</th>
              <th></th>
              <th className="text-success text-end">
                ₹ {totalAmount.toLocaleString("en-IN")}
              </th>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ExpenseManager;
