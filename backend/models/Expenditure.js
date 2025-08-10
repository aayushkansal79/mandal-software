import mongoose from "mongoose";

const ExpenditureSchema = new mongoose.Schema({
    mandal: { type: mongoose.Schema.Types.ObjectId, ref: "Mandal", required: true },
    mandalName: { type: String, required: true },
    field: { type: String, required: true },
    amount: { type: Number, required: true },
    status: { type: Boolean, default: true },
}, { timestamps: true });

export default mongoose.model("Expenditure", ExpenditureSchema);