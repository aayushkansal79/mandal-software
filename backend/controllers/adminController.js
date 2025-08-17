import Admin from "../models/Admin.js";

export const initAdmin = async () => {
  const existing = await Admin.findOne();
  if (!existing) {
    await Admin.create({});
    console.log("✅ Admin document initialized");
  }
};

export const getReceiptStatus = async (req, res) => {
  try {
    const { mandalName } = req.user;

    let field = "";
    if (mandalName === "Shri Shyam Sewa Sangh Sarojini Nagar") {
      field = "sarojiniReceiptStatus";
    } else if (mandalName === "Shri Shyam Sewak Yuva Mandal Sangam Vihar") {
      field = "sangamReceiptStatus";
    } else {
      return res.status(400).json({ message: "Invalid mandal name" });
    }

    const admin = await Admin.findOne().select(field);

    if (!admin) {
      return res.status(404).json({ message: "Admin settings not found" });
    }

    res.status(200).json({ status: admin[field] });
  } catch (err) {
    console.error("Error fetching receipt status:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const updateReceiptStatus = async (req, res) => {
  try {
    const { mandalName } = req.user;
    const { status } = req.body;

    let field = "";
    if (mandalName === "Shri Shyam Sewa Sangh Sarojini Nagar") {
      field = "sarojiniReceiptStatus";
    } else if (mandalName === "Shri Shyam Sewak Yuva Mandal Sangam Vihar") {
      field = "sangamReceiptStatus";
    } else {
      return res.status(400).json({ message: "Invalid mandal name" });
    }

    const existing = await Admin.findOne();
    if (!existing) {
      return res.status(404).json({ message: "Admin settings not found" });
    }

    existing[field] = status;
    await existing.save();

    res.status(200).json({
      message: `${mandalName} - Receipt Status ${status ? "Active" : "Inactive"}`,
      status: existing[field],
    });
  } catch (err) {
    console.error("Error updating receipt status:", err);
    res.status(500).json({ message: "Server error" });
  }
};