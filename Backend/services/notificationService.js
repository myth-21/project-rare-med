import Alert from '../models/Alert.js';
import Medicine from '../models/Medicine.js';
import Pharmacy from '../models/Pharmacy.js';

export const createAlert = async ({ userId, medicineId, threshold }) => {
  const medicine = await Medicine.findById(medicineId);
  if (!medicine) {
    const error = new Error('Medicine not found');
    error.statusCode = 404;
    throw error;
  }
  const alert = await Alert.create({ user: userId, medicine: medicineId, threshold });
  return alert;
};

export const getAlertsForUser = async (userId) => {
  return Alert.find({ user: userId, active: true }).populate('medicine', 'name brand dosage');
};

export const updateAlert = async (alertId, updates) => {
  const alert = await Alert.findById(alertId);
  if (!alert) {
    const error = new Error('Alert not found');
    error.statusCode = 404;
    throw error;
  }
  Object.assign(alert, updates);
  await alert.save();
  return alert;
};

export const deleteAlert = async (alertId, userId) => {
  const alert = await Alert.findOne({ _id: alertId, user: userId });
  if (!alert) {
    const error = new Error('Alert not found');
    error.statusCode = 404;
    throw error;
  }
  await alert.deleteOne();
  return { success: true };
};

export const notifyUsersForMedicine = async (medicineId, availableQuantity) => {
  const alerts = await Alert.find({ medicine: medicineId, active: true }).populate('user', 'email name');
  const notifications = alerts.filter((alert) => availableQuantity >= alert.threshold);
  return notifications.map((alert) => ({
    user: alert.user,
    medicineId: alert.medicine,
    threshold: alert.threshold,
    message: `Medicine available at threshold ${alert.threshold}`,
  }));
};
