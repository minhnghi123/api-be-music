import express from "express";
const router = express.Router();
import * as favoriteSongController from "../../controllers/client/favoriteSong.controller.js";

// CRUD routes cho favorite songs
router.get("/", favoriteSongController.getAllFavoriteSongs);
router.get("/:id", favoriteSongController.getFavoriteSongById);
router.post("/:id", favoriteSongController.addFavoriteSong);
router.delete("/:id", favoriteSongController.removeFavoriteSong);
router.delete("/", favoriteSongController.removeAllFavoriteSongs);

// Legacy routes - giữ tương thích
router.patch("/favorite-song/:id", favoriteSongController.addFavoriteSong);

export default router;
