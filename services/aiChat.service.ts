import Song from "../models/song.model.js";
import Artist from "../models/artist.model.js";
import Topic from "../models/topic.model.js";
import CachedPlaylist from "../models/cached_playlist.model.js";

interface MoodKeywords {
  [key: string]: {
    keywords: string[];
    topics: string[];
    description: string;
  };
}

// Định nghĩa các mood và từ khóa liên quan
const MOOD_DATABASE: MoodKeywords = {
  sad: {
    keywords: [
      "buồn",
      "sad",
      "melancholy",
      "depressed",
      "tâm trạng không tốt",
      "tâm trạng tệ",
      "cô đơn",
      "lonely",
      "chia tay",
      "nhớ",
      "thương",
      "khóc",
    ],
    topics: ["Ballad", "Acoustic", "R&B"],
    description: "Những bài hát buồn, tâm trạng",
  },
  happy: {
    keywords: [
      "vui",
      "happy",
      "cheerful",
      "tâm trạng tốt",
      "phấn khởi",
      "vui vẻ",
      "hạnh phúc",
      "excited",
      "upbeat",
      "sảng khoái",
    ],
    topics: ["Pop", "Dance", "EDM"],
    description: "Những bài hát vui tươi, sôi động",
  },
  chill: {
    keywords: [
      "thư giãn",
      "chill",
      "relax",
      "nghỉ ngơi",
      "lofi",
      "lo-fi",
      "nhẹ nhàng",
      "yên bình",
      "peaceful",
      "calm",
    ],
    topics: ["Lofi", "Jazz", "Acoustic", "Chill"],
    description: "Những bài hát thư giãn, nhẹ nhàng",
  },
  energetic: {
    keywords: [
      "năng lượng",
      "energetic",
      "workout",
      "tập luyện",
      "gym",
      "chạy bộ",
      "running",
      "mạnh mẽ",
      "powerful",
      "rock",
    ],
    topics: ["Rock", "EDM", "Hip Hop", "Dance"],
    description: "Những bài hát đầy năng lượng, mạnh mẽ",
  },
  romantic: {
    keywords: [
      "lãng mạn",
      "romantic",
      "tình yêu",
      "love",
      "yêu",
      "người yêu",
      "date",
      "hẹn hò",
      "ngọt ngào",
      "sweet",
    ],
    topics: ["Ballad", "Pop", "R&B", "Acoustic"],
    description: "Những bài hát lãng mạn, tình cảm",
  },
  sleep: {
    keywords: [
      "ngủ",
      "sleep",
      "buồn ngủ",
      "đi ngủ",
      "sleepy",
      "bedtime",
      "lullaby",
      "ru ngủ",
      "night",
    ],
    topics: ["Lofi", "Classical", "Acoustic", "Ambient"],
    description: "Những bài hát dễ ngủ, nhẹ nhàng",
  },
  study: {
    keywords: [
      "học",
      "study",
      "học bài",
      "làm việc",
      "work",
      "tập trung",
      "focus",
      "concentration",
      "đọc sách",
    ],
    topics: ["Lofi", "Classical", "Instrumental", "Jazz"],
    description: "Những bài hát phù hợp cho học tập, làm việc",
  },
};

/**
 * Chuẩn hóa text (lowercase, remove diacritics)
 */
export function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

/**
 * Phân tích message để xác định mood
 */
export function analyzeMood(message: string): {
  mood: string;
  confidence: number;
} {
  const normalizedMessage = normalizeText(message);
  let bestMood = "chill";
  let maxScore = 0;

  for (const [mood, data] of Object.entries(MOOD_DATABASE)) {
    let score = 0;
    for (const keyword of data.keywords) {
      const normalizedKeyword = normalizeText(keyword);
      if (normalizedMessage.includes(normalizedKeyword)) {
        score += 10;
      }
    }

    if (score > maxScore) {
      maxScore = score;
      bestMood = mood;
    }
  }

  // Nếu không tìm thấy mood rõ ràng, return chill as default
  const confidence = maxScore > 0 ? Math.min(maxScore / 10, 1) : 0.3;

  return { mood: bestMood, confidence };
}

