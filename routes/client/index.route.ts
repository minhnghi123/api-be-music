import musicRoute from "./music.route.js";
import homeRoute from "./home.route.js";
import playlistRoute from "./playlist.route.js";
import favoriteSongRoute from "./favoriteSong.route.js";
import authRoute from "./auth.route.js";
import topicRoute from "./topic.route.js";
import userRoute from "./user.route.js";
import artistRoute from "./artist.route.js";
import commentRoute from "./comment.route.js";
import { requireAuth } from "../../middlewares/client/auth.middleware.js";

const routeClient = (app: any) => {
  // Routes không cần bắt buộc auth
  app.use("/auth", authRoute);
  app.use("/music", musicRoute);
  app.use("/comments", commentRoute);

  // Áp dụng auth middleware cho các routes còn lại
  app.use(requireAuth);
  app.use("/", homeRoute);
  app.use("/favorite-songs", favoriteSongRoute);
  app.use("/playlist", playlistRoute);
  app.use("/topics", topicRoute);
  app.use("/user", userRoute);
  app.use("/artist", artistRoute);
};
export default routeClient;
