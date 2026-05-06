import React, { useState, useContext } from 'react';
import { Mail, RefreshCw, CheckCircle, LogOut, BookOpen } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { ToastContext } from '../App';

const VerifyRequired = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const toast = useContext(ToastContext);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const handleResend = async () => {
    if (sending) return;
    setSending(true);
    try {
      const res = await api.post('/auth/resend-verification');
      setSent(true);
      toast.success(res.data.message);
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to send email');
    } finally {
      setSending(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  const handleRefresh = () => {
    window.location.reload();
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
      <div style={{ width: '100%', maxWidth: 480 }}>

        {/* Card */}
        <div style={{
          background: 'rgba(255,255,255,0.05)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 24,
          padding: 40,
          textAlign: 'center',
          boxShadow: '0 8px 32px rgba(0,0,0,0.3)'
        }}>
          {/* Logo */}
          <div style={{
            width: 56,
            height: 56,
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            borderRadius: 16,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px',
            boxShadow: '0 0 20px rgba(99,102,241,0.4)'
          }}>
            <BookOpen style={{ width: 28, height: 28, color: 'white' }} />
          </div>

          {/* Email Icon */}
          <div style={{
            width: 80,
            height: 80,
            borderRadius: '50%',
            background: 'rgba(245,158,11,0.1)',
            border: '2px solid rgba(245,158,11,0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 24px',
            animation: 'pulseSlow 2s ease-in-out infinite'
          }}>
            <Mail style={{ width: 36, height: 36, color: '#fbbf24' }} />
          </div>

          {/* Title */}
          <h1 style={{
            fontSize: 24,
            fontWeight: 700,
            color: 'white',
            marginBottom: 8
          }}>
            Verify Your Email
          </h1>

          <p style={{
            color: 'rgba(255,255,255,0.5)',
            fontSize: 15,
            lineHeight: 1.7,
            marginBottom: 8
          }}>
            You need to verify your email address before you can access NoteVault.
          </p>

          {/* Email Display */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '8px 16px',
            borderRadius: 10,
            background: 'rgba(99,102,241,0.1)',
            border: '1px solid rgba(99,102,241,0.2)',
            marginBottom: 28
          }}>
            <Mail style={{ width: 14, height: 14, color: '#818cf8' }} />
            <span style={{ color: '#818cf8', fontSize: 13, fontWeight: 600 }}>
              {user?.email}
            </span>
          </div>

          {/* Steps */}
          <div style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: 16,
            padding: 20,
            marginBottom: 24,
            textAlign: 'left'
          }}>
            <p style={{
              color: 'rgba(255,255,255,0.5)',
              fontSize: 12,
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              marginBottom: 14
            }}>
              How to verify:
            </p>
            {[
              { step: '1', text: 'Check your email inbox' },
              { step: '2', text: 'Look for email from NoteVault' },
              { step: '3', text: 'Click the "Verify My Email" button' },
              { step: '4', text: 'Come back and refresh this page' },
            ].map(({ step, text }) => (
              <div key={step} style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                marginBottom: 10
              }}>
                <div style={{
                  width: 24,
                  height: 24,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 11,
                  fontWeight: 700,
                  color: 'white',
                  flexShrink: 0
                }}>
                  {step}
                </div>
                <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13, margin: 0 }}>
                  {text}
                </p>
              </div>
            ))}
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>

            {/* Resend Button */}
            {!sent ? (
              <button
                onClick={handleResend}
                disabled={sending}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  padding: '13px 24px',
                  borderRadius: 12,
                  background: 'linear-gradient(135deg, #4f46e5, #8b5cf6)',
                  border: 'none',
                  color: 'white',
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: sending ? 'not-allowed' : 'pointer',
                  opacity: sending ? 0.7 : 1,
                  boxShadow: '0 0 15px rgba(99,102,241,0.3)',
                  transition: 'all 0.2s ease'
                }}
              >
                {sending ? (
                  <>
                    <RefreshCw style={{ width: 16, height: 16, animation: 'spin 1s linear infinite' }} />
                    Sending...
                  </>
                ) : (
                  <>
                    <Mail style={{ width: 16, height: 16 }} />
                    Resend Verification Email
                  </>
                )}
              </button>
            ) : (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                padding: '13px 24px',
                borderRadius: 12,
                background: 'rgba(16,185,129,0.1)',
                border: '1px solid rgba(16,185,129,0.3)',
                color: '#34d399',
                fontSize: 14,
                fontWeight: 600,
              }}>
                <CheckCircle style={{ width: 16, height: 16 }} />
                Email Sent! Check Your Inbox
              </div>
            )}

            {/* Refresh Button */}
            <button
              onClick={handleRefresh}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                padding: '13px 24px',
                borderRadius: 12,
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                color: 'rgba(255,255,255,0.7)',
                fontSize: 14,
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                e.currentTarget.style.color = 'white';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                e.currentTarget.style.color = 'rgba(255,255,255,0.7)';
              }}
            >
              <RefreshCw style={{ width: 16, height: 16 }} />
              I've Verified — Refresh Page
            </button>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                padding: '11px 24px',
                borderRadius: 12,
                background: 'none',
                border: 'none',
                color: 'rgba(255,255,255,0.3)',
                fontSize: 13,
                cursor: 'pointer',
                transition: 'color 0.2s ease'
              }}
              onMouseEnter={e => e.currentTarget.style.color = 'rgb(248,113,113)'}
              onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.3)'}
            >
              <LogOut style={{ width: 14, height: 14 }} />
              Sign out and use different account
            </button>
          </div>
        </div>

        {/* Help Text */}
        <p style={{
          textAlign: 'center',
          color: 'rgba(255,255,255,0.2)',
          fontSize: 12,
          marginTop: 16
        }}>
          Check spam/junk folder if you don't see the email
        </p>
      </div>
    </div>
  );
};

export default VerifyRequired;