/**
 * Tạo response message dựa trên mood
 */
export function generateResponseMessage(
  mood: string,
  playlistTitle: string
): string {
  const responses: { [key: string]: string[] } = {
    sad: [
      `Mình hiểu bạn đang buồn 😔. Mình đã tạo playlist "${playlistTitle}" với những bài hát có thể giúp bạn cảm thấy tốt hơn.`,
      `Đừng buồn quá nhé! Hãy thử nghe playlist "${playlistTitle}" này, hy vọng nó sẽ làm bạn cảm thấy thoải mái hơn. 🎵`,
    ],
    happy: [
      `Tuyệt vời! Mình cảm nhận được năng lượng tích cực của bạn 😊. Đây là playlist "${playlistTitle}" để thêm phần vui vẻ!`,
      `Vui quá! Playlist "${playlistTitle}" này sẽ làm tâm trạng bạn càng thêm phấn khởi! 🎉`,
    ],
    chill: [
      `Thư giãn thôi! Playlist "${playlistTitle}" này hoàn hảo để chill 😌`,
      `Mình có một playlist "${playlistTitle}" nhẹ nhàng phù hợp với bạn đây!`,
    ],
    energetic: [
      `Đầy năng lượng đây! Playlist "${playlistTitle}" sẽ giúp bạn cháy hết mình! 💪🔥`,
      `Tuyệt! Playlist "${playlistTitle}" này sẽ boost thêm năng lượng cho bạn!`,
    ],
    romantic: [
      `Lãng mạn quá! Playlist "${playlistTitle}" này hoàn hảo cho những khoảnh khắc ngọt ngào 💕`,
      `Mình có playlist "${playlistTitle}" đặc biệt dành cho tình yêu của bạn đây!`,
    ],
    sleep: [
      `Đã muộn rồi! Playlist "${playlistTitle}" này sẽ giúp bạn ngủ ngon giấc 😴`,
      `Chúc ngủ ngon! Hãy thử playlist "${playlistTitle}" nhẹ nhàng này nhé!`,
    ],
    study: [
      `Tập trung học bài nào! Playlist "${playlistTitle}" này sẽ giúp bạn focus tốt hơn 📚`,
      `Mình có playlist "${playlistTitle}" hoàn hảo cho việc học tập đây!`,
    ],
  };

  const moodResponses = responses[mood] || responses["chill"];
  return moodResponses[Math.floor(Math.random() * moodResponses.length)];
}

/**
 * Tìm playlist từ cache
 */
export async function findCachedPlaylist(message: string, mood: string) {
  const normalizedQuery = normalizeText(message);

  // Tìm exact match hoặc similar query
  const cached = await CachedPlaylist.findOne({
    $or: [
      { normalizedQuery: normalizedQuery },
      { mood: mood, hitCount: { $gt: 5 } }, // Popular playlists for this mood
    ],
    deleted: false,
  })
    .populate("songs")
    .populate("playlistId")
    .sort({ hitCount: -1, lastUsed: -1 })
    .limit(1);

  if (cached) {
    // Update hit count and last used
    cached.hitCount += 1;
    cached.lastUsed = new Date();
    await cached.save();
    return cached;
  }

  return null;
}

/**
 * Tạo playlist mới dựa trên mood
 */
