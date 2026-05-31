import Alert from '../models/Alert.js';
import Medicine from '../models/Medicine.js';

export const listAlerts = async (req, res, next) => {
  try {
    const alerts = await Alert.find({ user: req.user._id }).populate('medicine', 'name availability category').sort('-createdAt');
    res.json({ alerts });
  } catch (error) {
    next(error);
  }
};

export const createAlert = async (req, res, next) => {
  try {
    const medicine = req.body.medicine ? await Medicine.findById(req.body.medicine) : null;
    const medicineName = req.body.medicineName || medicine?.name;
    if (!medicineName) return res.status(400).json({ message: 'Medicine is required for an alert' });
    const alert = await Alert.create({
      user: req.user._id,
      medicine: medicine?._id || req.body.medicine,
      medicineName,
      preferences: req.body.preferences,
      history: [{ message: `Alert created for ${medicineName} availability.` }],
    });
    res.status(201).json({ alert });
  } catch (error) {
    next(error);
  }
};

export const updateAlert = async (req, res, next) => {
  try {
    const alert = await Alert.findOneAndUpdate({ _id: req.params.id, user: req.user._id }, req.body, { new: true });
    if (!alert) return res.status(404).json({ message: 'Alert not found' });
    res.json({ alert });
  } catch (error) {
    next(error);
  }
};

export const deleteAlert = async (req, res, next) => {
  try {
    await Alert.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    res.json({ message: 'Alert deleted' });
  } catch (error) {
    next(error);
  }
};
