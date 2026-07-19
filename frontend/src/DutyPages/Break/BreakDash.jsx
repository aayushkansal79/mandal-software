import React from "react";
import "./breakDash.css";
import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import Loader from "../../components/Loader/Loader";
import { useNavigate } from "react-router-dom";

const ReportDash = ({ url }) => {
  const token = localStorage.getItem("token");
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [reports, setReports] = useState([]);
  const [filteredReports, setFilteredReports] = useState([]);
  const [search, setSearch] = useState("");
  const [liveBreaks, setLiveBreaks] = useState([]);

  const [breakStats, setBreakStats] = useState({
    totalMembers: 0,
    available: 0,
    onBreak: 0,
  });

  const fetchLiveBreaks = async () => {
    try {
      const response = await axios.get(`${url}/api/dutybreak/live`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.success) {
        setLiveBreaks(response.data.breaks);

        setBreakStats(response.data.stats);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const fetchReports = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${url}/api/dutybreak/reports`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.success) {
        const sorted = [...response.data.reports].sort(
          (a, b) => new Date(b.date) - new Date(a.date),
        );
        setReports(sorted);
        setFilteredReports(sorted);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to fetch reports.");
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchLiveBreaks();
    fetchReports();
  };

  useEffect(() => {
    fetchLiveBreaks();
    fetchReports();
  }, []);

  useEffect(() => {
    if (!search.trim()) {
      setFilteredReports(reports);
      return;
    }

    setFilteredReports(
      reports.filter((report) =>
        report.displayDate.toLowerCase().includes(search.toLowerCase()),
      ),
    );
  }, [search, reports]);

  const closeAllBreaks = async () => {
    const confirm = window.confirm("Close all active breaks?");

    if (!confirm) return;

    try {
      const response = await axios.put(
        `${url}/api/dutybreak/closeall`,

        {},

        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (response.data.success) {
        toast.success(response.data.message);

        fetchReports();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to close breaks.");
    }
  };

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div className="bread">Break Reports</div>

        <button className="btn btn-danger" onClick={closeAllBreaks}>
          Close All Active Breaks
        </button>
      </div>

      {/* Break Mode */}
      <div className="card shadow-sm mt-2 mb-4">
        <div className="card-body">
          <h5 className="fw-bold mb-3">Currently On Break</h5>

          {liveBreaks.length === 0 ? (
            <div className="text-center text-muted py-3">
              No one is currently on break.
            </div>
          ) : (
            <div
              style={{
                maxHeight: "320px",
                overflowY: "auto",
              }}
            >
              {liveBreaks.map((item) => (
                <div key={item._id} className="border rounded p-2 mb-2">
                  <div className="fw-bold">{item.name}</div>

                  <small className="text-muted">{item.memberCode}</small>

                  <div className="mt-2 d-flex justify-content-between">
                    <span className="badge bg-warning text-dark">On Break</span>

                    <span className="fw-bold">{item.durationText}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="card shadow-sm">
        <div className="card-body">
          <h5 className="fw-bold">Live Break Status</h5>

          <hr />

          <div className="d-flex justify-content-between mb-2">
            <span>Total Members</span>

            <span className="fw-bold">{breakStats.totalMembers}</span>
          </div>

          <div className="d-flex justify-content-between mb-2">
            <span>Available</span>

            <span className="fw-bold text-success">{breakStats.available}</span>
          </div>

          <div className="d-flex justify-content-between">
            <span>On Break</span>

            <span className="fw-bold text-warning">{breakStats.onBreak}</span>
          </div>
        </div>
      </div>

      <div className="row mt-4">
        {reports.map((report) => (
          <div className="col-lg-6 mb-4" key={report.date}>
            <div className="card shadow-sm report-card">
              <div className="card-body">
                <div className="d-flex justify-content-between">
                  <div>
                    <h4 className="align-items-center d-flex gap-2">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        height="20px"
                        viewBox="0 -960 960 960"
                        width="20px"
                        fill="#6d0616"
                      >
                        <path d="M200-80q-33 0-56.5-23.5T120-160v-560q0-33 23.5-56.5T200-800h40v-80h80v80h320v-80h80v80h40q33 0 56.5 23.5T840-720v560q0 33-23.5 56.5T760-80H200Zm0-80h560v-400H200v400Zm0-480h560v-80H200v80Zm0 0v-80 80Zm280 240q-17 0-28.5-11.5T440-440q0-17 11.5-28.5T480-480q17 0 28.5 11.5T520-440q0 17-11.5 28.5T480-400Zm-188.5-11.5Q280-423 280-440t11.5-28.5Q303-480 320-480t28.5 11.5Q360-457 360-440t-11.5 28.5Q337-400 320-400t-28.5-11.5ZM640-400q-17 0-28.5-11.5T600-440q0-17 11.5-28.5T640-480q17 0 28.5 11.5T680-440q0 17-11.5 28.5T640-400ZM480-240q-17 0-28.5-11.5T440-280q0-17 11.5-28.5T480-320q17 0 28.5 11.5T520-280q0 17-11.5 28.5T480-240Zm-188.5-11.5Q280-263 280-280t11.5-28.5Q303-320 320-320t28.5 11.5Q360-297 360-280t-11.5 28.5Q337-240 320-240t-28.5-11.5ZM640-240q-17 0-28.5-11.5T600-280q0-17 11.5-28.5T640-320q17 0 28.5 11.5T680-280q0 17-11.5 28.5T640-240Z" />
                      </svg>
                      {report.displayDate}
                    </h4>

                    <div className="mt-3">
                      <p>
                        <strong>Breaks</strong>

                        {" : "}

                        {report.breakCount}
                      </p>

                      <p>
                        <strong>Members</strong>

                        {" : "}

                        {report.memberCount}
                      </p>

                      <p>
                        <strong>Avg Duration</strong>

                        {" : "}

                        {report.averageDuration}
                      </p>

                      <p>
                        <strong>Longest Break</strong>
                        {" : "}
                        {report.longestBreak} min
                      </p>
                    </div>
                  </div>

                  <div className="d-flex align-items-end">
                    <button
                      className="btn btn-primary"
                      onClick={() => navigate(`/duty/break/${report.date}`)}
                    >
                      View Report
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {reports.length === 0 && (
        <div className="text-center mt-5">
          <h4>No Reports Available</h4>
        </div>
      )}

      {loading && <Loader />}
    </>
  );
};

export default ReportDash;
