import { Router } from "express";
import * as controller from "../../controllers/client/comment.controller.js";
import {
  requireAuth,
  optionalAuth,
} from "../../middlewares/client/auth.middleware.js";

const router: Router = Router();

// GET comments - không bắt buộc đăng nhập, nhưng cần check user nếu có
router.get("/:songId", optionalAuth, controller.getComments);

router.post("/", requireAuth, controller.addComment);

router.delete("/:commentId", requireAuth, controller.deleteComment);

router.post("/:commentId/like", requireAuth, controller.likeComment);

export default router;
