import React, { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import axios from "axios";
import toast from "react-hot-toast";
import Loader from "../../components/Loader/Loader";
import { useNavigate } from "react-router-dom";
// import "./Scanner.css";

const Scanner = ({ url }) => {
  const token = localStorage.getItem("token");
  const scannerRef = useRef(null);
  const scannerId = "reader";
  const successAudio = useRef(new Audio("/audio/success.mp3"));
  const errorAudio = useRef(new Audio("/audio/error.mp3"));
  const duplicateAudio = useRef(new Audio("/audio/duplicate.mp3"));
  const navigate = useNavigate();
  const lastCode = useRef("");
  const scanning = useRef(false);
  const [scannerMode, setScannerMode] = useState("attendance");
  const scannerModeRef = useRef(scannerMode);
  const [loading, setLoading] = useState(false);
  const [activeSession, setActiveSession] = useState(null);
  const [presentMembers, setPresentMembers] = useState(0);
  const [remainingMembers, setRemainingMembers] = useState(0);
  const [liveBreaks, setLiveBreaks] = useState([]);

  const [breakStats, setBreakStats] = useState({
    totalMembers: 0,
    available: 0,
    onBreak: 0,
  });

  useEffect(() => {
    scannerModeRef.current = scannerMode;
  }, [scannerMode]);

  // ---------------- FETCH ACTIVE SESSION ----------------

  const fetchSession = async () => {
    try {
      const response = await axios.get(`${url}/api/dutysession/live`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.data.success) {
        setActiveSession(response.data.session);
        if (response.data.stats) {
          setPresentMembers(response.data.stats.presentMembers || 0);
          setRemainingMembers(response.data.stats.remainingMembers || 0);
        }
      }
    } catch (error) {
      console.log(error);
    }
  };

  // ---------------- FETCH ACTIVE BREAK ----------------

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

  // ---------------- MARK ATTENDANCE ----------------

  const markAttendance = async (memberCode) => {
    try {
      const response = await axios.post(
        `${url}/api/dutyattendance`,
        {
          memberCode,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      if (response.data.success) {
        successAudio.current.currentTime = 0;
        successAudio.current.play().catch(() => {});
        toast.success(response.data.message);
        // Update UI instantly
        setPresentMembers((prev) => prev + 1);
        setRemainingMembers((prev) => (prev > 0 ? prev - 1 : 0));
      }
    } catch (error) {
      const message =
        error.response?.data?.message || "Unable to mark attendance";
      if (message.toLowerCase().includes("already")) {
        duplicateAudio.current.currentTime = 0;
        duplicateAudio.current.play().catch(() => {});
      } else {
        errorAudio.current.currentTime = 0;
        errorAudio.current.play().catch(() => {});
      }
      toast.error(message);
    }
  };

  // ---------------- BREAK ----------------

  const toggleBreak = async (memberCode) => {
    try {
      const response = await axios.post(
        `${url}/api/dutybreak`,
        { memberCode },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (response.data.success) {
        successAudio.current.currentTime = 0;
        successAudio.current.play().catch(() => {});

        toast.success(response.data.message);
      }
    } catch (error) {
      errorAudio.current.currentTime = 0;
      errorAudio.current.play().catch(() => {});

      toast.error(error.response?.data?.message || "Unable to update break.");
    }
  };

  // ---------------- QR SUCCESS ----------------

  const onScanSuccess = async (decodedText) => {
    if (!decodedText) return;
    if (scanning.current) return;
    if (decodedText === lastCode.current) return;
    scanning.current = true;
    lastCode.current = decodedText;

    if (scannerModeRef.current === "attendance") {
      await markAttendance(decodedText);
    } else {
      await toggleBreak(decodedText);
    }

    await scannerRef.current.pause(true);

    setTimeout(async () => {
      lastCode.current = "";
      scanning.current = false;

      try {
        await scannerRef.current.resume();
      } catch (err) {}
    }, 2000);

    return;
  };

  // ---------------- START CAMERA ----------------

  const startScanner = async () => {
    try {
      const scanner = new Html5Qrcode(scannerId);
      scannerRef.current = scanner;
      await scanner.start(
        {
          facingMode: "environment",
        },
        {
          fps: 15,
          qrbox: {
            width: 280,
            height: 280,
          },
        },
        onScanSuccess,
      );
    } catch (error) {
      console.log(error);
      toast.error("Unable to access camera");
    }
  };

  // ---------------- STOP CAMERA ----------------

  const stopScanner = async () => {
    if (!scannerRef.current) return;
    try {
      await scannerRef.current.stop();
    } catch (err) {}
    try {
      await scannerRef.current.clear();
    } catch (err) {}
  };

  // ---------------- INIT ----------------

  useEffect(() => {
    fetchSession();
    startScanner();
    const interval = setInterval(() => {
      if (scannerModeRef.current === "attendance") {
        fetchSession();
      } else {
        fetchLiveBreaks();
      }
    }, 3000);

    return () => {
      clearInterval(interval);
      stopScanner();
    };
  }, []);

  return (
    <>
      <div className="bread">
        {scannerMode === "attendance"
          ? "QR Attendance Scanner"
          : "QR Break Scanner"}
      </div>

      <div className="card shadow-sm mb-3">
        <div className="card-body">
          <h5 className="mb-3">Scanner Mode</h5>

          <div className="btn-group w-100">
            <button
              className={`btn ${
                scannerMode === "attendance"
                  ? "btn-primary"
                  : "btn-outline-primary"
              }`}
              onClick={() => {
                setScannerMode("attendance");
                scannerModeRef.current = "attendance";
              }}
            >
              Attendance
            </button>

            <button
              className={`btn ${
                scannerMode === "break" ? "btn-warning" : "btn-outline-warning"
              }`}
              onClick={() => {
                setScannerMode("break");
                scannerModeRef.current = "break";
              }}
            >
              Break
            </button>
          </div>
        </div>
      </div>

      <div className="row my-4">
        <div className="col-lg-8 mb-4">
          <div className="card shadow-sm">
            <div className="card-header">
              <h5 className="mb-0">Scan QR Code</h5>
            </div>

            <div className="card-body">
              <div
                id={scannerId}
                style={{
                  width: "100%",
                  minHeight: "150px",
                }}
              ></div>
            </div>
          </div>
        </div>

        <div className="col-lg-4">
          {/* Attendance Mode */}
          {scannerMode === "attendance" ? (
            <>
              <div className="card shadow-sm mb-4">
                <div className="card-body">
                  <h5 className="fw-bold">Active Session</h5>

                  <hr />

                  {activeSession ? (
                    <>
                      <h4 className="fw-bold">{activeSession.title}</h4>

                      <p className="mb-1">
                        <strong>Date :</strong>{" "}
                        {new Date(activeSession.date).toLocaleDateString()}
                      </p>

                      <p className="mb-1">
                        <strong>Started :</strong>{" "}
                        {new Date(activeSession.startTime).toLocaleTimeString()}
                      </p>

                      <span className="badge bg-success mb-1">Active</span>

                      <div>
                        <button
                          type="button"
                          className="btn btn-outline-primary"
                          onClick={() => navigate("/duty/attendance")}
                        >
                          <i class="bi bi-view-list me-2"></i>
                          View Attendance
                        </button>
                      </div>
                    </>
                  ) : (
                    <h5 className="text-danger">No Active Session</h5>
                  )}
                </div>
              </div>

              <div className="card shadow-sm">
                <div className="card-body">
                  <h5 className="fw-bold mb-3">Attendance</h5>

                  <div className="d-flex justify-content-between mb-2">
                    <span>Present</span>

                    <span className="fw-bold text-success">
                      {presentMembers}
                    </span>
                  </div>

                  <div className="d-flex justify-content-between">
                    <span>Remaining</span>

                    <span className="fw-bold text-danger">
                      {remainingMembers}
                    </span>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Break Mode */}
              <div className="card shadow-sm mb-4">
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

                          <small className="text-muted">
                            {item.memberCode}
                          </small>

                          <div className="mt-2 d-flex justify-content-between">
                            <span className="badge bg-warning text-dark">
                              On Break
                            </span>

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

                    <span className="fw-bold text-success">
                      {breakStats.available}
                    </span>
                  </div>

                  <div className="d-flex justify-content-between">
                    <span>On Break</span>

                    <span className="fw-bold text-warning">
                      {breakStats.onBreak}
                    </span>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {loading && <Loader />}
    </>
  );
};

export default Scanner;
