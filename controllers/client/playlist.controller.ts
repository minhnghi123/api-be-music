import { Request, Response } from "express";
import Song from "../../models/song.model.js";
import Artist from "../../models/artist.model.js";
import Playlist from "../../models/playlist.model.js";
export const index = async (req: Request, res: Response) => {
  const playlist = await Playlist.findOne({
    _id: req.params.id,
    deleted: false,
  });
  const songs = await Song.find({ status: "active", deleted: false });
  const songsInPlaylist = await Song.find({
    _id: {
      $in: playlist?.songs,
    },
  }).select("title fileUrl coverImage artist");
  for (const song of songsInPlaylist) {
    const artist = await Artist.findOne({
      _id: song.artist,
      status: "active",
      deleted: false,
    });
    (song as any)["artist"] = artist
      ? artist.fullName
      : "Không tìm thấy nghệ sĩ";
  }

  res.json({
    success: true,
    songsInPlaylist,
    playlist,
  });
};

export const createPlaylist = (req: Request, res: Response) => {
  try {
    if (res.locals.user) {
      req.body.user_id = res.locals.user.id;
      req.body.createdBy = res.locals.user.username;
      const record = new Playlist(req.body);
      record.save();
      res.json({
        code: "success",
        playlist: record,
      });
    } else {
      res.json({
        code: "unsuccess",
      });
    }
  } catch (error) {
    console.log(error);
  }
};

export const addPlaylist = async (req: Request, res: Response) => {
  try {
    const songID = req.body.song;
    const playlist = await Playlist.findOne({
      _id: req.body.playlist,
      deleted: false,
    });
    let songs: string[] = Array.isArray(playlist?.songs)
      ? playlist.songs.map((item: any) => item.toString())
      : [];
    if (songs.includes(songID)) {
      songs = songs.filter((item) => item != songID);
    } else {
      songs.push(songID);
    }
    if (playlist) {
      playlist.songs = songs;
      await Playlist.updateOne(
        {
          _id: req.body.playlist,
          deleted: false,
        },
        { $set: { songs } }
      );
    }
  } catch (error) {
    console.log(error);
  }
};

export const savePlaylist = async (req: Request, res: Response) => {
  try {
    await Playlist.updateOne(
      {
        _id: req.params.id,
        deleted: false,
      },
      req.body
    );
    res.redirect("back");
  } catch (error) {
    console.log(error);
  }
};
