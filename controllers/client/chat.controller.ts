import { Request, Response } from "express";
import ChatMessage from "../../models/chat_message.model.js";
import ChatSession from "../../models/chat_session.model.js";
import CachedPlaylist from "../../models/cached_playlist.model.js";
import Playlist from "../../models/playlist.model.js";
import Song from "../../models/song.model.js";
import { v4 as uuidv4 } from "uuid";
import {
  analyzeUserRequest,
  generateSmartPlaylist,
  generateSmartResponse,
  findCachedPlaylist,
  cachePlaylist,
} from "../../services/aiChat.service.js";
import { mapArtistIdToInfo } from "../../utils/client/mapArtistIdToInfo.util.js";

/**
 * Send chat message and get AI response
 */
export const sendChatMessage = async (req: Request, res: Response) => {
  try {
    const userId = res.locals.user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
        playlist: null,
      });
    }

    const { message } = req.body;

    if (!message || message.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: "Message is required",
        playlist: null,
      });
    }

    // Get or create session
    let session = await ChatSession.findOne({
      userId,
      active: true,
      deleted: false,
    }).sort({ lastActivity: -1 });

    if (!session) {
      session = new ChatSession({
        userId,
        sessionId: uuidv4(),
        active: true,
        lastActivity: new Date(),
      });
      await session.save();
    }

    // Phân tích message bằng AI
    const analysis = await analyzeUserRequest(message);
    const { intent, mood } = analysis;

    // Save user message
    const userMessage = new ChatMessage({
      userId,
      sessionId: session.sessionId,
      content: message,
      sender: "user",
      metadata: {
        mood,
        intent,
      },
    });
    await userMessage.save();

    // Check if this is a playlist request
    if (
      intent === "playlist_request" ||
      intent === "mixed_playlist" ||
      intent === "artist_search"
    ) {
      // Try to find cached playlist first
      let cachedPlaylist = await findCachedPlaylist(message, mood);
      let isCached = false;

      let playlistData;
      let playlistId;

      if (cachedPlaylist) {
        isCached = true;
        playlistData = {
          songs: cachedPlaylist.songs,
          title: cachedPlaylist.title,
          description: cachedPlaylist.description,
          coverImage: cachedPlaylist.coverImage,
        };
        playlistId = cachedPlaylist.playlistId;
      } else {
        // Generate new playlist với AI analysis
        playlistData = await generateSmartPlaylist(analysis, userId);

        // Create temporary playlist
        const newPlaylist = new Playlist({
          title: playlistData.title,
          description: playlistData.description,
          songs: playlistData.songs.map((s: any) => s._id.toString()),
          user_id: null,
          coverImage: playlistData.coverImage,
          createdBy: "ai_assistant",
          status: "private",
        });
        await newPlaylist.save();
        playlistId = newPlaylist._id;

        // Cache this playlist
        await cachePlaylist(
          message,
          mood,
          playlistId.toString(),
          playlistData.songs.map((s: any) => s._id.toString()),
          playlistData.title,
          playlistData.description,
          playlistData.coverImage
        );
      }

      // Format songs with artist info
      const formattedSongs = await Promise.all(
        playlistData.songs.map(async (song: any) => {
          let artistInfo;
          if (Array.isArray(song.artist)) {
            const artistInfos = await Promise.all(
              song.artist.map((artistId: string) => mapArtistIdToInfo(artistId))
            );
            artistInfo = artistInfos.filter(Boolean);
          } else if (song.artist) {
            artistInfo = await mapArtistIdToInfo(song.artist);
          } else {
            artistInfo = "Unknown Artist";
          }
          return {
            ...(song.toObject ? song.toObject() : song),
            artist: artistInfo,
          };
        })
      );

      // Generate smart response
      const botResponseText = await generateSmartResponse(
        analysis,
        playlistData.title,
        formattedSongs.length
      );

      // Save bot message
      const botMessage = new ChatMessage({
        userId,
        sessionId: session.sessionId,
        content: botResponseText,
        sender: "bot",
        playlistId: playlistId,
        songs: playlistData.songs.map((s: any) => s._id),
        metadata: {
          mood,
          intent,
          cached: isCached,
        },
      });
      await botMessage.save();

      // Update session context
      session.context = {
        lastMood: mood,
        lastPlaylistId: playlistId,
        conversationCount: (session.context?.conversationCount || 0) + 1,
      };
      session.lastActivity = new Date();
      await session.save();

      return res.json({
        success: true,
        message: botResponseText,
        playlist: {
          id: playlistId.toString(),
          title: playlistData.title,
          description: playlistData.description,
          mood: mood,
          songs: formattedSongs,
          coverImage: playlistData.coverImage,
        },
        cached: isCached,
      });
    } else {
      // General chat response - dùng GPT
      const botResponseText = await generateSmartResponse(
        { mood: "neutral" },
        "General Chat",
        0
      );

      const botMessage = new ChatMessage({
        userId,
        sessionId: session.sessionId,
        content: botResponseText,
        sender: "bot",
        metadata: {
          mood: "neutral",
          intent: "general_chat",
        },
      });
      await botMessage.save();

      return res.json({
        success: true,
        message: botResponseText,
        playlist: null,
        cached: false,
      });
    }
  } catch (error) {
    console.error("Error in sendChatMessage:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      playlist: null,
    });
  }
};

