import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

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

userSchema.pre('save', async function hashPassword(next) {
  if (!this.isModified('password') || !this.password) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.matchPassword = function matchPassword(password) {
  if (!this.password) return false;
  return bcrypt.compare(password, this.password);
};

export default mongoose.model('User', userSchema);
