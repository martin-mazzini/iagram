const express = require('express');
const cors = require('cors');
const aiRoutes = require('./routes/aiRoutes');
const userRoutes = require('./routes/userRoutes');
const postRoutes = require('./routes/postRoutes');
const jobRoutes = require('./routes/jobRoutes');
const path = require('path');
require('dotenv').config();


const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/ai', aiRoutes);
app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/jobs', jobRoutes);

// this might not be needed at all because
app.use(express.static(path.join(__dirname, '../../client/public')));

// Serve static files from React app in production (in development mode it's not needed because we have a proxy, namely webpack dev server)
if (process.env.NODE_ENV === 'production') {
  app.use(express.static('../../client/build'));
}

// Serve static files
app.use('/images', express.static(path.join(__dirname, '../public/images')));

module.exports = app; 