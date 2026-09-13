// Vercel Serverless Function Entry Point
process.env.VERCEL = '1';
const connectDB = require('../backend/config/db');
const app = require('../backend/server');

module.exports = async (req, res) => {
  await connectDB();
  return app(req, res);
};
