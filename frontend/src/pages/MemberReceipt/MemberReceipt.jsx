import React, { useContext, useEffect, useState } from "react";
import "./MemberReceipt.css";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";

const MemberReceipt = ({ url }) => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const { id } = useParams();
  const [memberData, setMemberData] = useState(null);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    axios
      .get(`${url}/api/user/${id}/receipts`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setMemberData(res.data);
      })
      .catch((err) => {
        console.error(err);
      });
  }, [id, url]);

  return (
    <>
      <div className="bread">Member Receipts</div>

      <div className="MemberReceipt rounded d-flex justify-content-between mt-3">
        <div>
          <button className="op-btn mb-3" onClick={() => navigate(-1)}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              height="40px"
              viewBox="0 -960 960 960"
              width="40px"
              fill="green"
            >
              <path d="m480-320 56-56-64-64h168v-80H472l64-64-56-56-160 160 160 160Zm0 240q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Z" />
            </svg>
          </button>
          <h3>
            Receipts for{" "}
            <b className="text-primary">{memberData?.member?.memberName}</b>
          </h3>
          <p>
            <b>Mobile :</b> {memberData?.member?.mobile} | <b>Address :</b>{" "}
            {memberData?.member?.address}
          </p>
        </div>
        <div>
          <img
            src={`${url}${memberData?.member?.profilePic}`}
            width={100}
            alt=""
            className="rounded-circle"
          />
        </div>
      </div>

      {user !== "member" && (
        <div className="row g-2 mb-4 px-2 mt-2">
          <div className="col-md-2 col-6">
            <label className="form-label">Receipt Number:</label>
            <input
              className="form-control"
              placeholder="Enter Receipt Number"
              type="number"
              // value={filters.invoiceNumber}
              // onChange={(e) =>
              //   setFilters({ ...filters, invoiceNumber: e.target.value })
              // }
            />
          </div>
          <div className="col-md-2 col-6">
            <label className="form-label">Amount Category:</label>
            <select className="form-select">
              <option value="">Select Amount</option>
              <option value="1100">&gt;= ₹ 1100</option>
              <option value="5100">&gt;= ₹ 5100</option>
              <option value="11000">&gt;= ₹ 11000</option>
              <option value="21000">&gt;= ₹ 21000</option>
              <option value="51000">&gt;= ₹ 51000</option>
              <option value="100000">&gt;= ₹ 100000</option>
            </select>
          </div>
          <div className="col-md-2 col-6">
            <label className="form-label">Donor Name:</label>
            <input
              className="form-control"
              placeholder="Enter Donor Name"
              // value={filters.invoiceNumber}
              // onChange={(e) =>
              //   setFilters({ ...filters, invoiceNumber: e.target.value })
              // }
            />
          </div>
          <div className="col-md-2 col-6">
            <label className="form-label">Mobile Number:</label>
            <input
              className="form-control"
              placeholder="Enter Mobile Number"
              type="number"
              // value={filters.customerName}
              // onChange={(e) =>
              //   setFilters({ ...filters, customerName: e.target.value })
              // }
            />
          </div>
        </div>
      )}
      
      <div className="MemberReceipt rounded my-3">
        <table className="table align-middle table-striped table-hover my-0">
          <thead className="table-info">
            <tr>
              <th scope="col">Receipt No.</th>
              {user?.type !== "member" && <th scope="col">Name</th>}
              <th scope="col">Amount</th>
              {user?.type !== "member" && (
                <>
                  <th scope="col">Mobile No.</th>
                  <th scope="col">Address</th>
                </>
              )}
            </tr>
          </thead>
          <tbody className="table-group-divider">
            {memberData?.receipts.length === 0 && (
              <tr>
                <td
                  colSpan={user?.type !== "member" ? 6 : 4}
                  className="text-center"
                >
                  No Receipts Found
                </td>
              </tr>
            )}
            {memberData?.receipts.map((receipt, index) => (
              <tr key={index}>
                <th>{receipt.receiptNumber}</th>
                {user?.type !== "member" && <td>{receipt.name}</td>}
                <th className="text-success">₹ {receipt.amount}</th>
                {user?.type !== "member" && (
                  <>
                    <td>{receipt.mobile || "-"}</td>
                    <td>{receipt.address || "-"}</td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default MemberReceipt;
