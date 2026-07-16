import mongoose from "mongoose";

const dutyMemberSchema = new mongoose.Schema(
  {   
    name: { type: String, required: true, trim: true, },
    memberCode: { type: String, required: true, unique: true, index: true, },
    mobile: { type: String, trim: true, default: "", },
    aadhaar: { type: String, trim: true, default: "", },
    status: { type: Boolean, default: true, },
    availability: { type: String, enum: ["Available", "Leave"], default: "Available",},
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("DutyMember", dutyMemberSchema);