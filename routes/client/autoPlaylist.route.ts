import express from "express";
const router = express.Router();
import {
  recordListeningHistory,
  getAutoPlaylists,
  generateAutoPlaylists,
} from "../../controllers/client/autoPlaylist.controller.js";

// Listening History
router.post("/listening-history", recordListeningHistory);

// Auto Playlists
router.get("/auto-playlists", getAutoPlaylists);
router.post("/auto-playlists/generate", generateAutoPlaylists);

export default router;
