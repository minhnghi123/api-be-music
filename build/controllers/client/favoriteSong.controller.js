var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import FavoriteSong from "../../models/favorite_song.model.js";
import Song from "../../models/song.model.js";
import { mapArtistIdToInfo } from "../../utils/client/mapArtistIdToInfo.util.js";
export const getAllFavoriteSongs = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = res.locals.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!userId) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }
        const favoriteSongs = yield FavoriteSong.find({
            user_id: userId,
            deleted: false,
        }).select("song_id");
        const songIds = favoriteSongs.map((item) => item.song_id);
        let songs = yield Song.find({
            _id: { $in: songIds },
            deleted: false,
            status: "active",
        });
        const songsWithArtist = yield Promise.all(songs.map((song) => __awaiter(void 0, void 0, void 0, function* () {
            const songObj = song.toObject();
            const artistInfo = yield mapArtistIdToInfo(song.artist);
            songObj.artist = artistInfo || "Unknown Artist";
            return songObj;
        })));
        const favoriteSongIds = favoriteSongs.map((item) => item.song_id.toString());
        return res.json({
            success: true,
            data: {
                songs: songsWithArtist,
                favoriteSongIds,
                total: songsWithArtist.length,
            },
        });
    }
    catch (error) {
        console.error(error);
        return res
            .status(500)
            .json({ success: false, message: "Internal Server Error" });
    }
});
export const index = getAllFavoriteSongs;
export const getFavoriteSongById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = res.locals.user) === null || _a === void 0 ? void 0 : _a.id;
        const songId = req.params.id;
        if (!userId) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }
        const favoriteSong = yield FavoriteSong.findOne({
            user_id: userId,
            song_id: songId,
            deleted: false,
        });
        if (!favoriteSong) {
            return res
                .status(404)
                .json({ success: false, message: "Favorite song not found" });
        }
        const song = yield Song.findOne({
            _id: songId,
            deleted: false,
            status: "active",
        });
        if (!song) {
            return res
                .status(404)
                .json({ success: false, message: "Song not found" });
        }
        const songObj = song.toObject();
        const artistInfo = yield mapArtistIdToInfo(song.artist);
        songObj.artist = artistInfo || "Unknown Artist";
        return res.json({ success: true, data: songObj });
    }
    catch (error) {
        console.error(error);
        return res
            .status(500)
            .json({ success: false, message: "Internal Server Error" });
    }
});
export const addFavoriteSong = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const songId = req.params.id;
        const userId = (_a = res.locals.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!userId) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }
        const song = yield Song.findOne({
            _id: songId,
            deleted: false,
            status: "active",
        });
        if (!song) {
            return res
                .status(404)
                .json({ success: false, message: "Song not found" });
        }
        const existingFavorite = yield FavoriteSong.findOne({
            user_id: userId,
            song_id: songId,
        });
        if (existingFavorite) {
            if (existingFavorite.deleted) {
                yield FavoriteSong.updateOne({ _id: existingFavorite._id }, { deleted: false, removed_at: null });
                return res.json({
                    success: true,
                    message: "Added to favorites",
                    action: "added",
                });
            }
            else {
                yield FavoriteSong.updateOne({ _id: existingFavorite._id }, { deleted: true, removed_at: new Date() });
                return res.json({
                    success: true,
                    message: "Removed from favorites",
                    action: "removed",
                });
            }
        }
        else {
            const newFavorite = new FavoriteSong({
                user_id: userId,
                song_id: songId,
            });
            yield newFavorite.save();
            return res.json({
                success: true,
                message: "Added to favorites",
                action: "added",
            });
        }
    }
    catch (error) {
        console.error(error);
        return res
            .status(500)
            .json({ success: false, message: "Internal Server Error" });
    }
});
export const removeFavoriteSong = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const songId = req.params.id;
        const userId = (_a = res.locals.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!userId) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }
        const favoriteSong = yield FavoriteSong.findOne({
            user_id: userId,
            song_id: songId,
            deleted: false,
        });
        if (!favoriteSong) {
            return res
                .status(404)
                .json({ success: false, message: "Favorite song not found" });
        }
        yield FavoriteSong.updateOne({ _id: favoriteSong._id }, { deleted: true, removed_at: new Date() });
        return res.json({ success: true, message: "Removed from favorites" });
    }
    catch (error) {
        console.error(error);
        return res
            .status(500)
            .json({ success: false, message: "Internal Server Error" });
    }
});
export const removeAllFavoriteSongs = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = res.locals.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!userId) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }
        yield FavoriteSong.updateMany({ user_id: userId, deleted: false }, { deleted: true, removed_at: new Date() });
        return res.json({ success: true, message: "All favorite songs removed" });
    }
    catch (error) {
        console.error(error);
        return res
            .status(500)
            .json({ success: false, message: "Internal Server Error" });
    }
});
