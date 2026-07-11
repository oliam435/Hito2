// Punto de entrada para AWS Lambda: envuelve la app de Express con serverless-http.
// API Gateway invoca este handler en cada petición.
const serverless = require('serverless-http');
const app = require('./src/app');

module.exports.handler = serverless(app);
