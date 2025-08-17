import mongoose from "mongoose";

const AdminSchema = new mongoose.Schema({
    status: { type: Boolean, default: true },
    sarojiniReceiptStatus: { type: Boolean, default: true },
    sangamReceiptStatus: { type: Boolean, default: true }
}, { timestamps: true });

export default mongoose.model("Admin", AdminSchema);