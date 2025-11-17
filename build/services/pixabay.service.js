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
class PixabayService {
    constructor() {
        this.apiKey = process.env.PIXABAY_API_KEY || "";
        this.baseUrl = "https://pixabay.com/api/";
    }
    searchMusic() {
        return __awaiter(this, arguments, void 0, function* (query = "", limit = 20, page = 1) {
            try {
                const response = yield axios.get(this.baseUrl, {
                    params: {
                        key: this.apiKey,
                        q: query,
                        per_page: Math.min(limit, 200),
                        page: page,
                    },
                });
                return response.data.hits.map((item) => ({
                    id: item.id,
                    title: item.tags || "Untitled",
                    artist: item.user || "Unknown Artist",
                    duration: item.duration,
                    fileUrl: item.audio,
                    previewUrl: item.previewURL,
                    coverImage: item.userImageURL || "https://via.placeholder.com/300",
                    downloads: item.downloads,
                    likes: item.likes,
                    tags: item.tags,
                }));
            }
            catch (error) {
                console.error("Pixabay API Error:", error.message);
                throw error;
            }
        });
    }
    getPopularMusic() {
        return __awaiter(this, arguments, void 0, function* (limit = 20) {
            return yield this.searchMusic("", limit);
        });
    }
}
export default new PixabayService();
