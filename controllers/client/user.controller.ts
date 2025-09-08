import { Request, Response } from "express";
import mongoose from "mongoose";
import Topic from "../../models/topic.model.js";
import Song from "../../models/song.model.js";
import Artist from "../../models/artist.model.js";
import User from "../../models/user.model.js";
import { getPlaylistOfUser } from "../../utils/client/getPlaylist.util.js";
import { getFavoriteSongOfUser } from "../../utils/client/getFavoriteSong.util.js";
import bcryptjs from "bcryptjs";

export const index = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID",
      });
    }

    const user = await User.findOne({
      _id: userId,
      deleted: false,
      status: "active",
    }).select("username avatar playlist follow_songs follow_artists");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const [individualPlaylists, favoriteSongs, songs] = await Promise.all([
      res.locals.user ? getPlaylistOfUser(userId) : null,
      getFavoriteSongOfUser(userId),
      Song.find({ deleted: false, status: "active" }),
    ]);

    const favoriteSongIds = favoriteSongs.map((item) =>
      item.song_id.toString()
    );

    // Get followed artists
    const artists = await Artist.find({
      _id: { $in: user.follow_artists },
      deleted: false,
      status: "active",
    }).select("fullName avatar");

    // Map artist name to each song
    const artistMap = new Map<string, string>();
    const songArtistIds = songs
      .map((song) => song.artist?.toString())
      .filter(Boolean);
    const songArtists = await Artist.find({
      _id: { $in: songArtistIds },
      deleted: false,
    }).select("fullName");

    songArtists.forEach((artist) => {
      artistMap.set(artist._id.toString(), artist.fullName);
    });

    const songsWithArtistName = songs.map((song) => ({
      ...song.toObject(),
      artist:
        artistMap.get(song.artist?.toString() || "") ||
        "Không tìm thấy thông tin nghệ sĩ",
    }));

    return res.json({
      success: true,
      data: {
        userInfo: user,
        songs: songsWithArtistName,
        artists,
        individualPlaylists,
        favoriteSongIds,
      },
      message: "User data fetched successfully",
    });
  } catch (error) {
    console.error("Error fetching user:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// Lấy thông tin tài khoản cá nhân (dựa vào token)
export const getMe = async (req: Request, res: Response) => {
  try {
    const userId = res.locals.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }
    const user = await User.findOne({
      _id: userId,
      deleted: false,
      status: "active",
    }).select("username email avatar playlist follow_songs follow_artists");
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
    return res.json({ success: true, data: user });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "Internal Server Error" });
  }
};

// Cập nhật thông tin cá nhân (tên, email, avatar...)
export const updateMe = async (req: Request, res: Response) => {
  try {
    const userId = res.locals.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }
    const { username, email, avatar } = req.body;
    const update: any = {};
    if (username) update.username = username;
    if (email) update.email = email;
    if (avatar) update.avatar = avatar;
    const user = await User.findByIdAndUpdate(userId, update, {
      new: true,
    }).select("username email avatar playlist follow_songs follow_artists");
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
    return res.json({ success: true, data: user, message: "Profile updated" });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "Internal Server Error" });
  }
};

// Đổi mật khẩu
export const changePassword = async (req: Request, res: Response) => {
  try {
    const userId = res.locals.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }
    const { oldPassword, newPassword, reNewPassword } = req.body;
    if (!oldPassword || !newPassword || !reNewPassword) {
      return res
        .status(400)
        .json({ success: false, message: "Missing required fields" });
    }
    if (newPassword !== reNewPassword) {
      return res
        .status(400)
        .json({ success: false, message: "Passwords do not match" });
    }
    const user = await User.findById(userId);
    if (!user || !user.password) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
    const isMatch = await bcryptjs.compare(oldPassword, String(user.password));
    if (!isMatch) {
      return res
        .status(401)
        .json({ success: false, message: "Old password is incorrect" });
    }
    const salt = bcryptjs.genSaltSync(10);
    const hashedPassword = await bcryptjs.hash(newPassword, salt);
    user.password = hashedPassword;
    await user.save();
    return res.json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "Internal Server Error" });
  }
};

// Xóa tài khoản cá nhân
export const deleteMe = async (req: Request, res: Response) => {
  try {
    const userId = res.locals.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }
    const user = await User.findByIdAndUpdate(
      userId,
      { deleted: true },
      { new: true }
    );
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
    return res.json({ success: true, message: "Account deleted" });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "Internal Server Error" });
  }
};
