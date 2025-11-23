import express from "express";
const router = express.Router();
import { sendChatMessage, getChatHistory, saveSuggestedPlaylist, } from "../../controllers/client/chat.controller.js";
router.post("/message", sendChatMessage);
router.get("/history", getChatHistory);
router.post("/playlist/save", saveSuggestedPlaylist);
export default router;
