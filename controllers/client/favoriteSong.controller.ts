import { Request, Response } from "express";
import FavoriteSong from "../../models/favorite_song.model.js";
import Song from "../../models/song.model.js";
import Artist from "../../models/artist.model.js";
import { mapArtistIdToInfo } from "../../utils/client/mapArtistIdToInfo.util.js";

// Lấy tất cả bài hát yêu thích của user hiện tại
export const getAllFavoriteSongs = async (req: Request, res: Response) => {
  try {
    const userId = res.locals.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    // Lấy danh sách favorite songs với populate song info
    const favoriteSongs = await FavoriteSong.find({
      user_id: userId,
      deleted: false,
    }).select("song_id");

    const songIds = favoriteSongs.map((item) => item.song_id);
    let songs = await Song.find({
      _id: { $in: songIds },
      deleted: false,
      status: "active",
    });

    // Map artist info cho từng bài hát
    const songsWithArtist = await Promise.all(
      songs.map(async (song) => {
        const songObj = song.toObject();
        if (Array.isArray(song.artist)) {
          const artistInfos = await Promise.all(
            song.artist.map((artistId) => mapArtistIdToInfo(artistId))
          );
          (songObj as any).artist = artistInfos.filter(Boolean);
        } else if (song.artist) {
          const artistInfo = await mapArtistIdToInfo(song.artist);
          (songObj as any).artist = artistInfo || "Unknown Artist";
        } else {
          (songObj as any).artist = "Unknown Artist";
        }
        return songObj;
      })
    );

    const favoriteSongIds = favoriteSongs.map((item) =>
      item.song_id.toString()
    );

    return res.json({
      success: true,
      data: {
        songs: songsWithArtist,
        favoriteSongIds,
        total: songsWithArtist.length,
      },
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, message: "Internal Server Error" });
  }
};

// Legacy method - giữ tương thích
export const index = getAllFavoriteSongs;

// Lấy chi tiết một bài hát yêu thích
export const getFavoriteSongById = async (req: Request, res: Response) => {
  try {
    const userId = res.locals.user?.id;
    const songId = req.params.id;

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const favoriteSong = await FavoriteSong.findOne({
      user_id: userId,
      song_id: songId,
      deleted: false,
    });

    if (!favoriteSong) {
      return res
        .status(404)
        .json({ success: false, message: "Favorite song not found" });
    }

    const song = await Song.findOne({
      _id: songId,
      deleted: false,
      status: "active",
    });
    if (!song) {
      return res
        .status(404)
        .json({ success: false, message: "Song not found" });
    }

    const songObj = song.toObject();
    if (Array.isArray(song.artist)) {
      const artistInfos = await Promise.all(
        song.artist.map((artistId) => mapArtistIdToInfo(artistId))
      );
      (songObj as any).artist = artistInfos.filter(Boolean);
    } else if (song.artist) {
      const artistInfo = await mapArtistIdToInfo(song.artist);
      (songObj as any).artist = artistInfo || "Unknown Artist";
    } else {
      (songObj as any).artist = "Unknown Artist";
    }

    return res.json({ success: true, data: songObj });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, message: "Internal Server Error" });
  }
};

// Thêm bài hát vào danh sách yêu thích
export const addFavoriteSong = async (req: Request, res: Response) => {
  try {
    const songId = req.params.id;
    const userId = res.locals.user?.id;

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    // Kiểm tra song có tồn tại
    const song = await Song.findOne({
      _id: songId,
      deleted: false,
      status: "active",
    });
    if (!song) {
      return res
        .status(404)
        .json({ success: false, message: "Song not found" });
    }

    const existingFavorite = await FavoriteSong.findOne({
      user_id: userId,
      song_id: songId,
    });

    if (existingFavorite) {
      if (existingFavorite.deleted) {
        // Khôi phục bài hát yêu thích
        await FavoriteSong.updateOne(
          { _id: existingFavorite._id },
          { deleted: false, removed_at: null }
        );
        return res.json({
          success: true,
          message: "Added to favorites",
          action: "added",
        });
      } else {
        // Xóa khỏi danh sách yêu thích
        await FavoriteSong.updateOne(
          { _id: existingFavorite._id },
          { deleted: true, removed_at: new Date() }
        );
        return res.json({
          success: true,
          message: "Removed from favorites",
          action: "removed",
        });
      }
    } else {
      // Tạo mới
      const newFavorite = new FavoriteSong({
        user_id: userId,
        song_id: songId,
      });
      await newFavorite.save();
      return res.json({
        success: true,
        message: "Added to favorites",
        action: "added",
      });
    }
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, message: "Internal Server Error" });
  }
};

// Xóa bài hát khỏi danh sách yêu thích
export const removeFavoriteSong = async (req: Request, res: Response) => {
  try {
    const songId = req.params.id;
    const userId = res.locals.user?.id;

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const favoriteSong = await FavoriteSong.findOne({
      user_id: userId,
      song_id: songId,
      deleted: false,
    });

    if (!favoriteSong) {
      return res
        .status(404)
        .json({ success: false, message: "Favorite song not found" });
    }

    await FavoriteSong.updateOne(
      { _id: favoriteSong._id },
      { deleted: true, removed_at: new Date() }
    );

    return res.json({ success: true, message: "Removed from favorites" });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, message: "Internal Server Error" });
  }
};

// Xóa tất cả bài hát yêu thích
export const removeAllFavoriteSongs = async (req: Request, res: Response) => {
  try {
    const userId = res.locals.user?.id;

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    await FavoriteSong.updateMany(
      { user_id: userId, deleted: false },
      { deleted: true, removed_at: new Date() }
    );

    return res.json({ success: true, message: "All favorite songs removed" });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, message: "Internal Server Error" });
  }
};
