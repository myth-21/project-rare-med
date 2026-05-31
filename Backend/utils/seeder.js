import 'dotenv/config';
import connectDB from '../config/db.js';
import { seedDatabase } from './seedDatabase.js';
import log from './logger.js';

const run = async () => {
  const result = await connectDB();
  if (!result.connected) {
    log.error('Cannot seed — MongoDB not connected');
    process.exit(1);
  }
  const seedResult = await seedDatabase({ clear: true });
  log.info('Rare Med seed complete:', seedResult);
  log.info('Login: user@raremed.com / User@123');
  process.exit(0);
};

run().catch((error) => {
  log.error(error);
  process.exit(1);
});
