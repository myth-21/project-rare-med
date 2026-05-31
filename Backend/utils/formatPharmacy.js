/** Normalize pharmacy document for API responses (flat lat/lng + medicines alias). */
export const formatPharmacy = (pharmacy, extra = {}) => {
  if (!pharmacy) return null;
  const doc = pharmacy.toObject ? pharmacy.toObject({ virtuals: true }) : { ...pharmacy };
  const lat = doc.location?.latitude ?? doc.latitude;
  const lng = doc.location?.longitude ?? doc.longitude;
  const meds = doc.availableMedicines || doc.medicines || [];

  return {
    ...doc,
    ...extra,
    latitude: lat,
    longitude: lng,
    location: doc.location || (lat != null && lng != null ? { latitude: lat, longitude: lng } : undefined),
    medicines: meds,
    logo: doc.logo || doc.image || '',
    medicineCount: meds.length,
  };
};

export const formatPharmacyList = (pharmacies, extra = {}) =>
  pharmacies.map((p) => formatPharmacy(p, typeof extra === 'function' ? extra(p) : extra));

export default formatPharmacy;
