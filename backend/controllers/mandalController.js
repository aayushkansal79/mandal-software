import Mandal from "../models/Mandal.js";

// Create Mandal
export const createMandal = async (req, res) => {
    try {
        const { name, code } = req.body;

        if (!name || !code) {
            return res.status(400).json({ message: "Name and code are required" });
        }

        const mandalExists = await Mandal.findOne({ $or: [{ name }, { code }] });
        if (mandalExists) {
            return res.status(400).json({ message: "Mandal with this name or code already exists" });
        }

        const mandal = await Mandal.create({ name, code });
        res.status(201).json(mandal);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Get all Mandals
export const getMandals = async (req, res) => {
    try {
        const mandals = await Mandal.find().sort({ name: 1 });
        res.json(mandals);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