export async function generatePlaylistByMood(
  mood: string,
  userId: string,
  limit: number = 15
): Promise<{
  songs: any[];
  title: string;
  description: string;
  coverImage: string;
}> {
  const moodData = MOOD_DATABASE[mood] || MOOD_DATABASE["chill"];

  // Tìm topics phù hợp với mood
  const topics = await Topic.find({
    title: { $in: moodData.topics },
    deleted: false,
  });

  const topicIds = topics.map((t) => t._id.toString());

  // Query songs dựa trên topics
  let songs;
  if (topicIds.length > 0) {
    songs = await Song.find({
      topic: { $in: topicIds },
      deleted: false,
      status: "active",
    })
      .limit(limit)
      .sort({ likes: -1 }); // Sort by popularity
  }

  // Nếu không tìm thấy đủ bài hát từ topics, lấy random
  if (!songs || songs.length < 5) {
    songs = await Song.aggregate([
      { $match: { deleted: false, status: "active" } },
      { $sample: { size: limit } },
    ]);
  }

  // Generate title and description
  const titles: { [key: string]: string } = {
    sad: "Tâm Trạng Buồn",
    happy: "Vui Vẻ Sảng Khoái",
    chill: "Thư Giãn Chill",
    energetic: "Năng Lượng Tràn Đầy",
    romantic: "Lãng Mạn Yêu Thương",
    sleep: "Ngủ Ngon Giấc",
    study: "Tập Trung Học Tập",
  };

  const title = titles[mood] || "Playlist Của Bạn";
  const description = moodData.description;
  const coverImage = songs[0]?.coverImage || "";

  return {
    songs,
    title,
    description,
    coverImage,
  };
}

/**
 * Lưu playlist vào cache
 */
export async function cachePlaylist(
  query: string,
  mood: string,
  playlistId: string,
  songs: string[],
  title: string,
  description: string,
  coverImage: string
) {
  const normalizedQuery = normalizeText(query);

  // Check if already exists
  const existing = await CachedPlaylist.findOne({ normalizedQuery });

  if (existing) {
    existing.hitCount += 1;
    existing.lastUsed = new Date();
    await existing.save();
    return existing;
  }

  // Create new cache entry
  const cached = new CachedPlaylist({
    query,
    normalizedQuery,
    mood,
    playlistId,
    songs,
    title,
    description,
    coverImage,
    hitCount: 1,
    lastUsed: new Date(),
  });

  await cached.save();
  return cached;
}

/**
 * Phân tích intent của message
 */
export function analyzeIntent(message: string): string {
  const normalizedMessage = normalizeText(message);

  // Check for save playlist intent
  if (
    normalizedMessage.includes("luu") ||
    normalizedMessage.includes("save") ||
    normalizedMessage.includes("them vao") ||
    normalizedMessage.includes("giu lai")
  ) {
    return "save_playlist";
  }

  // Check for playlist request
  if (
    normalizedMessage.includes("bai hat") ||
    normalizedMessage.includes("nhac") ||
    normalizedMessage.includes("playlist") ||
    normalizedMessage.includes("nghe") ||
    normalizedMessage.includes("phat")
  ) {
    return "playlist_request";
  }

  return "general_chat";
}

/**
 * Phân tích yêu cầu của user (RULE-BASED - Không dùng AI)
 */
