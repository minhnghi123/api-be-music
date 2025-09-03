import { Request, Response } from "express";
import Song from "../../models/song.model.js";
import FavoriteSong from "../../models/favorite_song.model.js";
import Playlist from "../../models/playlist.model.js";
import User from "../../models/user.model.js";
import Fuse from "fuse.js";
import getUserInfo from "../../utils/client/getUserInfo.util.js";
import { getFullArtists } from "../../utils/client/getArtist.util.js";
import {
  getFullPlaylists,
  getPlaylistOfUser,
} from "../../utils/client/getPlaylist.util.js";
import { getFullSongs } from "../../utils/client/getSong.util.js";
import { getFavoriteSongOfUser } from "../../utils/client/getFavoriteSong.util.js";
import { getFullTopics } from "../../utils/client/getTopic.util.js";

export const home = async (req: Request, res: Response) => {
  //finding logic
  const keyword = req.query.search as string;
  const userID = getUserInfo(req, res);
  if (keyword) {
    const songs = await Song.find({
      deleted: false,
      status: "active",
    }).select("_id title artist fileUrl coverImage");
    const fuse = new Fuse(songs, {
      keys: ["title"],
    });
    const result = fuse.search(keyword);

    const favoriteSongs = await getFavoriteSongOfUser(userID);
    const favoriteSongIds = favoriteSongs.map((item) =>
      item.song_id.toString()
    );
    //individual playlists
    let userIndividualPlaylists = null;
    if (res.locals.user) {
      userIndividualPlaylists = await Playlist.find({
        user_id: userID,
        deleted: false,
      });
      for (const playlist of userIndividualPlaylists) {
        const user = await User.findOne({
          _id: playlist.user_id,
          deleted: false,
        });
        if (user) {
          (playlist as any)["username"] = user.username;
        }
      }
    }
    //render
    res.json({
      success: true,
      findingTitle: keyword,
      songs: result,
      favoriteSongIds: favoriteSongIds,
      individualPlaylists: userIndividualPlaylists,
    });
    return; // Thêm return để không chạy tiếp code phía dưới
  }

  const artists = await getFullArtists();
  const songs = await getFullSongs();
  const playlists = await getFullPlaylists();
  //individual playlists
  let individualPlaylists = null;
  if (res.locals.user) {
    individualPlaylists = await getPlaylistOfUser(userID);
  }

  const favoriteSongs = await getFavoriteSongOfUser(userID);
  const favoriteIds = favoriteSongs.map((item) => item.song_id.toString());
  const topics = await getFullTopics();
  res.json({
    success: true,
    artists,
    songs,
    favoriteSongIds: favoriteIds,
    playlists,
    topics,
    individualPlaylists,
    user: res.locals.user,
  });
};

export const autocomplete = async (req: Request, res: Response) => {
  try {
    const keyword = req.query.q;
    if (!keyword || typeof keyword !== "string" || keyword.trim() === "") {
      return res
        .status(400)
        .json({ success: false, message: "Missing or invalid keyword" });
    }
    const result = await Song.find({
      title: { $regex: keyword, $options: "i" },
      status: "active",
      deleted: false,
    })
      .select("title")
      .limit(10);
    return res.json({ success: true, data: result });
  } catch (err) {
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
