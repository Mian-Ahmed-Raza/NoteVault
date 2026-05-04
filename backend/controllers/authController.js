const jwt = require('jsonwebtoken');
const User = require('../models/User');

// ─── Generate JWT Token ────────────────────────────────────────────
const generateToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

// ─── Register ─────────────────────────────────────────────────────
const register = async (req, res, next) => {
  try {
    const { name, rollNumber, email, password } = req.body;

    // Validate required fields
    if (!name || !rollNumber || !email || !password) {
      return res.status(400).json({
        error: 'All fields are required: name, rollNumber, email, password'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        error: 'Password must be at least 6 characters long'
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({
        error: 'An account with this email already exists'
      });
    }

    // Create new user
    const user = await User.create({
      name: name.trim(),
      rollNumber: rollNumber.trim().toUpperCase(),
      email: email.toLowerCase().trim(),
      password
    });

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      message: 'Account created successfully! Welcome to NoteVault.',
      token,
      user: user.toPublicJSON()
    });
  } catch (error) {
    next(error);
  }
};

// ─── Login ─────────────────────────────────────────────────────────
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: 'Email and password are required'
      });
    }

    // Find user with password
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

    if (!user) {
      return res.status(401).json({
        error: 'Invalid email or password'
      });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        error: 'Invalid email or password'
      });
    }

    // Generate token
    const token = generateToken(user._id);

    res.json({
      message: `Welcome back, ${user.name}!`,
      token,
      user: user.toPublicJSON()
    });
  } catch (error) {
    next(error);
  }
};

// ─── Get Current User ──────────────────────────────────────────────
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user: user.toPublicJSON() });
  } catch (error) {
    next(error);
  }
};

// ─── Update Profile ────────────────────────────────────────────────
const updateProfile = async (req, res, next) => {
  try {
    const { name, rollNumber } = req.body;
    const updates = {};

    if (name) updates.name = name.trim();
    if (rollNumber) updates.rollNumber = rollNumber.trim().toUpperCase();

    const user = await User.findByIdAndUpdate(
      req.user._id,
      updates,
      { new: true, runValidators: true }
    );

    res.json({
      message: 'Profile updated successfully',
      user: user.toPublicJSON()
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { register, login, getMe, updateProfile };