export const analyzeUserRequest = async (message: string) => {
  const normalizedMessage = normalizeText(message);

  // Phát hiện nghệ sĩ
  const artists: string[] = [];
  const artistKeywords = [
    "sơn tùng",
    "mtp",
    "đen vâu",
    "binz",
    "karik",
    "erik",
    "min",
    "amee",
    "hòa minzy",
    "bích phương",
    "noo phước thịnh",
    "đức phúc",
    "jack",
    "k-icm",
    "hoàng thùy linh",
  ];
  artistKeywords.forEach((keyword) => {
    if (normalizedMessage.includes(normalizeText(keyword))) {
      artists.push(keyword);
    }
  });

  // Phát hiện thể loại
  const genres: string[] = [];
  const genreMap: { [key: string]: string } = {
    pop: "Pop",
    rock: "Rock",
    rap: "Rap",
    "hip hop": "Hip Hop",
    ballad: "Ballad",
    edm: "EDM",
    jazz: "Jazz",
    acoustic: "Acoustic",
    lofi: "Lofi",
    "lo-fi": "Lofi",
    vpop: "Vpop",
    indie: "Indie",
  };

  Object.keys(genreMap).forEach((keyword) => {
    if (normalizedMessage.includes(keyword)) {
      genres.push(genreMap[keyword]);
    }
  });

  // Phát hiện thập kỷ
  let era = "all";
  if (normalizedMessage.includes("90") || normalizedMessage.includes("1990"))
    era = "90s";
  else if (normalizedMessage.includes("2000")) era = "2000s";
  else if (normalizedMessage.includes("2010")) era = "2010s";
  else if (
    normalizedMessage.includes("2020") ||
    normalizedMessage.includes("moi")
  )
    era = "2020s";

  // Phát hiện độ đa dạng
  let variety = "medium";
  if (
    normalizedMessage.includes("da dang") ||
    normalizedMessage.includes("mix") ||
    normalizedMessage.includes("nhieu the loai")
  ) {
    variety = "high";
  } else if (
    normalizedMessage.includes("mot the loai") ||
    normalizedMessage.includes("thuan") ||
    normalizedMessage.includes("chuyen")
  ) {
    variety = "low";
  }

  // Phát hiện số lượng bài hát
  let playlistSize = 15;
  const sizeMatch = normalizedMessage.match(/(\d+)\s*(bai|song)/);
  if (sizeMatch) {
    playlistSize = Math.min(30, Math.max(10, parseInt(sizeMatch[1])));
  }

  // Phát hiện mood
  const { mood } = analyzeMood(message);

  // Phát hiện intent
  let intent = "playlist_request";
  if (artists.length > 0) intent = "artist_search";
  if (genres.length > 2) intent = "mixed_playlist";
  if (
    normalizedMessage.includes("xin chao") ||
    normalizedMessage.includes("hello") ||
    normalizedMessage.includes("hi")
  ) {
    intent = "general_chat";
  }

  // Phát hiện keywords
  const keywords: string[] = [];
  [
    "tinh yeu",
    "buon",
    "vui",
    "nho",
    "thuong",
    "chia tay",
    "happy",
    "sad",
    "love",
  ].forEach((kw) => {
    if (normalizedMessage.includes(normalizeText(kw))) {
      keywords.push(kw);
    }
  });

  return {
    intent,
    mood,
    genres,
    artists,
    keywords,
    era,
    playlistSize,
    variety,
  };
};

/**
 * Tạo playlist thông minh dựa trên phân tích
 */
export const generateSmartPlaylist = async (analysis: any, userId: string) => {
  const { mood, genres, artists, keywords, era, playlistSize, variety } =
    analysis;

  // Build query động
  let query: any = { status: "active", deleted: false };

  // Tìm nghệ sĩ nếu có
  if (artists && artists.length > 0) {
    const artistDocs = await Artist.find({
      fullName: { $regex: artists.join("|"), $options: "i" },
      deleted: false,
    });

    if (artistDocs.length > 0) {
      query.artist = { $in: artistDocs.map((a) => a._id) };
    }
  }

  // Tìm theo thể loại
  if (genres && genres.length > 0) {
    const topicDocs = await Topic.find({
      title: { $regex: genres.join("|"), $options: "i" },
      deleted: false,
    });

    if (topicDocs.length > 0) {
      // FIX: Kiểm tra field name trong Song schema
      // Dùng topic hoặc topic_id tùy schema của bạn
      query.$or = [
        { topic: { $in: topicDocs.map((t) => t._id) } },
        { topic_id: { $in: topicDocs.map((t) => t._id) } },
      ];
    }
  }

  // Tìm theo từ khóa trong title
  if (keywords && keywords.length > 0) {
    const keywordRegex = keywords.map((kw: any) => new RegExp(kw, "i"));
    if (!query.$or) query.$or = [];
    query.$or.push({ title: { $in: keywordRegex } });
  }

  // Lọc theo thập kỷ (nếu có field createdAt)
  if (era && era !== "all") {
    const yearMap: { [key: string]: [number, number] } = {
      "90s": [1990, 1999],
      "2000s": [2000, 2009],
      "2010s": [2010, 2019],
      "2020s": [2020, 2029],
    };
    if (yearMap[era]) {
      const [startYear, endYear] = yearMap[era];
      query.createdAt = {
        $gte: new Date(`${startYear}-01-01`),
        $lte: new Date(`${endYear}-12-31`),
      };
    }
  }

  // Lấy bài hát
  let songs = await Song.find(query)
    .populate("artist")
    .sort({ listen: -1 })
    .limit(playlistSize * 2);

  // Nếu không đủ bài, lấy random
  if (songs.length < Math.min(5, playlistSize)) {
    console.log("Not enough songs, getting random...");
    songs = await Song.aggregate([
      { $match: { deleted: false, status: "active" } },
      { $sample: { size: playlistSize * 2 } },
    ]);

    // Populate artist cho aggregate
    await Song.populate(songs, { path: "artist" });
  }

  // Shuffle và lấy đúng số lượng
  const shuffled = songs.sort(() => Math.random() - 0.5);
  const finalSongs = shuffled.slice(0, playlistSize);

  // Tạo title và description
  const { title, description } = await generatePlaylistMetadata(
    analysis,
    finalSongs
  );

  return {
    songs: finalSongs,
    title,
    description,
    coverImage: finalSongs[0]?.coverImage || "",
  };
};

