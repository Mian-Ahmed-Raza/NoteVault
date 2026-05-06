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

    const verificationToken = crypto.randomBytes(32).toString('hex');

    const user = await User.create({
      name: name.trim(),
      rollNumber: rollNumber.trim().toUpperCase(),
      email: email.toLowerCase().trim(),
      password,
      verificationToken,
      verificationTokenExpiry: Date.now() + 24 * 60 * 60 * 1000,
      isVerified: false,
    });

    // Try to send email but DON'T fail registration
    try {
      console.log('📧 Sending verification email to:', user.email);
      await sendVerificationEmail(user.email, user.name, verificationToken);
      console.log('✅ Verification email sent!');
    } catch (emailError) {
      // Just log the error - don't fail registration
      console.error('❌ Email failed but registration succeeded');
      console.error('❌ Email error:', emailError.message);
      console.error('❌ Email error code:', emailError.code);
    }

    const token = generateToken(user._id);

    res.status(201).json({
      message: 'Account created successfully! Welcome to NoteVault.',
      token,
      user: user.toPublicJSON(),
      requiresVerification: true
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

    console.log('📧 Resending verification to:', user.email);
    console.log('📧 EMAIL_USER:', process.env.EMAIL_USER);
    console.log('📧 EMAIL_PASS exists:', !!process.env.EMAIL_PASS);
    console.log('📧 EMAIL_PASS length:', process.env.EMAIL_PASS?.length);

    const verificationToken = crypto.randomBytes(32).toString('hex');
    user.verificationToken = verificationToken;
    user.verificationTokenExpiry = Date.now() + 24 * 60 * 60 * 1000;
    await user.save();

    try {
      await sendVerificationEmail(user.email, user.name, verificationToken);
      res.json({ message: 'Verification email sent! Please check your inbox.' });
    } catch (emailError) {
      console.error('❌ Resend failed:', emailError.message);
      console.error('❌ Full error:', emailError);
      return res.status(500).json({
        error: `Email failed: ${emailError.message}`,
        code: emailError.code,
        hint: getEmailHint(emailError)
      });
    }
  } catch (error) {
    next(error);
  }
};

// ─── Helper: Get Email Hint ────────────────────────────────────────
const getEmailHint = (error) => {
  if (error.code === 'EAUTH') {
    return 'Gmail authentication failed. Check EMAIL_USER and EMAIL_PASS in environment variables.';
  }
  if (error.code === 'ECONNREFUSED') {
    return 'Cannot connect to Gmail SMTP. Check network settings.';
  }
  if (error.code === 'ETIMEDOUT') {
    return 'Connection timed out. Gmail SMTP may be blocked.';
  }
  if (error.message?.includes('Invalid login')) {
    return 'Invalid Gmail credentials. Make sure you are using an App Password, not your regular password.';
  }
  if (error.message?.includes('Username and Password not accepted')) {
    return 'Gmail rejected the credentials. Generate a new App Password at myaccount.google.com/apppasswords';
  }
  return 'Unknown email error. Check server logs for details.';
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