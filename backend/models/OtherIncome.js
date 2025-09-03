import mongoose from "mongoose";

const OtherIncomeSchema = new mongoose.Schema({
    mandal: { type: mongoose.Schema.Types.ObjectId, ref: "Mandal", required: true },
    mandalName: { type: String, required: true },
    description: { type: String, required: true },
    amount: { type: Number, required: true },
    mobile: { type: String},
    year: { type: Number, required: true },
    status: { type: Boolean, default: true },
}, { timestamps: true });

export default mongoose.model("OtherIncome", OtherIncomeSchema);