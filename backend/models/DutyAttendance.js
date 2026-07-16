import mongoose from "mongoose";

const dutyAttendanceSchema = new mongoose.Schema(
  {
    session: { type: mongoose.Schema.Types.ObjectId, ref: "DutySession", required: true, index: true,},
    member: { type: mongoose.Schema.Types.ObjectId, ref: "DutyMember", required: true, index: true,},
    status: { type: String, enum: ["Present", "Late", "Absent", "Leave", "Excused"], default: "Present",},
    attendanceTime: { type: Date, default: Date.now,},
  },
  {
    timestamps: true,
  }
);

// One attendance record per member per session
dutyAttendanceSchema.index(
  { session: 1, member: 1 },
  { unique: true }
);

// Faster session-wise listing
dutyAttendanceSchema.index({
  session: 1,
  attendanceTime: 1,
});

export default mongoose.model("DutyAttendance", dutyAttendanceSchema);