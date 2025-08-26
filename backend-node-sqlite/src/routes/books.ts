/**
 * routes/books.ts
 * Enthält CRUD-Routen für Bücher inkl. Suche und Filter.
 */
import { Router } from 'express';
import { initDB } from '../db';

const router = Router();

router.get('/', async (req, res) => {
  const db = await initDB();
  const { q, dateFrom, dateTo } = req.query;
  let query = 'SELECT * FROM books WHERE 1=1';
  const params: any[] = [];

  if (q) {
    query += ' AND title LIKE ?';
    params.push(`%${q}%`);
  }
  if (dateFrom) {
    query += ' AND date(createdAt) >= date(?)';
    params.push(dateFrom);
  }
  if (dateTo) {
    query += ' AND date(createdAt) <= date(?)';
    params.push(dateTo);
  }

  const books = await db.all(query, params);
  res.json(books);
});

router.get('/:id', async (req, res) => {
  const db = await initDB();
  const book = await db.get('SELECT * FROM books WHERE id = ?', req.params.id);
  if (!book) return res.status(404).send('Not found');
  res.json(book);
});

router.post('/', async (req, res) => {
  const db = await initDB();
  const { title, author, createdBy } = req.body;
  if (!title || !author) return res.status(400).send('Missing fields');
  const result = await db.run(
    'INSERT INTO books (title, author, createdAt, createdBy) VALUES (?, ?, ?, ?)',
    [title, author, new Date().toISOString(), createdBy || 'Unknown']
  );
  res.json({ id: result.lastID });
});

router.put('/:id', async (req, res) => {
  const db = await initDB();
  const { title, author, createdBy } = req.body;
  await db.run(
    'UPDATE books SET title = ?, author = ?, createdBy = ? WHERE id = ?',
    [title, author, createdBy, req.params.id]
  );
  res.sendStatus(204);
});

router.delete('/:id', async (req, res) => {
  const db = await initDB();
  await db.run('DELETE FROM books WHERE id = ?', req.params.id);
  res.sendStatus(204);
});

export default router;