/**
 * Get chat history
 */
export const getChatHistory = async (req: Request, res: Response) => {
  try {
    const userId = res.locals.user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        data: null,
      });
    }

    // Get active session
    const session = await ChatSession.findOne({
      userId,
      active: true,
      deleted: false,
    }).sort({ lastActivity: -1 });

    if (!session) {
      return res.json({
        success: true,
        data: [],
      });
    }

    // Get messages from this session
    const messages = await ChatMessage.find({
      userId,
      sessionId: session.sessionId,
      deleted: false,
    })
      .sort({ createdAt: 1 })
      .limit(100);

    // Format messages
    const formattedMessages = messages.map((msg) => ({
      _id: msg._id.toString(),
      content: msg.content,
      sender: msg.sender,
      timestamp: new Date(msg.createdAt).getTime(),
      playlistId: msg.playlistId?.toString() || null,
      songs: msg.songs?.map((s) => s.toString()) || null,
    }));

    res.json({
      success: true,
      data: formattedMessages,
    });
  } catch (error) {
    console.error("Error in getChatHistory:", error);
    res.status(500).json({
      success: false,
      data: null,
    });
  }
};

/**
 * Save suggested playlist to user's library
 */
export const saveSuggestedPlaylist = async (req: Request, res: Response) => {
  try {
    const userId = res.locals.user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
        playlistId: null,
      });
    }

    const { id, title, description, mood, songs, coverImage } = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Playlist ID is required",
        playlistId: null,
      });
    }

    // Find the playlist
    const playlist = await Playlist.findById(id);

    if (!playlist) {
      return res.status(404).json({
        success: false,
        message: "Playlist not found",
        playlistId: null,
      });
    }

    // Update playlist to assign to user
    playlist.user_id = userId;
    playlist.status = "private";
    playlist.title = title || playlist.title;
    playlist.description = description || playlist.description;

    await playlist.save();

    // Create a chat message to record this action
    const session = await ChatSession.findOne({
      userId,
      active: true,
      deleted: false,
    }).sort({ lastActivity: -1 });

    if (session) {
      const saveMessage = new ChatMessage({
        userId,
        sessionId: session.sessionId,
        content: `Đã lưu playlist "${playlist.title}" vào thư viện của bạn! 🎉`,
        sender: "bot",
        playlistId: playlist._id,
        metadata: {
          mood: mood || "neutral",
          intent: "save_playlist",
        },
      });
      await saveMessage.save();
    }

    res.json({
      success: true,
      message: "Playlist saved successfully",
      playlistId: playlist._id.toString(),
    });
  } catch (error) {
    console.error("Error in saveSuggestedPlaylist:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      playlistId: null,
    });
  }
};
