const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    minlength: [2, 'Name must be at least 2 characters'],
    maxlength: [50, 'Name cannot exceed 50 characters']
  },
  rollNumber: {
    type: String,
    required: [true, 'Roll number is required'],
    trim: true,
    uppercase: true,
    maxlength: [20, 'Roll number cannot exceed 20 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false
  },
  isAdmin: {
    type: Boolean,
    default: false
  },
  isBanned: {
    type: Boolean,
    default: false
  },
  banReason: {
    type: String,
    default: ''
  },
  // ── Email Verification ──────────────────────
  isVerified: {
    type: Boolean,
    default: false
  },
  verificationToken: {
    type: String,
    default: null,
    select: false
  },
  verificationTokenExpiry: {
    type: Date,
    default: null,
    select: false
  },
  // ── Password Reset ──────────────────────────
  resetPasswordToken: {
    type: String,
    default: null,
    select: false
  },
  resetPasswordExpiry: {
    type: Date,
    default: null,
    select: false
  },
  totalUploads: {
    type: Number,
    default: 0
  },
  joinedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

userSchema.virtual('initials').get(function () {
  return this.name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.toPublicJSON = function () {
  return {
    _id: this._id,
    name: this.name,
    rollNumber: this.rollNumber,
    email: this.email,
    isAdmin: this.isAdmin,
    isBanned: this.isBanned,
    isVerified: this.isVerified,
    totalUploads: this.totalUploads,
    joinedAt: this.joinedAt,
    initials: this.initials
  };
};

module.exports = mongoose.model('User', userSchema);