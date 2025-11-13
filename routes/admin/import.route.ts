import { Router } from "express";
import * as controller from "../../controllers/admin/import.controller.js";

const router: Router = Router();

// Import nghệ sĩ và bài hát của nghệ sĩ đó
router.post("/artist", controller.importArtistFromSpotify);

// Import nhiều nghệ sĩ cùng lúc
router.post("/artists", controller.importMultipleArtists);

export const importRoutes: Router = router;
