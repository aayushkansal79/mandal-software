import mongoose from "mongoose";

const pujaListSchema = new mongoose.Schema(
  {
    mandal: { type: mongoose.Schema.Types.ObjectId, ref: "Mandal", required: true },
    year: { type: Number, required: true },
    memberName: { type: String, required: true },
  },
  { timestamps: true }
);

const PujaList = mongoose.model("PujaList", pujaListSchema);
export default PujaList;