const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// ── Database ──────────────────────────────────────────────────────────────────
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

async function initDb() {
  const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
  await pool.query(schema);
  console.log('✅ Database ready');
}

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ── API Routes ────────────────────────────────────────────────────────────────

// Get full state: all items + assignments
app.get('/api/state', async (req, res) => {
  try {
    const [itemsResult, assignmentsResult] = await Promise.all([
      pool.query('SELECT name, category FROM items ORDER BY category, sort_order, name'),
      pool.query('SELECT item_name, family_name FROM assignments'),
    ]);

    const assignments = {};
    assignmentsResult.rows.forEach(r => {
      assignments[r.item_name] = r.family_name;
    });

    res.json({ items: itemsResult.rows, assignments });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'שגיאה בטעינת הנתונים' });
  }
});

// Assign an item to a family
app.post('/api/assign', async (req, res) => {
  const { item_name, family_name } = req.body;
  if (!item_name || !family_name) return res.status(400).json({ error: 'חסרים פרטים' });
  try {
    await pool.query(
      `INSERT INTO assignments (item_name, family_name)
       VALUES ($1, $2)
       ON CONFLICT (item_name) DO UPDATE SET family_name = $2, assigned_at = NOW()`,
      [item_name, family_name]
    );
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'שגיאה בשמירה' });
  }
});

// Unassign an item
app.delete('/api/assign/:item_name', async (req, res) => {
  try {
    await pool.query('DELETE FROM assignments WHERE item_name = $1', [
      decodeURIComponent(req.params.item_name),
    ]);
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'שגיאה במחיקה' });
  }
});

// Add a new item
app.post('/api/items', async (req, res) => {
  const { name, category } = req.body;
  if (!name || !category) return res.status(400).json({ error: 'חסרים פרטים' });
  try {
    await pool.query(
      'INSERT INTO items (name, category) VALUES ($1, $2) ON CONFLICT (name) DO NOTHING',
      [name.trim(), category.trim()]
    );
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'שגיאה בהוספת פריט' });
  }
});

// Rename an item
app.put('/api/items/:item_name', async (req, res) => {
  const oldName = decodeURIComponent(req.params.item_name);
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: 'חסר שם' });
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query('UPDATE items SET name = $1 WHERE name = $2', [name.trim(), oldName]);
    await client.query('UPDATE assignments SET item_name = $1 WHERE item_name = $2', [name.trim(), oldName]);
    await client.query('COMMIT');
    res.json({ ok: true });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ error: 'שגיאה בעדכון' });
  } finally {
    client.release();
  }
});

// Delete an item
app.delete('/api/items/:item_name', async (req, res) => {
  const name = decodeURIComponent(req.params.item_name);
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query('DELETE FROM assignments WHERE item_name = $1', [name]);
    await client.query('DELETE FROM items WHERE name = $1', [name]);
    await client.query('COMMIT');
    res.json({ ok: true });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ error: 'שגיאה במחיקה' });
  } finally {
    client.release();
  }
});

// ── Catch-all → serve index.html ─────────────────────────────────────────────
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ── Start ─────────────────────────────────────────────────────────────────────
initDb()
  .then(() => {
    app.listen(PORT, () => console.log(`🔥 BBQ Splitter running on port ${PORT}`));
  })
  .catch(err => {
    console.error('Failed to init DB:', err);
    process.exit(1);
  });
