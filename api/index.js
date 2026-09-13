// Vercel Serverless Function Entry Point
process.env.VERCEL = '1';
const connectDB = require('../backend/config/db');
const app = require('../backend/server');

module.exports = async (req, res) => {
  try {
    await connectDB();
  } catch (err) {
    return res.status(500).json({
      ok: false,
      msg: `Database connection error: ${err.message}`,
      hint: 'Please check MONGO_URI in your Vercel Project Settings > Environment Variables'
    });
  }
  return app(req, res);
};
