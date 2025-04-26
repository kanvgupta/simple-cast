/**
 * ChainView API Server
 */
require('dotenv').config();
const express = require('express');
const path = require('path');
const helmet = require('helmet');

// Create Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../public')));

// Routes
const viewRoutes = require('./routes/view');
const commandRoutes = require('./routes/commands');
const collectionRoutes = require('./routes/collections');

// API Routes
app.use('/api/commands', commandRoutes);
app.use('/api/collections', collectionRoutes);
app.use('/api', viewRoutes);

// Home route - serves the landing page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Start server
app.listen(PORT, () => {
    console.log(`ChainView server running on port ${PORT}`);
}); 