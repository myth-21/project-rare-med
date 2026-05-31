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

app.use(cors());
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

const startServer = async () => {
  try {
    validateEnv();

    const dbResult = await connectDB();

    if (dbResult.connected) {
      await ensureSeedData();
      console.log('MongoDB connected');
    } else {
      console.log('MongoDB connection failed');
    }

    const server = app.listen(PORT);

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
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
};

if (isDirectRun) {
  startServer();
}

export default app;