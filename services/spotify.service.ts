import axios from "axios";

class SpotifyService {
  private clientId = process.env.SPOTIFY_CLIENT_ID || "";
  private clientSecret = process.env.SPOTIFY_CLIENT_SECRET || "";
  private accessToken: string = "";
  private tokenExpiry: number = 0;

  private async getAccessToken() {
    if (this.accessToken && Date.now() < this.tokenExpiry) {
      return this.accessToken;
    }

    const response = await axios.post(
      "https://accounts.spotify.com/api/token",
      "grant_type=client_credentials",
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization:
            "Basic " +
            Buffer.from(this.clientId + ":" + this.clientSecret).toString(
              "base64"
            ),
        },
      }
    );

    this.accessToken = response.data.access_token;
    this.tokenExpiry = Date.now() + response.data.expires_in * 1000;
    return this.accessToken;
  }

  async searchArtist(artistName: string) {
    const token = await this.getAccessToken();
    const response = await axios.get("https://api.spotify.com/v1/search", {
      headers: { Authorization: `Bearer ${token}` },
      params: {
        q: artistName,
        type: "artist",
        limit: 1,
      },
    });
    return response.data.artists.items[0] || null;
  }

  async getArtistTopTracks(artistId: string, market: string = "VN") {
    const token = await this.getAccessToken();
    const response = await axios.get(
      `https://api.spotify.com/v1/artists/${artistId}/top-tracks`,
      {
        headers: { Authorization: `Bearer ${token}` },
        params: { market },
      }
    );
    return response.data.tracks;
  }

  async getArtistAlbums(artistId: string, limit: number = 20) {
    const token = await this.getAccessToken();
    const response = await axios.get(
      `https://api.spotify.com/v1/artists/${artistId}/albums`,
      {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          include_groups: "album,single",
          limit,
          market: "VN",
        },
      }
    );
    return response.data.items;
  }

  async getAlbumTracks(albumId: string) {
    const token = await this.getAccessToken();
    const response = await axios.get(
      `https://api.spotify.com/v1/albums/${albumId}/tracks`,
      {
        headers: { Authorization: `Bearer ${token}` },
        params: { limit: 50 },
      }
    );
    return response.data.items;
  }

  async getArtistDetails(artistId: string) {
    const token = await this.getAccessToken();
    const response = await axios.get(
      `https://api.spotify.com/v1/artists/${artistId}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return response.data;
  }

  async getTrackDetails(trackId: string) {
    const token = await this.getAccessToken();
    const response = await axios.get(
      `https://api.spotify.com/v1/tracks/${trackId}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return response.data;
  }

  // Map Spotify genres sang genres phổ biến
  mapGenreToTopic(genres: string[]): string {
    const genreMap: { [key: string]: string } = {
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
