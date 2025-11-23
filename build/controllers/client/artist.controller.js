var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import Artist from "../../models/artist.model.js";
import User from "../../models/user.model.js";
import Song from "../../models/song.model.js";
import { getFavoriteSongOfUser } from "../../utils/client/getFavoriteSong.util.js";
import getUserInfo from "../../utils/client/getUserInfo.util.js";
import { getPlaylistOfUser } from "../../utils/client/getPlaylist.util.js";
import { mapArtistIdToInfo } from "../../utils/client/mapArtistIdToInfo.util.js";
export const index = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userID = getUserInfo(req, res);
        let individualPlaylists = null;
        if (res.locals.user) {
            individualPlaylists = yield getPlaylistOfUser(userID);
        }
        const id = req.params.id;
        const artist = yield Artist.findOne({
            _id: id,
            deleted: false,
        });
        let followArtistsIds = null;
        if (res.locals.user) {
            const followArtists = yield User.findOne({
                _id: res.locals.user.id,
                deleted: false,
            }).select("follow_artists");
            if (followArtists && followArtists.follow_artists) {
                followArtistsIds = followArtists.follow_artists.map((item) => item.toString());
            }
        }
        const songs = yield Song.find({
            artist: id,
            deleted: false,
        });
        console.log(songs);
        const formattedSongs = yield Promise.all(songs.map((song) => __awaiter(void 0, void 0, void 0, function* () {
            let artistInfo;
            if (Array.isArray(song.artist)) {
                const artistInfos = yield Promise.all(song.artist.map((artistId) => mapArtistIdToInfo(artistId)));
                artistInfo = artistInfos.filter(Boolean);
            }
            else if (song.artist) {
                artistInfo = yield mapArtistIdToInfo(song.artist);
            }
            else {
                artistInfo = "Unknown Artist";
            }
            return Object.assign(Object.assign({}, song.toObject()), { artist: artistInfo });
        })));
        const favoriteSongs = yield getFavoriteSongOfUser(userID);
        const favoriteSongIds = favoriteSongs.map((item) => item.song_id.toString());
        res.json({
            success: true,
            artist,
            songs: formattedSongs,
            followArtistsIds,
            individualPlaylists,
            favoriteSongIds,
        });
    }
    catch (error) {
        console.log(error);
    }
});
export const addFollowArtist = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = req.params.id;
        const userID = res.locals.user.id;
        const user = yield User.findOne({
            _id: userID,
            deleted: false,
        }).select("follow_artists");
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        let tempArray = (user === null || user === void 0 ? void 0 : user.follow_artists) || [];
        if (tempArray.includes(id)) {
            tempArray = tempArray.filter((item) => item != id);
            res.json({ code: "remove" });
        }
        else {
            tempArray.push(id);
            res.json({ code: "add" });
        }
        user.follow_artists = tempArray;
        yield User.updateOne({
            _id: userID,
            deleted: false,
        }, user);
    }
    catch (error) {
        console.log(error);
    }
});
