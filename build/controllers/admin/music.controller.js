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
import Topic from "../../models/topic.model.js";
export const index = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const songs = yield Song.find({
        deleted: false,
    });
    for (const song of songs) {
        const artist = yield Artist.findOne({
            _id: song.artist,
            deleted: false,
            status: "active",
        });
        song["artist"] = artist ? artist.fullName : "Không tìm thấy nghệ sĩ";
        let topicTitle = "Không có chủ đề";
        if (Array.isArray(song.topic) && song.topic.length > 0) {
            const topic = yield Topic.findOne({
                _id: song.topic[0],
            });
            if (topic)
                topicTitle = topic.title;
        }
        song["topicTitle"] = topicTitle;
    }
    res.json({
        success: true,
        songs,
    });
});
export const create = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const artists = yield Artist.find({
        deleted: false,
    });
    const topics = yield Topic.find({ deleted: false });
    res.json({
        success: true,
        artists,
        topics,
    });
});
export const createPost = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const { title, topicId, singerId, lyrics, description, status, avatar, audio, } = req.body;
        const songInfo = {
            title,
            artist: singerId,
            topic: topicId,
            fileUrl: (_a = audio === null || audio === void 0 ? void 0 : audio[0]) !== null && _a !== void 0 ? _a : "",
            coverImage: (_b = avatar === null || avatar === void 0 ? void 0 : avatar[0]) !== null && _b !== void 0 ? _b : "",
            lyrics,
            description,
            status,
        };
        const newSong = new Song(songInfo);
        yield newSong.save();
        res.json({ success: true, song: newSong });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
export const edit = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const artists = yield Artist.find({
        deleted: false,
    });
    const topics = yield Topic.find({ deleted: false });
    const song = yield Song.findOne({
        _id: id,
        deleted: false,
        status: "active",
    });
    res.json({
        success: true,
        song,
        topics,
        artists,
    });
});
export const editPatch = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield Song.updateOne({
            _id: req.params.id,
        }, req.body);
        res.json({ success: true });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
export const deletePatch = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield Song.updateOne({
            _id: req.params.id,
        }, {
            deleted: true,
        });
        res.json({ success: true });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
