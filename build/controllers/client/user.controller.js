var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import mongoose from "mongoose";
import Song from "../../models/song.model.js";
import Artist from "../../models/artist.model.js";
import User from "../../models/user.model.js";
import { getPlaylistOfUser } from "../../utils/client/getPlaylist.util.js";
import { getFavoriteSongOfUser } from "../../utils/client/getFavoriteSong.util.js";
import bcryptjs from "bcryptjs";
import { streamUpload } from "../../helpers/cloudinary.helper.js";
export const index = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId } = req.params;
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid user ID",
            });
        }
        const user = yield User.findOne({
            _id: userId,
            deleted: false,
            status: "active",
        }).select("username avatar playlist follow_songs follow_artists");
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }
        const [individualPlaylists, favoriteSongs, songs] = yield Promise.all([
            res.locals.user ? getPlaylistOfUser(userId) : null,
            getFavoriteSongOfUser(userId),
            Song.find({ deleted: false, status: "active" }),
        ]);
        const favoriteSongIds = favoriteSongs.map((item) => item.song_id.toString());
        const artists = yield Artist.find({
            _id: { $in: user.follow_artists },
            deleted: false,
            status: "active",
        }).select("fullName avatar");
        const artistMap = new Map();
        const songArtistIds = songs
            .map((song) => { var _a; return (_a = song.artist) === null || _a === void 0 ? void 0 : _a.toString(); })
            .filter(Boolean);
        const songArtists = yield Artist.find({
            _id: { $in: songArtistIds },
            deleted: false,
        }).select("fullName");
        songArtists.forEach((artist) => {
            artistMap.set(artist._id.toString(), artist.fullName);
        });
        const songsWithArtistName = songs.map((song) => {
            var _a;
            return (Object.assign(Object.assign({}, song.toObject()), { artist: artistMap.get(((_a = song.artist) === null || _a === void 0 ? void 0 : _a.toString()) || "") ||
                    "Không tìm thấy thông tin nghệ sĩ" }));
        });
        return res.json({
            success: true,
            data: {
                userInfo: user,
                songs: songsWithArtistName,
                artists,
                individualPlaylists,
                favoriteSongIds,
            },
            message: "User data fetched successfully",
        });
    }
    catch (error) {
        console.error("Error fetching user:", error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
        });
    }
});
export const getMe = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = res.locals.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!userId) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }
        const user = yield User.findOne({
            _id: userId,
            deleted: false,
            status: "active",
        }).select("username email avatar playlist follow_songs follow_artists");
        if (!user) {
            return res
                .status(404)
                .json({ success: false, message: "User not found" });
        }
        return res.json({ success: true, data: user });
    }
    catch (error) {
        return res
            .status(500)
            .json({ success: false, message: "Internal Server Error" });
    }
});
export const updateMe = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = res.locals.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!userId) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }
        const { username, email } = req.body;
        let avatar = req.body.avatar;
        if (req.file && req.file.buffer) {
            const result = yield streamUpload(req.file.buffer);
            if (result && typeof result === "object" && "url" in result) {
                avatar = result.url;
            }
        }
        const update = {};
        if (username)
            update.username = username;
        if (email)
            update.email = email;
        if (avatar)
            update.avatar = avatar;
        const user = yield User.findByIdAndUpdate(userId, update, {
            new: true,
        }).select("username email avatar playlist follow_songs follow_artists");
        if (!user) {
            return res
                .status(404)
                .json({ success: false, message: "User not found" });
        }
        return res.json({ success: true, data: user, message: "Profile updated" });
    }
    catch (error) {
        return res
            .status(500)
            .json({ success: false, message: "Internal Server Error" });
    }
});
export const changePassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = res.locals.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!userId) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }
        const { oldPassword, newPassword, reNewPassword } = req.body;
        if (!oldPassword || !newPassword || !reNewPassword) {
            return res
                .status(400)
                .json({ success: false, message: "Missing required fields" });
        }
        if (newPassword !== reNewPassword) {
            return res
                .status(400)
                .json({ success: false, message: "Passwords do not match" });
        }
        const user = yield User.findById(userId);
        if (!user || !user.password) {
            return res
                .status(404)
                .json({ success: false, message: "User not found" });
        }
        const isMatch = yield bcryptjs.compare(oldPassword, String(user.password));
        if (!isMatch) {
            return res
                .status(401)
                .json({ success: false, message: "Old password is incorrect" });
        }
        const salt = bcryptjs.genSaltSync(10);
        const hashedPassword = yield bcryptjs.hash(newPassword, salt);
        user.password = hashedPassword;
        yield user.save();
        return res.json({
            success: true,
            message: "Password changed successfully",
        });
    }
    catch (error) {
        return res
            .status(500)
            .json({ success: false, message: "Internal Server Error" });
    }
});
export const deleteMe = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = res.locals.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!userId) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }
        const user = yield User.findByIdAndUpdate(userId, { deleted: true }, { new: true });
        if (!user) {
            return res
                .status(404)
                .json({ success: false, message: "User not found" });
        }
        return res.json({ success: true, message: "Account deleted" });
    }
    catch (error) {
        return res
            .status(500)
            .json({ success: false, message: "Internal Server Error" });
    }
});
export const getMyPlaylists = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = res.locals.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!userId) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }
        const playlists = yield getPlaylistOfUser(userId);
        res.json({ success: true, data: playlists });
    }
    catch (error) {
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
});
