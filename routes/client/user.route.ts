import express from "express";
const router = express.Router();
import * as controller from "../../controllers/client/user.controller.js";

router.get("/profile/:userId", controller.index);
router.get("/me", controller.getMe);
router.put("/me", controller.updateMe);
router.put("/me/change-password", controller.changePassword);
router.delete("/me", controller.deleteMe);

export default router;
