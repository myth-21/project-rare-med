import Medicine from '../models/Medicine.js';
import Pharmacy from '../models/Pharmacy.js';
import { seedDatabase, SEED_VERSION } from './seedDatabase.js';
import { isDbConnected } from '../config/db.js';
import log from './logger.js';

export async function ensureSeedData() {
  if (!isDbConnected()) {
    log.warn('[DB] Skipping seed — database not connected');
    return { seeded: false, skipped: true, reason: 'db_disconnected' };
  }

  try {
    const [medicineCount, pharmacyCount] = await Promise.all([
      Medicine.countDocuments(),
      Pharmacy.countDocuments(),
    ]);

    const sample = await Pharmacy.findOne().select('logo city').lean();
    const needsSeed =
      medicineCount === 0 ||
      pharmacyCount === 0 ||
      !sample?.logo ||
      pharmacyCount < 8;

    if (!needsSeed) {
      // log.info(`[DB] v${SEED_VERSION}: ${medicineCount} medicines, ${pharmacyCount} pharmacies`);
      return { seeded: false, medicineCount, pharmacyCount };
    }

    log.info(`[DB] Seeding catalog (v${SEED_VERSION})...`);
    const result = await seedDatabase({ clear: false, force: needsSeed });
    log.info(`[DB] Seed complete:`, result);
    return { seeded: true, ...result };
  } catch (error) {
    log.error('[DB] Seed failed:', error.message);
    return { seeded: false, error: error.message };
  }
}

export default ensureSeedData;
