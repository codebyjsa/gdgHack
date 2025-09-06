// app.js
const express = require('express');
const cors = require('cors');
const app = express();
const usersRoutes = require('./routes/usersRoutes');

// Enable CORS for all routes
app.use(cors({
  origin: 'http://localhost:5173', // Allow requests from your React app
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Middleware
app.use(express.json());

// Routes
app.get('/', (req, res) => res.send('Hello World!'));


app.use('/api/users', usersRoutes);

// Export the configured app
module.exports = app;
