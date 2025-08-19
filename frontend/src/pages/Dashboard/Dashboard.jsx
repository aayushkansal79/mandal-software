import React, { useEffect, useState } from "react";
import "./Dashboard.css";
import axios from "axios";
import { Link } from "react-router-dom";

const Dashboard = ({ url }) => {
  const [stats, setStats] = useState({});
  const [year, setYear] = useState(new Date().getFullYear());
  const token = localStorage.getItem("token");

  useEffect(() => {
    axios
      .get(`${url}/api/dashboard?year=${year}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setStats(res.data))
      .catch((err) => console.error(err));
  }, [year]);

  return (
    <>
      <div className="bread">Dashboard</div>

      <div className="my-3">
        <div className="col-12 col-sm-6 col-md-2">
          <div className="form-floating">
            <select
              className="form-select"
              onChange={(e) => setYear(e.target.value)}
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
            <label htmlFor="floatingSelectGrid">Year:</label>
          </div>
        </div>

        <div className="dashboard row gy-2 gx-4">
          <Link to="/member-records" className="col-12 col-sm-6 col-md-3">
            <div className="card text-bg-light mb-3">
              <div className="card-header text-dark">Members</div>
              <div className="card-body align-items-center">
                <p className="card-text blue">{stats.memberCount || "0"}</p>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  height="70px"
                  viewBox="0 -960 960 960"
                  width="50px"
                  fill="#000000"
                  className="blue"
                >
                  <path d="M40-160v-112q0-34 17.5-62.5T104-378q62-31 126-46.5T360-440q66 0 130 15.5T616-378q29 15 46.5 43.5T680-272v112H40Zm720 0v-120q0-44-24.5-84.5T666-434q51 6 96 20.5t84 35.5q36 20 55 44.5t19 53.5v120H760ZM360-480q-66 0-113-47t-47-113q0-66 47-113t113-47q66 0 113 47t47 113q0 66-47 113t-113 47Zm400-160q0 66-47 113t-113 47q-11 0-28-2.5t-28-5.5q27-32 41.5-71t14.5-81q0-42-14.5-81T544-792q14-5 28-6.5t28-1.5q66 0 113 47t47 113ZM120-240h480v-32q0-11-5.5-20T580-306q-54-27-109-40.5T360-360q-56 0-111 13.5T140-306q-9 5-14.5 14t-5.5 20v32Zm240-320q33 0 56.5-23.5T440-640q0-33-23.5-56.5T360-720q-33 0-56.5 23.5T280-640q0 33 23.5 56.5T360-560Zm0 320Zm0-400Z" />
                </svg>
              </div>
            </div>
          </Link>
          <Link to="/all-pads" className="col-12 col-sm-6 col-md-3">
            <div className="card text-bg-light mb-3">
              <div className="card-header text-dark">Pads</div>
              <div className="card-body align-items-center">
                <p className="card-text blue">{stats.padCount || "0"}</p>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  height="70px"
                  viewBox="0 -960 960 960"
                  width="50px"
                  fill="#000000"
                  className="blue"
                >
                  <path d="M480-160q-48-38-104-59t-116-21q-42 0-82.5 11T100-198q-21 11-40.5-1T40-234v-482q0-11 5.5-21T62-752q46-24 96-36t102-12q58 0 113.5 15T480-740v484q51-32 107-48t113-16q36 0 70.5 6t69.5 18v-480q15 5 29.5 10.5T898-752q11 5 16.5 15t5.5 21v482q0 23-19.5 35t-40.5 1q-37-20-77.5-31T700-240q-60 0-116 21t-104 59Zm80-200v-380l200-200v400L560-360Zm-160 65v-396q-33-14-68.5-21.5T260-720q-37 0-72 7t-68 21v397q35-13 69.5-19t70.5-6q36 0 70.5 6t69.5 19Zm0 0v-396 396Z" />
                </svg>
              </div>
            </div>
          </Link>
          <Link to="/receipt-list" className="col-12 col-sm-6 col-md-3">
            <div className="card text-bg-light mb-3">
              <div className="card-header">Receipts</div>
              <div className="card-body align-items-center">
                <p className="card-text blue">{stats.receiptCount || "0"}</p>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  height="70px"
                  viewBox="0 -960 960 960"
                  width="50px"
                  fill="#000000"
                  className="blue"
                >
                  <path d="M240-360h280l80-80H240v80Zm0-160h240v-80H240v80Zm-80-160v400h280l-80 80H80v-560h800v120h-80v-40H160Zm756 212q5 5 5 11t-5 11l-36 36-70-70 36-36q5-5 11-5t11 5l48 48ZM520-120v-70l266-266 70 70-266 266h-70ZM160-680v400-400Z" />
                </svg>
              </div>
            </div>
          </Link>
          <Link to="/expenditure" className="col-12 col-sm-6 col-md-3">
            <div className="card text-bg-light mb-3">
              <div className="card-header">Expenses</div>
              <div className="card-body align-items-center">
                <p className="card-text blue">{stats.expenseCount || "0"}</p>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  height="70px"
                  viewBox="0 -960 960 960"
                  width="50px"
                  fill="#1f1f1f"
                  className="blue"
                >
                  <path d="M200-200v-560 560Zm0 80q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h560q33 0 56.5 23.5T840-760v100h-80v-100H200v560h560v-100h80v100q0 33-23.5 56.5T760-120H200Zm320-160q-33 0-56.5-23.5T440-360v-240q0-33 23.5-56.5T520-680h280q33 0 56.5 23.5T880-600v240q0 33-23.5 56.5T800-280H520Zm280-80v-240H520v240h280Zm-160-60q25 0 42.5-17.5T700-480q0-25-17.5-42.5T640-540q-25 0-42.5 17.5T580-480q0 25 17.5 42.5T640-420Z" />
                </svg>
              </div>
            </div>
          </Link>

          <div className="row mt-3">
            <div className="col-12 col-sm-6 col-md-3">
              <div className="amt-card card text-bg-light mb-3">
                <div className="card-header bg-secondary text-light">
                  Account
                </div>
                <div className="card-body align-items-center">
                  {stats.totalReceiptAmount - stats.totalExpenseAmount < 0 ? (
                    <p className="card-text red amt">
                      - ₹{" "}
                      {(-(
                        stats.totalReceiptAmount - stats.totalExpenseAmount
                      ))?.toLocaleString("en-IN")}
                    </p>
                  ) : (
                    <p className="card-text green amt">
                      + ₹
                      {(
                        stats.totalReceiptAmount - stats.totalExpenseAmount
                      )?.toLocaleString("en-IN")}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="col-12 col-sm-6 col-md-3">
              <div className="amt-card card text-bg-light mb-3">
                <div className="card-header bg-secondary text-light">
                  Total Receipt Amount
                </div>
                <div className="card-body align-items-center">
                  <p className="card-text amt">
                    ₹ {stats.totalReceiptAmount?.toLocaleString("en-IN") || "0"}
                  </p>
                </div>
              </div>
            </div>

            <div className="col-12 col-sm-6 col-md-3">
              <div className="amt-card card text-bg-light mb-3">
                <div className="card-header bg-secondary text-light">
                  Total Expense Amount
                </div>
                <div className="card-body align-items-center">
                  <p className="card-text amt">
                    ₹ {stats.totalExpenseAmount?.toLocaleString("en-IN") || "0"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Dashboard;
