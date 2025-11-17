import { Request, Response } from "express";
import Song from "../../models/song.model.js";
import Artist from "../../models/artist.model.js";
import Topic from "../../models/topic.model.js";

export const index = async (req: Request, res: Response) => {
  const songs = await Song.find({
    deleted: false,
  });
  for (const song of songs) {
    // Xử lý nhiều ca sĩ
    const artistIds = Array.isArray(song.artist) ? song.artist : [song.artist];
    const artistNames = [];

    for (const artistId of artistIds) {
      const artist = await Artist.findOne({
        _id: artistId,
        deleted: false,
        status: "active",
      });
      if (artist) {
        artistNames.push(artist.fullName);
      }
    }

    (song as any)["artist"] =
      artistNames.length > 0
        ? artistNames.join(", ")
        : "Không tìm thấy nghệ sĩ";
    // console.log(song.topic);
    let topicTitle = "Không có chủ đề";
    if (Array.isArray(song.topic) && song.topic.length > 0) {
      const topic = await Topic.findOne({
        _id: song.topic[0],
      });
      if (topic) topicTitle = topic.title;
    }
    (song as any)["topicTitle"] = topicTitle;
  }
  res.json({
    success: true,
    songs,
  });
};
export const create = async (req: Request, res: Response) => {
  const artists = await Artist.find({
    deleted: false,
  });
  const topics = await Topic.find({ deleted: false });
  res.json({
    success: true,
    artists,
    topics,
  });
};
export const createPost = async (req: Request, res: Response) => {
  try {
    const {
      title,
      topicId,
      singerId, // Có thể là array hoặc string
      lyrics,
      description,
      status,
      avatar,
      audio,
    } = req.body;

    const artistIds = Array.isArray(singerId) ? singerId : [singerId];

    const songInfo = {
      title,
      artist: artistIds,
      topic: topicId,
      fileUrl: audio?.[0] ?? "",
      coverImage: avatar?.[0] ?? "",
      lyrics,
      description,
      status,
    };
    const newSong = new Song(songInfo);
    await newSong.save();
    res.json({ success: true, song: newSong });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};
export const edit = async (req: Request, res: Response) => {
  const { id } = req.params;
  const artists = await Artist.find({
    deleted: false,
  });
  const topics = await Topic.find({ deleted: false });
  const song = await Song.findOne({
    _id: id,
    deleted: false,
    status: "active",
  });

  res.json({
    success: true,
    song,
    topics,
    artists,
  });
};
export const editPatch = async (req: Request, res: Response) => {
  try {
    await Song.updateOne(
      {
        _id: req.params.id,
      },
      req.body
    );
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};
export const deletePatch = async (req: Request, res: Response) => {
  try {
    await Song.updateOne(
      {
        _id: req.params.id,
      },
      {
        deleted: true,
      }
    );
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};
