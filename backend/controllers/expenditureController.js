import Expenditure from "../models/Expenditure.js";

// ADD multiple expenses
export const addExpenses = async (req, res) => {
    try {
        const { expenses } = req.body;

        if (!Array.isArray(expenses) || expenses.length === 0) {
            return res.status(400).json({ message: "Expenses array is required" });
        }

        const mandalId = req.user.mandal;
        const mandalName = req.user.mandalName;
        const year = new Date().getFullYear();

        const expenseDocs = expenses.map(exp => ({
            mandal: mandalId,
            mandalName,
            field: exp.field,
            amount: exp.amount,
            year,
        }));

        const savedExpenses = await Expenditure.insertMany(expenseDocs);

        res.status(201).json({
            message: "Expenses added successfully",
            data: savedExpenses
        });
    } catch (error) {
        console.error("Error adding expenses:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// FETCH all expenses for specific mandal & year
export const getAllExpenses = async (req, res) => {
    try {
        const mandalId = req.user.mandal;
        const { year } = req.query;
        const selectedYear = year ? parseInt(year) : new Date().getFullYear();

        const expenses = await Expenditure.find({
            mandal: mandalId,
            year: selectedYear
        }).sort({ createdAt: 1 });

        res.status(200).json(expenses);
    } catch (error) {
        console.error("Error fetching expenses:", error);
        res.status(500).json({ message: "Server error" });
    }
};
