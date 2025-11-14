import { Router } from "express";
import * as controller from "../../controllers/admin/import.controller.js";
const router = Router();
router.post("/artist", controller.importArtistFromSpotify);
router.post("/artists", controller.importMultipleArtists);
export const importRoutes = router;
