import express from "express";
const router = express.Router();
import * as controller from "../../controllers/client/user.controller.js";
import { uploadSingle } from "../../middlewares/admin/uploadCloud.middleware.js";

import multer from "multer";
const upload = multer();
router.get("/profile/:userId", controller.index);
router.get("/me", controller.getMe);
router.put("/me", upload.single("avatar"), uploadSingle, controller.updateMe);
router.put("/me/change-password", controller.changePassword);
router.delete("/me", controller.deleteMe);

// Lấy tất cả playlist của account hiện tại (dựa vào token)
router.get("/me/playlists", controller.getMyPlaylists);

export default router;
