import mongoose from "mongoose";

const listeningHistorySchema = new mongoose.Schema(
  {
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
      type: Number, // milliseconds listened
      required: true,
    },
    completed: {
      type: Boolean, // listened to end?
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
  },
  { timestamps: true }
);

// Index để tối ưu truy vấn
listeningHistorySchema.index({ userId: 1, listenedAt: -1 });
listeningHistorySchema.index({ songId: 1 });

const ListeningHistory = mongoose.model(
  "ListeningHistory",
  listeningHistorySchema,
  "listening_history"
);

export default ListeningHistory;
