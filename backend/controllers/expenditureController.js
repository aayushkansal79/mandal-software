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

        const savedExpenses = [];

        // Create each expense one by one
        for (const exp of expenses) {
            const expenseDoc = new Expenditure({
                mandal: mandalId,
                mandalName,
                field: exp.field,
                amount: exp.amount,
                year,
            });

            const saved = await expenseDoc.save();
            savedExpenses.push(saved);
        }

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
    const { year, exportExcel } = req.query;
    const selectedYear = year ? parseInt(year) : new Date().getFullYear();

    const expenses = await Expenditure.find({
      mandal: mandalId,
      year: selectedYear,
    }).sort({ createdAt: 1 });

    if (exportExcel === "true") {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Expenses");

      worksheet.columns = [
        { header: "S No.", key: "index", width: 5 },
        { header: "Detail", key: "field", width: 30 },
        { header: "Amount", key: "amount", width: 15 },
        { header: "Payments", key: "payments", width: 30 },
      ];

      worksheet.getRow(1).eachCell((cell) => {
        cell.font = { bold: true, size: 12, color: { argb: "FFFFFFFF" } };
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "4F81BD" },
        };
        cell.alignment = { vertical: "middle", horizontal: "center" };
        cell.border = {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" },
        };
      });

      expenses.forEach((exp, index) => {
        const paymentsText = exp.payments
          .map(
            (payment) =>
              `${payment.paymentMethod} - ₹ ${payment.payAmount.toLocaleString(
                "en-IN"
              )} `
          )
          .join("\n");

        worksheet.addRow({
          index: index + 1,
          field: exp.field || "",
          amount: exp.amount,
          payments: paymentsText,
        });
      });

      worksheet.getColumn("amount").numFmt = '₹ #,##,##0';
      worksheet.getColumn("amount").alignment = {
        vertical: "middle",
        horizontal: "right",
      };

      worksheet.columns.forEach((col) => {
        if (col.key !== "amount") {
          col.alignment = { vertical: "middle", horizontal: "center" };
        }
      });

      worksheet.getRow(1).height = 28;

      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );
      res.setHeader(
        "Content-Disposition",
        `attachment; filename=Expenses_${selectedYear}.xlsx`
      );

      await workbook.xlsx.write(res);
      return res.end();
    }

    res.status(200).json(expenses);
  } catch (error) {
    console.error("Error fetching expenses:", error);
    res.status(500).json({ message: "Server error" });
  }
};


// export const addPayment = async (req, res) => {
//   const { id } = req.params;
//   const { payAmount, paymentMethod } = req.body;

//   if (!payAmount || !paymentMethod) {
//     return res.status(400).json({ message: "Payment amount and method are required" });
//   }

//   try {
//     const expenditure = await Expenditure.findById(id);

//     if (!expenditure) {
//       return res.status(404).json({ message: "Expenditure not found" });
//     }

//     const newPayment = {
//       payAmount: parseInt(payAmount),
//       paymentMethod,
//     };

//     expenditure.payments.push(newPayment);

//     await expenditure.save();

//     res.status(200).json({
//       message: "Payment added successfully",
//       updated: expenditure,
//     });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Failed to add payment" });
//   }
// };

export const addPayment = async (req, res) => {
  const { id } = req.params;
  const { payAmount, paymentMethod } = req.body.payment;

  if (!payAmount || !paymentMethod) {
    return res.status(400).json({ message: "Payment amount and method are required" });
  }

  const parsedAmount = parseFloat(payAmount);
  if (isNaN(parsedAmount) || parsedAmount <= 0) {
    return res.status(400).json({ message: "Invalid payment amount" });
  }

  try {
    const expenditure = await Expenditure.findById(id);
    if (!expenditure) {
      return res.status(404).json({ message: "Expenditure not found" });
    }

    const newPayment = {
      payAmount: parsedAmount,
      paymentMethod,
    };

    expenditure.payments.push(newPayment);

    await expenditure.save();

    res.status(200).json({
      message: "Payment added successfully",
      updated: expenditure,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to add payment" });
  }
};

