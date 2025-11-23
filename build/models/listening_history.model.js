import mongoose from "mongoose";
const listeningHistorySchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    songId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Song",
        required: true,
    },
    duration: {
        type: Number,
        required: true,
    },
    completed: {
        type: Boolean,
        default: false,
    },
    listenedAt: {
        type: Date,
        default: Date.now,
    },
    deleted: {
        type: Boolean,
        default: false,
    },
}, { timestamps: true });
listeningHistorySchema.index({ userId: 1, listenedAt: -1 });
listeningHistorySchema.index({ songId: 1 });
const ListeningHistory = mongoose.model("ListeningHistory", listeningHistorySchema, "listening_history");
export default ListeningHistory;
