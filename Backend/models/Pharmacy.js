import mongoose from 'mongoose';

const pharmacySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    ownerUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    address: { type: String, required: true },
    city: { type: String, required: true, trim: true },
    state: { type: String, default: '' },
    location: {
      latitude: { type: Number, required: true },
      longitude: { type: Number, required: true },
    },
    image: { type: String, default: '' },
    logo: { type: String, default: '' },
    phone: { type: String, default: '' },
    email: { type: String, default: '' },
    openHours: { type: String, default: '9:00 AM - 9:00 PM' },
    availableMedicines: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Medicine' }],
    isVerified: { type: Boolean, default: false },
    rating: { type: Number, default: 4.2 },
  },
  { timestamps: true }
);

pharmacySchema.virtual('latitude').get(function getLat() {
  return this.location?.latitude;
});

pharmacySchema.virtual('longitude').get(function getLng() {
  return this.location?.longitude;
});

pharmacySchema.set('toJSON', { virtuals: true });
pharmacySchema.set('toObject', { virtuals: true });

pharmacySchema.index({ name: 'text', city: 'text', address: 'text' });

export default mongoose.model('Pharmacy', pharmacySchema);
