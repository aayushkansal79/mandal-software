import mongoose from "mongoose";

const dutyBreakSchema = new mongoose.Schema(
{
    member:{ type:mongoose.Schema.Types.ObjectId, ref:"DutyMember", required:true, index:true },
    breakOut:{ type:Date, required:true },
    breakIn:{ type:Date, default:null },
    duration:{ type:Number, default:0 },
},{
    timestamps:true
});

export default mongoose.model("DutyBreak", dutyBreakSchema);