import { Request, Response } from "express";
import ListeningHistory from "../../models/listening_history.model.js";
import AutoPlaylist from "../../models/auto_playlist.model.js";
import Song from "../../models/song.model.js";
import { mapArtistIdToInfo } from "../../utils/client/mapArtistIdToInfo.util.js";

// Record listening history
export const recordListeningHistory = async (req: Request, res: Response) => {
  try {
    const userId = res.locals.user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    const { songId, duration, completed } = req.body;

    if (!songId || duration === undefined) {
      return res.status(400).json({
        success: false,
        message: "songId and duration are required",
      });
    }

    // Kiểm tra xem bài hát có tồn tại không
    const song = await Song.findById(songId);
    if (!song) {
      return res.status(404).json({
        success: false,
        message: "Song not found",
      });
    }

    // Tạo listening history
    const listeningHistory = new ListeningHistory({
      userId,
      songId,
      duration,
      completed: completed || false,
    });

    await listeningHistory.save();

    res.json({
      success: true,
      message: "Listening history recorded successfully",
    });
  } catch (error) {
    console.error("Error recording listening history:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error,
    });
  }
};

// Get auto-generated playlists
export const getAutoPlaylists = async (req: Request, res: Response) => {
  try {
    const userId = res.locals.user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    // Lấy tất cả auto playlists của user
    const autoPlaylists = await AutoPlaylist.find({
      userId,
      deleted: false,
    })
      .populate("songs")
      .sort({ generatedAt: -1 });

    // Format artist info cho từng bài hát trong mỗi playlist
    const formattedPlaylists = await Promise.all(
      autoPlaylists.map(async (playlist) => {
        const formattedSongs = await Promise.all(
          playlist.songs.map(async (song: any) => {
            let artistInfo;
            if (Array.isArray(song.artist)) {
              const artistInfos = await Promise.all(
                song.artist.map((artistId: string) =>
                  mapArtistIdToInfo(artistId)
                )
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

        return {
          _id: playlist._id,
          title: playlist.title,
          description: playlist.description,
          type: playlist.type,
          songs: formattedSongs,
          coverImage: playlist.coverImage,
          generatedAt: playlist.generatedAt,
          score: playlist.score,
        };
      })
    );

    res.json({
      success: true,
      data: formattedPlaylists,
      message: null,
    });
  } catch (error) {
    console.error("Error getting auto playlists:", error);
    res.status(500).json({
      success: false,
      data: [],
      message: "Server error",
    });
  }
};

// Generate auto playlists based on listening history
export const generateAutoPlaylists = async (req: Request, res: Response) => {
  try {
    const userId = res.locals.user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    // Lấy listening history của user (30 ngày gần nhất)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const listeningHistory = await ListeningHistory.find({
      userId,
      listenedAt: { $gte: thirtyDaysAgo },
      deleted: false,
    }).populate("songId");

    if (listeningHistory.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Not enough listening history to generate playlists",
      });
    }

    // Phân tích listening history
    const songFrequency: { [key: string]: number } = {};
    const completedSongs: Set<string> = new Set();

    listeningHistory.forEach((history) => {
      const songId = history.songId._id.toString();
      songFrequency[songId] = (songFrequency[songId] || 0) + 1;
      if (history.completed) {
        completedSongs.add(songId);
      }
    });

    // Lấy các bài hát được nghe nhiều nhất và nghe hết
    const topSongIds = Object.entries(songFrequency)
      .filter(([songId]) => completedSongs.has(songId))
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20)
      .map(([songId]) => songId);

    if (topSongIds.length < 5) {
      return res.status(400).json({
        success: false,
        message: "Not enough data to generate meaningful playlists",
      });
    }

    // Lấy thông tin các bài hát này
    const topSongs = await Song.find({ _id: { $in: topSongIds } });

    // Phân loại theo topic (giả sử topic có thể dùng để phân loại)
    const playlistTypes = ["chill", "workout", "mixed"];
    const newPlaylists = [];

    for (const type of playlistTypes) {
      let playlistSongs;
      let title;
      let description;
      let score = Math.floor(Math.random() * 20) + 80; // 80-100

      if (type === "mixed") {
        // Mixed playlist: Lấy ngẫu nhiên từ top songs
        playlistSongs = topSongs.slice(0, Math.min(15, topSongs.length));
        title = "Your Mix";
        description = "A personalized mix based on your listening habits";
      } else {
        // Các playlist khác: lọc theo một số tiêu chí
        playlistSongs = topSongs.slice(0, Math.min(10, topSongs.length));
        title = type === "chill" ? "Chill Vibes" : "Workout Energy";
        description =
          type === "chill"
            ? "Relaxing songs for your chill time"
            : "Energetic songs to boost your workout";
      }

      // Xóa playlist cũ cùng type (nếu có)
      await AutoPlaylist.deleteMany({ userId, type });

      // Tạo playlist mới
      const autoPlaylist = new AutoPlaylist({
        userId,
        title,
        description,
        type,
        songs: playlistSongs.map((song) => song._id),
        coverImage: playlistSongs[0]?.coverImage || "",
        score,
        generatedAt: new Date(),
      });

      await autoPlaylist.save();
      newPlaylists.push(autoPlaylist);
    }

    res.json({
      success: true,
      message: `Successfully generated ${newPlaylists.length} auto playlists`,
    });
  } catch (error) {
    console.error("Error generating auto playlists:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error,
    });
  }
};
