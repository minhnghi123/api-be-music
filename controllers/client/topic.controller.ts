import { Request, Response } from "express";
import Topic from "../../models/topic.model";
import Song from "../../models/song.model";
import Artist from "../../models/artist.model";
import FavoriteSong from "../../models/favorite_song.model";
import User from "../../models/user.model";

export const index = async (req: Request, res: Response) => {
  try {
    const id = req.params.id; // sẽ thay chỗ này bằng topic_slug
    const topic = await Topic.findOne({
      _id: id,
      deleted: false,
    });

    const songs = await Song.find({
      topic: {
        $in: id,
      },
      deleted: false,
    });
    //thêm phân trang và giới hạn số bài hát ở đây
    for (const song of songs) {
      const artist = await Artist.findOne({
        _id: song.artist,
        deleted: false,
      });
      if (!artist) {
        (song as any).artist = "Không tìm thấy thông tin nghệ sĩ";
      } else {
        (song as any)["artistFullName"] = artist.fullName;
      }
    }
    let favoriteSongIds: string[] = [];
    let followSongIds: string[] = [];
    if (res.locals.user) {
      const favoriteSongs = await FavoriteSong.find({
        user_id: res.locals.user.id,
        deleted: false,
      }).select("song_id");
      favoriteSongIds = favoriteSongs.map((item: any) =>
        item.song_id.toString()
      );

      const user = await User.findOne({
        _id: res.locals.user.id,
        deleted: false,
      }).select("follow_songs");
      if (user && user.follow_songs) {
        followSongIds = user.follow_songs.map((item: any) => item.toString());
      }
    }

    res.json({
      success: true,
      topic,
      songs,
      favoriteSongIds,
      followSongIds,
    });
  } catch (error) {
    console.log(error);
  }
};

export const followTopic = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    const userID = res.locals.user.id;
    const user = await User.findOne({
      _id: userID,
      deleted: false,
    }).select("follow_songs");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    let tempArray: string[] = Array.isArray(user.follow_songs)
      ? user.follow_songs.map((item: any) => item.toString())
      : [];
    if (tempArray.includes(id)) {
      tempArray = tempArray.filter((playlistID) => playlistID != id);
      res.json({ code: "remove" });
    } else {
      tempArray.push(id);
      res.json({ code: "success" });
    }
    user.follow_songs = tempArray;
    await User.updateOne(
      {
        _id: userID,
        deleted: false,
      },
      { $set: { follow_songs: tempArray } }
    );
  } catch (error) {
    console.log(error);
  }
};
