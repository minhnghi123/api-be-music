var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import ListeningHistory from "../../models/listening_history.model.js";
import AutoPlaylist from "../../models/auto_playlist.model.js";
import Song from "../../models/song.model.js";
import { mapArtistIdToInfo } from "../../utils/client/mapArtistIdToInfo.util.js";
export const recordListeningHistory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = res.locals.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "User not authenticated",
            });
        }
        const { songId, duration, completed } = req.body;
        if (!songId || duration === undefined) {
            return res.status(400).json({
                success: false,
                message: "songId and duration are required",
            });
        }
        const song = yield Song.findById(songId);
        if (!song) {
            return res.status(404).json({
                success: false,
                message: "Song not found",
            });
        }
        const listeningHistory = new ListeningHistory({
            userId,
            songId,
            duration,
            completed: completed || false,
        });
        yield listeningHistory.save();
        res.json({
            success: true,
            message: "Listening history recorded successfully",
        });
    }
    catch (error) {
        console.error("Error recording listening history:", error);
        res.status(500).json({
            success: false,
            message: "Server error",
            error: error,
        });
    }
});
export const getAutoPlaylists = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = res.locals.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "User not authenticated",
            });
        }
        const autoPlaylists = yield AutoPlaylist.find({
            userId,
            deleted: false,
        })
            .populate("songs")
            .sort({ generatedAt: -1 });
        const formattedPlaylists = yield Promise.all(autoPlaylists.map((playlist) => __awaiter(void 0, void 0, void 0, function* () {
            const formattedSongs = yield Promise.all(playlist.songs.map((song) => __awaiter(void 0, void 0, void 0, function* () {
                let artistInfo;
                if (Array.isArray(song.artist)) {
                    const artistInfos = yield Promise.all(song.artist.map((artistId) => mapArtistIdToInfo(artistId)));
                    artistInfo = artistInfos.filter(Boolean);
                }
                else if (song.artist) {
                    artistInfo = yield mapArtistIdToInfo(song.artist);
                }
                else {
                    artistInfo = "Unknown Artist";
                }
                return Object.assign(Object.assign({}, song.toObject()), { artist: artistInfo });
            })));
            return {
                _id: playlist._id,
                title: playlist.title,
                description: playlist.description,
                type: playlist.type,
                songs: formattedSongs,
                coverImage: playlist.coverImage,
                generatedAt: playlist.generatedAt,
                score: playlist.score,
            };
        })));
        res.json({
            success: true,
            data: formattedPlaylists,
            message: null,
        });
    }
    catch (error) {
        console.error("Error getting auto playlists:", error);
        res.status(500).json({
            success: false,
            data: [],
            message: "Server error",
        });
    }
});
export const generateAutoPlaylists = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const userId = (_a = res.locals.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "User not authenticated",
            });
        }
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const listeningHistory = yield ListeningHistory.find({
            userId,
            listenedAt: { $gte: thirtyDaysAgo },
            deleted: false,
        }).populate("songId");
        if (listeningHistory.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Not enough listening history to generate playlists",
            });
        }
        const songFrequency = {};
        const completedSongs = new Set();
        listeningHistory.forEach((history) => {
            const songId = history.songId._id.toString();
            songFrequency[songId] = (songFrequency[songId] || 0) + 1;
            if (history.completed) {
                completedSongs.add(songId);
            }
        });
        const topSongIds = Object.entries(songFrequency)
            .filter(([songId]) => completedSongs.has(songId))
            .sort((a, b) => b[1] - a[1])
            .slice(0, 20)
            .map(([songId]) => songId);
        if (topSongIds.length < 5) {
            return res.status(400).json({
                success: false,
                message: "Not enough data to generate meaningful playlists",
            });
        }
        const topSongs = yield Song.find({ _id: { $in: topSongIds } });
        const playlistTypes = ["chill", "workout", "mixed"];
        const newPlaylists = [];
        for (const type of playlistTypes) {
            let playlistSongs;
            let title;
            let description;
            let score = Math.floor(Math.random() * 20) + 80;
            if (type === "mixed") {
                playlistSongs = topSongs.slice(0, Math.min(15, topSongs.length));
                title = "Your Mix";
                description = "A personalized mix based on your listening habits";
            }
            else {
                playlistSongs = topSongs.slice(0, Math.min(10, topSongs.length));
                title = type === "chill" ? "Chill Vibes" : "Workout Energy";
                description =
                    type === "chill"
                        ? "Relaxing songs for your chill time"
                        : "Energetic songs to boost your workout";
            }
            yield AutoPlaylist.deleteMany({ userId, type });
            const autoPlaylist = new AutoPlaylist({
                userId,
                title,
                description,
                type,
                songs: playlistSongs.map((song) => song._id),
                coverImage: ((_b = playlistSongs[0]) === null || _b === void 0 ? void 0 : _b.coverImage) || "",
                score,
                generatedAt: new Date(),
            });
            yield autoPlaylist.save();
            newPlaylists.push(autoPlaylist);
        }
        res.json({
            success: true,
            message: `Successfully generated ${newPlaylists.length} auto playlists`,
        });
    }
    catch (error) {
        console.error("Error generating auto playlists:", error);
        res.status(500).json({
            success: false,
            message: "Server error",
            error: error,
        });
    }
});
