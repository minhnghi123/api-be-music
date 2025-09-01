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
export function mapArtistIdToInfo(artistId) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!artistId)
            return null;
        if (Array.isArray(artistId)) {
            const artists = yield Artist.find({ _id: { $in: artistId } });
            return artists.map((a) => ({ id: a._id, fullName: a.fullName }));
        }
        else {
            const artist = yield Artist.findById(artistId);
            if (!artist)
                return null;
            return { id: artist._id, fullName: artist.fullName };
        }
    });
}
