import React, { useEffect, useState } from "react";
import "./AllPads.css";
import axios from "axios";
import toast from "react-hot-toast";

const AllPads = ({ url }) => {
  const [pads, setPads] = useState([]);
  const token = localStorage.getItem("token");

  const [filters, setFilters] = useState({
    padNumber: "",
    memberName: "",
    year: "",
    exportExcel: "",
  });
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    const fetchPads = async () => {
      try {
        const params = new URLSearchParams();

        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== "") {
            params.append(key, String(value).trim());
          }
        });
        const res = await axios.get(
          `${url}/api/receiptbook/pads?${params.toString()}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setPads(res.data);
      } catch (err) {
        console.error("Error fetching pads:", err);
      }
    };
    fetchPads();
  }, [url, filters]);

  const handleDownloadExcel = async () => {
    setDownloading(true);
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          params.append(key, String(value).trim());
        }
      });

      params.append("exportExcel", "true");

      const res = await axios.get(
        `${url}/api/receiptbook/pads?${params.toString()}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          responseType: "blob",
        }
      );

      const blob = new Blob([res.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const link = document.createElement("a");
      link.href = window.URL.createObjectURL(blob);
      link.download = `Pads_${filters.year || new Date().getFullYear()}.xlsx`;
      link.click();
    } catch (err) {
      console.error(err);
      toast.error("Failed to download Excel");
    } finally {
      setDownloading(false);
    }
  };

  const totalAmount = pads.reduce((sum, pad) => sum + pad.totalAmount, 0);

  return (
    <>
      <div className="bread">All Pads</div>

      <div className="row g-2 mb-4 px-2 mt-2 align-items-end">
        <div className="col-md-2 col-6">
          <label className="form-label">Pad Number:</label>
          <input
            type="number"
            className="form-control"
            placeholder="Enter Pad No."
            value={filters.padNumber}
            onChange={(e) =>
              setFilters({ ...filters, padNumber: e.target.value })
            }
          />
        </div>
        <div className="col-md-2 col-6">
          <label className="form-label">Member Name:</label>
          <input
            className="form-control"
            placeholder="Enter Member Name"
            value={filters.memberName}
            onChange={(e) =>
              setFilters({ ...filters, memberName: e.target.value })
            }
          />
        </div>
        <div className="col-md-2 col-6">
          <label className="form-label">Year:</label>
          <select
            className="form-select"
            value={filters.year}
            onChange={(e) => setFilters({ ...filters, year: e.target.value })}
          >
            {Array.from(
              { length: new Date().getFullYear() - 2025 + 1 },
              (_, i) => new Date().getFullYear() - i
            ).map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>
        <div className="col-md-2 col-6">
          <button
            className="btn btn-sm btn-success px-3"
            onClick={handleDownloadExcel}
            title="Download Excel"
            disabled={downloading}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              height="24px"
              viewBox="0 -960 960 960"
              width="24px"
              fill="white"
            >
              <path d="m720-120 160-160-56-56-64 64v-167h-80v167l-64-64-56 56 160 160ZM560 0v-80h320V0H560ZM240-160q-33 0-56.5-23.5T160-240v-560q0-33 23.5-56.5T240-880h280l240 240v121h-80v-81H480v-200H240v560h240v80H240Zm0-80v-560 560Z" />
            </svg>
          </button>
        </div>
      </div>

      <div className="AllReceipts rounded my-3">
        <table className="table align-middle table-striped table-hover my-0">
          <thead className="table-primary">
            <tr>
              <th scope="col">Pad No.</th>
              <th scope="col">Member Name</th>
              <th scope="col" className="text-end">
                Amount
              </th>
            </tr>
          </thead>
          <tbody className="table-group-divider">
            {pads.length === 0 && (
              <tr>
                <td colSpan="3" className="text-center">
                  No Pads Found
                </td>
              </tr>
            )}
            {pads.map((pad, index) => (
              <tr key={pad._id}>
                <th>{pad.padNumber}</th>
                <td>{pad.memberName}</td>
                <th className="text-success text-end">
                  ₹ {pad.totalAmount.toLocaleString("en-IN")}
                </th>
              </tr>
            ))}
            <tr>
              <th className="text-danger">Grand Total</th>
              <td></td>
              <th className="text-end text-danger">
                ₹ {totalAmount.toLocaleString("en-IN")}
              </th>
            </tr>
          </tbody>
        </table>
      </div>
    </>
  );
};

export default AllPads;
