import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import log from '../utils/logger.js';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: {
      type: String,
      required() {
        return !this.googleId;
      },
    },
    googleId: { type: String },
    profilePicture: { type: String, default: '' },
    phoneNumber: { type: String, default: '' },
    city: { type: String, default: '' },
    state: { type: String, default: '' },
    isAdmin: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    welcomeEmailSentAt: { type: Date, default: null },
    searchHistory: [
      {
        term: { type: String, trim: true },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    resetPasswordToken: { type: String, default: '' },
    resetPasswordExpires: { type: Date, default: null },
    notificationPreferences: {
      email: { type: Boolean, default: true },
      inApp: { type: Boolean, default: true },
    },
    savedMedicines: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Medicine' }],
  },
  { timestamps: true }
);

userSchema.index({ googleId: 1 }, { unique: true, sparse: true });

userSchema.pre('validate', function normalizeAuthProviderFields(next) {
  if (this.googleId == null) this.googleId = undefined;
  next();
});

userSchema.pre('save', async function hashPassword(next) {
  if (!this.isModified('password') || !this.password) return next();
  log.info(`[Auth][Model] Password hash generation started userId=${this._id || 'new'} email=${this.email}`);
  this.password = await bcrypt.hash(this.password, 10);
  log.info(`[Auth][Model] Password hash generation completed userId=${this._id || 'new'} email=${this.email}`);
  next();
});

userSchema.methods.matchPassword = function matchPassword(password) {
  if (!this.password) {
    log.info(`[Auth][Model] Password comparison skipped noPasswordHash userId=${this._id} email=${this.email}`);
    return false;
  }
  return bcrypt.compare(password, this.password);
};

export default mongoose.model('User', userSchema);
