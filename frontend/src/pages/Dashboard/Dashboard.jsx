import React, { useEffect } from "react";
import "./Dashboard.css";

const Dashboard = () => {
  const user = "sangam";

  useEffect(() => {
    if (user === "sangam") {
      document.title = "Shri Shyam Sewak Yuva Mandal";
    } else if (user === "sarojini") {
      document.title = "Shri Shyam Sewa Sangh";
    }
  }, []);
  
  return (
    <>
      <div className="bread">Dashboard</div>

      <div className="my-3">
        <div className="dashboard row g-4">
          <div className="col-12 col-sm-6 col-md-3">
            <div className="card text-bg-light mb-3">
              <div className="card-header text-dark">Members</div>
              <div className="card-body align-items-center">
                <p className="card-text blue">42</p>
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
          </div>
          <div className="col-12 col-sm-6 col-md-3">
            <div className="card text-bg-light mb-3">
              <div className="card-header">Receipts</div>
              <div className="card-body align-items-center">
                <p className="card-text blue">518</p>
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
          </div>
          <div className="col-12 col-sm-6 col-md-3">
            <div className="card text-bg-light mb-3">
              <div className="card-header">Expenditure</div>
              <div className="card-body align-items-center">
                <p className="card-text blue">25</p>
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
          </div>
          <div className="col-12 col-sm-6 col-md-3">
            <div className="card text-bg-light mb-3">
              <div className="card-header">Documents</div>
              <div className="card-body align-items-center">
                <p className="card-text blue">10</p>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  height="70px"
                  viewBox="0 -960 960 960"
                  width="50px"
                  fill="#000000"
                  className="blue"
                >
                  <path d="M160-160q-33 0-56.5-23.5T80-240v-480q0-33 23.5-56.5T160-800h240l80 80h320q33 0 56.5 23.5T880-640H447l-80-80H160v480l96-320h684L837-217q-8 26-29.5 41.5T760-160H160Zm84-80h516l72-240H316l-72 240Zm0 0 72-240-72 240Zm-84-400v-80 80Z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        <div className="dashboard flex-column row">
          <div className="col-12 col-sm-6 col-md-2">
            <div class="form-floating">
              <select class="form-select" id="floatingSelectGrid">
                <option value="2023">2025</option>
                <option value="2022">2024</option>
                <option value="2021">2023</option>
              </select>
              <label htmlFor="floatingSelectGrid">Year:</label>
            </div>
          </div>

          <div className="row gy-2">
            <div className="col-12 col-sm-6 col-md-3">
              <div className="amt-card card text-bg-light mb-3">
                <div className="card-header bg-secondary text-light">
                  Account
                </div>
                <div className="card-body align-items-center">
                  <p className="card-text green amt">+ ₹ 9,46,000</p>
                </div>
              </div>
            </div>

            <div className="col-12 col-sm-6 col-md-3">
              <div className="amt-card card text-bg-light mb-3">
                <div className="card-header bg-secondary text-light">
                  Total Receipt Amount
                </div>
                <div className="card-body align-items-center">
                  <p className="card-text amt">₹ 10,00,000</p>
                </div>
              </div>
            </div>

            <div className="col-12 col-sm-6 col-md-3">
              <div className="amt-card card text-bg-light mb-3">
                <div className="card-header bg-secondary text-light">
                  Total Expense Amount
                </div>
                <div className="card-body align-items-center">
                  <p className="card-text amt">₹ 54,000</p>
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
