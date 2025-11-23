import mongoose from "mongoose";
const autoPlaylistSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        default: "",
    },
    type: {
        type: String,
        required: true,
        enum: [
            "rock",
            "chill",
            "lofi",
            "workout",
            "pop",
            "jazz",
            "classical",
            "edm",
            "acoustic",
            "mixed",
        ],
    },
    songs: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Song",
        },
    ],
    coverImage: {
        type: String,
        default: "",
    },
    score: {
        type: Number,
        default: 0,
    },
    generatedAt: {
        type: Date,
        default: Date.now,
    },
    deleted: {
        type: Boolean,
        default: false,
    },
}, { timestamps: true });
autoPlaylistSchema.index({ userId: 1, generatedAt: -1 });
autoPlaylistSchema.index({ type: 1 });
const AutoPlaylist = mongoose.model("AutoPlaylist", autoPlaylistSchema, "auto_playlists");
export default AutoPlaylist;
