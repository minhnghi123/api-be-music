import { Request, Response } from "express";
import Artist from "../../models/artist.model.js";
import User from "../../models/user.model.js";
import Song from "../../models/song.model.js";
import { getFavoriteSongOfUser } from "../../utils/client/getFavoriteSong.util.js";
import getUserInfo from "../../utils/client/getUserInfo.util.js";
import { getPlaylistOfUser } from "../../utils/client/getPlaylist.util.js";
import { mapArtistIdToInfo } from "../../utils/client/mapArtistIdToInfo.util.js";
export const index = async (req: Request, res: Response) => {
  try {
    const userID = getUserInfo(req, res);
    let individualPlaylists = null;
    if (res.locals.user) {
      individualPlaylists = await getPlaylistOfUser(userID);
    }
    const id = req.params.id;
    const artist = await Artist.findOne({
      _id: id,
      deleted: false,
    });
    let followArtistsIds = null;
    if (res.locals.user) {
      const followArtists = await User.findOne({
        _id: res.locals.user.id,
        deleted: false,
      }).select("follow_artists");
      if (followArtists && followArtists.follow_artists) {
        followArtistsIds = followArtists.follow_artists.map((item) =>
          item.toString()
        );
      }
    }
    const songs = await Song.find({
      artist: id,
      deleted: false,
    });
    console.log(songs);

    // Format artist info
    const formattedSongs = await Promise.all(
      songs.map(async (song) => {
        let artistInfo;
        if (Array.isArray(song.artist)) {
          const artistInfos = await Promise.all(
            song.artist.map((artistId) => mapArtistIdToInfo(artistId))
          );
          artistInfo = artistInfos.filter(Boolean);
        } else if (song.artist) {
          artistInfo = await mapArtistIdToInfo(song.artist);
        } else {
          artistInfo = "Unknown Artist";
        }
        return { ...song.toObject(), artist: artistInfo };
      })
    );

    const favoriteSongs = await getFavoriteSongOfUser(userID);
    const favoriteSongIds = favoriteSongs.map((item) =>
      item.song_id.toString()
    );

    res.json({
      success: true,
      artist,
      songs: formattedSongs,
      followArtistsIds,
      individualPlaylists,
      favoriteSongIds,
    });
  } catch (error) {
    console.log(error);
  }
};

export const addFollowArtist = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    const userID = res.locals.user.id;
    const user = await User.findOne({
      _id: userID,
      deleted: false,
    }).select("follow_artists");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    let tempArray = user?.follow_artists || [];
    if (tempArray.includes(id)) {
      tempArray = tempArray.filter((item) => item != id);
      res.json({ code: "remove" });
    } else {
      tempArray.push(id);
      res.json({ code: "add" });
    }
    user.follow_artists = tempArray;
    await User.updateOne(
      {
        _id: userID,
        deleted: false,
      },
      user
    );
  } catch (error) {
    console.log(error);
  }
};
