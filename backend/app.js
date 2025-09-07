// app.js
const express = require('express');
const cors = require('cors');
const app = express();
const usersRoutes = require('./routes/usersRoutes');
const educatorsRoutes = require('./routes/educatorRoutes');
const studentRoutes = require('./routes/studentRoutes');
const courseRoutes = require('./routes/courseRoutes');
const courseContentRoutes = require('./routes/courseContentRoutes');

// Enable CORS for all routes
app.use((req, res, next) => {
  const allowedOrigins = ['http://localhost:5173', 'http://localhost:3000', 'http://localhost:8080'];
  const origin = req.headers.origin;
  
  if (allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
  }
  
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, x-access-token');
  res.header('Access-Control-Allow-Credentials', true);
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  
  next();
});

// Middleware
app.use(express.json());

// Routes
app.get('/', (req, res) => res.send('Hello World!'));


app.use('/api/users', usersRoutes);
app.use('/api/educators', educatorsRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/coursesContent', courseContentRoutes);

// Export the configured app
module.exports = app;
