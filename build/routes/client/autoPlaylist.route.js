import express from "express";
const router = express.Router();
import { recordListeningHistory, getAutoPlaylists, generateAutoPlaylists, } from "../../controllers/client/autoPlaylist.controller.js";
router.post("/listening-history", recordListeningHistory);
router.get("/auto-playlists", getAutoPlaylists);
router.post("/auto-playlists/generate", generateAutoPlaylists);
export default router;
