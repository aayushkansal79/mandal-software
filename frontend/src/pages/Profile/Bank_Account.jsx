import React, { useContext, useEffect, useState } from "react";
import "./Profile.css";
import { AuthContext } from "../../context/AuthContext";
import Loader from "../../components/Loader/Loader";
import { assets } from "../../assets/assets";
import { useRef } from "react";
import html2canvas from "html2canvas";

const BankAccount = ({ url }) => {
  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const shareRef = useRef();

  const handleShare = async () => {
    try {
      const canvas = await html2canvas(shareRef.current);
      const blob = await new Promise((resolve) =>
        canvas.toBlob(resolve, "image/png")
      );
      const file = new File([blob], "bank-details.png", { type: "image/png" });

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: "Bank Details",
          text: "Scan the QR or see account details below.",
          files: [file],
        });
      } else {
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = "Account-Details.png";
        link.click();
        URL.revokeObjectURL(link.href);
        alert("Sharing is not supported. Image has been downloaded instead.");
      }
    } catch (err) {
      console.error("Error sharing:", err);
    }
  };

  return (
    <>
      <div className="bread">Bank Account</div>
      <div className="profile rounded mt-3">
        <div className="profile-container" style={{ maxWidth: 400 }}>
          <div ref={shareRef} className="p-3">
            <p className="text-center">
              <b style={{ color: "#6d0616" }}>
                {user?.mandalName.toUpperCase()}
              </b>
              <hr className="m-1" />
            </p>
            {user?.mandalName ===
            "Shri Shyam Sewak Yuva Mandal Sangam Vihar" ? (
              <>
                <div className="text-center">
                  <img src={assets.qr} width={180} alt="QRCode" />
                  <p>Scan to pay with any UPI app</p>
                </div>
                <hr />

                <div className="alert alert-info" role="alert">
                  <p>
                    Account Holder: <b>SHRI SHYAM SEWAK YUVA MANDAL S V</b>
                    <hr />
                  </p>
                  <p>
                    Account Number: <b>50200096184510</b>
                    <hr />
                  </p>
                  <p className="mb-0">
                    IFSC: <b>HDFC0003717</b>
                  </p>
                </div>
              </>
            ) : (
              <>
                <div className="text-center">
                  <img src={assets.qr} width={180} alt="QRCode" />
                </div>
                <hr />

                <div className="alert alert-info" role="alert">
                  <p>
                    Account Holder:{" "}
                    <b>SHRI SHYAM SEWA SANGH SAROJINI NAGAR DELHI</b>
                    <hr />
                  </p>
                  <p>
                    Account Number: <b>925020042889124</b>
                    <hr />
                  </p>
                  <p className="mb-0">
                    IFSC: <b>UTIB0002912</b>
                  </p>
                </div>
              </>
            )}
          </div>

          <button
            className="btn btn-outline-primary d-flex align-items-center justify-content-between gap-2"
            onClick={handleShare}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              height="20px"
              viewBox="0 -960 960 960"
              width="20px"
              fill="#0d6efd"
              className="share-icon"
            >
              <path d="M680-80q-50 0-85-35t-35-85q0-6 3-28L282-392q-16 15-37 23.5t-45 8.5q-50 0-85-35t-35-85q0-50 35-85t85-35q24 0 45 8.5t37 23.5l281-164q-2-7-2.5-13.5T560-760q0-50 35-85t85-35q50 0 85 35t35 85q0 50-35 85t-85 35q-24 0-45-8.5T598-672L317-508q2 7 2.5 13.5t.5 14.5q0 8-.5 14.5T317-452l281 164q16-15 37-23.5t45-8.5q50 0 85 35t35 85q0 50-35 85t-85 35Zm0-80q17 0 28.5-11.5T720-200q0-17-11.5-28.5T680-240q-17 0-28.5 11.5T640-200q0 17 11.5 28.5T680-160ZM200-440q17 0 28.5-11.5T240-480q0-17-11.5-28.5T200-520q-17 0-28.5 11.5T160-480q0 17 11.5 28.5T200-440Zm480-280q17 0 28.5-11.5T720-760q0-17-11.5-28.5T680-800q-17 0-28.5 11.5T640-760q0 17 11.5 28.5T680-720Zm0 520ZM200-480Zm480-280Z" />
            </svg>
            Share
          </button>
        </div>
      </div>

      {loading && <Loader />}
    </>
  );
};

export default BankAccount;
