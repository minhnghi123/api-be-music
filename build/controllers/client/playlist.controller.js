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
export const index = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const playlist = yield Playlist.findOne({
        _id: req.params.id,
        deleted: false,
    });
    console.log(req.params.id);
    const songs = yield Song.find({ status: "active", deleted: false });
    const songsInPlaylist = yield Song.find({
        _id: {
            $in: playlist === null || playlist === void 0 ? void 0 : playlist.songs,
        },
    })
        .select("title fileUrl coverImage artist lyrics")
        .populate({
        path: "artist",
        match: { status: "active", deleted: false },
        model: Artist,
    });
    res.json({
        success: true,
        songsInPlaylist,
        playlist,
    });
});
export const createPlaylist = (req, res) => {
    try {
        if (res.locals.user) {
            req.body.user_id = res.locals.user.id;
            req.body.createdBy = res.locals.user.username;
            const record = new Playlist(req.body);
            record.save();
            res.json({
                code: "success",
                playlist: record,
            });
        }
        else {
            res.json({
                code: "unsuccess",
            });
        }
    }
    catch (error) {
        console.log(error);
    }
};
export const addPlaylist = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const songID = req.body.song;
        const playlist = yield Playlist.findOne({
            _id: req.body.playlist,
            deleted: false,
        });
        let songs = Array.isArray(playlist === null || playlist === void 0 ? void 0 : playlist.songs)
            ? playlist.songs.map((item) => item.toString())
            : [];
        const exists = songs.includes(songID);
        console.log(songID, songs, exists);
        if (exists) {
            return res.json({
                success: false,
                message: "Bài hát đã có trong playlist",
            });
        }
        else {
            songs.push(songID);
            if (playlist) {
                playlist.songs = songs;
                yield Playlist.updateOne({
                    _id: req.body.playlist,
                    deleted: false,
                }, { $set: { songs } });
            }
            return res.json({
                success: true,
                message: "Đã thêm bài hát vào playlist",
                songs,
            });
        }
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ success: false, error: "Internal server error" });
    }
});
export const savePlaylist = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield Playlist.updateOne({
            _id: req.params.id,
            deleted: false,
        }, req.body);
        res.redirect("back");
    }
    catch (error) {
        console.log(error);
    }
});
