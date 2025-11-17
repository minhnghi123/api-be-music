import axios from "axios";

class YouTubeService {
  private apiKey = process.env.YOUTUBE_API_KEY || "";

  async searchMusic(query: string, maxResults: number = 20) {
    try {
      const response = await axios.get(
        "https://www.googleapis.com/youtube/v3/search",
        {
          params: {
            part: "snippet",
            q: query + " official audio",
            type: "video",
            videoCategoryId: "10", // Music category
            maxResults,
            key: this.apiKey,
          },
        }
      );

      return response.data.items.map((item: any) => ({
        videoId: item.id.videoId,
        title: item.snippet.title,
        thumbnail: item.snippet.thumbnails.high.url,
        channelTitle: item.snippet.channelTitle,
        description: item.snippet.description,
        publishedAt: item.snippet.publishedAt,
      }));
    } catch (error: any) {
      console.error("YouTube API Error:", error.message);
      throw error;
    }
  }

  getStreamUrl(videoId: string) {
    // Sử dụng YouTube embed hoặc third-party service
    return `https://www.youtube.com/watch?v=${videoId}`;
  }

  getEmbedUrl(videoId: string) {
    return `https://www.youtube.com/embed/${videoId}`;
  }
}

export default new YouTubeService();
