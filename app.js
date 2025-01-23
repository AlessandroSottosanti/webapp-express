import express from "express";
import moviesRouter from "./routers/movies.js";
import notFoundPage from './middlewares/notFoundRoute.js';
import handleError from "./middlewares/handleError.js";


const app = express(); // Inizializza l'app Express

const port = process.env.SERVER_PORT; // Porta su cui il server ascolterà

// Definisci una rotta di base
app.use("/movies", moviesRouter);

app.use(notFoundPage.notFoundRoute);
app.use(handleError);

app.use(express.static("public"));
// Avvia il server
app.listen(port, () => {
    console.log(`Server in ascolto su http://localhost:${port}`);
});
