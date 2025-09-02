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
import bcryptjs from "bcryptjs";
import { generateTokenAndSetToken } from "../../helpers/JWT.helper.js";
export function login(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        res.json({
            success: true,
            message: "Login page (API only)",
        });
    });
}
export function signup(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        res.json({
            success: true,
            message: "Sign up page (API only)",
        });
    });
}
export function loginPost(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { username, password } = req.body;
            if (!username || !password) {
                return res
                    .status(400)
                    .json({ success: false, message: "Missing username or password" });
            }
            const user = yield User.findOne({
                username: username,
                deleted: false,
                status: "active",
            });
            if (!user) {
                return res
                    .status(401)
                    .json({ success: false, message: "User not found or inactive" });
            }
            const isPasswordMatch = yield bcryptjs.compare(password, String(user.password));
            if (!isPasswordMatch) {
                return res
                    .status(401)
                    .json({ success: false, message: "Incorrect password" });
            }
            generateTokenAndSetToken(String(user._id), res);
            return res.status(200).json({ success: true, message: "Login successful" });
        }
        catch (error) {
            res.status(500).json({ success: false, message: "Internal server error" });
        }
    });
}
export function signupPost(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { username, email, password, rePassword } = req.body;
            if (!username || !email || !password || !rePassword) {
                return res
                    .status(400)
                    .json({ success: false, message: "Missing required fields" });
            }
            if (password !== rePassword) {
                return res
                    .status(400)
                    .json({ success: false, message: "Passwords do not match" });
            }
            const existingUser = yield User.findOne({ $or: [{ username }, { email }] });
            if (existingUser) {
                return res
                    .status(409)
                    .json({ success: false, message: "Username or email already exists" });
            }
            const salt = bcryptjs.genSaltSync(10);
            const hashedPassword = yield bcryptjs.hash(password, salt);
            const newUser = new User({ username, email, password: hashedPassword });
            yield newUser.save();
            generateTokenAndSetToken(String(newUser._id), res);
            return res
                .status(201)
                .json({ success: true, message: "Signup successful" });
        }
        catch (error) {
            res.status(500).json({ success: false, message: "Internal server error" });
        }
    });
}
export function logout(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            res.clearCookie("jwt-token");
            res.locals.user = null;
            res.status(200).json({ success: true, message: "Logout successfully" });
        }
        catch (error) {
            res.status(500).json({ success: false, message: "Internal server error" });
        }
    });
}
