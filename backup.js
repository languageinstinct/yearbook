const fs = require('fs');
const path = require('path');

const COMMENTS_FILE = path.join(__dirname, 'public', 'comments.html');
const BACKUP_FOLDER = path.join(__dirname, 'backups');

// Ensure backups folder exists
if (!fs.existsSync(BACKUP_FOLDER)) {
    fs.mkdirSync(BACKUP_FOLDER);
}

// Create a timestamped backup
const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
const backupFile = path.join(BACKUP_FOLDER, `comments-${timestamp}.html`);

fs.copyFileSync(COMMENTS_FILE, backupFile);

console.log(`✅ Backup created: ${backupFile}`);
