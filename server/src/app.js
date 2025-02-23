const express = require('express');
const cors = require('cors');
const itemRoutes = require('./routes/itemRoutes');
const aiRoutes = require('./routes/aiRoutes');
const path = require('path');


const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/items', itemRoutes);
app.use('/api/ai', aiRoutes);

// this might not be needed at all because
app.use(express.static(path.join(__dirname, '../../client/public')));

// Serve static files from React app in production (in development mode it's not needed because we have a proxy, namely webpack dev server)
if (process.env.NODE_ENV === 'production') {
  app.use(express.static('../../client/build'));
}

module.exports = app; 