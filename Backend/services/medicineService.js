import Medicine from '../models/Medicine.js';

export const searchMedicines = async (query) => {
  const searchTerm = query ? query.trim() : '';
  const filter = searchTerm
    ? {
        $or: [
          { name: { $regex: searchTerm, $options: 'i' } },
          { description: { $regex: searchTerm, $options: 'i' } },
          { category: { $regex: searchTerm, $options: 'i' } },
          { brand: { $regex: searchTerm, $options: 'i' } },
          { tags: { $regex: searchTerm, $options: 'i' } },
        ],
      }
    : {};
  return Medicine.find(filter).sort({ name: 1 });
};
export const getMedicineById = async (medicineId) => {
  const medicine = await Medicine.findById(medicineId);
  if (!medicine) {
    const error = new Error('Medicine not found');
    error.statusCode = 404;
    throw error;
  }
  return medicine;
};
