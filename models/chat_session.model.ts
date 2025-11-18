import mongoose from "mongoose";

const chatSessionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    sessionId: {
      type: String,
      required: true,
      unique: true,
    },
    active: {
      type: Boolean,
      default: true,
    },
    lastActivity: {
      type: Date,
      default: Date.now,
    },
    context: {
      lastMood: { type: String },
      lastPlaylistId: { type: mongoose.Schema.Types.ObjectId },
      conversationCount: { type: Number, default: 0 },
    },
    deleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Index để tối ưu truy vấn
chatSessionSchema.index({ userId: 1, active: 1 });
chatSessionSchema.index({ sessionId: 1 });

const ChatSession = mongoose.model(
  "ChatSession",
  chatSessionSchema,
  "chat_sessions"
);

export default ChatSession;
