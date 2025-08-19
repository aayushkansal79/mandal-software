import mongoose from "mongoose";

const InvitedMandalSchema = new mongoose.Schema({
    mandalName: { type: String, trim: true },
    contactPerson: { type: String, trim: true },
    mobile: { type: String, trim: true },
    address: { type: String, trim: true },
}, { timestamps: true });

export default mongoose.model("InvitedMandal", InvitedMandalSchema);