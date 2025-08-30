import express from "express";
const router = express.Router();
import {
  getAllSongs,
  getSongById,
  createSong,
  updateSong,
  deleteSong,
  getAllArtists,
  getArtistById,
  createArtist,
  updateArtist,
  deleteArtist,
  getAllPlaylists,
  getPlaylistById,
  createPlaylist,
  updatePlaylist,
  deletePlaylist,
  getAllTopics,
  getTopicById,
  createTopic,
  updateTopic,
  deleteTopic,
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
} from "../../controllers/client/music.controller.js";

// router.get("/", music);

// Song CRUD
router.get("/songs", getAllSongs);
router.get("/songs/:id", getSongById);
router.post("/songs", createSong);
router.put("/songs/:id", updateSong);
router.delete("/songs/:id", deleteSong);

// Artist CRUD
router.get("/artists", getAllArtists);
router.get("/artists/:id", getArtistById);
router.post("/artists", createArtist);
router.put("/artists/:id", updateArtist);
router.delete("/artists/:id", deleteArtist);

// Playlist CRUD
router.get("/playlists", getAllPlaylists);
router.get("/playlists/:id", getPlaylistById);
router.post("/playlists", createPlaylist);
router.put("/playlists/:id", updatePlaylist);
router.delete("/playlists/:id", deletePlaylist);

// Topic CRUD
router.get("/topics", getAllTopics);
router.get("/topics/:id", getTopicById);
router.post("/topics", createTopic);
router.put("/topics/:id", updateTopic);
router.delete("/topics/:id", deleteTopic);

// User CRUD
router.get("/users", getAllUsers);
router.get("/users/:id", getUserById);
router.post("/users", createUser);
router.put("/users/:id", updateUser);
router.delete("/users/:id", deleteUser);

export default router;
