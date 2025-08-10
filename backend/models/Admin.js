import mongoose from "mongoose";

const MandalSchema = new mongoose.Schema({
    year: { type: String },
    status: { type: Boolean, default: true },
}, { timestamps: true });

export default mongoose.model("Mandal", MandalSchema);