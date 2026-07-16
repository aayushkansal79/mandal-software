import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import QRCode from "react-qr-code";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import { useRef } from "react";

const Members = ({ url }) => {
  const token = localStorage.getItem("token");
  const [file, setFile] = useState(null);
  const componentRef = useRef(null);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [search, setSearch] = useState("");
  const [member, setMember] = useState({
    name: "",
    mobile: "",
    aadhaar: "",
  });

  // Fetch Members
  const fetchMembers = async () => {
    try {
      const response = await axios.get(`${url}/api/dutymember`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.data.success) {
        setMembers(response.data.members);
      }
    } catch (error) {
      toast.error("Unable to fetch members");
    }
  };
  useEffect(() => {
    fetchMembers();
  }, []);

  // Handle Form
  const handleChange = (e) => {
    setMember((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  // Add Member
  const handleCreateMember = async () => {
    try {
      if (!member.name.trim()) {
        return toast.error("Name is required");
      }
      if (!member.mobile.trim()) {
        return toast.error("Mobile number is required");
      }
      const response = await axios.post(`${url}/api/dutymember`, member, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.data.success) {
        toast.success(response.data.message);
        setMember({
          name: "",
          mobile: "",
          aadhaar: "",
        });
        setShowMemberModal(false);
        fetchMembers();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || "Something went wrong");
    }
  };

  // Search
  const filteredMembers = useMemo(() => {
    return members.filter((m) => {
      const value = search.toLowerCase();
      return (
        m.name.toLowerCase().includes(value) ||
        m.memberCode.toLowerCase().includes(value) ||
        (m.mobile || "").includes(search)
      );
    });
  }, [members, search]);

  // Print QR
  const handlePrintQR = () => {
    const printContents = componentRef.current.innerHTML;

    const printWindow = window.open("", "_blank", "width=1000,height=800");

    printWindow.document.write(`
        <html>

        <head>

            <title>Duty QR</title>

            <style>

                body{

                    margin:10px;
                    font-family:Arial;

                }

                .qr-print-area{

                    display:grid;

                    grid-template-columns:repeat(5,1fr);

                    gap:12px;

                }

                .qr-card{

                    border:1px solid black;

                    border-radius:8px;

                    padding:10px;

                    text-align:center;

                    page-break-inside:avoid;

                    break-inside:avoid;

                }

                .qr-card div{

                    margin-top:5px;

                    font-weight:bold;
                }

                @page{

                    margin:10mm;

                }

            </style>

        </head>

        <body>

            <div class="qr-print-area">

                ${printContents}

            </div>

        </body>

        </html>
    `);

    printWindow.document.close();

    printWindow.focus();

    setTimeout(() => {
      printWindow.print();

      printWindow.close();
    }, 500);
  };

  const handleUpload = async () => {
    if (!file) {
      return toast.error("Please select an Excel file.");
    }
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("file", file);
      const response = await axios.post(
        `${url}/api/dutymember/upload`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        },
      );
      if (response.data.success) {
        toast.success(response.data.message);
        setFile(null);
        fetchMembers();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Upload Failed");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (member) => {
    try {
      const response = await axios.patch(
        `${url}/api/dutymember/toggle-status/${member._id}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      if (response.data.success) {
        toast.success(response.data.message);
        fetchMembers();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update status");
    }
  };

  return (
    <div className="container-fluid">
      {/* Header */}

      <div className="d-flex justify-content-between align-items-center mb-4">
        <div className="bread">Duty Members</div>

        <button
          className="btn btn-primary"
          onClick={() => setShowMemberModal(true)}
        >
          <i className="bi bi-plus-circle me-2"></i>
          Add Member
        </button>
      </div>

      {/* Search */}

      <div className="card shadow-sm border-0 mb-2 d-flex flex-row justify-content-between align-items-center">
        <div className="card-body">
          <input
            type="text"
            className="form-control"
            placeholder="Search by Name, Member Code or Mobile"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <button className="btn btn-outline-success" onClick={handlePrintQR}>
          <i class="bi bi-qr-code"></i>
        </button>
      </div>

      <div className="card shadow-sm mb-4">
        <div className="card-body">
          <h5>Bulk Upload Members</h5>

          <div className="row mt-3">
            <div className="col-md-8">
              <input
                type="file"
                accept=".xlsx,.xls"
                className="form-control"
                onChange={(e) => setFile(e.target.files[0])}
              />
            </div>
            <div className="col-md-4">
              <button className="btn btn-success w-100" onClick={handleUpload}>
                Upload
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Members */}

      {loading ? (
        <div className="text-center mt-5">
          <div className="spinner-border text-primary" role="status"></div>
        </div>
      ) : filteredMembers.length === 0 ? (
        <div className="card border-0 shadow-sm">
          <div className="card-body text-center py-5">
            <h5>No Members Found</h5>
          </div>
        </div>
      ) : (
        <div className="my-3">
          <div className="members row g-2 g-md-3">
            {filteredMembers.map((member, index) => (
              <div key={member._id} className="col-6 col-sm-6 col-md-2">
                <div className="card text-bg-light">
                  <div className="card-header d-flex flex-column">
                    <b>{member.name.split(" ").slice(0, 2).join(" ")}</b>
                    <small className="text-muted">{member.memberCode}</small>
                  </div>

                  <div className="card-body p-md-3 p-2 align-items-center">
                    <p className="mb-2">
                      <i className="bi bi-telephone-fill me-2 "></i>
                      {member.mobile || "-"}
                    </p>

                    <p className="mb-3">
                      <i className="bi bi-person-vcard-fill me-2 text-danger"></i>
                      {member.aadhaar || "-"}
                    </p>

                    <div className="form-check form-switch">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        role="switch"
                        title="Change Status"
                        checked={member.availability === "Available"}
                        onChange={() => handleToggleStatus(member)}
                        style={{ cursor: "pointer" }}
                      />
                    </div>

                    {/* <span
                      className={`badge ${
                        member.status ? "bg-success" : "bg-danger"
                      }`}
                    >
                      {member.status ? "Active" : "Inactive"}
                    </span> */}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Hidden QR Codes for Printing */}
      <div
        ref={componentRef}
        className="qr-print-area"
        style={{
          position: "absolute",
          left: "-99999px",
          top: 0,
          visibility: "hidden",
        }}
      >
        {members.map((member) => (
          <div className="qr-card" key={member._id}>
            <QRCode value={member.memberCode} size={120} />

            <div>{member.memberCode}</div>

            <small>{member.name}</small>
          </div>
        ))}
      </div>

      {/* Modal */}

      {showMemberModal && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h5 className="mb-4" style={{ color: "#6d0616" }}>
              Add New Duty Member
            </h5>

            <div className="row text-start">
              <div className="col-12 mb-3">
                <label className="form-label">Name</label>

                <input
                  type="text"
                  className="form-control"
                  placeholder="Enter Name"
                  name="name"
                  value={member.name}
                  onChange={handleChange}
                />
              </div>

              <div className="col-md-6 mb-3">
                <label className="form-label">Mobile</label>

                <input
                  type="text"
                  className="form-control"
                  placeholder="Enter Mobile"
                  name="mobile"
                  value={member.mobile}
                  onChange={handleChange}
                />
              </div>

              <div className="col-md-6 mb-3">
                <label className="form-label">Aadhaar</label>

                <input
                  type="text"
                  className="form-control"
                  placeholder="Enter Aadhaar"
                  name="aadhaar"
                  value={member.aadhaar}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="d-flex justify-content-end gap-2">
              <button
                className="btn btn-secondary"
                onClick={() => setShowMemberModal(false)}
              >
                Cancel
              </button>

              <button className="btn btn-success" onClick={handleCreateMember}>
                Save Member
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Members;
