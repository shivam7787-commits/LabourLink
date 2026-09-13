// Vercel Serverless Function Entry Point
process.env.VERCEL = '1';
const app = require('../backend/server');

module.exports = app;
