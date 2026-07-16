import React, { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import Loader from "../../components/Loader/Loader";
// import "./Attendance.css";

const Attendance = ({ url }) => {
  const token = localStorage.getItem("token");
  const [loading, setLoading] = useState(false);
  const [sessions, setSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState("");
  const [attendance, setAttendance] = useState([]);
  const [filteredAttendance, setFilteredAttendance] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    present: 0,
    absent: 0,
    leave: 0,
  });
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [selectedAttendance, setSelectedAttendance] = useState(null);
  const [status, setStatus] = useState("");
  const [remarks, setRemarks] = useState("");

  // ---------------- GET SESSIONS ----------------

  const fetchSessions = async () => {
    try {
      const response = await axios.get(`${url}/api/dutysession`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.data.success) {
        setSessions(response.data.sessions);
        if (response.data.sessions.length > 0) {
          setSelectedSession(response.data.sessions[0]._id);
        }
      }
    } catch (error) {
      toast.error("Unable to fetch sessions");
    }
  };

  // ---------------- GET ATTENDANCE ----------------

  const fetchAttendance = async () => {
    if (!selectedSession) return;
    try {
      setLoading(true);
      const response = await axios.get(
        `${url}/api/dutyattendance/${selectedSession}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      if (response.data.success) {
        setAttendance(response.data.attendance);
        setFilteredAttendance(response.data.attendance);
        setStats(response.data.stats);
      }
    } catch (error) {
      toast.error("Unable to fetch attendance");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  useEffect(() => {
    fetchAttendance();
  }, [selectedSession]);

  // ---------------- SEARCH ----------------

  useEffect(() => {
    const temp = attendance.filter((item) => {
      return (
        item.name.toLowerCase().includes(search.toLowerCase()) ||
        item.memberCode.toLowerCase().includes(search.toLowerCase()) ||
        item.mobile.includes(search)
      );
    });

    setFilteredAttendance(temp);
  }, [search, attendance]);

  return (
    <>
      <div className="bread">Attendance</div>

      {/* Filters */}

      <div className="card shadow-sm my-4">
        <div className="card-body">
          <div className="row">
            <div className="col-md-4">
              <label className="form-label">Session</label>

              <select
                className="form-select"
                value={selectedSession}
                onChange={(e) => setSelectedSession(e.target.value)}
              >
                {sessions.map((session) => (
                  <option key={session._id} value={session._id}>
                    {session.title}-
                    {new Date(session.date).toLocaleDateString()}-
                    {new Date(session.startTime).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-md-8">
              <label className="form-label">Search</label>

              <input
                className="form-control"
                placeholder="Search Member"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}

      <div className="row mb-4">
        <div className="col-md-3 col-6">
          <div className="card shadow-sm">
            <div className="card-body text-center">
              <h5 className="fw-bold">Total Members</h5>

              <h2 className="fw-bold">{stats.total}</h2>
            </div>
          </div>
        </div>

        <div className="col-md-3 col-6">
          <div className="card shadow-sm">
            <div className="card-body text-center ">
              <h5 className="fw-bold">Present</h5>

              <h2 className="text-success fw-bold">{stats.present}</h2>
            </div>
          </div>
        </div>

        <div className="col-md-3 col-6">
          <div className="card shadow-sm">
            <div className="card-body text-center">
              <h5 className="fw-bold">Absent</h5>

              <h2 className="text-danger fw-bold">{stats.absent}</h2>
            </div>
          </div>
        </div>
        
        <div className="col-md-3 col-6">
          <div className="card shadow-sm">
            <div className="card-body text-center">
              <h5 className="fw-bold">Leave</h5>

              <h2 className="text-primary fw-bold">{stats.leave}</h2>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}

      <div className="AllReceipts rounded my-3">
        <table className="table align-middle table-striped table-hover my-0">
          <thead className="table-primary">
            <tr>
              <th scope="col">Status</th>
              {/* <th scope="col">Code</th> */}
              <th scope="col">Name</th>
              <th scope="col">Time</th>
              {/* <th scope="col">Mobile</th> */}
            </tr>
          </thead>
          <tbody className="table-group-divider">
            {sessions.length === 0 && (
              <tr>
                <td colSpan="3" className="text-center">
                  No Sessions Found
                </td>
              </tr>
            )}
            {filteredAttendance.map((item) => (
              <tr key={item._id}>
                <td>
                  {item.memberCode}
                  <br />
                  <span
                    className={`badge ${
                      item.status === "Present"
                        ? "bg-success"
                        : item.status === "Late"
                          ? "bg-warning text-dark"
                          : item.status === "Leave"
                            ? "bg-primary"
                            : item.status === "Excused"
                              ? "bg-info text-dark"
                              : "bg-danger"
                    }`}
                  >
                    {item.status}
                  </span>
                </td>
                {/* <td>{item.memberCode}</td> */}
                <td>
                  <span className="fw-bold">{item.name}</span>
                  <br/>
                  {item.mobile}
                  </td>
                <td>
                  {item.attendanceTime
                    ? new Date(item.attendanceTime).toLocaleTimeString("en-IN")
                    : "-"}
                </td>
                {/* <td>{item.mobile}</td> */}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {loading && <Loader />}
    </>
  );
};

export default Attendance;
