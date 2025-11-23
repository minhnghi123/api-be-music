var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import ChatMessage from "../../models/chat_message.model.js";
import ChatSession from "../../models/chat_session.model.js";
import Playlist from "../../models/playlist.model.js";
import { v4 as uuidv4 } from "uuid";
import { analyzeUserRequest, generateSmartPlaylist, generateSmartResponse, findCachedPlaylist, cachePlaylist, } from "../../services/aiChat.service.js";
import { mapArtistIdToInfo } from "../../utils/client/mapArtistIdToInfo.util.js";
export const sendChatMessage = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const userId = (_a = res.locals.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "User not authenticated",
                playlist: null,
            });
        }
        const { message } = req.body;
        if (!message || message.trim().length === 0) {
            return res.status(400).json({
                success: false,
                message: "Message is required",
                playlist: null,
            });
        }
        let session = yield ChatSession.findOne({
            userId,
            active: true,
            deleted: false,
        }).sort({ lastActivity: -1 });
        if (!session) {
            session = new ChatSession({
                userId,
                sessionId: uuidv4(),
                active: true,
                lastActivity: new Date(),
            });
            yield session.save();
        }
        const analysis = yield analyzeUserRequest(message);
        const { intent, mood } = analysis;
        const userMessage = new ChatMessage({
            userId,
            sessionId: session.sessionId,
            content: message,
            sender: "user",
            metadata: {
                mood,
                intent,
            },
        });
        yield userMessage.save();
        if (intent === "playlist_request" ||
            intent === "mixed_playlist" ||
            intent === "artist_search") {
            let cachedPlaylist = yield findCachedPlaylist(message, mood);
            let isCached = false;
            let playlistData;
            let playlistId;
            if (cachedPlaylist) {
                isCached = true;
                playlistData = {
                    songs: cachedPlaylist.songs,
                    title: cachedPlaylist.title,
                    description: cachedPlaylist.description,
                    coverImage: cachedPlaylist.coverImage,
                };
                playlistId = cachedPlaylist.playlistId;
            }
            else {
                playlistData = yield generateSmartPlaylist(analysis, userId);
                const newPlaylist = new Playlist({
                    title: playlistData.title,
                    description: playlistData.description,
                    songs: playlistData.songs.map((s) => s._id.toString()),
                    user_id: null,
                    coverImage: playlistData.coverImage,
                    createdBy: "ai_assistant",
                    status: "private",
                });
                yield newPlaylist.save();
                playlistId = newPlaylist._id;
                yield cachePlaylist(message, mood, playlistId.toString(), playlistData.songs.map((s) => s._id.toString()), playlistData.title, playlistData.description, playlistData.coverImage);
            }
            const formattedSongs = yield Promise.all(playlistData.songs.map((song) => __awaiter(void 0, void 0, void 0, function* () {
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
                return Object.assign(Object.assign({}, (song.toObject ? song.toObject() : song)), { artist: artistInfo });
            })));
            const botResponseText = yield generateSmartResponse(analysis, playlistData.title, formattedSongs.length);
            const botMessage = new ChatMessage({
                userId,
                sessionId: session.sessionId,
                content: botResponseText,
                sender: "bot",
                playlistId: playlistId,
                songs: playlistData.songs.map((s) => s._id),
                metadata: {
                    mood,
                    intent,
                    cached: isCached,
                },
            });
            yield botMessage.save();
            session.context = {
                lastMood: mood,
                lastPlaylistId: playlistId,
                conversationCount: (((_b = session.context) === null || _b === void 0 ? void 0 : _b.conversationCount) || 0) + 1,
            };
            session.lastActivity = new Date();
            yield session.save();
            return res.json({
                success: true,
                message: botResponseText,
                playlist: {
                    id: playlistId.toString(),
                    title: playlistData.title,
                    description: playlistData.description,
                    mood: mood,
                    songs: formattedSongs,
                    coverImage: playlistData.coverImage,
                },
                cached: isCached,
            });
        }
        else {
            const botResponseText = yield generateSmartResponse({ mood: "neutral" }, "General Chat", 0);
            const botMessage = new ChatMessage({
                userId,
                sessionId: session.sessionId,
                content: botResponseText,
                sender: "bot",
                metadata: {
                    mood: "neutral",
                    intent: "general_chat",
                },
            });
            yield botMessage.save();
            return res.json({
                success: true,
                message: botResponseText,
                playlist: null,
                cached: false,
            });
        }
    }
    catch (error) {
        console.error("Error in sendChatMessage:", error);
        res.status(500).json({
            success: false,
            message: "Server error",
            playlist: null,
        });
    }
});
export const getChatHistory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = res.locals.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!userId) {
            return res.status(401).json({
                success: false,
                data: null,
            });
        }
        const session = yield ChatSession.findOne({
            userId,
            active: true,
            deleted: false,
        }).sort({ lastActivity: -1 });
        if (!session) {
            return res.json({
                success: true,
                data: [],
            });
        }
        const messages = yield ChatMessage.find({
            userId,
            sessionId: session.sessionId,
            deleted: false,
        })
            .sort({ createdAt: 1 })
            .limit(100);
        const formattedMessages = messages.map((msg) => {
            var _a, _b;
            return ({
                _id: msg._id.toString(),
                content: msg.content,
                sender: msg.sender,
                timestamp: new Date(msg.createdAt).getTime(),
                playlistId: ((_a = msg.playlistId) === null || _a === void 0 ? void 0 : _a.toString()) || null,
                songs: ((_b = msg.songs) === null || _b === void 0 ? void 0 : _b.map((s) => s.toString())) || null,
            });
        });
        res.json({
            success: true,
            data: formattedMessages,
        });
    }
    catch (error) {
        console.error("Error in getChatHistory:", error);
        res.status(500).json({
            success: false,
            data: null,
        });
    }
});
export const saveSuggestedPlaylist = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = res.locals.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "User not authenticated",
                playlistId: null,
            });
        }
        const { id, title, description, mood, songs, coverImage } = req.body;
        if (!id) {
            return res.status(400).json({
                success: false,
                message: "Playlist ID is required",
                playlistId: null,
            });
        }
        const playlist = yield Playlist.findById(id);
        if (!playlist) {
            return res.status(404).json({
                success: false,
                message: "Playlist not found",
                playlistId: null,
            });
        }
        playlist.user_id = userId;
        playlist.status = "private";
        playlist.title = title || playlist.title;
        playlist.description = description || playlist.description;
        yield playlist.save();
        const session = yield ChatSession.findOne({
            userId,
            active: true,
            deleted: false,
        }).sort({ lastActivity: -1 });
        if (session) {
            const saveMessage = new ChatMessage({
                userId,
                sessionId: session.sessionId,
                content: `Đã lưu playlist "${playlist.title}" vào thư viện của bạn! 🎉`,
                sender: "bot",
                playlistId: playlist._id,
                metadata: {
                    mood: mood || "neutral",
                    intent: "save_playlist",
                },
            });
            yield saveMessage.save();
        }
        res.json({
            success: true,
            message: "Playlist saved successfully",
            playlistId: playlist._id.toString(),
        });
    }
    catch (error) {
        console.error("Error in saveSuggestedPlaylist:", error);
        res.status(500).json({
            success: false,
            message: "Server error",
            playlistId: null,
        });
    }
});
