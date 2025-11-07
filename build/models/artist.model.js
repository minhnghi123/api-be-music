import mongoose from "mongoose";
const artistSchema = new mongoose.Schema({
    fullName: { type: String, required: true },
    country: { type: String, required: true },
    coverImage: { type: String },
    status: { type: String, default: "active" },
    deleted: {
        type: Boolean,
        default: false,
    },
}, { timestamps: true });
const Artist = mongoose.model("Artist", artistSchema, "artists");
export default Artist;
