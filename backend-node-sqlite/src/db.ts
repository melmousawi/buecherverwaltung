/**
 * db.ts
 * Initialisiert SQLite-Datenbank und legt die Tabelle 'books' an.
 * Enthält Seed-Daten für die Demo.
 */
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';


// Async-Funktion zum Öffnen der DB
export async function initDB() {
  const db = await open({
    filename: './books.db',
    driver: sqlite3.Database
  });

  // Tabelle erstellen, falls nicht existiert
  await db.exec(`
    CREATE TABLE IF NOT EXISTS books (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      author TEXT NOT NULL,
      createdAt TEXT NOT NULL,
      createdBy TEXT NOT NULL
    )
  `);
  

  const now = new Date();

  // Heute
  const heute = new Date(now);

  // Gestern
  const gestern = new Date(now);
  gestern.setDate(gestern.getDate() - 1);

  // Vorgestern
  const vorgestern = new Date(now);
  vorgestern.setDate(vorgestern.getDate() - 2);

  // Letzte Woche
  const letzteWoche = new Date(now);
  letzteWoche.setDate(letzteWoche.getDate() - 7);

  // Älteres Datum (z.B. 10.05.2025)
  const alt = new Date(2025, 4, 10, 13, 0);

   // Seed-Daten, falls leer
    const result = await db.get<{count: number}>('SELECT COUNT(*) as count FROM books');
    if ((result?.count ?? 0) === 0) {

  await db.run(
    'INSERT INTO books (title, author, createdAt, createdBy) VALUES (?, ?, ?, ?)',
    ['Buch Heute', 'Autor A', heute.toISOString(), 'System']
  );
  await db.run(
    'INSERT INTO books (title, author, createdAt, createdBy) VALUES (?, ?, ?, ?)',
    ['Buch Gestern', 'Autor B', gestern.toISOString(), 'System']
  );
  await db.run(
    'INSERT INTO books (title, author, createdAt, createdBy) VALUES (?, ?, ?, ?)',
    ['Buch Vorgestern', 'Autor C', vorgestern.toISOString(), 'System']
  );
  await db.run(
    'INSERT INTO books (title, author, createdAt, createdBy) VALUES (?, ?, ?, ?)',
    ['Buch Letzte Woche', 'Autor D', letzteWoche.toISOString(), 'System']
  );
  await db.run(
    'INSERT INTO books (title, author, createdAt, createdBy) VALUES (?, ?, ?, ?)',
    ['Buch Alt', 'Autor E', alt.toISOString(), 'System']
  );
}

  return db;
}




