import Pharmacy from '../models/Pharmacy.js';
import Medicine from '../models/Medicine.js';

export const findNearbyPharmacies = async ({ latitude, longitude, medicineId, radiusMeters = 10000 }) => {
  const filter = {
    location: {
      $nearSphere: {
        $geometry: { type: 'Point', coordinates: [longitude, latitude] },
        $maxDistance: radiusMeters,
      },
    },
  };
  if (medicineId) {
    filter['availability.medicine'] = medicineId;
  }

  const pharmacies = await Pharmacy.find(filter)
    .populate('availability.medicine', 'name brand dosage')
    .sort({ name: 1 });

  if (!pharmacies.length) {
    return [];
  }
  return pharmacies;
};

export const getPharmacyDetails = async (pharmacyId) => {
  const pharmacy = await Pharmacy.findById(pharmacyId).populate('availability.medicine', 'name brand dosage');
  if (!pharmacy) {
    const error = new Error('Pharmacy not found');
    error.statusCode = 404;
    throw error;
  }
  return pharmacy;
};

export const createPharmacy = async (payload) => {
  const pharmacy = await Pharmacy.create(payload);
  return pharmacy;
};
