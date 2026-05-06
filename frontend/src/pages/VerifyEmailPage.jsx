import React, { useEffect, useState, useContext } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { CheckCircle, XCircle, Loader2, BookOpen, Mail } from 'lucide-react';
import api from '../services/api';
import { ToastContext } from '../App';

const VerifyEmailPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const toast = useContext(ToastContext);

  const [status, setStatus] = useState('loading'); // loading, success, error
  const [message, setMessage] = useState('');

  useEffect(() => {
    const verify = async () => {
      const token = searchParams.get('token');

      if (!token) {
        setStatus('error');
        setMessage('Invalid verification link. No token found.');
        return;
      }

      try {
        const res = await api.post('/auth/verify-email', { token });
        setStatus('success');
        setMessage(res.data.message);
        toast.success('Email verified successfully!');
        setTimeout(() => navigate('/dashboard'), 3000);
      } catch (error) {
        setStatus('error');
        setMessage(error.response?.data?.error || 'Verification failed');
      }
    };

    verify();
  }, []);

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
      <div style={{
        width: '100%',
        maxWidth: 440,
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

        {/* Loading */}
        {status === 'loading' && (
          <>
            <div style={{
              width: 64,
              height: 64,
              borderRadius: '50%',
              border: '4px solid rgba(99,102,241,0.2)',
              borderTopColor: '#6366f1',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 20px'
            }} />
            <h2 style={{ color: 'white', fontSize: 20, fontWeight: 700, marginBottom: 8 }}>
              Verifying your email...
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14 }}>
              Please wait a moment
            </p>
          </>
        )}

        {/* Success */}
        {status === 'success' && (
          <>
            <div style={{
              width: 72,
              height: 72,
              borderRadius: '50%',
              background: 'rgba(16,185,129,0.15)',
              border: '1px solid rgba(16,185,129,0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px'
            }}>
              <CheckCircle style={{ width: 36, height: 36, color: '#34d399' }} />
            </div>
            <h2 style={{ color: 'white', fontSize: 22, fontWeight: 700, marginBottom: 8 }}>
              Email Verified! 🎉
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14, marginBottom: 24, lineHeight: 1.6 }}>
              {message}
            </p>
            <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 13, marginBottom: 20 }}>
              Redirecting to dashboard in 3 seconds...
            </p>
            <Link
              to="/dashboard"
              style={{
                display: 'inline-block',
                background: 'linear-gradient(135deg, #4f46e5, #8b5cf6)',
                color: 'white',
                textDecoration: 'none',
                padding: '12px 28px',
                borderRadius: 12,
                fontWeight: 600,
                fontSize: 14,
                boxShadow: '0 0 15px rgba(99,102,241,0.3)'
              }}
            >
              Go to Dashboard →
            </Link>
          </>
        )}

        {/* Error */}
        {status === 'error' && (
          <>
            <div style={{
              width: 72,
              height: 72,
              borderRadius: '50%',
              background: 'rgba(239,68,68,0.15)',
              border: '1px solid rgba(239,68,68,0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px'
            }}>
              <XCircle style={{ width: 36, height: 36, color: '#f87171' }} />
            </div>
            <h2 style={{ color: 'white', fontSize: 22, fontWeight: 700, marginBottom: 8 }}>
              Verification Failed
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14, marginBottom: 24, lineHeight: 1.6 }}>
              {message}
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
              <Link
                to="/auth"
                style={{
                  display: 'inline-block',
                  background: 'rgba(255,255,255,0.08)',
                  color: 'white',
                  textDecoration: 'none',
                  padding: '12px 24px',
                  borderRadius: 12,
                  fontWeight: 500,
                  fontSize: 14,
                  border: '1px solid rgba(255,255,255,0.15)'
                }}
              >
                Back to Login
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default VerifyEmailPage;