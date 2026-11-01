const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { xss } = require('express-xss-sanitizer');
const path = require('path');

// Import gabungan rute (routes)
const apiRoutes = require('./routes/api');

const app = express();

// Middleware Security & General Setup
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(xss());

// Mengizinkan direktori uploads dibaca secara statis (agar foto tampil di URL)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Daftarkan base URL dengan awalan /api
app.use('/api', apiRoutes);

// Jalankan Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server berjalan di http://localhost:${PORT}`);
});