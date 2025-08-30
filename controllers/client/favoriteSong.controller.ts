import { Request, response, Response } from "express";
import FavoriteSong from "../../models/favorite_song.model.js";
import Song from "../../models/song.model.js";
import Artist from "../../models/artist.model.js";

export const index = async (req: Request, res: Response) => {
  try {
    const id = res.locals.user?.id;
    if (id) {
      const favoriteSongs = await FavoriteSong.find({
        user_id: id,
        deleted: false,
      }).select("song_id");
      const songs = [];
      for (const favoriteSong of favoriteSongs) {
        const song = await Song.findOne({
          _id: favoriteSong.song_id,
          deleted: false,
        });
        songs.push(song);
      }
      for (const song of songs) {
        if (!song) continue;
        const artist = await Artist.findOne({
          _id: song.artist,
          deleted: false,
        }).select("fullName");
        if (!artist) {
          (song as any).artist = "Không tìm thấy thông tin nghệ sĩ";
        } else {
          (song as any).artist = artist.fullName;
        }
      }
      const favoriteSongIds = favoriteSongs.map((item) =>
        item.song_id.toString()
      );
      res.json({
        success: true,
        songs,
        favoriteSongIds,
      });
    } else {
      res.redirect("/auth/login");
    }
  } catch (error) {
    console.log(error);
  }
};

export const addFavoriteSong = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    const userID = res.locals.user?.id;
    if (userID) {
      const favoriteSong = await FavoriteSong.findOne({ song_id: id });
      if (favoriteSong) {
        if (favoriteSong.deleted === true) {
          await FavoriteSong.updateOne(
            { song_id: id },
            {
              user_id: userID,
              deleted: false,
              removed_at: null,
            }
          );
          res.json({ code: "success" });
        } else {
          await FavoriteSong.updateOne(
            { song_id: id },
            {
              deleted: true,
              removed_at: new Date(),
            }
          );
          res.json({ code: "remove" });
        }
      } else {
        const record = new FavoriteSong({
          user_id: res.locals.user.id,
          song_id: id,
        });
        await record.save();
        res.json({ code: "success" });
      }
    } else {
      res.status(401).json({ success: false, message: "Unauthorized" });
    }
  } catch (error) {
    console.log(error);
    res.json({ code: "error" });
  }
};
