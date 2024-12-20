const express = require('express');
const multer = require('multer');
const path = require('path');
const QuickDB = require('sandbox.db');
const bodyParser = require('body-parser');

const app = express();
const db = new QuickDB("./db/db.sqlite");

// Setup for uploaded files
const uploadDir = path.join(__dirname, 'uploads');
const upload = multer({ dest: uploadDir });

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));

// Home route (upload form)
app.get('/', (req, res) => {
    res.render('index', { success: false });
});

// Upload route
app.post('/upload', upload.single('file'), (req, res) => {
    const file = req.file;

    if (!file) return res.status(400).send('No file uploaded.');

    // Generate unique ID and save file metadata
    const fileId = Date.now().toString();
    db.set(fileId, {
        filename: file.originalname,
        path: file.path,
        size: file.size,
        uploadedAt: new Date().toISOString(),
    });

    res.render('index', { success: true, fileId });
});

// File Explorer route
app.get('/files', (req, res) => {
    const allEntries = db.all(); // Fetch all entries from the database
    const files = allEntries
        .filter((entry) => typeof entry.ID === 'string' || typeof entry.ID === 'number') // Validate IDs
        .map((entry) => ({
            id: entry.ID.toString(), // Convert to string if necessary
            filename: entry.data.filename,
            size: (entry.data.size / 1024).toFixed(2), // Size in KB
            uploadedAt: new Date(entry.data.uploadedAt).toLocaleString(),
        }));

    res.render('files', { files });
});

// API route to fetch file by ID
app.get('/download/:id', (req, res) => {
    const id = req.params.id.toString(); // Convert to string
    const file = db.get(id);

    if (!file) return res.status(404).send('File not found.');
    res.download(file.path, file.filename);
});

app.get('/api/file/:id', (req, res) => {
    const id = req.params.id.toString(); // Convert to string
    const file = db.get(id);

    if (!file) return res.status(404).json({ error: 'File not found.' });
    res.json({
        id,
        filename: file.filename,
        size: (file.size / 1024).toFixed(2), // Size in KB
        uploadedAt: new Date(file.uploadedAt).toISOString(),
    });
});

app.listen(3000, () => console.log('Server running on http://localhost:3000')); 