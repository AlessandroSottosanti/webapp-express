import express from "express";
import releaseYearController from "../controllers/releaseYearController.js";

const router = express.Router();

// INDEX
router.get("/", releaseYearController.index);



export default router;