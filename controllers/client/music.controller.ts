import { Request, Response } from "express";
import Song from "../../models/song.model.js";
import Artist from "../../models/artist.model.js";
import Playlist from "../../models/playlist.model.js";
import Topic from "../../models/topic.model.js";
import User from "../../models/user.model.js";

// Get all songs
export const getAllSongs = async (req: Request, res: Response) => {
  try {
    const songs = await Song.find({ deleted: false, status: "active" });
    res.json({ success: true, data: songs });
  } catch (err) {
    res
      .status(500)
      .json({ success: false, message: "Server error", error: err });
  }
};

// Get song by ID
export const getSongById = async (req: Request, res: Response) => {
  try {
    const song = await Song.findById(req.params.id);
    if (!song || song.deleted) {
      return res
        .status(404)
        .json({ success: false, message: "Song not found" });
    }
    res.json({ success: true, data: song });
  } catch (err) {
    res
      .status(500)
      .json({ success: false, message: "Server error", error: err });
  }
};

// Create song
export const createSong = async (req: Request, res: Response) => {
  try {
    const song = new Song(req.body);
    await song.save();
    res.status(201).json({ success: true, data: song });
  } catch (err) {
    res
      .status(400)
      .json({ success: false, message: "Invalid data", error: err });
  }
};

// Update song
export const updateSong = async (req: Request, res: Response) => {
  try {
    const song = await Song.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!song || song.deleted) {
      return res
        .status(404)
        .json({ success: false, message: "Song not found" });
    }
    res.json({ success: true, data: song });
  } catch (err) {
    res
      .status(400)
      .json({ success: false, message: "Invalid data", error: err });
  }
};

// Delete song (soft delete)
export const deleteSong = async (req: Request, res: Response) => {
  try {
    const song = await Song.findByIdAndUpdate(
      req.params.id,
      { deleted: true },
      { new: true }
    );
    if (!song) {
      return res
        .status(404)
        .json({ success: false, message: "Song not found" });
    }
    res.json({ success: true, message: "Song deleted" });
  } catch (err) {
    res
      .status(500)
      .json({ success: false, message: "Server error", error: err });
  }
};

// Get all artists
export const getAllArtists = async (req: Request, res: Response) => {
  try {
    const artists = await Artist.find({ deleted: false, status: "active" });
    res.json({ success: true, data: artists });
  } catch (err) {
    res
      .status(500)
      .json({ success: false, message: "Server error", error: err });
  }
};

// Get artist by ID
export const getArtistById = async (req: Request, res: Response) => {
  try {
    const artist = await Artist.findById(req.params.id);
    if (!artist || artist.deleted) {
      return res
        .status(404)
        .json({ success: false, message: "Artist not found" });
    }
    res.json({ success: true, data: artist });
  } catch (err) {
    res
      .status(500)
      .json({ success: false, message: "Server error", error: err });
  }
};

// Create artist
export const createArtist = async (req: Request, res: Response) => {
  try {
    const artist = new Artist(req.body);
    await artist.save();
    res.status(201).json({ success: true, data: artist });
  } catch (err) {
    res
      .status(400)
      .json({ success: false, message: "Invalid data", error: err });
  }
};

// Update artist
export const updateArtist = async (req: Request, res: Response) => {
  try {
    const artist = await Artist.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!artist || artist.deleted) {
      return res
        .status(404)
        .json({ success: false, message: "Artist not found" });
    }
    res.json({ success: true, data: artist });
  } catch (err) {
    res
      .status(400)
      .json({ success: false, message: "Invalid data", error: err });
  }
};

// Delete artist (soft delete)
export const deleteArtist = async (req: Request, res: Response) => {
  try {
    const artist = await Artist.findByIdAndUpdate(
      req.params.id,
      { deleted: true },
      { new: true }
    );
    if (!artist) {
      return res
        .status(404)
        .json({ success: false, message: "Artist not found" });
    }
    res.json({ success: true, message: "Artist deleted" });
  } catch (err) {
    res
      .status(500)
      .json({ success: false, message: "Server error", error: err });
  }
};

// Get all playlists
export const getAllPlaylists = async (req: Request, res: Response) => {
  try {
    const playlists = await Playlist.find({ deleted: false });
    res.json({ success: true, data: playlists });
  } catch (err) {
    res
      .status(500)
      .json({ success: false, message: "Server error", error: err });
  }
};

// Get playlist by ID
export const getPlaylistById = async (req: Request, res: Response) => {
  try {
    const playlist = await Playlist.findById(req.params.id);
    if (!playlist || playlist.deleted) {
      return res
        .status(404)
        .json({ success: false, message: "Playlist not found" });
    }
    res.json({ success: true, data: playlist });
  } catch (err) {
    res
      .status(500)
      .json({ success: false, message: "Server error", error: err });
  }
};