/**
 * Tạo title và description cho playlist (TEMPLATE-BASED)
 */
export const generatePlaylistMetadata = async (analysis: any, songs: any[]) => {
  const { mood, genres, artists } = analysis;

  let title = "";
  let description = "";

  // Tạo title dựa trên context
  if (artists.length > 0) {
    const artistName = artists[0].charAt(0).toUpperCase() + artists[0].slice(1);
    title = `${artistName} Collection`;
    description = `Tuyển tập nhạc hay của ${artists.join(", ")}`;
  } else if (genres.length > 0) {
    title = `${genres[0]} Vibes ${new Date().getFullYear()}`;
    description = `Playlist ${genres.join(", ")} đặc sắc dành cho bạn`;
  } else {
    const moodTitles: { [key: string]: string } = {
      happy: "Vui Vẻ Sảng Khoái",
      sad: "Tâm Trạng Buồn",
      chill: "Thư Giãn Chill",
      energetic: "Năng Lượng Tràn Đầy",
      romantic: "Lãng Mạn Yêu Thương",
      sleep: "Ngủ Ngon Giấc",
      study: "Tập Trung Học Tập",
    };
    title = moodTitles[mood] || "Playlist Của Bạn";
    description = `${songs.length} bài hát phù hợp với tâm trạng ${mood} của bạn`;
  }

  return { title, description };
};

/**
 * Tạo response message (TEMPLATE-BASED)
 */
export const generateSmartResponse = async (
  analysis: any,
  playlistTitle: string,
  songCount: number
) => {
  if (songCount > 0) {
    const responses = [
      `🎵 Mình vừa tạo playlist "${playlistTitle}" với ${songCount} bài hát cho bạn đây!`,
      `✨ Đây là "${playlistTitle}" - ${songCount} bài hát đặc biệt dành cho bạn!`,
      `🎶 Playlist "${playlistTitle}" (${songCount} bài) đã sẵn sàng! Nghe thử nhé!`,
      `💖 Mình đã chuẩn bị "${playlistTitle}" với ${songCount} bài hát tuyệt vời!`,
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  } else {
    const greetings = [
      "Xin chào! 👋 Bạn muốn nghe nhạc gì không? Hãy cho mình biết tâm trạng của bạn nhé!",
      "Hi bạn! 😊 Mình có thể giúp bạn tìm nhạc phù hợp đấy! Bạn đang cảm thấy thế nào?",
      "Chào bạn! 🎵 Nói cho mình biết bạn muốn nghe loại nhạc nào nhé!",
      "Hello! ✨ Mình là trợ lý âm nhạc của bạn! Bạn muốn playlist nào?",
    ];
    return greetings[Math.floor(Math.random() * greetings.length)];
  }
};
