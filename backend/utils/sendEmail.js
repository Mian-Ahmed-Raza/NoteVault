const nodemailer = require('nodemailer');

// ─── Create Transporter ────────────────────────────────────────────
const createTransporter = () => {
  console.log('📧 Creating email transporter...');
  console.log('📧 Host: smtp.gmail.com');
  console.log('📧 User:', process.env.EMAIL_USER);
  console.log('📧 Pass length:', process.env.EMAIL_PASS?.replace(/\s/g, '').length);

  return nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER?.trim(),
      pass: process.env.EMAIL_PASS?.replace(/\s/g, ''), // Remove spaces from app password
    },
    tls: {
      rejectUnauthorized: false
    },
    debug: true,
    logger: true
  });
};

// ─── Test Connection ───────────────────────────────────────────────
const testConnection = async () => {
  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.log('⚠️  Email not configured (EMAIL_USER or EMAIL_PASS missing)');
      return false;
    }

    const transporter = createTransporter();
    await transporter.verify();
    console.log('✅ Email service ready!');
    return true;
  } catch (error) {
    console.error('❌ Email service error:', error.message);
    console.error('❌ Error code:', error.code);
    return false;
  }
};

// ─── Send Verification Email ───────────────────────────────────────
const sendVerificationEmail = async (email, name, token) => {
  // Check env vars
  if (!process.env.EMAIL_USER) {
    throw new Error('EMAIL_USER is not set in environment variables');
  }
  if (!process.env.EMAIL_PASS) {
    throw new Error('EMAIL_PASS is not set in environment variables');
  }
  if (!process.env.FRONTEND_URL) {
    throw new Error('FRONTEND_URL is not set in environment variables');
  }

  const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;
  console.log('📧 Sending to:', email);
  console.log('📧 Verification URL:', verificationUrl);

  const transporter = createTransporter();

  // Verify SMTP connection
  console.log('📧 Verifying SMTP connection...');
  await transporter.verify();
  console.log('✅ SMTP verified!');

  const info = await transporter.sendMail({
    from: process.env.EMAIL_FROM || `NoteVault <${process.env.EMAIL_USER}>`,
    to: email,
    subject: '✅ Verify Your NoteVault Account',
    html: `
      <!DOCTYPE html>
      <html>
      <body style="margin:0;padding:0;font-family:Arial,sans-serif;background:#0a0a0f;color:#fff;">
        <div style="max-width:560px;margin:40px auto;padding:20px;">
          <div style="
            background:linear-gradient(135deg,#1a1a35,#0f0f20);
            border:1px solid rgba(99,102,241,0.2);
            border-radius:20px;padding:40px;text-align:center;
          ">
            <div style="
              width:64px;height:64px;
              background:linear-gradient(135deg,#6366f1,#8b5cf6);
              border-radius:16px;
              display:inline-flex;align-items:center;justify-content:center;
              margin-bottom:20px;font-size:28px;
            ">📚</div>

            <h1 style="font-size:28px;font-weight:800;margin:0 0 8px;color:white;">
              NoteVault
            </h1>

            <p style="color:rgba(255,255,255,0.5);font-size:14px;margin:0 0 30px;">
              Student Notes Sharing Platform
            </p>

            <div style="
              background:rgba(255,255,255,0.04);
              border:1px solid rgba(255,255,255,0.08);
              border-radius:16px;padding:30px;margin-bottom:24px;text-align:left;
            ">
              <h2 style="font-size:20px;font-weight:700;margin:0 0 12px;color:white;">
                Hey ${name}! 👋
              </h2>
              <p style="color:rgba(255,255,255,0.6);font-size:15px;line-height:1.6;margin:0 0 24px;">
                Welcome to NoteVault! Please verify your email address 
                to activate your account and start sharing notes.
              </p>
              <div style="text-align:center;">
                <a href="${verificationUrl}" style="
                  display:inline-block;
                  background:linear-gradient(135deg,#4f46e5,#8b5cf6);
                  color:white;text-decoration:none;
                  padding:14px 36px;border-radius:12px;
                  font-weight:600;font-size:15px;
                ">✅ Verify My Email</a>
              </div>
            </div>

            <div style="
              background:rgba(245,158,11,0.08);
              border:1px solid rgba(245,158,11,0.2);
              border-radius:12px;padding:16px;margin-bottom:20px;
            ">
              <p style="color:rgba(245,158,11,0.9);font-size:13px;margin:0;">
                ⏰ This link expires in <strong>24 hours</strong>
              </p>
            </div>

            <p style="color:rgba(255,255,255,0.3);font-size:12px;margin:0 0 8px;">
              If the button doesn't work, copy this link:
            </p>
            <p style="
              color:#818cf8;font-size:11px;word-break:break-all;
              background:rgba(255,255,255,0.04);
              padding:10px;border-radius:8px;margin:0;
            ">${verificationUrl}</p>
          </div>

          <p style="text-align:center;margin-top:20px;color:rgba(255,255,255,0.2);font-size:12px;">
            If you didn't create a NoteVault account, ignore this email.
          </p>
        </div>
      </body>
      </html>
    `,
  });

  console.log('✅ Email sent! Message ID:', info.messageId);
  return info;
};

// ─── Send Password Reset Email ─────────────────────────────────────
const sendPasswordResetEmail = async (email, name, token) => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    throw new Error('Email credentials not configured');
  }

  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
  const transporter = createTransporter();

  await transporter.sendMail({
    from: process.env.EMAIL_FROM || `NoteVault <${process.env.EMAIL_USER}>`,
    to: email,
    subject: '🔐 Reset Your NoteVault Password',
    html: `
      <!DOCTYPE html>
      <html>
      <body style="margin:0;padding:0;font-family:Arial,sans-serif;background:#0a0a0f;color:#fff;">
        <div style="max-width:560px;margin:40px auto;padding:20px;">
          <div style="
            background:linear-gradient(135deg,#1a1a35,#0f0f20);
            border:1px solid rgba(239,68,68,0.2);
            border-radius:20px;padding:40px;text-align:center;
          ">
            <div style="font-size:48px;margin-bottom:16px;">🔐</div>
            <h2 style="color:white;margin:0 0 12px;font-size:22px;">
              Reset Your Password
            </h2>
            <p style="color:rgba(255,255,255,0.5);margin:0 0 28px;font-size:15px;">
              Hey ${name}, click below to reset your password.
            </p>
            <a href="${resetUrl}" style="
              display:inline-block;
              background:linear-gradient(135deg,#dc2626,#b91c1c);
              color:white;text-decoration:none;
              padding:14px 36px;border-radius:12px;
              font-weight:600;font-size:15px;margin-bottom:24px;
            ">Reset Password</a>
            <p style="color:rgba(255,255,255,0.3);font-size:13px;margin:0;">
              ⏰ Expires in <strong>1 hour</strong>.
              Didn't request this? Ignore this email.
            </p>
          </div>
        </div>
      </body>
      </html>
    `,
  });

  console.log('✅ Password reset email sent to:', email);
};

module.exports = {
  sendVerificationEmail,
  sendPasswordResetEmail,
  testConnection
};