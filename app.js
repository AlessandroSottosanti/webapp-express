import express from "express";
import moviesRouter from "./routers/movies.js"

const app = express(); // Inizializza l'app Express

const port = process.env.SERVER_PORT; // Porta su cui il server ascolterà

// Definisci una rotta di base
app.use("/movies", moviesRouter);

app.use(express.static("public"));
// Avvia il server
app.listen(port, () => {
    console.log(`Server in ascolto su http://localhost:${port}`);
});
