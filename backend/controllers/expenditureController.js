import Expenditure from "../models/Expenditure.js";
import ExcelJS from "exceljs";

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

export const updateExpenditure = async (req, res) => {
  try {
    const { id } = req.params;
    const { field, amount } = req.body;

    const expense = await Expenditure.findById(id);
    if (!expense) {
      return res.status(404).json({ message: "Expense not found" });
    }

    if (field) expense.field = field;
    if (amount !== undefined) expense.amount = amount;

    const updated = await expense.save();
    res.json({ message: "Expense updated successfully", updated });
  } catch (err) {
    res.status(500).json({ message: "Failed to update expense" });
  }
};

// FETCH all expenses for specific mandal & year
// export const getAllExpenses = async (req, res) => {
//     try {
//         const mandalId = req.user.mandal;
//         const { year } = req.query;
//         const selectedYear = year ? parseInt(year) : new Date().getFullYear();

//         const expenses = await Expenditure.find({
//             mandal: mandalId,
//             year: selectedYear
//         }).sort({ createdAt: 1 });

//         res.status(200).json(expenses);
//     } catch (error) {
//         console.error("Error fetching expenses:", error);
//         res.status(500).json({ message: "Server error" });
//     }
// };

export const getAllExpenses = async (req, res) => {
  try {
    const mandalId = req.user.mandal;
    const { year, exportExcel } = req.query; // add exportExcel flag
    const selectedYear = year ? parseInt(year) : new Date().getFullYear();

    const expenses = await Expenditure.find({
      mandal: mandalId,
      year: selectedYear,
    }).sort({ createdAt: 1 });

    // If user requested Excel
    if (exportExcel === "true") {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Expenses");

      // Define columns
      worksheet.columns = [
          { header: "Field", key: "field", width: 30 },
          { header: "Amount", key: "amount", width: 15 },
          { header: "Date", key: "date", width: 15 },
      ];

      // Add rows
      expenses.forEach((exp) => {
        worksheet.addRow({
            field: exp.field || "",
            amount: exp.amount,
            date: exp.createdAt.toISOString().split("T")[0], // format YYYY-MM-DD
        });
      });

      // Style header row
      worksheet.getRow(1).font = { bold: true };

      // Set response headers for Excel file
      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );
      res.setHeader(
        "Content-Disposition",
        `attachment; filename=Expenses_${selectedYear}.xlsx`
      );

      // Write to response
      await workbook.xlsx.write(res);
      return res.end();
    }

    // Default: return JSON
    res.status(200).json(expenses);
  } catch (error) {
    console.error("Error fetching expenses:", error);
    res.status(500).json({ message: "Server error" });
  }
};
