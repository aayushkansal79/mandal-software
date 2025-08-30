import React, { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import Swal from "sweetalert2";
import Loader from "../../components/Loader/Loader";

const DocumentManager = ({ url }) => {
  const [documentsByYear, setDocumentsByYear] = useState({});
  const [file, setFile] = useState(null);
  const [year, setYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(false);
  const token = localStorage.getItem("token");

  const fetchDocuments = async () => {
    try {
      const res = await axios.get(`${url}/api/documents`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDocumentsByYear(res.data);
    } catch (err) {
      toast.error("Failed to fetch documents");
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return toast.warn("Select a file to upload");

    const formData = new FormData();
    formData.append("file", file);
    formData.append("year", year);

    setLoading(true);
    try {
      await axios.post(`${url}/api/documents`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      toast.success("Uploaded successfully");
      setFile(null);
      fetchDocuments();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Upload failed");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "Do you want to delete this document?",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    });

    if (result.isConfirmed) {
      setLoading(true);
      try {
        await axios.delete(`${url}/api/documents/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success("Deleted");
        fetchDocuments();
      } catch (err) {
        toast.error("Delete failed");
      } finally {
        setLoading(false);
      }
    }
  };

  const handleDownload = async (id) => {
    setLoading(true);
    try {
      const response = await axios.get(`${url}/api/documents/download/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        responseType: "blob",
      });

      if (response.data instanceof Blob) {
        const blob = response.data;
        const urlObject = window.URL.createObjectURL(blob);

        const a = document.createElement("a");
        a.href = urlObject;

        const contentDisposition = response.headers["content-disposition"];
        const fileName = contentDisposition
          ? contentDisposition.split("filename=")[1].replace(/"/g, "")
          : "document.pdf";

        a.download = fileName;
        a.click();

        window.URL.revokeObjectURL(urlObject);
      } else {
        toast.error("Failed to download document. Invalid response.");
      }
    } catch (error) {
      toast.error("Failed to download the document.");
      console.error("Download error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-4">
      <h4 className="bread">Documents</h4>

      <form
        onSubmit={handleUpload}
        className="row g-3 mt-1 mb-4 align-items-end"
      >
        <div className="col-md-3">
          <label htmlFor="yearInput" className="form-label">
            Year
          </label>
          <input
            id="yearInput"
            type="number"
            className="form-control"
            value={year}
            onChange={(e) => setYear(e.target.value)}
          />
        </div>
        <div className="col-md-5">
          <label htmlFor="fileInput" className="form-label">
            File
          </label>
          <input
            id="fileInput"
            type="file"
            className="form-control"
            onChange={(e) => setFile(e.target.files[0])}
          />
        </div>
        <div className="col-md-2">
          <button
            className="btn btn-success w-100"
            type="submit"
            disabled={loading}
          >
            Upload
          </button>
        </div>
      </form>

      <div className="accordion" id="yearAccordion">
        {Object.keys(documentsByYear)
          .sort((a, b) => Number(b) - Number(a))
          .map((yearKey, index) => (
            <div className="accordion-item" key={yearKey}>
              <h2 className="accordion-header" id={`heading-${yearKey}`}>
                <button
                  className={`accordion-button ${
                    index !== 0 ? "collapsed" : ""
                  }`}
                  type="button"
                  data-bs-toggle="collapse"
                  data-bs-target={`#collapse-${yearKey}`}
                  aria-expanded={index === 0 ? "true" : "false"}
                  aria-controls={`collapse-${yearKey}`}
                >
                  📂 Documents - {yearKey}
                </button>
              </h2>
              <div
                id={`collapse-${yearKey}`}
                className={`accordion-collapse collapse ${
                  index === 0 ? "show" : ""
                }`}
                aria-labelledby={`heading-${yearKey}`}
                data-bs-parent="#yearAccordion"
              >
                <div className="accordion-body">
                  {documentsByYear[yearKey].length === 0 ? (
                    <p className="text-muted">No documents for this year.</p>
                  ) : (
                    <ul className="list-group">
                      {documentsByYear[yearKey].map((doc) => (
                        <li
                          key={doc._id}
                          className="list-group-item d-flex justify-content-between align-items-center"
                        >
                          <div>
                            <strong>{doc.originalName}</strong>
                            <div className="small text-muted">
                              Uploaded:{" "}
                              {new Date(doc.createdAt).toLocaleString()}
                            </div>
                          </div>
                          <div
                            className="btn-group"
                            role="group"
                            aria-label="Document actions"
                          >
                            <button
                              className="btn btn-outline-primary btn-sm"
                              onClick={() => handleDownload(doc._id)}
                            >
                              Download
                            </button>
                            <button
                              className="btn btn-outline-danger btn-sm"
                              onClick={() => handleDelete(doc._id)}
                            >
                              Delete
                            </button>
                          </div>
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

export default DocumentManager;
