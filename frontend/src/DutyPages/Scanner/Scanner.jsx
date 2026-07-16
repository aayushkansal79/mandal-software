import React, { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import axios from "axios";
import toast from "react-hot-toast";
import Loader from "../../components/Loader/Loader";
// import "./Scanner.css";

const Scanner = ({ url }) => {
  const token = localStorage.getItem("token");
  const scannerRef = useRef(null);
  const scannerId = "reader";
  const successAudio = useRef(new Audio("/audio/success.mp3"));
  const errorAudio = useRef(new Audio("/audio/error.mp3"));
  const duplicateAudio = useRef(new Audio("/audio/duplicate.mp3"));
  const lastCode = useRef("");
  const scanning = useRef(false);
  const [loading, setLoading] = useState(false);
  const [activeSession, setActiveSession] = useState(null);
  const [presentMembers, setPresentMembers] = useState(0);
  const [remainingMembers, setRemainingMembers] = useState(0);

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

  // ---------------- QR SUCCESS ----------------

  const onScanSuccess = async (decodedText) => {
    if (!decodedText) return;
    if (scanning.current) return;
    if (decodedText === lastCode.current) return;
    scanning.current = true;
    lastCode.current = decodedText;
    await markAttendance(decodedText);
    scanning.current = false;
    setTimeout(() => {
      lastCode.current = "";
    }, 1500);
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
      fetchSession();
    }, 3000);

    return () => {
      clearInterval(interval);
      stopScanner();
    };
  }, []);

  return (
    <>
      <div className="bread">QR Attendance Scanner</div>

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

                  <span className="badge bg-success">Active</span>
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

                <span className="fw-bold text-success">{presentMembers}</span>
              </div>

              <div className="d-flex justify-content-between">
                <span>Remaining</span>

                <span className="fw-bold text-danger">{remainingMembers}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {loading && <Loader />}
    </>
  );
};

export default Scanner;
