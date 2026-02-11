import PujaList from "../models/PujaList.js";

export const addPujaMember = async (req, res) => {
  try {
    const { memberName, year } = req.body;

    if (!memberName) {
      return res.status(400).json({ message: "Member name is required" });
    }

    const mandalId = req.user.mandal;
    const selectedYear = year || new Date().getFullYear();

    // Check duplicate
    const existingMember = await PujaList.findOne({
      mandal: mandalId,
      year: selectedYear,
      memberName: memberName.trim(),
    });

    if (existingMember) {
      return res.status(400).json({
        message: "Member already exists for this year",
      });
    }

    const newMember = await PujaList.create({
      mandal: mandalId,
      year: selectedYear,
      memberName: memberName.trim()
    });

    res.status(201).json({
      message: "Member added successfully",
      data: newMember,
    });
  } catch (error) {
    console.error("Add puja member error:", error);
    res.status(500).json({
      message: "Server error",
    });
  }
};

export const getPujaList = async (req, res) => {
  try {
    const mandalId = req.user.mandal;

    const docs = await PujaList.find({ mandal: mandalId })
      .sort({ year: -1, createdAt: -1 })
      .lean();

    const grouped = docs.reduce((acc, doc) => {
      const year = String(doc.year); // ensure consistent key

      if (!acc[year]) {
        acc[year] = [];
      }

      acc[year].push(doc);
      return acc;
    }, {});

    res.status(200).json(grouped);
  } catch (err) {
    console.error("Get puja list error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const deletePujaMember = async (req, res) => {
  try {
    const { id } = req.params;
    const mandalId = req.user.mandal;

    const member = await PujaList.findById(id);

    if (!member) {
      return res.status(404).json({ message: "Member not found" });
    }

    // Ensure same mandal
    if (member.mandal.toString() !== mandalId.toString()) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    await PujaList.deleteOne({ _id: id });

    res.status(200).json({ message: "Member deleted successfully" });
  } catch (err) {
    console.error("Delete puja member error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
