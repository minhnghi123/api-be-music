import mongoose from "mongoose";
const chatMessageSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    sessionId: {
        type: String,
        required: true,
    },
    content: {
        type: String,
        required: true,
    },
    sender: {
        type: String,
        enum: ["user", "bot"],
        required: true,
    },
    playlistId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Playlist",
        default: null,
    },
    songs: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Song",
        },
    ],
    metadata: {
        mood: { type: String },
        intent: { type: String },
        cached: { type: Boolean, default: false },
    },
    deleted: {
        type: Boolean,
        default: false,
    },
}, { timestamps: true });
chatMessageSchema.index({ userId: 1, sessionId: 1, createdAt: -1 });
chatMessageSchema.index({ sessionId: 1 });
const ChatMessage = mongoose.model("ChatMessage", chatMessageSchema, "chat_messages");
export default ChatMessage;
