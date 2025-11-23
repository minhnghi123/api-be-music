var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import Song from "../models/song.model.js";
import Artist from "../models/artist.model.js";
import Topic from "../models/topic.model.js";
import CachedPlaylist from "../models/cached_playlist.model.js";
const MOOD_DATABASE = {
    sad: {
        keywords: [
            "buồn",
            "sad",
            "melancholy",
            "depressed",
            "tâm trạng không tốt",
            "tâm trạng tệ",
            "cô đơn",
            "lonely",
            "chia tay",
            "nhớ",
            "thương",
            "khóc",
        ],
        topics: ["Ballad", "Acoustic", "R&B"],
        description: "Những bài hát buồn, tâm trạng",
    },
    happy: {
        keywords: [
            "vui",
            "happy",
            "cheerful",
            "tâm trạng tốt",
            "phấn khởi",
            "vui vẻ",
            "hạnh phúc",
            "excited",
            "upbeat",
            "sảng khoái",
        ],
        topics: ["Pop", "Dance", "EDM"],
        description: "Những bài hát vui tươi, sôi động",
    },
    chill: {
        keywords: [
            "thư giãn",
            "chill",
            "relax",
            "nghỉ ngơi",
            "lofi",
            "lo-fi",
            "nhẹ nhàng",
            "yên bình",
            "peaceful",
            "calm",
        ],
        topics: ["Lofi", "Jazz", "Acoustic", "Chill"],
        description: "Những bài hát thư giãn, nhẹ nhàng",
    },
    energetic: {
        keywords: [
            "năng lượng",
            "energetic",
            "workout",
            "tập luyện",
            "gym",
            "chạy bộ",
            "running",
            "mạnh mẽ",
            "powerful",
            "rock",
        ],
        topics: ["Rock", "EDM", "Hip Hop", "Dance"],
        description: "Những bài hát đầy năng lượng, mạnh mẽ",
    },
    romantic: {
        keywords: [
            "lãng mạn",
            "romantic",
            "tình yêu",
            "love",
            "yêu",
            "người yêu",
            "date",
            "hẹn hò",
            "ngọt ngào",
            "sweet",
        ],
        topics: ["Ballad", "Pop", "R&B", "Acoustic"],
        description: "Những bài hát lãng mạn, tình cảm",
    },
    sleep: {
        keywords: [
            "ngủ",
            "sleep",
            "buồn ngủ",
            "đi ngủ",
            "sleepy",
            "bedtime",
            "lullaby",
            "ru ngủ",
            "night",
        ],
        topics: ["Lofi", "Classical", "Acoustic", "Ambient"],
        description: "Những bài hát dễ ngủ, nhẹ nhàng",
    },
    study: {
        keywords: [
            "học",
            "study",
            "học bài",
            "làm việc",
            "work",
            "tập trung",
            "focus",
            "concentration",
            "đọc sách",
        ],
        topics: ["Lofi", "Classical", "Instrumental", "Jazz"],
        description: "Những bài hát phù hợp cho học tập, làm việc",
    },
};
export function normalizeText(text) {
    return text
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .trim();
}
export function analyzeMood(message) {
    const normalizedMessage = normalizeText(message);
    let bestMood = "chill";
    let maxScore = 0;
    for (const [mood, data] of Object.entries(MOOD_DATABASE)) {
        let score = 0;
        for (const keyword of data.keywords) {
            const normalizedKeyword = normalizeText(keyword);
            if (normalizedMessage.includes(normalizedKeyword)) {
                score += 10;
            }
        }
        if (score > maxScore) {
            maxScore = score;
            bestMood = mood;
        }
    }
    const confidence = maxScore > 0 ? Math.min(maxScore / 10, 1) : 0.3;
    return { mood: bestMood, confidence };
}
export function generateResponseMessage(mood, playlistTitle) {
    const responses = {
        sad: [
            `Mình hiểu bạn đang buồn 😔. Mình đã tạo playlist "${playlistTitle}" với những bài hát có thể giúp bạn cảm thấy tốt hơn.`,
            `Đừng buồn quá nhé! Hãy thử nghe playlist "${playlistTitle}" này, hy vọng nó sẽ làm bạn cảm thấy thoải mái hơn. 🎵`,
        ],
        happy: [
            `Tuyệt vời! Mình cảm nhận được năng lượng tích cực của bạn 😊. Đây là playlist "${playlistTitle}" để thêm phần vui vẻ!`,
            `Vui quá! Playlist "${playlistTitle}" này sẽ làm tâm trạng bạn càng thêm phấn khởi! 🎉`,
        ],
        chill: [
            `Thư giãn thôi! Playlist "${playlistTitle}" này hoàn hảo để chill 😌`,
            `Mình có một playlist "${playlistTitle}" nhẹ nhàng phù hợp với bạn đây!`,
        ],
        energetic: [
            `Đầy năng lượng đây! Playlist "${playlistTitle}" sẽ giúp bạn cháy hết mình! 💪🔥`,
            `Tuyệt! Playlist "${playlistTitle}" này sẽ boost thêm năng lượng cho bạn!`,
        ],
        romantic: [
            `Lãng mạn quá! Playlist "${playlistTitle}" này hoàn hảo cho những khoảnh khắc ngọt ngào 💕`,
            `Mình có playlist "${playlistTitle}" đặc biệt dành cho tình yêu của bạn đây!`,
        ],
        sleep: [
            `Đã muộn rồi! Playlist "${playlistTitle}" này sẽ giúp bạn ngủ ngon giấc 😴`,
            `Chúc ngủ ngon! Hãy thử playlist "${playlistTitle}" nhẹ nhàng này nhé!`,
        ],
        study: [
            `Tập trung học bài nào! Playlist "${playlistTitle}" này sẽ giúp bạn focus tốt hơn 📚`,
            `Mình có playlist "${playlistTitle}" hoàn hảo cho việc học tập đây!`,
        ],
    };
    const moodResponses = responses[mood] || responses["chill"];
    return moodResponses[Math.floor(Math.random() * moodResponses.length)];
}
export function findCachedPlaylist(message, mood) {
    return __awaiter(this, void 0, void 0, function* () {
        const normalizedQuery = normalizeText(message);
        const cached = yield CachedPlaylist.findOne({
            $or: [
                { normalizedQuery: normalizedQuery },
                { mood: mood, hitCount: { $gt: 5 } },
            ],
            deleted: false,
        })
            .populate("songs")
            .populate("playlistId")
            .sort({ hitCount: -1, lastUsed: -1 })
            .limit(1);
        if (cached) {
            cached.hitCount += 1;
            cached.lastUsed = new Date();
            yield cached.save();
            return cached;
        }
        return null;
    });
}
export function generatePlaylistByMood(mood_1, userId_1) {
    return __awaiter(this, arguments, void 0, function* (mood, userId, limit = 15) {
        var _a;
        const moodData = MOOD_DATABASE[mood] || MOOD_DATABASE["chill"];
        const topics = yield Topic.find({
            title: { $in: moodData.topics },
            deleted: false,
        });
        const topicIds = topics.map((t) => t._id.toString());
        let songs;
        if (topicIds.length > 0) {
            songs = yield Song.find({
                topic: { $in: topicIds },
                deleted: false,
                status: "active",
            })
                .limit(limit)
                .sort({ likes: -1 });
        }
        if (!songs || songs.length < 5) {
            songs = yield Song.aggregate([
                { $match: { deleted: false, status: "active" } },
                { $sample: { size: limit } },
            ]);
        }
        const titles = {
            sad: "Tâm Trạng Buồn",
            happy: "Vui Vẻ Sảng Khoái",
            chill: "Thư Giãn Chill",
            energetic: "Năng Lượng Tràn Đầy",
            romantic: "Lãng Mạn Yêu Thương",
            sleep: "Ngủ Ngon Giấc",
            study: "Tập Trung Học Tập",
        };
        const title = titles[mood] || "Playlist Của Bạn";
        const description = moodData.description;
        const coverImage = ((_a = songs[0]) === null || _a === void 0 ? void 0 : _a.coverImage) || "";
        return {
            songs,
            title,
            description,
            coverImage,
        };
    });
}
export function cachePlaylist(query, mood, playlistId, songs, title, description, coverImage) {
    return __awaiter(this, void 0, void 0, function* () {
        const normalizedQuery = normalizeText(query);
        const existing = yield CachedPlaylist.findOne({ normalizedQuery });
        if (existing) {
            existing.hitCount += 1;
            existing.lastUsed = new Date();
            yield existing.save();
            return existing;
        }
        const cached = new CachedPlaylist({
            query,
            normalizedQuery,
            mood,
            playlistId,
            songs,
            title,
            description,
            coverImage,
            hitCount: 1,
            lastUsed: new Date(),
        });
        yield cached.save();
        return cached;
    });
}
export function analyzeIntent(message) {
    const normalizedMessage = normalizeText(message);
    if (normalizedMessage.includes("luu") ||
        normalizedMessage.includes("save") ||
        normalizedMessage.includes("them vao") ||
        normalizedMessage.includes("giu lai")) {
        return "save_playlist";
    }
    if (normalizedMessage.includes("bai hat") ||
        normalizedMessage.includes("nhac") ||
        normalizedMessage.includes("playlist") ||
        normalizedMessage.includes("nghe") ||
        normalizedMessage.includes("phat")) {
        return "playlist_request";
    }
    return "general_chat";
}
export const analyzeUserRequest = (message) => __awaiter(void 0, void 0, void 0, function* () {
    const normalizedMessage = normalizeText(message);
    const artists = [];
    const artistKeywords = [
        "sơn tùng",
        "mtp",
        "đen vâu",
        "binz",
        "karik",
        "erik",
        "min",
        "amee",
        "hòa minzy",
        "bích phương",
        "noo phước thịnh",
        "đức phúc",
        "jack",
        "k-icm",
        "hoàng thùy linh",
    ];
    artistKeywords.forEach((keyword) => {
        if (normalizedMessage.includes(normalizeText(keyword))) {
            artists.push(keyword);
        }
    });
    const genres = [];
    const genreMap = {
        pop: "Pop",
        rock: "Rock",
        rap: "Rap",
        "hip hop": "Hip Hop",
        ballad: "Ballad",
        edm: "EDM",
        jazz: "Jazz",
        acoustic: "Acoustic",
        lofi: "Lofi",
        "lo-fi": "Lofi",
        vpop: "Vpop",
        indie: "Indie",
    };
    Object.keys(genreMap).forEach((keyword) => {
        if (normalizedMessage.includes(keyword)) {
            genres.push(genreMap[keyword]);
        }
    });
    let era = "all";
    if (normalizedMessage.includes("90") || normalizedMessage.includes("1990"))
        era = "90s";
    else if (normalizedMessage.includes("2000"))
        era = "2000s";
    else if (normalizedMessage.includes("2010"))
        era = "2010s";
    else if (normalizedMessage.includes("2020") ||
        normalizedMessage.includes("moi"))
        era = "2020s";
    let variety = "medium";
    if (normalizedMessage.includes("da dang") ||
        normalizedMessage.includes("mix") ||
        normalizedMessage.includes("nhieu the loai")) {
        variety = "high";
    }
    else if (normalizedMessage.includes("mot the loai") ||
        normalizedMessage.includes("thuan") ||
        normalizedMessage.includes("chuyen")) {
        variety = "low";
    }
    let playlistSize = 15;
    const sizeMatch = normalizedMessage.match(/(\d+)\s*(bai|song)/);
    if (sizeMatch) {
        playlistSize = Math.min(30, Math.max(10, parseInt(sizeMatch[1])));
    }
    const { mood } = analyzeMood(message);
    let intent = "playlist_request";
    if (artists.length > 0)
        intent = "artist_search";
    if (genres.length > 2)
        intent = "mixed_playlist";
    if (normalizedMessage.includes("xin chao") ||
        normalizedMessage.includes("hello") ||
        normalizedMessage.includes("hi")) {
        intent = "general_chat";
    }
    const keywords = [];
    [
        "tinh yeu",
        "buon",
        "vui",
        "nho",
        "thuong",
        "chia tay",
        "happy",
        "sad",
        "love",
    ].forEach((kw) => {
        if (normalizedMessage.includes(normalizeText(kw))) {
            keywords.push(kw);
        }
    });
    return {
        intent,
        mood,
        genres,
        artists,
        keywords,
        era,
        playlistSize,
        variety,
    };
});
export const generateSmartPlaylist = (analysis, userId) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { mood, genres, artists, keywords, era, playlistSize, variety } = analysis;
    let query = { status: "active", deleted: false };
    if (artists && artists.length > 0) {
        const artistDocs = yield Artist.find({
            fullName: { $regex: artists.join("|"), $options: "i" },
            deleted: false,
        });
        if (artistDocs.length > 0) {
            query.artist = { $in: artistDocs.map((a) => a._id) };
        }
    }
    if (genres && genres.length > 0) {
        const topicDocs = yield Topic.find({
            title: { $regex: genres.join("|"), $options: "i" },
            deleted: false,
        });
        if (topicDocs.length > 0) {
            query.$or = [
                { topic: { $in: topicDocs.map((t) => t._id) } },
                { topic_id: { $in: topicDocs.map((t) => t._id) } },
            ];
        }
    }
    if (keywords && keywords.length > 0) {
        const keywordRegex = keywords.map((kw) => new RegExp(kw, "i"));
        if (!query.$or)
            query.$or = [];
        query.$or.push({ title: { $in: keywordRegex } });
    }
    if (era && era !== "all") {
        const yearMap = {
            "90s": [1990, 1999],
            "2000s": [2000, 2009],
            "2010s": [2010, 2019],
            "2020s": [2020, 2029],
        };
        if (yearMap[era]) {
            const [startYear, endYear] = yearMap[era];
            query.createdAt = {
                $gte: new Date(`${startYear}-01-01`),
                $lte: new Date(`${endYear}-12-31`),
            };
        }
    }
    let songs = yield Song.find(query)
        .populate("artist")
        .sort({ listen: -1 })
        .limit(playlistSize * 2);
    if (songs.length < Math.min(5, playlistSize)) {
        console.log("Not enough songs, getting random...");
        songs = yield Song.aggregate([
            { $match: { deleted: false, status: "active" } },
            { $sample: { size: playlistSize * 2 } },
        ]);
        yield Song.populate(songs, { path: "artist" });
    }
    const shuffled = songs.sort(() => Math.random() - 0.5);
    const finalSongs = shuffled.slice(0, playlistSize);
    const { title, description } = yield generatePlaylistMetadata(analysis, finalSongs);
    return {
        songs: finalSongs,
        title,
        description,
        coverImage: ((_a = finalSongs[0]) === null || _a === void 0 ? void 0 : _a.coverImage) || "",
    };
});
export const generatePlaylistMetadata = (analysis, songs) => __awaiter(void 0, void 0, void 0, function* () {
    const { mood, genres, artists } = analysis;
    let title = "";
    let description = "";
    if (artists.length > 0) {
        const artistName = artists[0].charAt(0).toUpperCase() + artists[0].slice(1);
        title = `${artistName} Collection`;
        description = `Tuyển tập nhạc hay của ${artists.join(", ")}`;
    }
    else if (genres.length > 0) {
        title = `${genres[0]} Vibes ${new Date().getFullYear()}`;
        description = `Playlist ${genres.join(", ")} đặc sắc dành cho bạn`;
    }
    else {
        const moodTitles = {
            happy: "Vui Vẻ Sảng Khoái",
            sad: "Tâm Trạng Buồn",
            chill: "Thư Giãn Chill",
            energetic: "Năng Lượng Tràn Đầy",
            romantic: "Lãng Mạn Yêu Thương",
            sleep: "Ngủ Ngon Giấc",
            study: "Tập Trung Học Tập",
        };
        title = moodTitles[mood] || "Playlist Của Bạn";
        description = `${songs.length} bài hát phù hợp với tâm trạng ${mood} của bạn`;
    }
    return { title, description };
});
export const generateSmartResponse = (analysis, playlistTitle, songCount) => __awaiter(void 0, void 0, void 0, function* () {
    if (songCount > 0) {
        const responses = [
            `🎵 Mình vừa tạo playlist "${playlistTitle}" với ${songCount} bài hát cho bạn đây!`,
            `✨ Đây là "${playlistTitle}" - ${songCount} bài hát đặc biệt dành cho bạn!`,
            `🎶 Playlist "${playlistTitle}" (${songCount} bài) đã sẵn sàng! Nghe thử nhé!`,
            `💖 Mình đã chuẩn bị "${playlistTitle}" với ${songCount} bài hát tuyệt vời!`,
        ];
        return responses[Math.floor(Math.random() * responses.length)];
    }
    else {
        const greetings = [
            "Xin chào! 👋 Bạn muốn nghe nhạc gì không? Hãy cho mình biết tâm trạng của bạn nhé!",
            "Hi bạn! 😊 Mình có thể giúp bạn tìm nhạc phù hợp đấy! Bạn đang cảm thấy thế nào?",
            "Chào bạn! 🎵 Nói cho mình biết bạn muốn nghe loại nhạc nào nhé!",
            "Hello! ✨ Mình là trợ lý âm nhạc của bạn! Bạn muốn playlist nào?",
        ];
        return greetings[Math.floor(Math.random() * greetings.length)];
    }
});
