import OtherIncome from "../models/OtherIncome.js";
import ExcelJS from "exceljs";

export const addOtherIncome = async (req, res) => {
  try {
    const {description, amount, mobile } = req.body;

    if (!description || !amount) {
      return res.status(400).json({ message: "All required fields must be provided" });
    }

    const mandalId = req.user.mandal;
    const mandalName = req.user.mandalName;
    const year = new Date().getFullYear();

    const newIncome = new OtherIncome({
      mandal: mandalId,
      mandalName,
      description,
      amount,
      mobile,
      year,
    });

    await newIncome.save();

    res.status(201).json({ message: "Other income added successfully", data: newIncome });
  } catch (error) {
    console.error("Error adding other income:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getOtherIncomes = async (req, res) => {
  try {
    const {
      year,
      page = 1,
      limit = 50,
      description,
      mobile,
      amount,
      exportExcel,
    } = req.query;

    const selectedYear = year ? parseInt(year) : new Date().getFullYear();
    const query = { mandal: req.user.mandal };

    if (selectedYear) query.year = selectedYear;
    if (description) query.description = { $regex: description, $options: "i" };
    if (mobile) query.mobile = { $regex: mobile, $options: "i" };
    if (amount) query.amount = { $gte: parseFloat(amount) };

    if (exportExcel === "true") {
      const incomes = await OtherIncome.find(query).sort({ createdAt: 1 });

      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Other Incomes");

      const columns = [
        { header: "S No.", key: "index", width: 7 },
        { header: "Name", key: "description", width: 35 },
        { header: "Amount", key: "amount", width: 12 },
        { header: "Mobile", key: "mobile", width: 15 },
      ];

      worksheet.columns = columns;

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

      incomes.forEach((inc, i) => {
        const rowData = {
          index: i + 1,
          description: inc.description,
          amount: inc.amount,
          mobile: inc.mobile,
        };

        worksheet.addRow(rowData);
      });

      worksheet.columns.forEach((col) => {
        if (col.key !== "amount") {
          col.alignment = { vertical: "middle", horizontal: "center" };
        }
      });

      worksheet.getColumn("amount").numFmt = "₹ #,##,##0";
      worksheet.getColumn("amount").alignment = {
        vertical: "middle",
        horizontal: "right",
      };

      worksheet.getRow(1).height = 28;

      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );
      res.setHeader(
        "Content-Disposition",
        `attachment; filename=OtherIncomes_${selectedYear}.xlsx`
      );

      await workbook.xlsx.write(res);
      return res.end();
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [incomes, total] = await Promise.all([
      OtherIncome.find(query)
        .sort({ createdAt: 1 })
        .skip(skip)
        .limit(parseInt(limit)),
      OtherIncome.countDocuments(query),
    ]);

    res.status(200).json({
      incomes,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
    });

  } catch (err) {
    console.error("Error fetching other incomes:", err);
    res.status(500).json({ message: "Server error" });
  }
};


export const updateOtherIncome = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedData = req.body;

    const income = await OtherIncome.findByIdAndUpdate(id, updatedData, { new: true });

    if (!income) {
      return res.status(404).json({ message: "Other income not found" });
    }

    res.status(200).json({ message: "Other income updated successfully", data: income });
  } catch (error) {
    console.error("Error updating other income:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const deleteOtherIncome = async (req, res) => {
  try {
    const { id } = req.params;

    const income = await OtherIncome.findByIdAndDelete(id);

    if (!income) {
      return res.status(404).json({ message: "Other income not found" });
    }

    res.status(200).json({ message: "Other income deleted successfully" });
  } catch (error) {
    console.error("Error deleting other income:", error);
    res.status(500).json({ message: "Server error" });
  }
};
