require('dotenv').config();
const express = require('express');
const cors = require('cors');
const platesRoutes = require('./routes/plates.routes');
const errorHandler = require('./middlewares/errorHandler');

// App de Express SIN escuchar puerto: la reutilizan index.js (local) y lambda.js (AWS).
const app = express();

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => res.json({ status: 'ok' }));
app.use('/api/patentes', platesRoutes);

// Manejo centralizado de errores (al final)
app.use(errorHandler);

module.exports = app;
