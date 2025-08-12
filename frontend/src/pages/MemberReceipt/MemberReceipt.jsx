import React from "react";
import "./MemberReceipt.css";
import { useNavigate } from "react-router-dom";

const MemberReceipt = () => {

    const navigate = useNavigate();

  return (
    <>
      <div className="bread">Member Receipts</div>

      <div className="MemberReceipt rounded my-3">
        <button className="btn btn-secondary mb-3" onClick={() => navigate(-1)}>
          ← Back
        </button>
        <p>
          <b className="text-danger">Personal Information : </b> {" "}
          <b>Member ID :</b> 1234567890 | {" "}
          <b>Email :</b> example123@gmail.com | {" "}  
          <b>Mobile :</b> 95821448468 | {" "}
          <b>Address :</b> 234 , Street Name, City | {" "}
          <b>Role :</b> <b className="text-primary">Karyakarta</b>
        </p>
        <h3>
          <b className="text-primary">Aayush Kansal 's</b> Reciepts
        </h3>
        
        <table className="table align-middle table-striped table-hover my-0">
          <thead className="table-info">
            <tr>
              <th scope="col">#</th>
              <th scope="col">Name</th>
              <th scope="col">Amount</th>
              <th scope="col">Mobile No.</th>
              <th scope="col">Address</th>
            </tr>
          </thead>
          <tbody className="table-group-divider">
            <tr>
              <th>1</th>
              <td>Aayush Kansal</td>
              <th className="text-success">₹ 10,00,000</th>
              <td>9582448615</td>
              <td>123 Street, City</td>
            </tr>
          </tbody>
        </table>
      </div>
    </>
  );
};

export default MemberReceipt;
