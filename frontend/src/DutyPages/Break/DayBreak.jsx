import React, { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import Loader from "../../components/Loader/Loader";
import { useParams } from "react-router-dom";

const DayBreak = ({ url }) => {
  const token = localStorage.getItem("token");
  const { date } = useParams();
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [members, setMembers] = useState([]);
  const [filteredMembers, setFilteredMembers] = useState([]);
  const [longBreakMembers, setLongBreakMembers] = useState([]);
  const [displayDate, setDisplayDate] = useState("");
  const [totalMembers, setTotalMembers] = useState(0);
  const [totalBreaks, setTotalBreaks] = useState(0);
  const [averageBreak, setAverageBreak] = useState(0);
  const [longestBreak, setLongestBreak] = useState(0);

  const fetchReport = async () => {
    try {
      setLoading(true);

      const response = await axios.get(
        `${url}/api/dutybreak/report?date=${date}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (response.data.success) {
        setDisplayDate(response.data.displayDate);

        setMembers(response.data.members);

        setFilteredMembers(response.data.members);

        setTotalMembers(response.data.totalMembers);

        setTotalBreaks(response.data.totalBreaks);

        setAverageBreak(response.data.averageBreak);

        // Calculate longest break
        let longest = 0;

        response.data.members.forEach((member) => {
          member.breaks.forEach((item) => {
            if (item.duration > longest) {
              longest = item.duration;
            }
          });
        });

        setLongestBreak(longest);
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

    const longBreak = members.filter(
      (member) =>
        member.totalDuration >= 40,
    );

    setLongBreakMembers(longBreak);
  }, [members]);

  useEffect(() => {
    fetchReport();
  }, []);

  return (
    <>
      <div className="bread">
        Break Report
        <small className="ms-3 text-muted">{displayDate}</small>
      </div>
      <div className="container-fluid mt-2">
        <div className="row mb-4">
          <div className="col-md-3 col-6">
            <div className="card shadow-sm">
              <div className="card-body text-center">
                <h6>Total Members</h6>

                <h2>{totalMembers}</h2>
              </div>
            </div>
          </div>

          <div className="col-md-3 col-6">
            <div className="card shadow-sm border-primary">
              <div className="card-body text-center">
                <h6>Total Breaks</h6>

                <h2>{totalBreaks}</h2>
              </div>
            </div>
          </div>

          <div className="col-md-3 col-6">
            <div className="card shadow-sm border-success">
              <div className="card-body text-center">
                <h6>Average</h6>

                <h2>{averageBreak} min</h2>
              </div>
            </div>
          </div>

          <div className="col-md-3 col-6">
            <div className="card shadow-sm border-warning">
              <div className="card-body text-center">
                <h6>Longest</h6>

                <h2>{longestBreak} min</h2>
              </div>
            </div>
          </div>
        </div>

        <div className="card shadow-sm mt-2 mb-4">
          <div className="card-body">
            <h5 className="fw-bold mb-3">On Break more than 40 minutes</h5>

            {longBreakMembers.length === 0 ? (
              <div className="text-center text-muted py-3">
                No one is on break for too long.
              </div>
            ) : (
              <div
                style={{
                  maxHeight: "320px",
                  overflowY: "auto",
                }}
              >
                {longBreakMembers.map((member) => (
                  <div key={member._id} className="border rounded p-2 mb-2">
                    <div className="w-100 d-flex justify-content-between">
                    <div>
                      <strong>{member.name}</strong>

                      <br />

                      <small>{member.memberCode}</small>
                    </div>

                    <div className="text-end">
                      <div>{member.breakCount} Break(s)</div>

                      <strong>{member.totalBreakText}</strong>
                    </div>
                  </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="row mb-4">
          <div className="col-md-6">
            <input
              className="form-control"
              placeholder="Search Member"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="accordion">
          {filteredMembers.map((member) => (
            <div className="accordion-item mb-3" key={member.memberId}>
              <h2 className="accordion-header">
                <button
                  className="accordion-button collapsed"
                  data-bs-toggle="collapse"
                  data-bs-target={`#${member.memberId}`}
                >
                  <div className="w-100 d-flex justify-content-between">
                    <div>
                      <strong>{member.name}</strong>

                      <br />

                      <small>{member.memberCode}</small>
                    </div>

                    <div className="text-end">
                      <div>{member.breakCount} Break(s)</div>

                      <strong>{member.totalBreakText}</strong>
                    </div>
                  </div>
                </button>
              </h2>

              <div id={member.memberId} className="accordion-collapse collapse">
                <div className="accordion-body">
                  <table className="table table-bordered">
                    <thead>
                      <tr>
                        <th>Break Out</th>

                        <th>Break In</th>

                        <th>Duration</th>
                      </tr>
                    </thead>

                    <tbody>
                      {member.breaks.map((item, index) => (
                        <tr key={index}>
                          <td>
                            {new Date(item.breakOut).toLocaleTimeString(
                              "en-IN",
                              {
                                hour: "2-digit",
                                minute: "2-digit",
                              },
                            )}
                          </td>

                          <td>
                            {new Date(item.breakIn).toLocaleTimeString(
                              "en-IN",
                              {
                                hour: "2-digit",
                                minute: "2-digit",
                              },
                            )}
                          </td>

                          <td>{item.duration} min</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ))}
        </div>
        {loading && <Loader />}
      </div>
    </>
  );
};

export default DayBreak;
