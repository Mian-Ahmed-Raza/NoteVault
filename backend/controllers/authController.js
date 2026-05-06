const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const { sendVerificationEmail, sendPasswordResetEmail } = require('../utils/sendEmail');

// ─── Generate JWT ──────────────────────────────────────────────────
const generateToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

// ─── Register ──────────────────────────────────────────────────────
const register = async (req, res, next) => {
  try {
    const { name, rollNumber, email, password } = req.body;

    if (!name || !rollNumber || !email || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({ error: 'An account with this email already exists' });
    }

    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');

    const user = await User.create({
      name: name.trim(),
      rollNumber: rollNumber.trim().toUpperCase(),
      email: email.toLowerCase().trim(),
      password,
      verificationToken,
      verificationTokenExpiry: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
      isVerified: false,
    });

    // Send verification email (don't fail registration if email fails)
    try {
      await sendVerificationEmail(user.email, user.name, verificationToken);
    } catch (emailError) {
      console.error('Failed to send verification email:', emailError.message);
    }

    const token = generateToken(user._id);

    res.status(201).json({
      message: 'Account created! Please check your email to verify your account.',
      token,
      user: user.toPublicJSON(),
      requiresVerification: true
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
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    if (user.isBanned) {
      return res.status(403).json({
        error: `Your account has been banned. Reason: ${user.banReason || 'Violated platform rules'}`
      });
    }

    const token = generateToken(user._id);

    res.json({
      message: `Welcome back, ${user.name}!`,
      token,
      user: user.toPublicJSON(),
      requiresVerification: !user.isVerified
    });
  } catch (error) {
    next(error);
  }
};

// ─── Verify Email ──────────────────────────────────────────────────
const verifyEmail = async (req, res, next) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ error: 'Verification token is required' });
    }

    const user = await User.findOne({
      verificationToken: token,
      verificationTokenExpiry: { $gt: Date.now() }
    }).select('+verificationToken +verificationTokenExpiry');

    if (!user) {
      return res.status(400).json({
        error: 'Invalid or expired verification link. Please request a new one.'
      });
    }

    user.isVerified = true;
    user.verificationToken = null;
    user.verificationTokenExpiry = null;
    await user.save();

    res.json({
      message: '🎉 Email verified successfully! You can now use all features.',
      user: user.toPublicJSON()
    });
  } catch (error) {
    next(error);
  }
};

// ─── Resend Verification Email ─────────────────────────────────────
const resendVerification = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id)
      .select('+verificationToken +verificationTokenExpiry');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.isVerified) {
      return res.status(400).json({ error: 'Email is already verified' });
    }

    // Rate limit: Check if last email was sent less than 2 minutes ago
    if (user.verificationTokenExpiry) {
      const timeSinceLastEmail = (user.verificationTokenExpiry - Date.now()) - (23 * 60 * 60 * 1000);
      if (timeSinceLastEmail > 0) {
        return res.status(429).json({
          error: 'Please wait 2 minutes before requesting another verification email'
        });
      }
    }

    const verificationToken = crypto.randomBytes(32).toString('hex');
    user.verificationToken = verificationToken;
    user.verificationTokenExpiry = Date.now() + 24 * 60 * 60 * 1000;
    await user.save();

    await sendVerificationEmail(user.email, user.name, verificationToken);

    res.json({ message: 'Verification email sent! Please check your inbox.' });
  } catch (error) {
    next(error);
  }
};

// ─── Forgot Password ───────────────────────────────────────────────
const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    // Always return success (security - don't reveal if email exists)
    if (!user) {
      return res.json({
        message: 'If an account exists with this email, you will receive a reset link.'
      });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpiry = Date.now() + 60 * 60 * 1000; // 1 hour
    await user.save();

    try {
      await sendPasswordResetEmail(user.email, user.name, resetToken);
    } catch (emailError) {
      console.error('Failed to send reset email:', emailError.message);
    }

    res.json({
      message: 'If an account exists with this email, you will receive a reset link.'
    });
  } catch (error) {
    next(error);
  }
};

// ─── Reset Password ────────────────────────────────────────────────
const resetPassword = async (req, res, next) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({ error: 'Token and new password are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpiry: { $gt: Date.now() }
    }).select('+resetPasswordToken +resetPasswordExpiry');

    if (!user) {
      return res.status(400).json({
        error: 'Invalid or expired reset link. Please request a new one.'
      });
    }

    user.password = newPassword;
    user.resetPasswordToken = null;
    user.resetPasswordExpiry = null;
    await user.save();

    res.json({ message: 'Password reset successfully! You can now login.' });
  } catch (error) {
    next(error);
  }
};

// ─── Get Me ────────────────────────────────────────────────────────
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ user: user.toPublicJSON() });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  verifyEmail,
  resendVerification,
  forgotPassword,
  resetPassword,
  getMe
};