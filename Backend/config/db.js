import mongoose from 'mongoose';
import log from '../utils/logger.js';

const LOCAL_FALLBACK = 'mongodb://127.0.0.1:27017/raremed';

let connectedUri = null;
let reconnectPromise = null;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const maskMongoUri = (uri = '') =>
  uri.replace(/\/\/([^:]+):([^@]+)@/, '//$1:***@');

const tryConnect = async (uri) => {
  await mongoose.connect(uri, {
    serverSelectionTimeoutMS: Number(process.env.DB_SERVER_SELECTION_TIMEOUT_MS) || 5000,
    socketTimeoutMS: 45000,
  });
  connectedUri = uri;
  log.info(`[DB] MongoDB connected db=${mongoose.connection.name} uri=${maskMongoUri(uri)}`);
  return true;
};

const connectDB = async () => {
  if (mongoose.connection.readyState === 1) {
    return { connected: true, uri: connectedUri };
  }

  const shouldUseLocalFallback =
    process.env.NODE_ENV !== 'production' &&
    process.env.DISABLE_LOCAL_DB_FALLBACK !== 'true';

  const candidates = [
    process.env.MONGO_URI,
    process.env.MONGODB_URI,
    shouldUseLocalFallback ? LOCAL_FALLBACK : null,
  ].filter((uri, index, arr) => uri && arr.indexOf(uri) === index);

  const errors = [];
  const attempts =
    Number(process.env.DB_CONNECT_RETRIES) ||
    (process.env.NODE_ENV === 'production' ? 1 : 2);

  for (const uri of candidates) {
    for (let attempt = 1; attempt <= attempts; attempt++) {
      try {
        if (mongoose.connection.readyState !== 0) {
          await mongoose.disconnect();
        }
        await tryConnect(uri);
        return { connected: true, uri };
      } catch (error) {
        const msg = `${maskMongoUri(uri)} (attempt ${attempt}): ${error.message}`;
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

export const reconnectDB = async () => {
  if (isDbConnected()) {
    return { connected: true, uri: connectedUri };
  }

  if (!reconnectPromise) {
    reconnectPromise = connectDB().finally(() => {
      reconnectPromise = null;
    });
  }

  return reconnectPromise;
};

export default connectDB;
