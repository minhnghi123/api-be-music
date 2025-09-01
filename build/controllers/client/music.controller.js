var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import Song from "../../models/song.model.js";
import Artist from "../../models/artist.model.js";
import Playlist from "../../models/playlist.model.js";
import Topic from "../../models/topic.model.js";
import User from "../../models/user.model.js";
import { mapArtistIdToInfo } from "../../utils/client/mapArtistIdToInfo.util.js";
export const getAllSongs = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const songs = yield Song.find({ deleted: false, status: "active" });
        const formattedSongs = yield Promise.all(songs.map((song) => __awaiter(void 0, void 0, void 0, function* () {
            const artistInfo = yield mapArtistIdToInfo(song.artist);
            return Object.assign(Object.assign({}, song.toObject()), { artist: artistInfo });
        })));
        res.json({ success: true, data: formattedSongs });
    }
    catch (err) {
        res
            .status(500)
            .json({ success: false, message: "Server error", error: err });
    }
});
export const getSongById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const song = yield Song.findById(req.params.id);
        if (!song || song.deleted) {
            return res
                .status(404)
                .json({ success: false, message: "Song not found" });
        }
        const artistInfo = yield mapArtistIdToInfo(song.artist);
        res.json({
            success: true,
            data: Object.assign(Object.assign({}, song.toObject()), { artist: artistInfo }),
        });
    }
    catch (err) {
        res
            .status(500)
            .json({ success: false, message: "Server error", error: err });
    }
});
export const createSong = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const song = new Song(req.body);
        yield song.save();
        res.status(201).json({ success: true, data: song });
    }
    catch (err) {
        res
            .status(400)
            .json({ success: false, message: "Invalid data", error: err });
    }
});
export const updateSong = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const song = yield Song.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
        });
        if (!song || song.deleted) {
            return res
                .status(404)
                .json({ success: false, message: "Song not found" });
        }
        res.json({ success: true, data: song });
    }
    catch (err) {
        res
            .status(400)
            .json({ success: false, message: "Invalid data", error: err });
    }
});
export const deleteSong = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const song = yield Song.findByIdAndUpdate(req.params.id, { deleted: true }, { new: true });
        if (!song) {
            return res
                .status(404)
                .json({ success: false, message: "Song not found" });
        }
        res.json({ success: true, message: "Song deleted" });
    }
    catch (err) {
        res
            .status(500)
            .json({ success: false, message: "Server error", error: err });
    }
});
export const getAllArtists = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const artists = yield Artist.find({ deleted: false, status: "active" });
        res.json({ success: true, data: artists });
    }
    catch (err) {
        res
            .status(500)
            .json({ success: false, message: "Server error", error: err });
    }
});
export const getArtistById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const artist = yield Artist.findById(req.params.id);
        if (!artist || artist.deleted) {
            return res
                .status(404)
                .json({ success: false, message: "Artist not found" });
        }
        res.json({ success: true, data: artist });
    }
    catch (err) {
        res
            .status(500)
            .json({ success: false, message: "Server error", error: err });
    }
});
export const createArtist = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const artist = new Artist(req.body);
        yield artist.save();
        res.status(201).json({ success: true, data: artist });
    }
    catch (err) {
        res
            .status(400)
            .json({ success: false, message: "Invalid data", error: err });
    }
});
export const updateArtist = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const artist = yield Artist.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
        });
        if (!artist || artist.deleted) {
            return res
                .status(404)
                .json({ success: false, message: "Artist not found" });
        }
        res.json({ success: true, data: artist });
    }
    catch (err) {
        res
            .status(400)
            .json({ success: false, message: "Invalid data", error: err });
    }
});
export const deleteArtist = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const artist = yield Artist.findByIdAndUpdate(req.params.id, { deleted: true }, { new: true });
        if (!artist) {
            return res
                .status(404)
                .json({ success: false, message: "Artist not found" });
        }
        res.json({ success: true, message: "Artist deleted" });
    }
    catch (err) {
        res
            .status(500)
            .json({ success: false, message: "Server error", error: err });
    }
});
export const getAllPlaylists = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const playlists = yield Playlist.find({ deleted: false });
        res.json({ success: true, data: playlists });
    }
    catch (err) {
        res
            .status(500)
            .json({ success: false, message: "Server error", error: err });
    }
});
export const getPlaylistById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const playlist = yield Playlist.findById(req.params.id);
        if (!playlist || playlist.deleted) {
            return res
                .status(404)
                .json({ success: false, message: "Playlist not found" });
        }
        res.json({ success: true, data: playlist });
    }
    catch (err) {
        res
            .status(500)
            .json({ success: false, message: "Server error", error: err });
    }
});
export const createPlaylist = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const playlist = new Playlist(req.body);
        yield playlist.save();
        res.status(201).json({ success: true, data: playlist });
    }
    catch (err) {
        res
            .status(400)
            .json({ success: false, message: "Invalid data", error: err });
    }
});
export const updatePlaylist = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const playlist = yield Playlist.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
        });
        if (!playlist || playlist.deleted) {
            return res
                .status(404)
                .json({ success: false, message: "Playlist not found" });
        }
        res.json({ success: true, data: playlist });
    }
    catch (err) {
        res
            .status(400)
            .json({ success: false, message: "Invalid data", error: err });
    }
});
export const deletePlaylist = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const playlist = yield Playlist.findByIdAndUpdate(req.params.id, { deleted: true }, { new: true });
        if (!playlist) {
            return res
                .status(404)
                .json({ success: false, message: "Playlist not found" });
        }
        res.json({ success: true, message: "Playlist deleted" });
    }
    catch (err) {
        res
            .status(500)
            .json({ success: false, message: "Server error", error: err });
    }
});
export const getAllTopics = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const topics = yield Topic.find({ deleted: false });
        res.json({ success: true, data: topics });
    }
    catch (err) {
        res
            .status(500)
            .json({ success: false, message: "Server error", error: err });
    }
});
export const getTopicById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const topic = yield Topic.findById(req.params.id);
        if (!topic || topic.deleted) {
            return res
                .status(404)
                .json({ success: false, message: "Topic not found" });
        }
        res.json({ success: true, data: topic });
    }
    catch (err) {
        res
            .status(500)
            .json({ success: false, message: "Server error", error: err });
    }
});
export const createTopic = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const topic = new Topic(req.body);
        yield topic.save();
        res.status(201).json({ success: true, data: topic });
    }
    catch (err) {
        res
            .status(400)
            .json({ success: false, message: "Invalid data", error: err });
    }
});
export const updateTopic = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const topic = yield Topic.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
        });
        if (!topic || topic.deleted) {
            return res
                .status(404)
                .json({ success: false, message: "Topic not found" });
        }
        res.json({ success: true, data: topic });
    }
    catch (err) {
        res
            .status(400)
            .json({ success: false, message: "Invalid data", error: err });
    }
});
export const deleteTopic = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const topic = yield Topic.findByIdAndUpdate(req.params.id, { deleted: true }, { new: true });
        if (!topic) {
            return res
                .status(404)
                .json({ success: false, message: "Topic not found" });
        }
        res.json({ success: true, message: "Topic deleted" });
    }
    catch (err) {
        res
            .status(500)
            .json({ success: false, message: "Server error", error: err });
    }
});
export const getUserProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield User.findById(req.params.id).select("-password");
        if (!user || user.deleted) {
            return res
                .status(404)
                .json({ success: false, message: "User not found" });
        }
        res.json({ success: true, data: user });
    }
    catch (err) {
        res
            .status(500)
            .json({ success: false, message: "Server error", error: err });
    }
});
export const updateUserProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield User.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
        }).select("-password");
        if (!user || user.deleted) {
            return res
                .status(404)
                .json({ success: false, message: "User not found" });
        }
        res.json({ success: true, data: user });
    }
    catch (err) {
        res
            .status(400)
            .json({ success: false, message: "Invalid data", error: err });
    }
});
export const getAllUsers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const users = yield User.find({ deleted: false });
        res.json({ success: true, data: users });
    }
    catch (err) {
        res
            .status(500)
            .json({ success: false, message: "Server error", error: err });
    }
});
export const getUserById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield User.findById(req.params.id);
        if (!user || user.deleted) {
            return res
                .status(404)
                .json({ success: false, message: "User not found" });
        }
        res.json({ success: true, data: user });
    }
    catch (err) {
        res
            .status(500)
            .json({ success: false, message: "Server error", error: err });
    }
});
export const createUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = new User(req.body);
        yield user.save();
        res.status(201).json({ success: true, data: user });
    }
    catch (err) {
        res
            .status(400)
            .json({ success: false, message: "Invalid data", error: err });
    }
});
export const updateUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield User.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
        });
        if (!user || user.deleted) {
            return res
                .status(404)
                .json({ success: false, message: "User not found" });
        }
        res.json({ success: true, data: user });
    }
    catch (err) {
        res
            .status(400)
            .json({ success: false, message: "Invalid data", error: err });
    }
});
export const deleteUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield User.findByIdAndUpdate(req.params.id, { deleted: true }, { new: true });
        if (!user) {
            return res
                .status(404)
                .json({ success: false, message: "User not found" });
        }
        res.json({ success: true, message: "User deleted" });
    }
    catch (err) {
        res
            .status(500)
            .json({ success: false, message: "Server error", error: err });
    }
});
