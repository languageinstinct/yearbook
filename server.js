const express = require('express');
const { Pool } = require('pg');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('public'));

// PostgreSQL connection
const pool = new Pool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
    ssl: {
        rejectUnauthorized: false
    }
});

// Star colors
const colorClasses = ['star-color-blue', 'star-color-white', 'star-color-yellow', 'star-color-orange'];

// Ensure table exists
(async () => {
    await pool.query(`
        CREATE TABLE IF NOT EXISTS comments (
            id SERIAL PRIMARY KEY,
            message TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            color VARCHAR(50),
            pos_top INTEGER,
            pos_left INTEGER
        );
    `);
})();

// Serve main page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// API: Fetch all comments
app.get('/comments', async (req, res) => {
    const result = await pool.query('SELECT * FROM comments ORDER BY created_at DESC');
    res.json(result.rows);
});

// API: Save new comment
app.post('/comment', async (req, res) => {
    const message = req.body.message.trim();
    if (!message) return res.status(400).send('Empty message.');

    const randomColorClass = colorClasses[Math.floor(Math.random() * colorClasses.length)];
    const randomTop = Math.floor(Math.random() * 1000); // random top position
    const randomLeft = Math.floor(Math.random() * 1600); // random left position

    await pool.query(
        'INSERT INTO comments (message, color, pos_top, pos_left) VALUES ($1, $2, $3, $4)',
        [escapeHtml(message), randomColorClass, randomTop, randomLeft]
    );

    res.redirect('/');
});

// Escape HTML
function escapeHtml(text) {
    return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

// Start server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
