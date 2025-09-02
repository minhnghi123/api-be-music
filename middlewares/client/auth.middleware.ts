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

    // console.log("test token ");
    if (token) {
      if (process.env.JWT_SECRET) {
        const verifiedUser = jwt.verify(token, process.env.JWT_SECRET);
        // console.log(verifiedUser);=> decode to registered userId , iat and exp
        //=>get userId to check in DB
        const user = await User.findById(
          (verifiedUser as jwt.JwtPayload).userId.toString()
        );
        if (!user) {
          res.redirect("/auth/login");
          return;
        }
        res.locals.user = user;
      } else {
        throw new Error("JWT_SECRET is not defined");
      }
    }
    //  else {
    //   res.locals.user = null;
    // }
    next();
  } catch (error) {
    console.log(error);
  }
};
