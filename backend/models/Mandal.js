import mongoose from "mongoose";

const MandalSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    status: { type: Boolean, default: true },
}, { timestamps: true });

export default mongoose.model("Mandal", MandalSchema);