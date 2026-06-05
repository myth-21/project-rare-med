import Pharmacy from '../models/Pharmacy.js';
import { formatPharmacy, formatPharmacyList } from '../utils/formatPharmacy.js';
import { distanceKm } from '../utils/geo.js';
import mongoose from 'mongoose';
import log from '../utils/logger.js';

const parseCoordinates = (query) => {
  const lat = Number.parseFloat(query.lat);
  const lng = Number.parseFloat(query.lng);
  const valid =
    Number.isFinite(lat) &&
    Number.isFinite(lng) &&
    lat >= -90 &&
    lat <= 90 &&
    lng >= -180 &&
    lng <= 180;
  return { lat, lng, valid };
};

const pharmacyDistanceExtra = (lat, lng) => (pharmacy) => {
  const plat = pharmacy.latitude ?? pharmacy.location?.latitude;
  const plng = pharmacy.longitude ?? pharmacy.location?.longitude;
  if (typeof plat !== 'number' || typeof plng !== 'number') return { distanceKm: null };
  return {
    distanceKm: Math.round(distanceKm(lat, lng, plat, plng) * 10) / 10,
    coordinates: { lat: plat, lng: plng },
  };
};

const sortNearest = (pharmacies) =>
  pharmacies.sort((a, b) => {
    if (a.distanceKm == null) return 1;
    if (b.distanceKm == null) return -1;
    return a.distanceKm - b.distanceKm;
  });

export const listPharmacies = async (req, res, next) => {
  try {
    const { search = '', city, rare, lat, lng, sort } = req.query;
    const query = {};
    if (search) query.$or = [{ name: new RegExp(search, 'i') }, { address: new RegExp(search, 'i') }];
    if (city) query.city = new RegExp(city, 'i');
    if (rare === 'true') query.availableMedicines = { $exists: true, $not: { $size: 0 } };

    const rows = await Pharmacy.find(query)
      .populate('availableMedicines', 'name genericName availability category manufacturer image')
      .lean();

    const { lat: userLat, lng: userLng, valid: hasCoords } = parseCoordinates({ lat, lng });

    let pharmacies = formatPharmacyList(rows, (p) => {
      if (!hasCoords) return {};
      return pharmacyDistanceExtra(userLat, userLng)(p);
    });

    if (hasCoords && (sort === 'distance' || !sort)) {
      pharmacies = sortNearest(pharmacies);
    } else {
      pharmacies = pharmacies.sort((a, b) => `${a.city}${a.name}`.localeCompare(`${b.city}${b.name}`));
    }

    res.json({
      pharmacies,
      userLocation: hasCoords ? { latitude: userLat, longitude: userLng } : null,
    });
  } catch (error) {
    next(error);
  }
};

export const nearbyPharmacies = async (req, res, next) => {
  try {
    const { lat, lng, valid } = parseCoordinates(req.query);
    if (!valid) {
      log.warn(`[Pharmacy][Nearby] Invalid coordinates lat=${req.query.lat || '(missing)'} lng=${req.query.lng || '(missing)'}`);
      return res.status(400).json({ message: 'Valid latitude and longitude are required' });
    }

    const rows = await Pharmacy.find({})
      .populate('availableMedicines', 'name genericName availability category manufacturer image')
      .lean();

    const pharmacies = sortNearest(formatPharmacyList(rows, pharmacyDistanceExtra(lat, lng)));
    log.info(`[Pharmacy][Nearby] Returned ${pharmacies.length} pharmacies for lat=${lat} lng=${lng}`);

    res.json({
      pharmacies,
      userLocation: { latitude: lat, longitude: lng },
    });
  } catch (error) {
    log.error(`[Pharmacy][Nearby] Failed message=${error.message}`);
    next(error);
  }
};

export const getPharmacy = async (req, res, next) => {
  try {
    const { lat, lng } = req.query;
    const pharmacy = await Pharmacy.findById(req.params.id).populate(
      'availableMedicines',
      'name genericName category availability manufacturer image'
    );
    if (!pharmacy) return res.status(404).json({ message: 'Pharmacy not found' });

    const userLat = parseFloat(lat);
    const userLng = parseFloat(lng);
    let extra = {};
    if (!Number.isNaN(userLat) && !Number.isNaN(userLng)) {
      const plat = pharmacy.location?.latitude;
      const plng = pharmacy.location?.longitude;
      if (typeof plat === 'number' && typeof plng === 'number') {
        extra.distanceKm = Math.round(distanceKm(userLat, userLng, plat, plng) * 10) / 10;
      }
    }

    res.json({ pharmacy: formatPharmacy(pharmacy, extra) });
  } catch (error) {
    next(error);
  }
};

export const createPharmacy = async (req, res, next) => {
  try {
    const ownerUser = mongoose.Types.ObjectId.isValid(req.user?._id) ? req.user._id : undefined;
    const pharmacy = await Pharmacy.create({ ...req.body, ownerUser });
    res.status(201).json({ pharmacy: formatPharmacy(pharmacy) });
  } catch (error) {
    next(error);
  }
};

export const updatePharmacy = async (req, res, next) => {
  try {
    const pharmacy = await Pharmacy.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!pharmacy) return res.status(404).json({ message: 'Pharmacy not found' });
    res.json({ pharmacy: formatPharmacy(pharmacy) });
  } catch (error) {
    next(error);
  }
};

export const deletePharmacy = async (req, res, next) => {
  try {
    await Pharmacy.findByIdAndDelete(req.params.id);
    res.json({ message: 'Pharmacy deleted' });
  } catch (error) {
    next(error);
  }
};
