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
export const authUserInMainPage = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const token = req.cookies["jwt-token"];
        if (token) {
            if (process.env.JWT_SECRET) {
                const verifiedUser = jwt.verify(token, process.env.JWT_SECRET);
                const user = yield User.findById(verifiedUser.userId.toString());
                if (!user) {
                    res.redirect("/auth/login");
                    return;
                }
                res.locals.user = user;
            }
            else {
                throw new Error("JWT_SECRET is not defined");
            }
        }
        next();
    }
    catch (error) {
        console.log(error);
    }
});
