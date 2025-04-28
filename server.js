// server.js (splash wall version)

const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = 3000;

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('public'));

// File to store comments
const COMMENTS_FILE = path.join(__dirname, 'public', 'comments.html');

// Star colors
const colorClasses = ['star-color-blue', 'star-color-white', 'star-color-yellow', 'star-color-orange'];

// Create empty comments file if it doesn't exist
if (!fs.existsSync(COMMENTS_FILE)) {
    fs.writeFileSync(COMMENTS_FILE, '');
}

// Serve main page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Serve raw comments
app.get('/comments', (req, res) => {
    res.sendFile(COMMENTS_FILE);
});

// Handle new comment POST
app.post('/comment', (req, res) => {
    const message = req.body.message.trim();
    if (!message) {
        return res.status(400).send('Empty message.');
    }

    const timestamp = formatTimestamp(new Date());
    const currentComments = fs.readFileSync(COMMENTS_FILE, 'utf-8');
    const commentCount = (currentComments.match(/\*#(\d+)/g) || []).length + 1;

    const randomColorClass = colorClasses[Math.floor(Math.random() * colorClasses.length)];
    const randomTop = Math.floor(Math.random() * 1000); // random top position
    const randomLeft = Math.floor(Math.random() * 1600); // random left position

    const newComment = `
<div class="splash-comment" style="top:${randomTop}px; left:${randomLeft}px;">
    <span class="star-comment ${randomColorClass}">*#${commentCount} (${timestamp})<br>${escapeHtml(message)}</span>
</div>
`;

    // Prepend new comment at the top
    const updatedComments = newComment + currentComments;

    fs.writeFileSync(COMMENTS_FILE, updatedComments, 'utf-8');
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

// Format timestamp
function formatTimestamp(date) {
    let hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    if (hours === 0) hours = 12;

    const month = date.getMonth() + 1;
    const day = date.getDate();
    const year = date.getFullYear();

    return `${month}/${day}/${year} ${hours}:${minutes.toString().padStart(2, '0')}${ampm}`;
}

// Start server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
