import mongoose from 'mongoose';

const alertSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    medicine: { type: mongoose.Schema.Types.ObjectId, ref: 'Medicine' },
    medicineName: { type: String, required: true },
    status: { type: String, enum: ['watching', 'triggered', 'paused'], default: 'watching' },
    enabled: { type: Boolean, default: true },
    preferences: {
      email: { type: Boolean, default: true },
      inApp: { type: Boolean, default: true },
    },
    history: [
      {
        message: String,
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model('Alert', alertSchema);
