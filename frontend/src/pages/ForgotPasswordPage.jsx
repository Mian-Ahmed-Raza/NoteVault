import React, { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, Loader2, BookOpen, CheckCircle } from 'lucide-react';
import api from '../services/api';
import { ToastContext } from '../App';

const ForgotPasswordPage = () => {
  const toast = useContext(ToastContext);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || loading) return;

    setLoading(true);
    try {
      const res = await api.post('/auth/forgot-password', { email });
      setSent(true);
      toast.success(res.data.message);
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to send reset email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#0a0a0f',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 24,
      backgroundImage: `
        radial-gradient(ellipse at 20% 20%, rgba(99,102,241,0.08) 0%, transparent 50%),
        radial-gradient(ellipse at 80% 80%, rgba(139,92,246,0.06) 0%, transparent 50%)
      `
    }}>
      <div style={{ width: '100%', maxWidth: 420 }}>
        {/* Back Link */}
        <Link to="/auth" style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          color: 'rgba(255,255,255,0.5)', textDecoration: 'none',
          fontSize: 14, marginBottom: 24,
          transition: 'color 0.2s'
        }}>
          <ArrowLeft style={{ width: 16, height: 16 }} />
          Back to Login
        </Link>

        <div style={{
          background: 'rgba(255,255,255,0.05)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 24,
          padding: 40,
          textAlign: 'center',
          boxShadow: '0 8px 32px rgba(0,0,0,0.3)'
        }}>
          {/* Icon */}
          <div style={{
            width: 64,
            height: 64,
            borderRadius: '50%',
            background: 'rgba(99,102,241,0.15)',
            border: '1px solid rgba(99,102,241,0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px'
          }}>
            <Mail style={{ width: 28, height: 28, color: '#818cf8' }} />
          </div>

          {!sent ? (
            <>
              <h2 style={{ color: 'white', fontSize: 22, fontWeight: 700, marginBottom: 8 }}>
                Forgot Password?
              </h2>
              <p style={{
                color: 'rgba(255,255,255,0.4)', fontSize: 14,
                marginBottom: 28, lineHeight: 1.6
              }}>
                Enter your email and we'll send you a link to reset your password.
              </p>

              <form onSubmit={handleSubmit} style={{ textAlign: 'left' }}>
                <label style={{
                  display: 'block', color: 'rgba(255,255,255,0.6)',
                  fontSize: 13, fontWeight: 500, marginBottom: 8
                }}>
                  Email Address
                </label>
                <div style={{
                  display: 'flex', alignItems: 'center',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 12, overflow: 'hidden',
                  marginBottom: 20
                }}>
                  <div style={{ paddingLeft: 14, paddingRight: 8 }}>
                    <Mail style={{ width: 16, height: 16, color: 'rgba(255,255,255,0.3)' }} />
                  </div>
                  <input
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={{
                      flex: 1, background: 'transparent',
                      padding: '12px 8px', fontSize: 14,
                      color: 'white', outline: 'none', border: 'none'
                    }}
                    onFocus={e => {
                      e.target.parentElement.style.borderColor = 'rgba(99,102,241,0.6)';
                      e.target.parentElement.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.15)';
                    }}
                    onBlur={e => {
                      e.target.parentElement.style.borderColor = 'rgba(255,255,255,0.1)';
                      e.target.parentElement.style.boxShadow = 'none';
                    }}
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading || !email.trim()}
                  className="btn-primary"
                  style={{ width: '100%', gap: 8 }}
                >
                  {loading ? (
                    <>
                      <Loader2 style={{ width: 16, height: 16, animation: 'spin 1s linear infinite' }} />
                      Sending...
                    </>
                  ) : 'Send Reset Link'}
                </button>
              </form>
            </>
          ) : (
            <>
              <div style={{
                width: 72, height: 72, borderRadius: '50%',
                background: 'rgba(16,185,129,0.15)',
                border: '1px solid rgba(16,185,129,0.3)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 20px'
              }}>
                <CheckCircle style={{ width: 36, height: 36, color: '#34d399' }} />
              </div>
              <h2 style={{ color: 'white', fontSize: 22, fontWeight: 700, marginBottom: 8 }}>
                Check Your Email!
              </h2>
              <p style={{
                color: 'rgba(255,255,255,0.5)', fontSize: 14,
                marginBottom: 24, lineHeight: 1.6
              }}>
                We sent a password reset link to <strong style={{ color: 'white' }}>{email}</strong>
              </p>
              <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 13, marginBottom: 20 }}>
                Didn't receive it? Check your spam folder or
              </p>
              <button
                onClick={() => setSent(false)}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: '#818cf8', fontSize: 14, fontWeight: 600,
                  textDecoration: 'underline'
                }}
              >
                try again
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;