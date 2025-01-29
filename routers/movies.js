import movieController from "../controllers/movieController.js";
import express from "express";
import upload from "../middlewares/fileUpload.js";

const router = express.Router();

// INDEX
router.get("/", movieController.index);

// SHOW
router.get('/:slug', movieController.show);

// SALVATAGGIO FILM
router.post(`/`, upload.single("image"), movieController.store);

// SALVATAGGIO RECENSIONE
router.post(`/:id`, movieController.storeReview);


export default router;