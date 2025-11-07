var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import User from "../../models/user.model.js";
import jwt from "jsonwebtoken";
export const authSignUp = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { username, email, password, rePassword } = req.body;
    if (!username || !email || !password) {
        return res
            .status(400)
            .json({ success: false, message: "Missing required fields" });
    }
    if (password.length < 6) {
        return res.status(400).json({
            success: false,
            message: "Password must be at least 6 characters",
        });
    }
    if (password !== rePassword) {
        return res
            .status(400)
            .json({ success: false, message: "Passwords do not match" });
    }
    const existingUserByEmail = yield User.findOne({
        email: email,
        deleted: false,
        status: "active",
    });
    const existingUserByUsername = yield User.findOne({
        username: username,
        deleted: false,
        status: "active",
    });
    if (existingUserByEmail) {
        return res
            .status(409)
            .json({ success: false, message: "Email already exists" });
    }
    if (existingUserByUsername) {
        return res
            .status(409)
            .json({ success: false, message: "Username already exists" });
    }
    next();
});
export const requireAuth = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const token = req.cookies["jwt-token"];
        if (!token) {
            return res
                .status(401)
                .json({ success: false, message: "Authentication required" });
        }
        if (!process.env.JWT_SECRET) {
            return res
                .status(500)
                .json({ success: false, message: "Server configuration error" });
        }
        let verifiedUser;
        try {
            verifiedUser = jwt.verify(token, process.env.JWT_SECRET);
        }
        catch (err) {
            return res
                .status(401)
                .json({ success: false, message: "Invalid or expired token" });
        }
        const user = yield User.findById(verifiedUser.userId);
        if (!user) {
            return res
                .status(401)
                .json({ success: false, message: "User not found" });
        }
        res.locals.user = user;
        next();
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
});
export const optionalAuth = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const token = req.cookies["jwt-token"];
        if (!token) {
            return next();
        }
        if (!process.env.JWT_SECRET) {
            return next();
        }
        try {
            const verifiedUser = jwt.verify(token, process.env.JWT_SECRET);
            const user = yield User.findById(verifiedUser.userId);
            if (user) {
                res.locals.user = user;
            }
        }
        catch (err) {
        }
        next();
    }
    catch (error) {
        next();
    }
});
