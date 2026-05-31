import mongoose from 'mongoose';

const reportSchema = new mongoose.Schema(
  {
    reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    medicine: { type: mongoose.Schema.Types.ObjectId, ref: 'Medicine' },
    pharmacy: { type: mongoose.Schema.Types.ObjectId, ref: 'Pharmacy' },
    medicineName: { type: String, required: true, trim: true },
    pharmacyName: { type: String, default: '', trim: true },
    description: { type: String, default: '' },
    notes: { type: String, default: '' },
    severity: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
    status: { type: String, enum: ['pending', 'approved', 'rejected', 'verified', 'resolved'], default: 'pending' },
    availabilityStatus: { type: String, enum: ['available', 'limited', 'out_of_stock'], default: 'available' },
    location: { type: String, required: true },
    upvotes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    submittedAt: { type: Date, default: Date.now },
    reviewedAt: { type: Date, default: null },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

export default mongoose.model('Report', reportSchema);
