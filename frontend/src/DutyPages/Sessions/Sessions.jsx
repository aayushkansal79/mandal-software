import React, { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import Loader from "../../components/Loader/Loader";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
// import "./Sessions.css";

const Sessions = ({ url }) => {
  const token = localStorage.getItem("token");
  const navigate = useNavigate();   

  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const [sessions, setSessions] = useState([]);
  const [activeSession, setActiveSession] = useState(null);

  const [title, setTitle] = useState("");

  // ---------------- FETCH ----------------

  const fetchSessions = async () => {
    try {
      setLoading(true);

      const response = await axios.get(`${url}/api/dutysession`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.success) {
        setSessions(response.data.sessions);
        setActiveSession(response.data.activeSession);
      }
    } catch (error) {
      console.log(error);
      toast.error("Unable to fetch sessions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  // ---------------- CREATE SESSION ----------------

  const handleCreateSession = async (e) => {
    e.preventDefault();

    if (!title.trim()) {
      return toast.error("Please enter session title");
    }

    try {
      setLoading(true);

      const response = await axios.post(
        `${url}/api/dutysession`,
        {
          title,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (response.data.success) {
        toast.success(response.data.message);

        setShowModal(false);
        setTitle("");

        fetchSessions();
      }
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || "Unable to create session");
    } finally {
      setLoading(false);
    }
  };

  // ---------------- END SESSION ----------------

  const handleEndSession = async () => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "Do you want to end this session?",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, end it!",
    });

    if (result.isConfirmed) {
      try {
        setLoading(true);

        const response = await axios.put(
          `${url}/api/dutysession/end`,
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        if (response.data.success) {
          toast.success(response.data.message);
          fetchSessions();
        }
      } catch (error) {
        console.log(error);
        toast.error(error.response?.data?.message || "Unable to end session");
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div className="bread">Sessions</div>

        {activeSession ? (
          <button className="btn btn-danger" onClick={handleEndSession}>
            End Session
          </button>
        ) : (
          <button
            className="btn btn-primary"
            onClick={() => setShowModal(true)}
          >
            Start New Session
          </button>
        )}
      </div>

      {/* Active Session */}

      {activeSession ? (
        <div className="card shadow-sm border-0 my-4">
          <div className="card-body">
            <div className="d-flex justify-content-between">
              <div>
                <h4 className="text-success fw-bold">● Active Session</h4>

                <h3 className="fw-bold">{activeSession.title}</h3>
              </div>

              <div className="text-end">
                <span className="badge bg-success fs-6">
                  {activeSession.status}
                </span>
              </div>
            </div>

            <hr />

            <div className="row">
              <div className="col-md-4">
                <h6>Date</h6>

                <p>{new Date(activeSession.date).toLocaleDateString()}</p>
              </div>

              <div className="col-md-4">
                <h6>Started At</h6>

                <p>{new Date(activeSession.startTime).toLocaleTimeString()}</p>
              </div>

              <div className="col-md-4">
                <h6>Status</h6>

                <p className="text-success fw-bold">Running</p>
              </div>
              <div className="col-md-4">
                <button type="button" className="btn btn-outline-primary" onClick={() => navigate("/duty/scanner")}>
                    <i className="bi bi-qr-code-scan me-2"></i>
                    Start Scanning
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="card shadow-sm border-0 my-4">
          <div className="card-body text-center py-5">
            <h4>No Active Session</h4>

            <p className="text-muted">
              Click on Start New Session to begin attendance.
            </p>
          </div>
        </div>
      )}

      {/* Session History */}

      <div className="shadow-sm border-0">
        <div className="card-header bg-white p-3">
          <h5 className="mb-0 fw-bold">Session History</h5>
        </div>

        <div className="AllReceipts rounded my-3">
          <table className="table align-middle table-striped table-hover my-0">
            <thead className="table-success">
              <tr>
                <th scope="col">Title</th>
                <th scope="col">Date</th>
                <th scope="col">Start Time</th>
                <th scope="col">End Time</th>
                <th scope="col">Total</th>
                <th scope="col">Present</th>
                <th scope="col">Absent</th>
                <th scope="col">Leave</th>
                <th scope="col">Status</th>
              </tr>
            </thead>
            <tbody className="table-group-divider">
              {sessions.length === 0 && (
                <tr>
                  <td colSpan="9" className="text-center">
                    No Sessions Found
                  </td>
                </tr>
              )}
              {sessions.map((session, index) => (
                <tr key={session._id}>
                  <td>{session.title}</td>

                  <td>{new Date(session.date).toLocaleDateString()}</td>

                  <td>
                    {new Date(session.startTime).toLocaleTimeString("en-IN")}
                  </td>

                  <td>
                    {session.endTime
                      ? new Date(session.endTime).toLocaleTimeString("en-IN")
                      : "-"}
                  </td>
                  <td>{session.presentCount + session.absentCount + session.leaveCount}</td>
                  <td>{session.presentCount}</td>
                  <td>{session.absentCount}</td>
                  <td>{session.leaveCount}</td>
                  <td>
                    <span
                      className={`badge ${
                        session.status === "Completed"
                          ? "bg-primary"
                          : session.status === "Active"
                            ? "bg-success"
                            : "bg-danger"
                      }`}
                    >
                      {session.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h5 className="mb-4" style={{ color: "#6d0616" }}>
              Start New Session
            </h5>

            <form onSubmit={handleCreateSession}>
              <div className="mb-4">
                <label className="form-label">Session Title</label>

                <input
                  type="text"
                  className="form-control"
                  placeholder="Eg. Sunday Sabha"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              <div className="d-flex justify-content-end gap-2">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>

                <button type="submit" className="btn btn-success">
                  Start Session
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {loading && <Loader />}
    </>
  );
};

export default Sessions;
