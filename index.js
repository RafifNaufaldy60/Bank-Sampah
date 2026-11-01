const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { xss } = require('express-xss-sanitizer');
const path = require('path');


const apiRoutes = require('./routes/api');

const app = express();


app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(xss());


app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


app.use('/api', apiRoutes);


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server berjalan di http://localhost:${PORT}`);
});