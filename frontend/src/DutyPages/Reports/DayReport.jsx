import React, { useEffect, useState } from "react";
import axios from "axios";
import Loader from "../../components/Loader/Loader";
import toast from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";

const DayReport = ({ url }) => {
  const token = localStorage.getItem("token");

  const navigate = useNavigate();

  const { date } = useParams();

  const [loading, setLoading] = useState(false);

  const [search, setSearch] = useState("");

  const [sessions, setSessions] = useState([]);

  const [members, setMembers] = useState([]);

  const [filteredMembers, setFilteredMembers] = useState([]);

  const [displayDate, setDisplayDate] = useState("");

  const fetchReport = async () => {
    try {
      setLoading(true);

      const response = await axios.get(
        `${url}/api/dutyreport/day?date=${date}`,

        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (response.data.success) {
        setSessions(response.data.sessions);

        setMembers(response.data.members);

        setFilteredMembers(response.data.members);

        setDisplayDate(response.data.displayDate);
      }
    } catch (error) {
      console.log(error);

      toast.error(error.response?.data?.message || "Unable to fetch report.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!search) {
      setFilteredMembers(members);
      return;
    }

    const filtered = members.filter(
      (member) =>
        member.name.toLowerCase().includes(search.toLowerCase()) ||
        member.memberCode.toLowerCase().includes(search.toLowerCase()),
    );

    setFilteredMembers(filtered);
  }, [search, members]);

  useEffect(() => {
    fetchReport();
  }, []);

  const getBadge = (status) => {
    switch (status) {
      case "Present":
        return "bg-success";

      case "Absent":
        return "bg-danger";

      case "Leave":
        return "bg-primary";

      case "Late":
        return "bg-warning text-dark";

      case "Excused":
        return "bg-info text-dark";

      default:
        return "bg-secondary";
    }
  };
  return (
    <>
      <div className="bread">Daily Attendance Report</div>

      <div className="container-fluid my-4">
        {/* Header */}

        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h2 className="fw-bold">{displayDate}</h2>
            <small className="text-muted">Attendance Register</small>
          </div>

          <button className="btn btn-secondary" onClick={() => navigate(-1)}>
            {/* <i className="fa-solid fa-arrow-left me-2"></i> */}
            Back
          </button>
        </div>

        {/* Search */}

        <div className="row mb-4">
          <div className="col-md-5">
            <input
              type="text"
              className="form-control"
              placeholder="Search by Name or Member Code"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Matrix */}

        <div className="table-responsive">
          <table className="table table-bordered table-hover align-middle">
            <thead className="table-dark">
              <tr>
                <th
                  style={{
                    minWidth: "120px",
                    position: "sticky",
                    left: 0,
                    zIndex: 10,
                  }}
                >
                  Member
                </th>

                {sessions.map((session) => (
                  <th
                    key={session._id}
                    className="text-center"
                    style={{
                      minWidth: "100px",
                    }}
                  >
                    <div>{session.title}</div>

                    <small>{session.startTime}</small>
                  </th>
                ))}

                <th className="text-center">Present</th>

                <th className="text-center">%</th>
              </tr>
            </thead>

            <tbody>
              {filteredMembers.map((member) => (
                <tr key={member._id}>
                  {/* Member */}

                  <td
                    style={{
                      position: "sticky",
                      left: 0,
                      background: "white",
                      zIndex: 5,
                    }}
                  >
                    <div
                      className="fw-bold"
                      style={{
                        color: "#6d0616",
                      }}
                    >
                      {member.memberCode}
                    </div>

                    <div>{member.name}</div>
                  </td>

                  {/* Attendance */}

                  {sessions.map((session) => {
                    const attendance = member.attendance[session._id];

                    return (
                      <td key={session._id} className="text-center">
                        <span
                          className={`badge rounded-pill px-2 py-1 ${
                            attendance.status === "Present"
                              ? "bg-success"
                              : attendance.status === "Absent"
                                ? "bg-danger"
                                : attendance.status === "Leave"
                                  ? "bg-primary"
                                  : attendance.status === "Late"
                                    ? "bg-warning text-dark"
                                    : "bg-secondary"
                          }`}
                          title={
                            attendance.attendanceTime
                              ? `${attendance.status} • ${new Date(
                                  attendance.attendanceTime,
                                ).toLocaleTimeString()}`
                              : attendance.status
                          }
                        >
                          {attendance.status === "Present"
                            ? "P"
                            : attendance.status === "Absent"
                              ? "A"
                              : attendance.status === "Leave"
                                ? "L"
                                : attendance.status === "Late"
                                  ? "LT"
                                  : "-"}
                        </span>
                      </td>
                    );
                  })}

                  {/* Total */}

                  <td className="text-center fw-bold">
                    {member.presentCount}/{sessions.length - member.leaveCount}
                  </td>

                  {/* Percentage */}

                  <td className="text-center fw-bold">
                    {member.attendancePercentage == null
                      ? "-"
                      : `${member.attendancePercentage}%`}
                  </td>
                </tr>
              ))}

              {/* Footer */}

              <tr className="table-light fw-bold">
                <td>Session Summary</td>

                {sessions.map((session) => (
                  <td key={session._id} className="text-center">
                    <div className="text-success">
                      P : {session.presentCount}
                    </div>

                    <div className="text-danger">A : {session.absentCount}</div>

                    <div className="text-primary">L : {session.leaveCount}</div>
                  </td>
                ))}

                <td></td>

                <td></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {loading && <Loader />}
    </>
  );
};

export default DayReport;
