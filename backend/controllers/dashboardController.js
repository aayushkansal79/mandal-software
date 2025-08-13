import Receipt from "../models/Receipt.js";
import User from "../models/User.js";


export const getDashboardStats = async (req, res) => {
  try {
    const { year } = req.query; // ?year=2025

    const memberCount = await User.countDocuments({ mandal: req.user.mandal, type: "member" });

    const receiptFilter = { mandal: req.user.mandal };
    if (year) {
      receiptFilter.year = parseInt(year);
    }
    const receiptCount = await Receipt.countDocuments(receiptFilter);

    res.status(200).json({
      memberCount,
      receiptCount,
      year: year ? parseInt(year) : new Date().getFullYear(),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};