import mongoose from "mongoose";
const commentSchema = new mongoose.Schema({
    songId: {
        type: String,
        required: true,
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    content: {
        type: String,
        required: true,
    },
    likes: {
        type: Number,
        default: 0,
    },
    likedBy: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
    ],
    deleted: {
        type: Boolean,
        default: false,
    },
}, {
    timestamps: true,
});
const Comment = mongoose.model("Comment", commentSchema, "comments");
export default Comment;
