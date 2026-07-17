import { Routes, Route, Navigate } from "react-router-dom";
import Dashboard from "../DutyPages/Dashboard/Dashboard";
import Members from "../DutyPages/Members/Members";
import Sessions from "../DutyPages/Sessions/Sessions";
import Scanner from "../DutyPages/Scanner/Scanner";
import Attendance from "../DutyPages/Attendance/Attendance";
import ReportDash from "../DutyPages/Reports/ReportDash";
import DayReport from "../DutyPages/Reports/DayReport";

export default function DutyRoutes({url}) {
  return (
    <Routes>
      <Route path="*" element={<Navigate to="/duty/sessions" replace />} />
      <Route path="/dashboard" element={<Dashboard url={url} />} />
      <Route path="/scanner" element={<Scanner url={url} />} />
      <Route path="/attendance" element={<Attendance url={url} />} />
      <Route path="/sessions" element={<Sessions url={url} />} />
      <Route path="/member" element={<Members url={url} />} />
      <Route path="/report" element={<ReportDash url={url} />} />
      <Route path="/report/:date" element={<DayReport url={url} />} />
    </Routes>
  );
}