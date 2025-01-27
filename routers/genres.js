import genreController from "../controllers/genreController.js";
import express from "express";

const router = express.Router();

// INDEX
router.get("/", genreController.index);



export default router;