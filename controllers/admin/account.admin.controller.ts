import { Request, Response } from "express";
import Account from "../../models/account.model.js";

export const index = async (req: Request, res: Response) => {
  try {
    const admins = await Account.find({
      role_id: { $ne: "CUSTOMER" },
      deleted: false,
    });
    console.log(admins);
    res.json({
      success: true,
      admins,
    });
  } catch (error) {
    console.log(error);
  }
};
