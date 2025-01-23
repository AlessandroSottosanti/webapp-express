import express from "express";
import mysql from "mysql2";

const app = express(); // Inizializza l'app Express

const PORT = 3000; // Porta su cui il server ascolterà

// Definisci una rotta di base
app.get('/', (req, res) => {
    res.send('Benvenuto in Express!');
});

// Avvia il server
app.listen(PORT, () => {
    console.log(`Server in ascolto su http://localhost:${PORT}`);
});
