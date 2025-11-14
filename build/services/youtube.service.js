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
class YouTubeService {
    constructor() {
        this.apiKey = process.env.YOUTUBE_API_KEY || "";
    }
    searchMusic(query_1) {
        return __awaiter(this, arguments, void 0, function* (query, maxResults = 20) {
            try {
                const response = yield axios.get("https://www.googleapis.com/youtube/v3/search", {
                    params: {
                        part: "snippet",
                        q: query + " official audio",
                        type: "video",
                        videoCategoryId: "10",
                        maxResults,
                        key: this.apiKey,
                    },
                });
                return response.data.items.map((item) => ({
                    videoId: item.id.videoId,
                    title: item.snippet.title,
                    thumbnail: item.snippet.thumbnails.high.url,
                    channelTitle: item.snippet.channelTitle,
                    description: item.snippet.description,
                    publishedAt: item.snippet.publishedAt,
                }));
            }
            catch (error) {
                console.error("YouTube API Error:", error.message);
                throw error;
            }
        });
    }
    getStreamUrl(videoId) {
        return `https://www.youtube.com/watch?v=${videoId}`;
    }
    getEmbedUrl(videoId) {
        return `https://www.youtube.com/embed/${videoId}`;
    }
}
export default new YouTubeService();
