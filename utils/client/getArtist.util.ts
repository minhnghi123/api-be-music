import Artist from "../../models/artist.model.js";
export const getFullArtists = async () => {
  const artists = await Artist.find({ status: "active", deleted: false });
  return artists;
};
