import React, { useState, useContext } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { Lock, Eye, EyeOff, Loader2, CheckCircle, ArrowLeft } from 'lucide-react';
import api from '../services/api';
import { ToastContext } from '../App';

const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const toast = useContext(ToastContext);

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    const token = searchParams.get('token');
    if (!token) {
      setError('Invalid reset link');
      return;
    }

    setLoading(true);
    try {
      await api.post('/auth/reset-password', { token, newPassword: password });
      setSuccess(true);
      toast.success('Password reset successfully!');
      setTimeout(() => navigate('/auth'), 2500);
    } catch (error) {
      setError(error.response?.data?.error || 'Reset failed. Link may be expired.');
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
        <Link to="/auth" style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          color: 'rgba(255,255,255,0.5)', textDecoration: 'none',
          fontSize: 14, marginBottom: 24
        }}>
          <ArrowLeft style={{ width: 16, height: 16 }} />
          Back to Login
        </Link>

        <div style={{
          background: 'rgba(255,255,255,0.05)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 24, padding: 40, textAlign: 'center',
          boxShadow: '0 8px 32px rgba(0,0,0,0.3)'
        }}>
          {!success ? (
            <>
              <div style={{
                width: 64, height: 64, borderRadius: '50%',
                background: 'rgba(99,102,241,0.15)',
                border: '1px solid rgba(99,102,241,0.3)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 20px'
              }}>
                <Lock style={{ width: 28, height: 28, color: '#818cf8' }} />
              </div>

              <h2 style={{ color: 'white', fontSize: 22, fontWeight: 700, marginBottom: 8 }}>
                Reset Password
              </h2>
              <p style={{
                color: 'rgba(255,255,255,0.4)', fontSize: 14,
                marginBottom: 28, lineHeight: 1.6
              }}>
                Enter your new password below
              </p>

              {error && (
                <div style={{
                  background: 'rgba(239,68,68,0.1)',
                  border: '1px solid rgba(239,68,68,0.3)',
                  borderRadius: 10, padding: '10px 14px',
                  marginBottom: 16, fontSize: 13,
                  color: 'rgb(248,113,113)', textAlign: 'left'
                }}>
                  ⚠ {error}
                </div>
              )}

              <form onSubmit={handleSubmit} style={{ textAlign: 'left' }}>
                {/* New Password */}
                <label style={{
                  display: 'block', color: 'rgba(255,255,255,0.6)',
                  fontSize: 13, fontWeight: 500, marginBottom: 8
                }}>
                  New Password
                </label>
                <div style={{
                  display: 'flex', alignItems: 'center',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 12, overflow: 'hidden', marginBottom: 16
                }}>
                  <div style={{ paddingLeft: 14, paddingRight: 8 }}>
                    <Lock style={{ width: 16, height: 16, color: 'rgba(255,255,255,0.3)' }} />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Min. 6 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
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
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      background: 'none', border: 'none',
                      paddingRight: 12, cursor: 'pointer',
                      color: 'rgba(255,255,255,0.3)'
                    }}
                  >
                    {showPassword
                      ? <EyeOff style={{ width: 16, height: 16 }} />
                      : <Eye style={{ width: 16, height: 16 }} />
                    }
                  </button>
                </div>

                {/* Confirm Password */}
                <label style={{
                  display: 'block', color: 'rgba(255,255,255,0.6)',
                  fontSize: 13, fontWeight: 500, marginBottom: 8
                }}>
                  Confirm Password
                </label>
                <div style={{
                  display: 'flex', alignItems: 'center',
                  background: 'rgba(255,255,255,0.05)',
                  border: `1px solid ${confirmPassword && password !== confirmPassword ? 'rgba(239,68,68,0.5)' : 'rgba(255,255,255,0.1)'}`,
                  borderRadius: 12, overflow: 'hidden', marginBottom: 20
                }}>
                  <div style={{ paddingLeft: 14, paddingRight: 8 }}>
                    <Lock style={{ width: 16, height: 16, color: 'rgba(255,255,255,0.3)' }} />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    style={{
                      flex: 1, background: 'transparent',
                      padding: '12px 8px', fontSize: 14,
                      color: 'white', outline: 'none', border: 'none'
                    }}
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary"
                  style={{ width: '100%', gap: 8 }}
                >
                  {loading ? (
                    <>
                      <Loader2 style={{ width: 16, height: 16, animation: 'spin 1s linear infinite' }} />
                      Resetting...
                    </>
                  ) : 'Reset Password'}
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
                Password Reset! 🎉
              </h2>
              <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14, marginBottom: 8 }}>
                Your password has been reset successfully.
              </p>
              <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 13 }}>
                Redirecting to login...
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;