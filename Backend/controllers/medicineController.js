import asyncHandler from 'express-async-handler';
import Medicine from '../models/Medicine.js';

// GET /api/medicines - List medicines with filtering
export const listMedicines = asyncHandler(async (req, res) => {
  const { search, category, availability, sort = 'name', lat, lng } = req.query;

  let query = {};

  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { genericName: { $regex: search, $options: 'i' } },
      { manufacturer: { $regex: search, $options: 'i' } },
    ];
  }

  if (category) {
    query.category = category;
  }

  if (availability) {
    query.availability = availability;
  }

  const medicines = await Medicine.find(query).sort(sort === '-createdAt' ? { createdAt: -1 } : { name: 1 }).limit(100);

  res.json(medicines);
});

// GET /api/medicines/suggestions - Get medicine suggestions
export const suggestMedicines = asyncHandler(async (req, res) => {
  const { search } = req.query;

  if (!search || search.length < 2) {
    return res.json({ suggestions: [] });
  }

  const suggestions = await Medicine.find(
    {
      $or: [
        { name: { $regex: search, $options: 'i' } },
        { genericName: { $regex: search, $options: 'i' } },
        { manufacturer: { $regex: search, $options: 'i' } },
      ],
    },
    { name: 1, genericName: 1, manufacturer: 1 }
  )
    .limit(10);

  res.json({
    suggestions: suggestions.map((m) => ({
      _id: m._id,
      label: m.name,
      genericName: m.genericName,
      manufacturer: m.manufacturer,
    })),
  });
});

// GET /api/medicines/:id - Get medicine details
export const getMedicine = asyncHandler(async (req, res) => {
  const medicine = await Medicine.findById(req.params.id);

  if (!medicine) {
    return res.status(404).json({ message: 'Medicine not found' });
  }

  res.json(medicine);
});

// POST /api/medicines - Create medicine (admin only)
export const createMedicine = asyncHandler(async (req, res) => {
  const { name, genericName, manufacturer, category, description, availability } = req.body;

  if (!name || !genericName || !manufacturer) {
    return res.status(400).json({ message: 'Name, generic name, and manufacturer are required' });
  }

  const medicine = await Medicine.create({
    name,
    genericName,
    manufacturer,
    category: category || 'Other',
    description: description || '',
    availability: availability || 'available',
  });

  res.status(201).json(medicine);
});

// PUT /api/medicines/:id - Update medicine (admin only)
export const updateMedicine = asyncHandler(async (req, res) => {
  const { name, genericName, manufacturer, category, description, availability } = req.body;

  const medicine = await Medicine.findByIdAndUpdate(
    req.params.id,
    { name, genericName, manufacturer, category, description, availability },
    { new: true, runValidators: true }
  );

  if (!medicine) {
    return res.status(404).json({ message: 'Medicine not found' });
  }

  res.json(medicine);
});

// DELETE /api/medicines/:id - Delete medicine (admin only)
export const deleteMedicine = asyncHandler(async (req, res) => {
  const medicine = await Medicine.findByIdAndDelete(req.params.id);

  if (!medicine) {
    return res.status(404).json({ message: 'Medicine not found' });
  }

  res.json({ message: 'Medicine deleted successfully' });
});
