import Medicine from '../models/Medicine.js';
import Alert from '../models/Alert.js';
import { sendMedicineAvailabilityAlert } from '../services/emailService.js';
import { distanceKm } from '../utils/geo.js';
import { formatPharmacy } from '../utils/formatPharmacy.js';

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

const withDistance = (pharmacy, lat, lng) => {
  const doc = pharmacy.toObject ? pharmacy.toObject({ virtuals: true }) : { ...pharmacy };
  const plat = doc.location?.latitude ?? doc.latitude;
  const plng = doc.location?.longitude ?? doc.longitude;
  const extra = {};
  if (typeof plat === 'number' && typeof plng === 'number') {
    extra.distanceKm = Math.round(distanceKm(lat, lng, plat, plng) * 10) / 10;
    extra.coordinates = { lat: plat, lng: plng };
  }
  return formatPharmacy(doc, extra);
};

const sortNearest = (pharmacies) =>
  pharmacies.sort((a, b) => {
    if (a.distanceKm == null) return 1;
    if (b.distanceKm == null) return -1;
    return a.distanceKm - b.distanceKm;
  });

export const listMedicines = async (req, res, next) => {
  try {
    const { search = '', category, availability, sort = 'name' } = req.query;
    const { lat, lng, valid: hasCoords } = parseCoordinates(req.query);
    const query = {};
    if (search) query.$or = [{ name: new RegExp(search, 'i') }, { genericName: new RegExp(search, 'i') }, { manufacturer: new RegExp(search, 'i') }];
    if (category) query.category = category;
    if (availability) query.availability = availability;
    const allowed = new Set(['name', 'createdAt', 'category', 'availability']);
    const field = String(sort).replace(/^-/, '');
    const sortKey = allowed.has(field)
      ? { [field]: String(sort).startsWith('-') ? -1 : 1 }
      : { name: 1 };
    const medicineDocs = await Medicine.find(query)
      .populate('pharmacies', 'name address city state phone email rating location openHours isVerified image logo')
      .sort(sortKey);
    const medicines = medicineDocs.map((medicineDoc) => {
      const medicine = medicineDoc.toObject({ virtuals: true });
      medicine.pharmacies = (medicine.pharmacies || []).map((pharmacy) => {
        if (!hasCoords) return formatPharmacy(pharmacy);
        return withDistance(pharmacy, lat, lng);
      });
      if (hasCoords) medicine.pharmacies = sortNearest(medicine.pharmacies);
      return medicine;
    });
    res.json({ medicines });
  } catch (error) {
    next(error);
  }
};

export const suggestMedicines = async (req, res, next) => {
  try {
    const search = String(req.query.search || '').trim();
    if (search.length < 2) return res.json({ suggestions: [] });
    const matcher = new RegExp(search, 'i');
    const medicines = await Medicine.find({
      $or: [{ name: matcher }, { genericName: matcher }, { manufacturer: matcher }],
    })
      .select('name genericName manufacturer availability image pharmacies')
      .limit(8)
      .lean();
    const suggestions = medicines.map((medicine) => ({
      _id: medicine._id,
      label: medicine.name,
      genericName: medicine.genericName,
      manufacturer: medicine.manufacturer,
      availability: medicine.availability,
      image: medicine.image,
      pharmacyCount: medicine.pharmacies?.length || 0,
    }));
    res.json({ suggestions });
  } catch (error) {
    next(error);
  }
};

export const getMedicine = async (req, res, next) => {
  try {
    const medicineDoc = await Medicine.findById(req.params.id).populate(
      'pharmacies',
      'name address city state rating openHours location phone email availableMedicines isVerified image logo'
    );
    if (!medicineDoc) return res.status(404).json({ message: 'Medicine not found' });

    const medicine = medicineDoc.toObject({ virtuals: true });
    const { lat: userLat, lng: userLng, valid: hasCoords } = parseCoordinates(req.query);

    medicine.pharmacies = (medicine.pharmacies || [])
      .map((pharmacy) => (hasCoords ? withDistance(pharmacy, userLat, userLng) : formatPharmacy(pharmacy)));
    if (hasCoords) medicine.pharmacies = sortNearest(medicine.pharmacies);

    const related = await Medicine.find({ category: medicine.category, _id: { $ne: medicine._id } }).limit(8);
    res.json({ medicine, related });
  } catch (error) {
    next(error);
  }
};

export const createMedicine = async (req, res, next) => {
  try {
    const medicine = await Medicine.create(req.body);
    res.status(201).json({ medicine });
  } catch (error) {
    next(error);
  }
};

export const updateMedicine = async (req, res, next) => {
  try {
    const medicine = await Medicine.findById(req.params.id);
    if (!medicine) return res.status(404).json({ message: 'Medicine not found' });

    const oldAvailability = medicine.availability;
    
    // Apply updates
    Object.assign(medicine, req.body);
    await medicine.save();

    // Trigger alerts if transition occurred
    if (medicine.availability === 'available' && oldAvailability !== 'available') {
      try {
        await medicine.populate('pharmacies');
        const activeAlerts = await Alert.find({ medicine: medicine._id, enabled: true }).populate('user');
        
        const pharmacy = medicine.pharmacies?.[0];
        if (!pharmacy) {
          console.warn(`[Medicine] No pharmacy linked for alert on ${medicine.name}`);
        }

        for (const alert of activeAlerts) {
          if (alert.user && alert.user.email && pharmacy) {
            sendMedicineAvailabilityAlert(alert.user, medicine, pharmacy)
              .catch((err) => console.error('[Medicine] Alert email delivery failed:', err.message));
            
            // Log history in database
            alert.history.push({
              message: `Stock detected as available at ${pharmacy.name}. Email notification dispatched.`,
            });
            alert.status = 'triggered';
            await alert.save();
          }
        }
      } catch (alertError) {
        console.error('Failed to trigger medicine availability alerts:', alertError);
      }
    }

    res.json({ medicine });
  } catch (error) {
    next(error);
  }
};

export const deleteMedicine = async (req, res, next) => {
  try {
    await Medicine.findByIdAndDelete(req.params.id);
    res.json({ message: 'Medicine deleted' });
  } catch (error) {
    next(error);
  }
};
