import axios from "axios";

class PixabayService {
  private apiKey = process.env.PIXABAY_API_KEY || "";
  private baseUrl = "https://pixabay.com/api/";

  async searchMusic(query: string = "", limit: number = 20, page: number = 1) {
    try {
      const response = await axios.get(this.baseUrl, {
        params: {
          key: this.apiKey,
          q: query,
          per_page: Math.min(limit, 200), // Max 200 per page
          page: page,
        },
      });

      return response.data.hits.map((item: any) => ({
        id: item.id,
        title: item.tags || "Untitled",
        artist: item.user || "Unknown Artist",
        duration: item.duration,
        fileUrl: item.audio, // Full MP3 file URL
        previewUrl: item.previewURL,
        coverImage: item.userImageURL || "https://via.placeholder.com/300",
        downloads: item.downloads,
        likes: item.likes,
        tags: item.tags,
      }));
    } catch (error: any) {
      console.error("Pixabay API Error:", error.message);
      throw error;
    }
  }

  async getPopularMusic(limit: number = 20) {
    return await this.searchMusic("", limit);
  }
}

export default new PixabayService();
