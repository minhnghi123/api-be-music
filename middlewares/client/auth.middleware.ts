import { NextFunction, Request, Response } from "express";
import User from "../../models/user.model.js";
import jwt from "jsonwebtoken";
export const authSignUp = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
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
  const existingUserByEmail = await User.findOne({
    email: email,
    deleted: false,
    status: "active",
  });
  const existingUserByUsername = await User.findOne({
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
};
export const authUserInMainPage = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.cookies["jwt-token"];
    if (!token) {
      return res
        .status(401)
        .json({ success: false, message: "Authentication token missing" });
    }

    if (!process.env.JWT_SECRET) {
      return res
        .status(500)
        .json({ success: false, message: "Server configuration error" });
    }

    let verifiedUser;
    try {
      verifiedUser = jwt.verify(
        token,
        process.env.JWT_SECRET
      ) as jwt.JwtPayload;
    } catch (err) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid or expired token" });
    }

    const user = await User.findById(verifiedUser.userId);
    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "User not found" });
    }

    res.locals.user = user;
    next();
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
