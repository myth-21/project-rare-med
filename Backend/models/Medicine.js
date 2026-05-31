import mongoose from 'mongoose';

const medicineSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    genericName: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    manufacturer: { type: String, default: '' },
    image: { type: String, default: '' },
    availability: {
      type: String,
      enum: ['available', 'limited', 'out_of_stock'],
      default: 'limited',
    },
    pharmacies: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Pharmacy' }],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

medicineSchema.virtual('pharmacyCount').get(function () {
  return this.pharmacies ? this.pharmacies.length : 0;
});

medicineSchema.index({ name: 'text', genericName: 'text', category: 'text' });

export default mongoose.model('Medicine', medicineSchema);
