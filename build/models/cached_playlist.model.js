import mongoose from "mongoose";
const cachedPlaylistSchema = new mongoose.Schema({
    query: {
        type: String,
        required: true,
        unique: true,
    },
    normalizedQuery: {
        type: String,
        required: true,
    },
    mood: {
        type: String,
        required: true,
    },
    playlistId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Playlist",
        required: true,
    },
    songs: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Song",
        },
    ],
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        default: "",
    },
    coverImage: {
        type: String,
        default: "",
    },
    hitCount: {
        type: Number,
        default: 1,
    },
    lastUsed: {
        type: Date,
        default: Date.now,
    },
    deleted: {
        type: Boolean,
        default: false,
    },
}, { timestamps: true });
cachedPlaylistSchema.index({ normalizedQuery: 1 });
cachedPlaylistSchema.index({ mood: 1 });
cachedPlaylistSchema.index({ lastUsed: -1 });
const CachedPlaylist = mongoose.model("CachedPlaylist", cachedPlaylistSchema, "cached_playlists");
export default CachedPlaylist;
