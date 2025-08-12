import React, { useEffect } from "react";
import "./Members.css";
import { assets } from "../../assets/assets";
import { useNavigate } from "react-router-dom";

const Members = () => {
  const user = "sangam";

  useEffect(() => {
    if (user === "sangam") {
      document.title = "Shri Shyam Sewak Yuva Mandal";
    } else if (user === "sarojini") {
      document.title = "Shri Shyam Sewa Sangh";
    }
  }, []);

  const navigate = useNavigate();

  const handleCustomerClick = () => {
    navigate(`/member-list/:id/member-receipts`);
  };

  return (
    <>
      <div className="bread">Member Receipts</div>

      <div className="my-3">
        <div className="members row">

          <div className="col-6 col-sm-6 col-md-2" onClick={handleCustomerClick}>
            <div className="card text-bg-light mb-3 text-center">
              <div className="card-header d-flex flex-column align-items-center">
                <img src={assets.sarojini_logo} width={50} alt="" className="rounded-circle"/>
                <b>Aayush Kansal</b>
                <div className="text-primary">9582448615</div>
              </div>
              <div className="card-body align-items-center">
                <p className="card-text red">Assigned Pad No.: <br /> <b className="text-black">1, 2, 3, 4, 5, 6</b></p>
                <p className="card-text red">Receipt Count : <br /> <b className="text-black">150</b></p>
                <p className="card-text red">Total Collection : <br /> <b className="text-black">₹ 10,00,000</b></p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </>
  );
};

export default Members;
