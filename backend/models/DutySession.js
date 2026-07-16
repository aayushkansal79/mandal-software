import mongoose from "mongoose";

const attendanceSessionSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, },
    date: { type: Date, required: true, index: true, },
    startTime: { type: Date, required: true, },
    endTime: { type: Date, default: null, },
    status: { type: String, enum: ["Upcoming", "Active", "Completed", "Cancelled"], default: "Active", },
    presentCount: { type: Number,default: 0},
    absentCount: { type: Number, default: 0},
    leaveCount: { type: Number, default: 0}
  },
  { timestamps: true }
);
export default mongoose.model("DutySession", attendanceSessionSchema);