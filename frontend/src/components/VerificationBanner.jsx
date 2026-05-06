import React, { useState, useContext } from 'react';
import { Mail, X, RefreshCw, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { ToastContext } from '../App';

const VerificationBanner = () => {
  const { user } = useAuth();
  const toast = useContext(ToastContext);
  const [dismissed, setDismissed] = useState(false);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  // Don't show if verified or dismissed
  if (!user || user.isVerified || dismissed) return null;

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

  return (
    <div style={{
      position: 'fixed',
      bottom: 24,
      left: '50%',
      transform: 'translateX(-50%)',
      zIndex: 40,
      width: 'calc(100% - 48px)',
      maxWidth: 560,
      background: 'rgba(245,158,11,0.1)',
      backdropFilter: 'blur(20px)',
      border: '1px solid rgba(245,158,11,0.3)',
      borderRadius: 16,
      padding: '14px 18px',
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
      animation: 'slideUp 0.3s ease-out both'
    }}>
      {/* Icon */}
      <div style={{
        width: 36,
        height: 36,
        borderRadius: 10,
        background: 'rgba(245,158,11,0.2)',
        border: '1px solid rgba(245,158,11,0.3)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0
      }}>
        <Mail style={{ width: 18, height: 18, color: '#fbbf24' }} />
      </div>

      {/* Text */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ color: 'white', fontSize: 13, fontWeight: 600, margin: 0 }}>
          Please verify your email
        </p>
        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, margin: 0 }}>
          Check {user.email} for a verification link
        </p>
      </div>

      {/* Resend Button */}
      {!sent ? (
        <button
          onClick={handleResend}
          disabled={sending}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '7px 14px',
            borderRadius: 10,
            background: 'rgba(245,158,11,0.2)',
            border: '1px solid rgba(245,158,11,0.4)',
            color: '#fbbf24',
            fontSize: 12,
            fontWeight: 600,
            cursor: 'pointer',
            flexShrink: 0,
            whiteSpace: 'nowrap'
          }}
        >
          {sending ? (
            <>
              <RefreshCw style={{ width: 12, height: 12, animation: 'spin 1s linear infinite' }} />
              Sending...
            </>
          ) : (
            <>
              <RefreshCw style={{ width: 12, height: 12 }} />
              Resend
            </>
          )}
        </button>
      ) : (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          padding: '7px 14px',
          borderRadius: 10,
          background: 'rgba(16,185,129,0.15)',
          border: '1px solid rgba(16,185,129,0.3)',
          color: '#34d399',
          fontSize: 12,
          fontWeight: 600,
          flexShrink: 0
        }}>
          <CheckCircle style={{ width: 12, height: 12 }} />
          Sent!
        </div>
      )}

      {/* Dismiss */}
      <button
        onClick={() => setDismissed(true)}
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          color: 'rgba(255,255,255,0.3)',
          padding: 4,
          flexShrink: 0,
          display: 'flex'
        }}
      >
        <X style={{ width: 16, height: 16 }} />
      </button>
    </div>
  );
};

export default VerificationBanner;