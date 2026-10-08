const express = require('express');
const app = express();
const path = require('path');
const fs = require('fs');

app.set('view engine', 'ejs');
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Extra Feature: Agar 'files' folder nahi hai, toh automatic bana dega (Crash se bachane ke liye)
const filesDir = path.join(__dirname, 'files');
if (!fs.existsSync(filesDir)) {
    fs.mkdirSync(filesDir);
}

// 1. HOME ROUTE 
app.get('/', (req, res) => {
    fs.readdir(filesDir, (err, files) => {
        if (err) return res.status(500).send("Error reading files.");
        res.render('index', { files: files });
    });
});

// 2. CREATE ROUTE 
app.post('/create', (req, res) => {
    // Title ke spaces hata kar usko clean filename banayenge
    const fileName = req.body.title.split(' ').join('') + '.txt';
    fs.writeFile(path.join(filesDir, fileName), req.body.details, (err) => {
        if (err) return res.status(500).send("Error creating file.");
        res.redirect('/');
    });
});

// 3. READ SPECIFIC NOTE ROUTE
app.get('/file/:filename', (req, res) => {
    fs.readFile(path.join(filesDir, req.params.filename), 'utf-8', (err, fileData) => {
        if (err) return res.status(500).send("Error reading file.");
        res.render('show', { filename: req.params.filename, fileData: fileData });
    });
});

// 4. EDIT PAGE ROUTE 
app.get('/edit/:filename', (req, res) => {
    res.render('edit', { filename: req.params.filename });
});

// 5. UPDATE ROUTE (Rename the file)
app.post('/edit', (req, res) => {
    const oldPath = path.join(filesDir, req.body.previousName);
    const newPath = path.join(filesDir, req.body.newName.split(' ').join('') + '.txt');
    
    fs.rename(oldPath, newPath, (err) => {
        if (err) return res.status(500).send("Error renaming file.");
        res.redirect('/');
    });
});

// 6. DELETE ROUTE
app.post('/delete/:filename', (req, res) => {
    fs.unlink(path.join(filesDir, req.params.filename), (err) => {
        if (err) return res.status(500).send("Error deleting file.");
        res.redirect('/');
    });
});

app.listen(3000, () => {
    console.log("Server is running perfectly on port 3000!");
});