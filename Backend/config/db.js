import mongoose from 'mongoose';
import log from '../utils/logger.js';

const LOCAL_FALLBACK = 'mongodb://127.0.0.1:27017/raremed';

let connectedUri = null;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const tryConnect = async (uri) => {
  await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 8000,
    socketTimeoutMS: 45000,
  });
  connectedUri = uri;
  // log.info(`MongoDB connected: ${uri.replace(/\/\/([^:]+):([^@]+)@/, '//$1:***@')}`);
  return true;
};

const connectDB = async () => {
  if (mongoose.connection.readyState === 1) {
    return { connected: true, uri: connectedUri };
  }

  const candidates = [
    process.env.MONGO_URI,
    process.env.MONGODB_URI,
    LOCAL_FALLBACK,
  ].filter((uri, index, arr) => uri && arr.indexOf(uri) === index);

  const errors = [];

  for (const uri of candidates) {
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        if (mongoose.connection.readyState !== 0) {
          await mongoose.disconnect();
        }
        await tryConnect(uri);
        return { connected: true, uri };
      } catch (error) {
        const msg = `${uri} (attempt ${attempt}): ${error.message}`;
        errors.push(msg);
        log.warn(`[DB] Connection failed — ${msg}`);
        await sleep(1000);
      }
    }
  }

  log.error('[DB] All MongoDB connection attempts failed:');
  errors.forEach((e) => log.error(`  - ${e}`));
  log.error('[DB] Start local MongoDB or fix MONGO_URI / Atlas network access.');

  return { connected: false, errors };
};

export const isDbConnected = () => mongoose.connection.readyState === 1;

export default connectDB;
