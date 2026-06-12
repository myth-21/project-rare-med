export const getPharmacyCoords = (pharmacy) => {
  const lat = pharmacy?.location?.latitude ?? pharmacy?.latitude ?? pharmacy?.coordinates?.lat;
  const lng = pharmacy?.location?.longitude ?? pharmacy?.longitude ?? pharmacy?.coordinates?.lng;
  if (typeof lat === 'number' && typeof lng === 'number') return { lat, lng };
  return null;
};

export const pharmacySearchQuery = (pharmacy = {}) =>
  [pharmacy.name, pharmacy.address, pharmacy.city, pharmacy.state].filter(Boolean).join(' ');

export const directionsUrl = (pharmacy) => {
  const position = getPharmacyCoords(pharmacy);
  if (position) return `https://www.google.com/maps/dir/?api=1&destination=${position.lat},${position.lng}`;
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(pharmacySearchQuery(pharmacy))}`;
};

export const openMapsUrl = (pharmacy) => {
  const position = getPharmacyCoords(pharmacy);
  const query = position ? `${position.lat},${position.lng}` : pharmacySearchQuery(pharmacy);
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
};
