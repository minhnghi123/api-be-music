import Artist from "../../models/artist.model.js";

/**
 * Chuyển đổi trường artist (id hoặc mảng id) thành object {id, fullName} hoặc mảng object
 * @param {string|string[]} artistId
 * @returns {Promise<Object|Object[]>}
 */
export async function mapArtistIdToInfo(artistId: string) {
  if (!artistId) return null;
  if (Array.isArray(artistId)) {
    const artists = await Artist.find({ _id: { $in: artistId } });
    return artists.map((a) => ({ id: a._id, fullName: a.fullName }));
  } else {
    const artist = await Artist.findById(artistId);
    if (!artist) return null;
    return { id: artist._id, fullName: artist.fullName };
  }
}
