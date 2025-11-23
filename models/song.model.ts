import mongoose from "mongoose";

const songSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    artist: { type: [String], required: true }, // Đổi thành array để hỗ trợ nhiều ca sĩ
    album: { type: String, default: "" },
    topic: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Topic",
    },
    fileUrl: { type: String, required: true },
    coverImage: { type: String },
    likes: { type: Array, default: [] },
    lyrics: { type: String, default: "" },
    description: { type: String, default: "" },
    status: { type: String, default: "active" },
    views: { type: Number, default: 0 },
    deleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const Song = mongoose.model("Song", songSchema, "songs");
export default Song;
