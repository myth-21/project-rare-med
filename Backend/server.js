import 'dotenv/config';
import { fileURLToPath } from 'url';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';

import connectDB, { isDbConnected } from './config/db.js';
import validateEnv from './config/validateEnv.js';

import authRoutes from './routes/authRoutes.js';
import medicineRoutes from './routes/medicineRoutes.js';
import pharmacyRoutes from './routes/pharmacyRoutes.js';
import reportRoutes from './routes/reportRoutes.js';
import alertRoutes from './routes/alertRoutes.js';
import adminRoutes from './routes/adminRoutes.js';

import errorHandler, { notFound } from './middleware/errorMiddleware.js';

import passport from 'passport';
import './config/passport.js';

import { ensureSeedData } from './utils/ensureSeed.js';

const app = express();

const normalizeOrigin = (origin = '') => origin.replace(/\/$/, '');
const allowedOrigins = [
  process.env.CLIENT_URL,
  process.env.FRONTEND_URL,
  process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null,
  'http://localhost:5173',
  'http://127.0.0.1:5173',
]
  .filter(Boolean)
  .map(normalizeOrigin);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.length === 0 || allowedOrigins.includes(normalizeOrigin(origin))) {
        return callback(null, true);
      }
      return callback(new Error(`CORS blocked origin: ${origin}`));
    },
    credentials: true,
  })
);
app.use(express.json({ limit: '10mb' }));
app.use('/uploads', express.static('public/uploads'));
app.use(passport.initialize());

app.get('/api/health', (req, res) => {
  res.json({
    ok: isDbConnected(),
    app: 'Rare Med',
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/medicines', medicineRoutes);
app.use('/api/pharmacies', pharmacyRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/admin', adminRoutes);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const isDirectRun =
  process.argv[1] &&
  fileURLToPath(import.meta.url) === process.argv[1];

const initializeDatabase = async () => {
  const dbResult = await connectDB();

  if (dbResult.connected) {
    await ensureSeedData();
    console.log('MongoDB connected');
  } else {
    console.warn('MongoDB connection failed - API is running with database-backed routes unavailable');
  }
};

const startServer = async () => {
  try {
    validateEnv();

    const server = app.listen(PORT, () => {
      console.log(`Rare Med API listening on port ${PORT}`);
    });

    server.on('error', (error) => {
      if (error.code === 'EADDRINUSE') {
        console.error(`Port ${PORT} is already in use`);
      } else {
        console.error(error.message);
      }
      process.exit(1);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('MongoDB disconnected');
    });

    initializeDatabase().catch((error) => {
      console.error(`MongoDB initialization failed: ${error.message}`);
    });
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
};

if (isDirectRun) {
  startServer();
}

export default app;
