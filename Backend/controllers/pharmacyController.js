import asyncHandler from 'express-async-handler';
import Pharmacy from '../models/Pharmacy.js';
import { distanceKm } from '../utils/geo.js';

// GET /api/pharmacies - List pharmacies with optional geolocation filtering
export const listPharmacies = asyncHandler(async (req, res) => {
  const { search, city, lat, lng, sort = 'distance' } = req.query;

  let query = {};

  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { address: { $regex: search, $options: 'i' } },
      { city: { $regex: search, $options: 'i' } },
    ];
  }

  if (city) {
    query.city = { $regex: city, $options: 'i' };
  }

  let pharmacies = await Pharmacy.find(query).limit(100);

  // Calculate distances if coordinates provided
  if (lat && lng) {
    pharmacies = pharmacies.map((pharmacy) => {
      const distance = distanceKm(
        parseFloat(lat),
        parseFloat(lng),
        pharmacy.latitude,
        pharmacy.longitude
      );
      return { ...pharmacy.toObject(), distanceKm: parseFloat(distance.toFixed(2)) };
    });

    // Sort by distance if requested
    if (sort === 'distance') {
      pharmacies.sort((a, b) => a.distanceKm - b.distanceKm);
    }
  }

  res.json(pharmacies);
});

// GET /api/pharmacies/nearby - Get nearby pharmacies (within radius)
export const nearbyPharmacies = asyncHandler(async (req, res) => {
  const { lat, lng, radius = 15 } = req.query;

  if (!lat || !lng) {
    return res.status(400).json({ message: 'Latitude and longitude are required' });
  }

  const userLat = parseFloat(lat);
  const userLng = parseFloat(lng);
  const radiusKm = parseFloat(radius);

  // Get all pharmacies and calculate distance
  const pharmacies = await Pharmacy.find({});
  
  const nearbyPharmacies = pharmacies
    .map((pharmacy) => {
      const distance = distanceKm(userLat, userLng, pharmacy.latitude, pharmacy.longitude);
      return { ...pharmacy.toObject(), distanceKm: parseFloat(distance.toFixed(2)) };
    })
    .filter((p) => p.distanceKm <= radiusKm)
    .sort((a, b) => a.distanceKm - b.distanceKm);

  res.json(nearbyPharmacies);
});

// GET /api/pharmacies/:id - Get pharmacy details
export const getPharmacy = asyncHandler(async (req, res) => {
  const pharmacy = await Pharmacy.findById(req.params.id);

  if (!pharmacy) {
    return res.status(404).json({ message: 'Pharmacy not found' });
  }

  res.json(pharmacy);
});

// POST /api/pharmacies - Create pharmacy (admin only)
export const createPharmacy = asyncHandler(async (req, res) => {
  const { name, address, city, state, latitude, longitude, phone, email } = req.body;

  if (!name || !address || !city || !latitude || !longitude) {
    return res.status(400).json({ message: 'Name, address, city, and coordinates are required' });
  }

  const pharmacy = await Pharmacy.create({
    name,
    address,
    city,
    state: state || '',
    latitude: parseFloat(latitude),
    longitude: parseFloat(longitude),
    phone: phone || '',
    email: email || '',
  });

  res.status(201).json(pharmacy);
});

// PUT /api/pharmacies/:id - Update pharmacy (admin only)
export const updatePharmacy = asyncHandler(async (req, res) => {
  const { name, address, city, state, latitude, longitude, phone, email } = req.body;

  const pharmacy = await Pharmacy.findByIdAndUpdate(
    req.params.id,
    {
      name,
      address,
      city,
      state,
      latitude: latitude ? parseFloat(latitude) : undefined,
      longitude: longitude ? parseFloat(longitude) : undefined,
      phone,
      email,
    },
    { new: true, runValidators: true }
  );

  if (!pharmacy) {
    return res.status(404).json({ message: 'Pharmacy not found' });
  }

  res.json(pharmacy);
});

// DELETE /api/pharmacies/:id - Delete pharmacy (admin only)
export const deletePharmacy = asyncHandler(async (req, res) => {
  const pharmacy = await Pharmacy.findByIdAndDelete(req.params.id);

  if (!pharmacy) {
    return res.status(404).json({ message: 'Pharmacy not found' });
  }

  res.json({ message: 'Pharmacy deleted successfully' });
});
