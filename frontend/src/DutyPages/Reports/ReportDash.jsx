import React from "react";
import "./reportDash.css";
import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import Loader from "../../components/Loader/Loader";
import { useNavigate } from "react-router-dom";

const ReportDash = ({url}) => {
  const token = localStorage.getItem("token");
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [reports, setReports] = useState([]);
  const [filteredReports, setFilteredReports] = useState([]);
  const [search, setSearch] = useState("");

  const fetchReports = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${url}/api/dutyreport`, {
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

  const handleViewReport = (date) => {
    navigate(`/duty/report/${date}`);
  };

  const handleRefresh = () => {
    fetchReports();
  };

  useEffect(() => {
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

  return (
    <>
      <div className="bread">Duty Reports</div>

      {/* <div className="card shadow-sm my-4">
        <div className="card-body">
          <div className="row align-items-end">
            <div className="col-md-6">
              <label className="form-label">Search Date</label>

              <input
                type="text"
                className="form-control"
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div> */}

      <div className="row mt-4">
        {reports.map((report) => (
          <div className="col-lg-6 mb-4" key={report.date}>
            <div className="card shadow-sm report-card">
              <div className="card-body">
                <div className="d-flex justify-content-between">
                  <div>
                    <h4 className="align-items-center d-flex gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px" fill="#6d0616"><path d="M200-80q-33 0-56.5-23.5T120-160v-560q0-33 23.5-56.5T200-800h40v-80h80v80h320v-80h80v80h40q33 0 56.5 23.5T840-720v560q0 33-23.5 56.5T760-80H200Zm0-80h560v-400H200v400Zm0-480h560v-80H200v80Zm0 0v-80 80Zm280 240q-17 0-28.5-11.5T440-440q0-17 11.5-28.5T480-480q17 0 28.5 11.5T520-440q0 17-11.5 28.5T480-400Zm-188.5-11.5Q280-423 280-440t11.5-28.5Q303-480 320-480t28.5 11.5Q360-457 360-440t-11.5 28.5Q337-400 320-400t-28.5-11.5ZM640-400q-17 0-28.5-11.5T600-440q0-17 11.5-28.5T640-480q17 0 28.5 11.5T680-440q0 17-11.5 28.5T640-400ZM480-240q-17 0-28.5-11.5T440-280q0-17 11.5-28.5T480-320q17 0 28.5 11.5T520-280q0 17-11.5 28.5T480-240Zm-188.5-11.5Q280-263 280-280t11.5-28.5Q303-320 320-320t28.5 11.5Q360-297 360-280t-11.5 28.5Q337-240 320-240t-28.5-11.5ZM640-240q-17 0-28.5-11.5T600-280q0-17 11.5-28.5T640-320q17 0 28.5 11.5T680-280q0 17-11.5 28.5T640-240Z"/></svg>
                         {report.displayDate}</h4>

                    <div className="mt-3">
                      <p>
                        <strong>Sessions</strong>

                        {" : "}

                        {report.sessionCount}
                      </p>

                      <p>
                        <strong>Members</strong>

                        {" : "}

                        {report.memberCount}
                      </p>

                      <p>
                        <strong>Avg Present</strong>

                        {" : "}

                        {report.averagePresent}
                      </p>

                      <p>
                        <strong>Last Session</strong>

                        {" : "}

                        {report.lastSessionTime}
                      </p>
                    </div>
                  </div>

                  <div className="d-flex align-items-end">
                    <button
                      className="btn btn-primary"
                      onClick={() => navigate(`/duty/report/${report.date}`)}
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