// Create playlist
export const createPlaylist = async (req: Request, res: Response) => {
  try {
    const playlist = new Playlist(req.body);
    await playlist.save();
    res.status(201).json({ success: true, data: playlist });
  } catch (err) {
    res
      .status(400)
      .json({ success: false, message: "Invalid data", error: err });
  }
};

// Update playlist
export const updatePlaylist = async (req: Request, res: Response) => {
  try {
    const playlist = await Playlist.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!playlist || playlist.deleted) {
      return res
        .status(404)
        .json({ success: false, message: "Playlist not found" });
    }
    res.json({ success: true, data: playlist });
  } catch (err) {
    res
      .status(400)
      .json({ success: false, message: "Invalid data", error: err });
  }
};

// Delete playlist (soft delete)
export const deletePlaylist = async (req: Request, res: Response) => {
  try {
    const playlist = await Playlist.findByIdAndUpdate(
      req.params.id,
      { deleted: true },
      { new: true }
    );
    if (!playlist) {
      return res
        .status(404)
        .json({ success: false, message: "Playlist not found" });
    }
    res.json({ success: true, message: "Playlist deleted" });
  } catch (err) {
    res
      .status(500)
      .json({ success: false, message: "Server error", error: err });
  }
};

// Get all topics
export const getAllTopics = async (req: Request, res: Response) => {
  try {
    const topics = await Topic.find({ deleted: false });
    res.json({ success: true, data: topics });
  } catch (err) {
    res
      .status(500)
      .json({ success: false, message: "Server error", error: err });
  }
};

// Get topic by ID
export const getTopicById = async (req: Request, res: Response) => {
  try {
    const topic = await Topic.findById(req.params.id);
    if (!topic || topic.deleted) {
      return res
        .status(404)
        .json({ success: false, message: "Topic not found" });
    }
    res.json({ success: true, data: topic });
  } catch (err) {
    res
      .status(500)
      .json({ success: false, message: "Server error", error: err });
  }
};

// Create topic
export const createTopic = async (req: Request, res: Response) => {
  try {
    const topic = new Topic(req.body);
    await topic.save();
    res.status(201).json({ success: true, data: topic });
  } catch (err) {
    res
      .status(400)
      .json({ success: false, message: "Invalid data", error: err });
  }
};

// Update topic
export const updateTopic = async (req: Request, res: Response) => {
  try {
    const topic = await Topic.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!topic || topic.deleted) {
      return res
        .status(404)
        .json({ success: false, message: "Topic not found" });
    }
    res.json({ success: true, data: topic });
  } catch (err) {
    res
      .status(400)
      .json({ success: false, message: "Invalid data", error: err });
  }
};

// Delete topic (soft delete)
export const deleteTopic = async (req: Request, res: Response) => {
  try {
    const topic = await Topic.findByIdAndUpdate(
      req.params.id,
      { deleted: true },
      { new: true }
    );
    if (!topic) {
      return res
        .status(404)
        .json({ success: false, message: "Topic not found" });
    }
    res.json({ success: true, message: "Topic deleted" });
  } catch (err) {
    res
      .status(500)
      .json({ success: false, message: "Server error", error: err });
  }
};

// Get user profile
export const getUserProfile = async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user || user.deleted) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
    res.json({ success: true, data: user });
  } catch (err) {
    res
      .status(500)
      .json({ success: false, message: "Server error", error: err });
  }
};

// Update user profile
export const updateUserProfile = async (req: Request, res: Response) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    }).select("-password");
    if (!user || user.deleted) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
    res.json({ success: true, data: user });
  } catch (err) {
    res
      .status(400)
      .json({ success: false, message: "Invalid data", error: err });
  }
};

// Get all users
export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await User.find({ deleted: false });
    res.json({ success: true, data: users });
  } catch (err) {
    res
      .status(500)
      .json({ success: false, message: "Server error", error: err });
  }
};

// Get user by ID
export const getUserById = async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user || user.deleted) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
    res.json({ success: true, data: user });
  } catch (err) {
    res
      .status(500)
      .json({ success: false, message: "Server error", error: err });
  }
};

// Create user
export const createUser = async (req: Request, res: Response) => {
  try {
    const user = new User(req.body);
    await user.save();
    res.status(201).json({ success: true, data: user });
  } catch (err) {
    res
      .status(400)
      .json({ success: false, message: "Invalid data", error: err });
  }
};

// Update user
export const updateUser = async (req: Request, res: Response) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!user || user.deleted) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
    res.json({ success: true, data: user });
  } catch (err) {
    res
      .status(400)
      .json({ success: false, message: "Invalid data", error: err });
  }
};

// Delete user (soft delete)
export const deleteUser = async (req: Request, res: Response) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { deleted: true },
      { new: true }
    );
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
    res.json({ success: true, message: "User deleted" });
  } catch (err) {
    res
      .status(500)
      .json({ success: false, message: "Server error", error: err });
  }
};
