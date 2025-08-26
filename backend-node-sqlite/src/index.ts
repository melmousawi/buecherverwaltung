/**
 * index.ts
 * Startet den Express-Server und bindet die Books-Routen ein.
 */
import express from 'express';
import cors from 'cors';
import booksRouter from './routes/books';

const app = express();

// CORS aktivieren, sonst blockiert der Browser Anfragen vom UI5-Frontend
app.use(cors());
app.use(express.json());

// Bücher-API unter /api/books
app.use('/api/books', booksRouter);

// Starten
const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Server läuft auf http://localhost:${PORT}`);
});

