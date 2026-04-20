import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import toast from 'react-hot-toast';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setTimeout(() => setVisible(true), 80);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email });
      setSent(true);
    } catch (err) {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      fontFamily: 'Roboto, sans-serif',
      background: '#FAFAF8',
    }}>
      <div style={{
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px',
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(20px)',
        transition: 'opacity 0.7s ease, transform 0.7s ease',
      }}>
        <div style={{ width: '100%', maxWidth: '420px' }}>

          {/* Logo */}
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <div style={{
              width: '56px', height: '56px', borderRadius: '16px',
              background: 'linear-gradient(135deg, #1B6B5A, #00B894)',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              color: '#F5C518', fontWeight: '800', fontSize: '24px',
              marginBottom: '12px',
            }}>X</div>
            <p style={{ margin: 0, fontWeight: '800', fontSize: '20px', color: '#1B6B5A' }}>XenEdu</p>
          </div>

          {!sent ? (
            <div style={{
              background: 'white', borderRadius: '20px', padding: '36px',
              boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
              border: '1px solid #F0F0F0',
            }}>
              {/* Icon */}
              <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                <div style={{
                  width: '64px', height: '64px', borderRadius: '50%',
                  background: '#E8F5F0', display: 'inline-flex',
                  alignItems: 'center', justifyContent: 'center', fontSize: '28px',
                }}>🔐</div>
              </div>

              <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#1a1a1a', margin: '0 0 8px', textAlign: 'center' }}>
                Forgot Password?
              </h1>
              <p style={{ color: '#888', fontSize: '14px', margin: '0 0 28px', textAlign: 'center', lineHeight: '1.6' }}>
                No worries! Enter your email address and we'll send you a link to reset your password.
              </p>

              <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '20px' }}>
                  <label style={{
                    display: 'block', fontSize: '13px',
                    fontWeight: '600', color: '#444', marginBottom: '8px',
                  }}>
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    required
                    style={{
                      width: '100%', padding: '13px 16px',
                      border: '1.5px solid #E8E8E8',
                      borderRadius: '12px', fontSize: '14px',
                      outline: 'none', background: 'white',
                      transition: 'border-color 0.2s',
                      boxSizing: 'border-box', color: '#1a1a1a',
                    }}
                    onFocus={e => e.target.style.borderColor = '#1B6B5A'}
                    onBlur={e => e.target.style.borderColor = '#E8E8E8'}
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    width: '100%', padding: '14px',
                    background: loading ? '#ccc' : '#1B6B5A',
                    color: 'white', border: 'none',
                    borderRadius: '12px', fontSize: '15px',
                    fontWeight: '700', cursor: loading ? 'not-allowed' : 'pointer',
                    boxShadow: loading ? 'none' : '0 4px 15px rgba(27,107,90,0.3)',
                    transition: 'all 0.2s',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                  }}
                >
                  {loading ? (
                    <>
                      <span style={{
                        width: '18px', height: '18px', borderRadius: '50%',
                        border: '2.5px solid rgba(255,255,255,0.3)',
                        borderTopColor: 'white',
                        animation: 'spin 0.7s linear infinite',
                        display: 'inline-block',
                      }} />
                      Sending...
                    </>
                  ) : 'Send Reset Link'}
                </button>
              </form>

              <div style={{ textAlign: 'center', marginTop: '24px' }}>
                <Link to="/login" style={{
                  color: '#1B6B5A', fontWeight: '600',
                  fontSize: '14px', textDecoration: 'none',
                  display: 'inline-flex', alignItems: 'center', gap: '6px',
                }}>
                  ← Back to Login
                </Link>
              </div>
            </div>
          ) : (
            /* Success state */
            <div style={{
              background: 'white', borderRadius: '20px', padding: '36px',
              boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
              border: '1px solid #F0F0F0',
              textAlign: 'center',
              animation: 'fadeIn 0.5s ease',
            }}>
              <div style={{
                width: '72px', height: '72px', borderRadius: '50%',
                background: '#E8F5F0',
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '32px', marginBottom: '20px',
                border: '3px solid #1B6B5A',
              }}>
                📧
              </div>
              <h2 style={{ fontSize: '22px', fontWeight: '800', color: '#1a1a1a', margin: '0 0 12px' }}>
                Check your email!
              </h2>
              <p style={{ color: '#666', fontSize: '14px', lineHeight: '1.6', margin: '0 0 8px' }}>
                We sent a password reset link to:
              </p>
              <p style={{ color: '#1B6B5A', fontWeight: '700', fontSize: '15px', margin: '0 0 24px' }}>
                {email}
              </p>
              <p style={{ color: '#aaa', fontSize: '13px', lineHeight: '1.6', margin: '0 0 28px' }}>
                The link expires in <strong>1 hour</strong>.
                Check your spam folder if you don't see it.
              </p>

              {/* Resend */}
              <button
                onClick={() => { setSent(false); setEmail(''); }}
                style={{
                  background: 'none', border: '1.5px solid #1B6B5A',
                  color: '#1B6B5A', borderRadius: '12px', padding: '10px 24px',
                  fontWeight: '600', fontSize: '14px', cursor: 'pointer',
                  marginBottom: '16px', transition: 'all 0.2s',
                }}
                onMouseEnter={e => {
                  e.target.style.background = '#1B6B5A';
                  e.target.style.color = 'white';
                }}
                onMouseLeave={e => {
                  e.target.style.background = 'none';
                  e.target.style.color = '#1B6B5A';
                }}
              >
                Try different email
              </button>

              <div>
                <Link to="/login" style={{
                  color: '#888', fontSize: '14px', textDecoration: 'none',
                  display: 'block',
                }}>
                  ← Back to Login
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
      `}</style>
    </div>
  );
};

export default ForgotPasswordPage;