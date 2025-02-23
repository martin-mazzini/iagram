const express = require('express');
const cors = require('cors');
const itemRoutes = require('./routes/itemRoutes');
const path = require('path');

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/items', itemRoutes);
app.use(express.static(path.join(__dirname, '../../client/public')));

// Serve static files from React app in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static('../../client/build'));
}

module.exports = app; 