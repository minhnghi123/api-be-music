import mongoose from "mongoose";

const chatMessageSchema = new mongoose.Schema(
  {
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
      intent: { type: String }, // "playlist_request", "general_chat", "save_playlist"
      cached: { type: Boolean, default: false },
    },
    deleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Index để tối ưu truy vấn
chatMessageSchema.index({ userId: 1, sessionId: 1, createdAt: -1 });
chatMessageSchema.index({ sessionId: 1 });

const ChatMessage = mongoose.model(
  "ChatMessage",
  chatMessageSchema,
  "chat_messages"
);

export default ChatMessage;
