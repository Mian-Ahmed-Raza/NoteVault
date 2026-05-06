const nodemailer = require('nodemailer');

// ─── Create Transporter ────────────────────────────────────────────
const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

// ─── Send Verification Email ───────────────────────────────────────
const sendVerificationEmail = async (email, name, token) => {
  const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;
  const transporter = createTransporter();

  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: email,
    subject: '✅ Verify Your NoteVault Account',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Verify Email</title>
      </head>
      <body style="
        margin: 0;
        padding: 0;
        font-family: 'Inter', Arial, sans-serif;
        background-color: #0a0a0f;
        color: #ffffff;
      ">
        <div style="
          max-width: 560px;
          margin: 40px auto;
          padding: 20px;
        ">
          <!-- Header -->
          <div style="
            background: linear-gradient(135deg, #1a1a35, #0f0f20);
            border: 1px solid rgba(99,102,241,0.2);
            border-radius: 20px;
            padding: 40px;
            text-align: center;
          ">
            <!-- Logo -->
            <div style="
              width: 64px;
              height: 64px;
              background: linear-gradient(135deg, #6366f1, #8b5cf6);
              border-radius: 16px;
              display: inline-flex;
              align-items: center;
              justify-content: center;
              margin-bottom: 20px;
              box-shadow: 0 0 20px rgba(99,102,241,0.4);
            ">
              <span style="font-size: 28px;">📚</span>
            </div>

            <h1 style="
              font-size: 28px;
              font-weight: 800;
              margin: 0 0 8px;
            ">
              <span style="
                background: linear-gradient(135deg, #818cf8, #a78bfa);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
              ">Note</span>Vault
            </h1>

            <p style="color: rgba(255,255,255,0.5); font-size: 14px; margin: 0 0 30px;">
              Student Notes Sharing Platform
            </p>

            <!-- Main Content -->
            <div style="
              background: rgba(255,255,255,0.04);
              border: 1px solid rgba(255,255,255,0.08);
              border-radius: 16px;
              padding: 30px;
              margin-bottom: 24px;
            ">
              <h2 style="font-size: 20px; font-weight: 700; margin: 0 0 12px; color: #fff;">
                Hey ${name}! 👋
              </h2>
              <p style="color: rgba(255,255,255,0.6); font-size: 15px; line-height: 1.6; margin: 0 0 24px;">
                Welcome to NoteVault! You're almost there. 
                Please verify your email address to activate your account 
                and start sharing notes with thousands of students.
              </p>

              <!-- Verify Button -->
              <a href="${verificationUrl}"
                style="
                  display: inline-block;
                  background: linear-gradient(135deg, #4f46e5, #8b5cf6);
                  color: white;
                  text-decoration: none;
                  padding: 14px 36px;
                  border-radius: 12px;
                  font-weight: 600;
                  font-size: 15px;
                  box-shadow: 0 0 20px rgba(99,102,241,0.4);
                  transition: all 0.2s;
                "
              >
                ✅ Verify My Email
              </a>
            </div>

            <!-- Warning -->
            <div style="
              background: rgba(245,158,11,0.08);
              border: 1px solid rgba(245,158,11,0.2);
              border-radius: 12px;
              padding: 16px;
              margin-bottom: 24px;
            ">
              <p style="color: rgba(245,158,11,0.9); font-size: 13px; margin: 0;">
                ⏰ This link expires in <strong>24 hours</strong>
              </p>
            </div>

            <!-- Link Fallback -->
            <p style="color: rgba(255,255,255,0.3); font-size: 12px; margin: 0 0 8px;">
              If the button doesn't work, copy and paste this link:
            </p>
            <p style="
              color: #818cf8;
              font-size: 11px;
              word-break: break-all;
              background: rgba(255,255,255,0.04);
              padding: 10px;
              border-radius: 8px;
              margin: 0;
            ">
              ${verificationUrl}
            </p>
          </div>

          <!-- Footer -->
          <div style="text-align: center; margin-top: 20px;">
            <p style="color: rgba(255,255,255,0.2); font-size: 12px; margin: 0;">
              If you didn't create a NoteVault account, please ignore this email.
            </p>
          </div>
        </div>
      </body>
      </html>
    `,
  };

  await transporter.sendMail(mailOptions);
  console.log(`✅ Verification email sent to ${email}`);
};

// ─── Send Password Reset Email ─────────────────────────────────────
const sendPasswordResetEmail = async (email, name, token) => {
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
  const transporter = createTransporter();

  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: email,
    subject: '🔐 Reset Your NoteVault Password',
    html: `
      <!DOCTYPE html>
      <html>
      <body style="
        margin: 0; padding: 0;
        font-family: Arial, sans-serif;
        background-color: #0a0a0f;
        color: #ffffff;
      ">
        <div style="max-width: 560px; margin: 40px auto; padding: 20px;">
          <div style="
            background: linear-gradient(135deg, #1a1a35, #0f0f20);
            border: 1px solid rgba(239,68,68,0.2);
            border-radius: 20px;
            padding: 40px;
            text-align: center;
          ">
            <div style="font-size: 48px; margin-bottom: 16px;">🔐</div>
            <h2 style="color: white; margin: 0 0 12px;">Reset Your Password</h2>
            <p style="color: rgba(255,255,255,0.5); margin: 0 0 24px;">
              Hey ${name}, we received a request to reset your password.
            </p>
            <a href="${resetUrl}" style="
              display: inline-block;
              background: linear-gradient(135deg, #dc2626, #b91c1c);
              color: white;
              text-decoration: none;
              padding: 14px 36px;
              border-radius: 12px;
              font-weight: 600;
              margin-bottom: 20px;
            ">
              Reset Password
            </a>
            <p style="color: rgba(255,255,255,0.3); font-size: 13px;">
              ⏰ Link expires in 1 hour. If you didn't request this, ignore this email.
            </p>
          </div>
        </div>
      </body>
      </html>
    `,
  };

  await transporter.sendMail(mailOptions);
  console.log(`✅ Password reset email sent to ${email}`);
};

module.exports = {
  sendVerificationEmail,
  sendPasswordResetEmail
};