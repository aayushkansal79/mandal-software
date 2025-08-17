import Expenditure from "../models/Expenditure.js";
import ReceiptBook from "../models/ReceiptBook.js";
import Receipt from "../models/Receipt.js";
import User from "../models/User.js";


export const getDashboardStats = async (req, res) => {
  try {
    const { year } = req.query;
    const selectedYear = year ? parseInt(year) : new Date().getFullYear();

    const mandalId = req.user.mandal;

    const memberCount = await User.countDocuments({
      mandal: mandalId,
      type: { $ne: "superadmin" }
    });

    const filter = { mandal: mandalId, year: selectedYear };

    const padCount = await ReceiptBook.countDocuments(filter);

    const receiptCount = await Receipt.countDocuments(filter);
    const expenseCount = await Expenditure.countDocuments(filter);

    const receiptTotal = await Receipt.aggregate([
      { $match: filter },
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);
    const totalReceiptAmount = receiptTotal.length > 0 ? receiptTotal[0].total : 0;

    const expenseTotal = await Expenditure.aggregate([
      { $match: filter },
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);
    const totalExpenseAmount = expenseTotal.length > 0 ? expenseTotal[0].total : 0;

    res.status(200).json({
      memberCount,
      padCount,
      receiptCount,
      expenseCount,
      totalReceiptAmount,
      totalExpenseAmount,
      year: selectedYear
    });
  } catch (err) {
    console.error("Error in getDashboardStats:", err);
    res.status(500).json({ message: err.message });
  }
};
