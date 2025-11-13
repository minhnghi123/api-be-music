import { Request, Response } from "express";
import spotifyService from "../../services/spotify.service.js";
import Song from "../../models/song.model.js";
import Artist from "../../models/artist.model.js";
import Topic from "../../models/topic.model.js";

export const importArtistFromSpotify = async (req: Request, res: Response) => {
  try {
    const { artistName, includeAlbums = false } = req.body;

    if (!artistName) {
      return res.status(400).json({
        success: false,
        message: "Artist name is required",
      });
    }

    console.log(`🔍 Đang tìm nghệ sĩ: "${artistName}"...`);

    // Tìm nghệ sĩ trên Spotify
    const spotifyArtist = await spotifyService.searchArtist(artistName);

    if (!spotifyArtist) {
      return res.json({
        success: false,
        message: `Không tìm thấy nghệ sĩ "${artistName}"`,
      });
    }

    console.log(`✅ Tìm thấy: ${spotifyArtist.name}`);

    // Lấy chi tiết nghệ sĩ để có genres
    const artistDetails = await spotifyService.getArtistDetails(
      spotifyArtist.id
    );

    // Kiểm tra nghệ sĩ đã tồn tại chưa
    let artist = await Artist.findOne({
      fullName: spotifyArtist.name,
      deleted: false,
    });

    if (!artist) {
      artist = new Artist({
        fullName: spotifyArtist.name,
        country: "International",
        coverImage: spotifyArtist.images[0]?.url || "",
        status: "active",
      });
      await artist.save();
      console.log(`✅ Đã tạo nghệ sĩ: ${spotifyArtist.name}`);
    } else {
      console.log(`ℹ️ Nghệ sĩ đã tồn tại: ${spotifyArtist.name}`);
    }

    const importedSongs = [];
    const skippedSongs = [];
    const errors = [];

    // Xác định genre/topic
    const topicName = spotifyService.mapGenreToTopic(
      artistDetails.genres || []
    );
    let topic = await Topic.findOne({
      title: topicName,
      deleted: false,
    });

    if (!topic) {
      topic = new Topic({
        title: topicName,
        imgTopic: spotifyArtist.images[0]?.url || "https://via.placeholder.com/300",
        content: `Thể loại ${topicName}`,
      });
      await topic.save();
      console.log(`✅ Đã tạo chủ đề: ${topicName}`);
    }

    // Lấy top tracks
    console.log(`📦 Đang lấy bài hát phổ biến...`);
    const topTracks = await spotifyService.getArtistTopTracks(
      spotifyArtist.id
    );

    for (const track of topTracks) {
      try {
        // Kiểm tra bài hát đã tồn tại
        const existingSong = await Song.findOne({
          title: track.name,
          artist: { $in: [artist._id.toString()] },
          deleted: false,
        });

        if (existingSong) {
          skippedSongs.push(track.name);
          continue;
        }

        // Lấy tất cả nghệ sĩ của bài hát (nếu là collab)
        const artistIds = [];
        for (const trackArtist of track.artists) {
          let collabArtist = await Artist.findOne({
            fullName: trackArtist.name,
            deleted: false,
          });

          if (!collabArtist) {
            // Lấy thông tin chi tiết nghệ sĩ collab
            const collabDetails = await spotifyService.getArtistDetails(
              trackArtist.id
            );
            collabArtist = new Artist({
              fullName: trackArtist.name,
              country: "International",
              coverImage: collabDetails.images[0]?.url || "",
              status: "active",
            });
            await collabArtist.save();
            console.log(`  ✅ Tạo nghệ sĩ collab: ${trackArtist.name}`);
          }
          artistIds.push(collabArtist._id.toString());
        }

        // Tạo bài hát mới
        const newSong = new Song({
          title: track.name,
          artist: artistIds,
          album: track.album?.name || "Single",
          topic: [topic._id.toString()],
          fileUrl: track.preview_url || track.external_urls.spotify,
          coverImage: track.album?.images[0]?.url || "",
          lyrics: "",
          description: `Album: ${track.album?.name}. Popularity: ${track.popularity}/100. Release: ${track.album?.release_date}`,
          status: "active",
        });

        await newSong.save();
        importedSongs.push({
          title: track.name,
          artists: track.artists.map((a: any) => a.name).join(", "),
          album: track.album?.name,
        });
        console.log(`  ✅ Import: ${track.name}`);
      } catch (error: any) {
        console.error(`  ❌ Lỗi: ${track.name}`, error.message);
        errors.push({ track: track.name, error: error.message });
      }
    }

    // Nếu yêu cầu lấy thêm từ albums
    if (includeAlbums) {
      console.log(`📀 Đang lấy bài hát từ albums...`);
      const albums = await spotifyService.getArtistAlbums(spotifyArtist.id, 5);

      for (const album of albums) {
        try {
          const albumTracks = await spotifyService.getAlbumTracks(album.id);

          for (const track of albumTracks) {
            try {
              const existingSong = await Song.findOne({
                title: track.name,
                artist: { $in: [artist._id.toString()] },
                deleted: false,
              });

              if (existingSong) {
                skippedSongs.push(track.name);
                continue;
              }

              // Lấy chi tiết track để có đầy đủ thông tin
              const trackDetails = await spotifyService.getTrackDetails(
                track.id
              );

              const artistIds = [];
              for (const trackArtist of trackDetails.artists) {
                let collabArtist = await Artist.findOne({
                  fullName: trackArtist.name,
                  deleted: false,
                });

                if (!collabArtist) {
                  const collabDetails = await spotifyService.getArtistDetails(
                    trackArtist.id
                  );
                  collabArtist = new Artist({
                    fullName: trackArtist.name,
                    country: "International",
                    coverImage: collabDetails.images[0]?.url || "",
                    status: "active",
                  });
                  await collabArtist.save();
                }
                artistIds.push(collabArtist._id.toString());
              }

              const newSong = new Song({
                title: track.name,
                artist: artistIds,
                album: album.name,
                topic: [topic._id.toString()],
                fileUrl:
                  trackDetails.preview_url || trackDetails.external_urls.spotify,
                coverImage: album.images[0]?.url || "",
                lyrics: "",
                description: `Album: ${album.name}. Release: ${album.release_date}`,
                status: "active",
              });

              await newSong.save();
              importedSongs.push({
                title: track.name,
                artists: trackDetails.artists.map((a: any) => a.name).join(", "),
                album: album.name,
              });
              console.log(`  ✅ Import: ${track.name}`);
            } catch (error: any) {
              console.error(`  ❌ Lỗi: ${track.name}`, error.message);
            }
          }
        } catch (error: any) {
          console.error(`  ❌ Lỗi album: ${album.name}`, error.message);
        }
      }
    }

    console.log(
      `\n✨ Hoàn thành! Import: ${importedSongs.length}, Bỏ qua: ${skippedSongs.length}`
    );

    res.json({
      success: true,
      message: `Import thành công ${importedSongs.length} bài hát của ${spotifyArtist.name}. Bỏ qua ${skippedSongs.length} bài trùng.`,
      artist: {
        name: spotifyArtist.name,
        genre: topicName,
        followers: artistDetails.followers?.total || 0,
      },
      imported: importedSongs,
      skipped: skippedSongs,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error: any) {
    console.error("❌ Lỗi:", error.message);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

export const importMultipleArtists = async (req: Request, res: Response) => {
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

        const spotifyArtist = await spotifyService.searchArtist(artistName);

        if (!spotifyArtist) {
          console.log(`❌ Không tìm thấy: ${artistName}`);
          results.push({
            artist: artistName,
            success: false,
            message: "Not found",
          });
          continue;
        }

        const artistDetails = await spotifyService.getArtistDetails(
          spotifyArtist.id
        );

        let artist = await Artist.findOne({
          fullName: spotifyArtist.name,
          deleted: false,
        });

        if (!artist) {
          artist = new Artist({
            fullName: spotifyArtist.name,
            country: "International",
            coverImage: spotifyArtist.images[0]?.url || "",
            status: "active",
          });
          await artist.save();
        }

        const topicName = spotifyService.mapGenreToTopic(
          artistDetails.genres || []
        );
        let topic = await Topic.findOne({
          title: topicName,
          deleted: false,
        });

        if (!topic) {
          topic = new Topic({
            title: topicName,
            imgTopic: spotifyArtist.images[0]?.url || "https://via.placeholder.com/300",
            content: `Thể loại ${topicName}`,
          });
          await topic.save();
        }

        const topTracks = await spotifyService.getArtistTopTracks(
          spotifyArtist.id
        );
        let importCount = 0;

        for (const track of topTracks) {
          try {
            const existingSong = await Song.findOne({
              title: track.name,
              artist: { $in: [artist._id.toString()] },
              deleted: false,
            });

            if (existingSong) continue;

            const artistIds = [];
            for (const trackArtist of track.artists) {
              let collabArtist = await Artist.findOne({
                fullName: trackArtist.name,
                deleted: false,
              });

              if (!collabArtist) {
                const collabDetails = await spotifyService.getArtistDetails(
                  trackArtist.id
                );
                collabArtist = new Artist({
                  fullName: trackArtist.name,
                  country: "International",
                  coverImage: collabDetails.images[0]?.url || "",
                  status: "active",
                });
                await collabArtist.save();
              }
              artistIds.push(collabArtist._id.toString());
            }

            const newSong = new Song({
              title: track.name,
              artist: artistIds,
              album: track.album?.name || "Single",
              topic: [topic._id.toString()],
              fileUrl: track.preview_url || track.external_urls.spotify,
              coverImage: track.album?.images[0]?.url || "",
              lyrics: "",
              description: `Album: ${track.album?.name}. Release: ${track.album?.release_date}`,
              status: "active",
            });

            await newSong.save();
            importCount++;
          } catch (error) {
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
      } catch (error: any) {
        console.error(`❌ Lỗi nghệ sĩ: ${artistName}`, error.message);
        results.push({
          artist: artistName,
          success: false,
          error: error.message,
        });
      }
    }

    const totalImported = results.reduce(
      (sum, r) => sum + (r.imported || 0),
      0
    );

    res.json({
      success: true,
      message: `Đã import ${totalImported} bài hát từ ${results.filter((r) => r.success).length}/${artists.length} nghệ sĩ`,
      results,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};
