import movieController from "../controllers/movieController.js";
import express from "express";

const router = express.Router();

// INDEX
router.get("/", movieController.index);

router.get('/:slug', movieController.show);


export default router;