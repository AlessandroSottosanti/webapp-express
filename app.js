import express from "express";
import moviesRouter from "./routers/movies.js";
import genresRouter from "./routers/genres.js";
import releaseYearRouter from "./routers/releaseYear.js"
import notFoundPage from './middlewares/notFoundRoute.js';
import handleError from "./middlewares/handleError.js";
import cors from "cors";


const app = express(); // Inizializza l'app Express

const port = process.env.SERVER_PORT; // Porta su cui il server ascolterà

app.use(cors({
    origin: process.env.FRONTEND_URL,
}))

app.use(express.static("public"));

// Definisci una rotta di base
app.use("/movies", moviesRouter);

app.use("/genres", genresRouter);

app.use("/release-years", releaseYearRouter);


app.use(notFoundPage.notFoundRoute);
app.use(handleError);

// Avvia il server
app.listen(port, () => {
    console.log(`Server in ascolto su http://localhost:${port}`);
});
