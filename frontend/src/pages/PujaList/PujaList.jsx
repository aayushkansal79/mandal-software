import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import Swal from "sweetalert2";
import Loader from "../../components/Loader/Loader";
import { AuthContext } from "../../context/AuthContext";

const PujaListManager = ({ url }) => {
  const [listByYear, setListByYear] = useState({});
  const [memberName, setMemberName] = useState("");
  const [year, setYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(false);
  const { user } = useContext(AuthContext);
  const token = localStorage.getItem("token");

  const fetchPujaList = async () => {
    try {
      const res = await axios.get(`${url}/api/puja-list`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setListByYear(res.data);
    } catch (err) {
      toast.error("Failed to fetch puja list");
    }
  };

  useEffect(() => {
    fetchPujaList();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!memberName) return toast.error("Enter member name");

    setLoading(true);
    try {
      await axios.post(
        `${url}/api/puja-list`,
        { memberName, year },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      toast.success("Saved successfully");
      setMemberName("");
      fetchPujaList();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Save failed");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "Do you want to delete this member?",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    });

    if (result.isConfirmed) {
      setLoading(true);
      try {
        await axios.delete(`${url}/api/puja-list/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success("Deleted");
        fetchPujaList();
      } catch (err) {
        toast.error("Delete failed");
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="container py-4">
      <h4 className="bread">Puja List</h4>

      {user?.type === "admin" && (
        <form
          onSubmit={handleSave}
          className="row g-3 mt-1 mb-4 align-items-end"
        >
          <div className="col-md-3">
            <label className="form-label">Year</label>
            <input
              type="number"
              className="form-control"
              value={year}
              onChange={(e) => setYear(e.target.value)}
            />
          </div>

          <div className="col-md-5">
            <label className="form-label">Member Name</label>
            <input
              type="text"
              className="form-control"
              value={memberName}
              onChange={(e) => setMemberName(e.target.value)}
              placeholder="Enter Member Name"
            />
          </div>

          <div className="col-md-2">
            <button
              className="btn btn-success w-100"
              type="submit"
              disabled={loading}
            >
              Save
            </button>
          </div>
        </form>
      )}

      <div className="accordion" id="yearAccordion">
        {Object.keys(listByYear)
          .sort((a, b) => Number(b) - Number(a))
          .map((yearKey, index) => (
            <div className="accordion-item" key={yearKey}>
              <h2 className="accordion-header">
                <button
                  className={`accordion-button ${
                    index !== 0 ? "collapsed" : ""
                  }`}
                  type="button"
                  data-bs-toggle="collapse"
                  data-bs-target={`#collapse-${yearKey}`}
                >
                  📂 Puja List - {yearKey}
                </button>
              </h2>

              <div
                id={`collapse-${yearKey}`}
                className={`accordion-collapse collapse ${
                  index === 0 ? "show" : ""
                }`}
                data-bs-parent="#yearAccordion"
              >
                <div className="accordion-body">
                  {listByYear[yearKey].length === 0 ? (
                    <p className="text-muted">No puja list for this year.</p>
                  ) : (
                    <ul className="list-group">
                      {listByYear[yearKey].map((doc) => (
                        <li
                          key={doc._id}
                          className="list-group-item d-flex justify-content-between align-items-center"
                        >
                          <div>
                            <strong>{doc.memberName}</strong>
                            {/* <div className="small text-muted">
                              Added:{" "}
                              {new Date(doc.createdAt).toLocaleString()}
                            </div> */}
                          </div>

                          <button
                            className="btn btn-sm"
                            onClick={() => handleDelete(doc._id)}
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              height="20px"
                              viewBox="0 -960 960 960"
                              width="20px"
                              fill="red"
                            >
                              <path d="M280-120q-33 0-56.5-23.5T200-200v-520h-40v-80h200v-40h240v40h200v80h-40v520q0 33-23.5 56.5T680-120H280Zm400-600H280v520h400v-520ZM360-280h80v-360h-80v360Zm160 0h80v-360h-80v360ZM280-720v520-520Z" />
                            </svg>
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>
          ))}
      </div>

      {loading && <Loader />}
    </div>
  );
};

export default PujaListManager;
