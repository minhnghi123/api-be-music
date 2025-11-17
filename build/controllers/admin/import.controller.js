var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import spotifyService from "../../services/spotify.service.js";
import Song from "../../models/song.model.js";
import Artist from "../../models/artist.model.js";
import Topic from "../../models/topic.model.js";
export const importArtistFromSpotify = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m;
    try {
        const { artistName, includeAlbums = false } = req.body;
        if (!artistName) {
            return res.status(400).json({
                success: false,
                message: "Artist name is required",
            });
        }
        console.log(`🔍 Đang tìm nghệ sĩ: "${artistName}"...`);
        const spotifyArtist = yield spotifyService.searchArtist(artistName);
        if (!spotifyArtist) {
            return res.json({
                success: false,
                message: `Không tìm thấy nghệ sĩ "${artistName}"`,
            });
        }
        console.log(`✅ Tìm thấy: ${spotifyArtist.name}`);
        const artistDetails = yield spotifyService.getArtistDetails(spotifyArtist.id);
        let artist = yield Artist.findOne({
            fullName: spotifyArtist.name,
            deleted: false,
        });
        if (!artist) {
            artist = new Artist({
                fullName: spotifyArtist.name,
                country: "International",
                coverImage: ((_a = spotifyArtist.images[0]) === null || _a === void 0 ? void 0 : _a.url) || "",
                status: "active",
            });
            yield artist.save();
            console.log(`✅ Đã tạo nghệ sĩ: ${spotifyArtist.name}`);
        }
        else {
            console.log(`ℹ️ Nghệ sĩ đã tồn tại: ${spotifyArtist.name}`);
        }
        const importedSongs = [];
        const skippedSongs = [];
        const errors = [];
        const topicName = spotifyService.mapGenreToTopic(artistDetails.genres || []);
        let topic = yield Topic.findOne({
            title: topicName,
            deleted: false,
        });
        if (!topic) {
            topic = new Topic({
                title: topicName,
                imgTopic: ((_b = spotifyArtist.images[0]) === null || _b === void 0 ? void 0 : _b.url) || "https://via.placeholder.com/300",
                content: `Thể loại ${topicName}`,
            });
            yield topic.save();
            console.log(`✅ Đã tạo chủ đề: ${topicName}`);
        }
        console.log(`📦 Đang lấy bài hát phổ biến...`);
        const topTracks = yield spotifyService.getArtistTopTracks(spotifyArtist.id);
        for (const track of topTracks) {
            try {
                const existingSong = yield Song.findOne({
                    title: track.name,
                    artist: { $in: [artist._id.toString()] },
                    deleted: false,
                });
                if (existingSong) {
                    skippedSongs.push(track.name);
                    continue;
                }
                const artistIds = [];
                for (const trackArtist of track.artists) {
                    let collabArtist = yield Artist.findOne({
                        fullName: trackArtist.name,
                        deleted: false,
                    });
                    if (!collabArtist) {
                        const collabDetails = yield spotifyService.getArtistDetails(trackArtist.id);
                        collabArtist = new Artist({
                            fullName: trackArtist.name,
                            country: "International",
                            coverImage: ((_c = collabDetails.images[0]) === null || _c === void 0 ? void 0 : _c.url) || "",
                            status: "active",
                        });
                        yield collabArtist.save();
                        console.log(`  ✅ Tạo nghệ sĩ collab: ${trackArtist.name}`);
                    }
                    artistIds.push(collabArtist._id.toString());
                }
                const newSong = new Song({
                    title: track.name,
                    artist: artistIds,
                    album: ((_d = track.album) === null || _d === void 0 ? void 0 : _d.name) || "Single",
                    topic: [topic._id.toString()],
                    fileUrl: track.preview_url || track.external_urls.spotify,
                    coverImage: ((_f = (_e = track.album) === null || _e === void 0 ? void 0 : _e.images[0]) === null || _f === void 0 ? void 0 : _f.url) || "",
                    lyrics: "",
                    description: `Album: ${(_g = track.album) === null || _g === void 0 ? void 0 : _g.name}. Popularity: ${track.popularity}/100. Release: ${(_h = track.album) === null || _h === void 0 ? void 0 : _h.release_date}`,
                    status: "active",
                });
                yield newSong.save();
                importedSongs.push({
                    title: track.name,
                    artists: track.artists.map((a) => a.name).join(", "),
                    album: (_j = track.album) === null || _j === void 0 ? void 0 : _j.name,
                });
                console.log(`  ✅ Import: ${track.name}`);
            }
            catch (error) {
                console.error(`  ❌ Lỗi: ${track.name}`, error.message);
                errors.push({ track: track.name, error: error.message });
            }
        }
        if (includeAlbums) {
            console.log(`📀 Đang lấy bài hát từ albums...`);
            const albums = yield spotifyService.getArtistAlbums(spotifyArtist.id, 5);
            for (const album of albums) {
                try {
                    const albumTracks = yield spotifyService.getAlbumTracks(album.id);
                    for (const track of albumTracks) {
                        try {
                            const existingSong = yield Song.findOne({
                                title: track.name,
                                artist: { $in: [artist._id.toString()] },
                                deleted: false,
                            });
                            if (existingSong) {
                                skippedSongs.push(track.name);
                                continue;
                            }
                            const trackDetails = yield spotifyService.getTrackDetails(track.id);
                            const artistIds = [];
                            for (const trackArtist of trackDetails.artists) {
                                let collabArtist = yield Artist.findOne({
                                    fullName: trackArtist.name,
                                    deleted: false,
                                });
                                if (!collabArtist) {
                                    const collabDetails = yield spotifyService.getArtistDetails(trackArtist.id);
                                    collabArtist = new Artist({
                                        fullName: trackArtist.name,
                                        country: "International",
                                        coverImage: ((_k = collabDetails.images[0]) === null || _k === void 0 ? void 0 : _k.url) || "",
                                        status: "active",
                                    });
                                    yield collabArtist.save();
                                }
                                artistIds.push(collabArtist._id.toString());
                            }
                            const newSong = new Song({
                                title: track.name,
                                artist: artistIds,
                                album: album.name,
                                topic: [topic._id.toString()],
                                fileUrl: trackDetails.preview_url ||
                                    trackDetails.external_urls.spotify,
                                coverImage: ((_l = album.images[0]) === null || _l === void 0 ? void 0 : _l.url) || "",
                                lyrics: "",
                                description: `Album: ${album.name}. Release: ${album.release_date}`,
                                status: "active",
                            });
                            yield newSong.save();
                            importedSongs.push({
                                title: track.name,
                                artists: trackDetails.artists
                                    .map((a) => a.name)
                                    .join(", "),
                                album: album.name,
                            });
                            console.log(`  ✅ Import: ${track.name}`);
                        }
                        catch (error) {
                            console.error(`  ❌ Lỗi: ${track.name}`, error.message);
                        }
                    }
                }
                catch (error) {
                    console.error(`  ❌ Lỗi album: ${album.name}`, error.message);
                }
            }
        }
        console.log(`\n✨ Hoàn thành! Import: ${importedSongs.length}, Bỏ qua: ${skippedSongs.length}`);
        res.json({
            success: true,
            message: `Import thành công ${importedSongs.length} bài hát của ${spotifyArtist.name}. Bỏ qua ${skippedSongs.length} bài trùng.`,
            artist: {
                name: spotifyArtist.name,
                genre: topicName,
                followers: ((_m = artistDetails.followers) === null || _m === void 0 ? void 0 : _m.total) || 0,
            },
            imported: importedSongs,
            skipped: skippedSongs,
            errors: errors.length > 0 ? errors : undefined,
        });
    }
    catch (error) {
        console.error("❌ Lỗi:", error.message);
        res.status(500).json({
            success: false,
            error: error.message,
        });
    }
});
export const importMultipleArtists = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e, _f, _g, _h;
    try {
        const { artists, includeAlbums = false } = req.body;
        if (!Array.isArray(artists) || artists.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Artists array is required",
            });
        }
        console.log(`🔍 Đang import ${artists.length} nghệ sĩ...`);
        const results = [];
        for (const artistName of artists) {
            try {
                console.log(`\n--- Đang xử lý: ${artistName} ---`);
                const spotifyArtist = yield spotifyService.searchArtist(artistName);
                if (!spotifyArtist) {
                    console.log(`❌ Không tìm thấy: ${artistName}`);
                    results.push({
                        artist: artistName,
                        success: false,
                        message: "Not found",
                    });
                    continue;
                }
                const artistDetails = yield spotifyService.getArtistDetails(spotifyArtist.id);
                let artist = yield Artist.findOne({
                    fullName: spotifyArtist.name,
                    deleted: false,
                });
                if (!artist) {
                    artist = new Artist({
                        fullName: spotifyArtist.name,
                        country: "International",
                        coverImage: ((_a = spotifyArtist.images[0]) === null || _a === void 0 ? void 0 : _a.url) || "",
                        status: "active",
                    });
                    yield artist.save();
                }
                const topicName = spotifyService.mapGenreToTopic(artistDetails.genres || []);
                let topic = yield Topic.findOne({
                    title: topicName,
                    deleted: false,
                });
                if (!topic) {
                    topic = new Topic({
                        title: topicName,
                        imgTopic: ((_b = spotifyArtist.images[0]) === null || _b === void 0 ? void 0 : _b.url) || "https://via.placeholder.com/300",
                        content: `Thể loại ${topicName}`,
                    });
                    yield topic.save();
                }
                const topTracks = yield spotifyService.getArtistTopTracks(spotifyArtist.id);
                let importCount = 0;
                for (const track of topTracks) {
                    try {
                        const existingSong = yield Song.findOne({
                            title: track.name,
                            artist: { $in: [artist._id.toString()] },
                            deleted: false,
                        });
                        if (existingSong)
                            continue;
                        const artistIds = [];
                        for (const trackArtist of track.artists) {
                            let collabArtist = yield Artist.findOne({
                                fullName: trackArtist.name,
                                deleted: false,
                            });
                            if (!collabArtist) {
                                const collabDetails = yield spotifyService.getArtistDetails(trackArtist.id);
                                collabArtist = new Artist({
                                    fullName: trackArtist.name,
                                    country: "International",
                                    coverImage: ((_c = collabDetails.images[0]) === null || _c === void 0 ? void 0 : _c.url) || "",
                                    status: "active",
                                });
                                yield collabArtist.save();
                            }
                            artistIds.push(collabArtist._id.toString());
                        }
                        const newSong = new Song({
                            title: track.name,
                            artist: artistIds,
                            album: ((_d = track.album) === null || _d === void 0 ? void 0 : _d.name) || "Single",
                            topic: [topic._id.toString()],
                            fileUrl: track.preview_url || track.external_urls.spotify,
                            coverImage: ((_f = (_e = track.album) === null || _e === void 0 ? void 0 : _e.images[0]) === null || _f === void 0 ? void 0 : _f.url) || "",
                            lyrics: "",
                            description: `Album: ${(_g = track.album) === null || _g === void 0 ? void 0 : _g.name}. Release: ${(_h = track.album) === null || _h === void 0 ? void 0 : _h.release_date}`,
                            status: "active",
                        });
                        yield newSong.save();
                        importCount++;
                    }
                    catch (error) {
                        console.error(`  ❌ Lỗi: ${track.name}`);
                    }
                }
                results.push({
                    artist: spotifyArtist.name,
                    success: true,
                    imported: importCount,
                    genre: topicName,
                });
                console.log(`✅ Hoàn thành: ${spotifyArtist.name} - ${importCount} bài`);
            }
            catch (error) {
                console.error(`❌ Lỗi nghệ sĩ: ${artistName}`, error.message);
                results.push({
                    artist: artistName,
                    success: false,
                    error: error.message,
                });
            }
        }
        const totalImported = results.reduce((sum, r) => sum + (r.imported || 0), 0);
        res.json({
            success: true,
            message: `Đã import ${totalImported} bài hát từ ${results.filter((r) => r.success).length}/${artists.length} nghệ sĩ`,
            results,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            error: error.message,
        });
    }
});
