import jwt from "jsonwebtoken";
import User from "../models/User.js";
import dotenv from "dotenv";
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;

export const protect = (roles = []) => {
    if (typeof roles === "string") {
        roles = [roles];
    }

    return async (req, res, next) => {
        let token;

        if (
            req.headers.authorization &&
            req.headers.authorization.startsWith("Bearer")
        ) {
            try {
                token = req.headers.authorization.split(" ")[1];
                const decoded = jwt.verify(token, JWT_SECRET);

                // If the user's status is false, block access
                if (decoded.status === false) {
                    return res.status(403).json({ message: "Access denied: Your account is disabled." });
                }

                // Find user from DB without password
                const user = await User.findById(decoded.id).select("-password");
                if (!user) {
                    return res.status(404).json({ message: "User not found" });
                }

                // Role-based access check if roles array is given
                if (roles.length > 0 && !roles.includes(user.type)) {
                    return res.status(403).json({ message: "Access denied: insufficient permissions" });
                }

                req.user = user;
                next();
            } catch (err) {
                console.error(err);
                return res.status(401).json({ message: "Not authorized, token failed" });
            }
        } else {
            return res.status(401).json({ message: "Not authorized, no token" });
        }
    };
};
