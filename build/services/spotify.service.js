var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import axios from "axios";
class SpotifyService {
    constructor() {
        this.clientId = process.env.SPOTIFY_CLIENT_ID || "";
        this.clientSecret = process.env.SPOTIFY_CLIENT_SECRET || "";
        this.accessToken = "";
        this.tokenExpiry = 0;
    }
    getAccessToken() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.accessToken && Date.now() < this.tokenExpiry) {
                return this.accessToken;
            }
            const response = yield axios.post("https://accounts.spotify.com/api/token", "grant_type=client_credentials", {
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                    Authorization: "Basic " +
                        Buffer.from(this.clientId + ":" + this.clientSecret).toString("base64"),
                },
            });
            this.accessToken = response.data.access_token;
            this.tokenExpiry = Date.now() + response.data.expires_in * 1000;
            return this.accessToken;
        });
    }
    searchArtist(artistName) {
        return __awaiter(this, void 0, void 0, function* () {
            const token = yield this.getAccessToken();
            const response = yield axios.get("https://api.spotify.com/v1/search", {
                headers: { Authorization: `Bearer ${token}` },
                params: {
                    q: artistName,
                    type: "artist",
                    limit: 1,
                },
            });
            return response.data.artists.items[0] || null;
        });
    }
    getArtistTopTracks(artistId_1) {
        return __awaiter(this, arguments, void 0, function* (artistId, market = "VN") {
            const token = yield this.getAccessToken();
            const response = yield axios.get(`https://api.spotify.com/v1/artists/${artistId}/top-tracks`, {
                headers: { Authorization: `Bearer ${token}` },
                params: { market },
            });
            return response.data.tracks;
        });
    }
    getArtistAlbums(artistId_1) {
        return __awaiter(this, arguments, void 0, function* (artistId, limit = 20) {
            const token = yield this.getAccessToken();
            const response = yield axios.get(`https://api.spotify.com/v1/artists/${artistId}/albums`, {
                headers: { Authorization: `Bearer ${token}` },
                params: {
                    include_groups: "album,single",
                    limit,
                    market: "VN",
                },
            });
            return response.data.items;
        });
    }
    getAlbumTracks(albumId) {
        return __awaiter(this, void 0, void 0, function* () {
            const token = yield this.getAccessToken();
            const response = yield axios.get(`https://api.spotify.com/v1/albums/${albumId}/tracks`, {
                headers: { Authorization: `Bearer ${token}` },
                params: { limit: 50 },
            });
            return response.data.items;
        });
    }
    getArtistDetails(artistId) {
        return __awaiter(this, void 0, void 0, function* () {
            const token = yield this.getAccessToken();
            const response = yield axios.get(`https://api.spotify.com/v1/artists/${artistId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            return response.data;
        });
    }
    getTrackDetails(trackId) {
        return __awaiter(this, void 0, void 0, function* () {
            const token = yield this.getAccessToken();
            const response = yield axios.get(`https://api.spotify.com/v1/tracks/${trackId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            return response.data;
        });
    }
    mapGenreToTopic(genres) {
        const genreMap = {
            pop: "Nhạc Pop",
            rock: "Nhạc Rock",
            "hip hop": "Nhạc Rap/Hip-Hop",
            rap: "Nhạc Rap/Hip-Hop",
            jazz: "Nhạc Jazz",
            classical: "Nhạc Cổ Điển",
            electronic: "Nhạc Electronic",
            "r&b": "Nhạc R&B",
            country: "Nhạc Country",
            indie: "Nhạc Indie",
            ballad: "Nhạc Ballad",
            dance: "Nhạc Dance",
            latin: "Nhạc Latin",
            metal: "Nhạc Metal",
            blues: "Nhạc Blues",
            folk: "Nhạc Folk",
            soul: "Nhạc Soul",
            vpop: "Nhạc V-Pop",
            kpop: "Nhạc K-Pop",
        };
        for (const genre of genres) {
            const lowerGenre = genre.toLowerCase();
            for (const key in genreMap) {
                if (lowerGenre.includes(key)) {
                    return genreMap[key];
                }
            }
        }
        return "Nhạc Tổng Hợp";
    }
}
export default new SpotifyService();
