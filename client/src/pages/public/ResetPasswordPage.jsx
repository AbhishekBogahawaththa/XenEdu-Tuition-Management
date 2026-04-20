import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import toast from 'react-hot-toast';

const ResetPasswordPage = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({ password: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setTimeout(() => setVisible(true), 80);
  }, []);

  const getStrength = (pwd) => {
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    return score;
  };

  const strengthLabels = ['', 'Weak', 'Fair', 'Good', 'Strong'];
  const strengthColors = ['', '#EF4444', '#F59E0B', '#3B82F6', '#10B981'];
  const strength = getStrength(form.password);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (form.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    try {
      await api.post('/auth/reset-password', {
        token,
        password: form.password,
      });
      setSuccess(true);
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Reset failed. Link may be expired.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex',
      fontFamily: 'Roboto, sans-serif', background: '#FAFAF8',
      alignItems: 'center', justifyContent: 'center', padding: '40px',
    }}>
      <div style={{
        width: '100%', maxWidth: '420px',
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(20px)',
        transition: 'opacity 0.7s ease, transform 0.7s ease',
      }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            width: '56px', height: '56px', borderRadius: '16px',
            background: 'linear-gradient(135deg, #1B6B5A, #00B894)',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            color: '#F5C518', fontWeight: '800', fontSize: '24px',
            marginBottom: '12px',
          }}>X</div>
          <p style={{ margin: 0, fontWeight: '800', fontSize: '20px', color: '#1B6B5A' }}>XenEdu</p>
        </div>

        {!success ? (
          <div style={{
            background: 'white', borderRadius: '20px', padding: '36px',
            boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
            border: '1px solid #F0F0F0',
          }}>
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <div style={{
                width: '64px', height: '64px', borderRadius: '50%',
                background: '#E8F5F0', display: 'inline-flex',
                alignItems: 'center', justifyContent: 'center', fontSize: '28px',
              }}>🔑</div>
            </div>

            <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#1a1a1a', margin: '0 0 8px', textAlign: 'center' }}>
              Set New Password
            </h1>
            <p style={{ color: '#888', fontSize: '14px', margin: '0 0 28px', textAlign: 'center' }}>
              Choose a strong password for your XenEdu account.
            </p>

            <form onSubmit={handleSubmit}>

              {/* New password */}
              <div style={{ marginBottom: '16px' }}>
                <label style={{
                  display: 'block', fontSize: '13px',
                  fontWeight: '600', color: '#444', marginBottom: '8px',
                }}>
                  New Password
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={form.password}
                    onChange={e => setForm({ ...form, password: e.target.value })}
                    placeholder="Min. 6 characters"
                    required
                    style={{
                      width: '100%', padding: '13px 48px 13px 16px',
                      border: '1.5px solid #E8E8E8', borderRadius: '12px',
                      fontSize: '14px', outline: 'none', background: 'white',
                      transition: 'border-color 0.2s',
                      boxSizing: 'border-box', color: '#1a1a1a',
                    }}
                    onFocus={e => e.target.style.borderColor = '#1B6B5A'}
                    onBlur={e => e.target.style.borderColor = '#E8E8E8'}
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute', right: '14px', top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px',
                    }}>
                    {showPassword ? '🙈' : '👁️'}
                  </button>
                </div>

                {/* Password strength */}
                {form.password.length > 0 && (
                  <div style={{ marginTop: '8px' }}>
                    <div style={{ display: 'flex', gap: '4px', marginBottom: '4px' }}>
                      {[1, 2, 3, 4].map(i => (
                        <div key={i} style={{
                          flex: 1, height: '4px', borderRadius: '2px',
                          background: i <= strength ? strengthColors[strength] : '#E8E8E8',
                          transition: 'background 0.3s',
                        }} />
                      ))}
                    </div>
                    <p style={{
                      margin: 0, fontSize: '12px', fontWeight: '600',
                      color: strengthColors[strength],
                    }}>
                      {strengthLabels[strength]}
                    </p>
                  </div>
                )}
              </div>

              {/* Confirm password */}
              <div style={{ marginBottom: '24px' }}>
                <label style={{
                  display: 'block', fontSize: '13px',
                  fontWeight: '600', color: '#444', marginBottom: '8px',
                }}>
                  Confirm Password
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showConfirm ? 'text' : 'password'}
                    value={form.confirmPassword}
                    onChange={e => setForm({ ...form, confirmPassword: e.target.value })}
                    placeholder="Repeat your password"
                    required
                    style={{
                      width: '100%', padding: '13px 48px 13px 16px',
                      border: `1.5px solid ${
                        form.confirmPassword && form.password !== form.confirmPassword
                          ? '#EF4444'
                          : form.confirmPassword && form.password === form.confirmPassword
                          ? '#10B981'
                          : '#E8E8E8'
                      }`,
                      borderRadius: '12px', fontSize: '14px', outline: 'none',
                      background: 'white', transition: 'border-color 0.2s',
                      boxSizing: 'border-box', color: '#1a1a1a',
                    }}
                  />
                  <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                    style={{
                      position: 'absolute', right: '14px', top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px',
                    }}>
                    {showConfirm ? '🙈' : '👁️'}
                  </button>
                </div>
                {form.confirmPassword && form.password !== form.confirmPassword && (
                  <p style={{ margin: '6px 0 0', fontSize: '12px', color: '#EF4444' }}>
                    Passwords do not match
                  </p>
                )}
                {form.confirmPassword && form.password === form.confirmPassword && (
                  <p style={{ margin: '6px 0 0', fontSize: '12px', color: '#10B981' }}>
                    ✓ Passwords match
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading || form.password !== form.confirmPassword}
                style={{
                  width: '100%', padding: '14px',
                  background: loading || form.password !== form.confirmPassword
                    ? '#ccc' : '#1B6B5A',
                  color: 'white', border: 'none', borderRadius: '12px',
                  fontSize: '15px', fontWeight: '700',
                  cursor: loading || form.password !== form.confirmPassword
                    ? 'not-allowed' : 'pointer',
                  boxShadow: '0 4px 15px rgba(27,107,90,0.3)',
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
                    Resetting...
                  </>
                ) : 'Reset Password'}
              </button>
            </form>

            <div style={{ textAlign: 'center', marginTop: '20px' }}>
              <Link to="/login" style={{
                color: '#888', fontSize: '14px', textDecoration: 'none',
              }}>
                ← Back to Login
              </Link>
            </div>
          </div>
        ) : (
          /* Success */
          <div style={{
            background: 'white', borderRadius: '20px', padding: '36px',
            boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
            border: '1px solid #F0F0F0', textAlign: 'center',
            animation: 'fadeIn 0.5s ease',
          }}>
            <div style={{
              width: '72px', height: '72px', borderRadius: '50%',
              background: '#E8F5F0', border: '3px solid #1B6B5A',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '32px', marginBottom: '20px',
            }}>✅</div>
            <h2 style={{ fontSize: '22px', fontWeight: '800', color: '#1a1a1a', margin: '0 0 12px' }}>
              Password Reset!
            </h2>
            <p style={{ color: '#666', fontSize: '14px', margin: '0 0 8px', lineHeight: '1.6' }}>
              Your password has been successfully reset.
            </p>
            <p style={{ color: '#aaa', fontSize: '13px', margin: '0 0 24px' }}>
              Redirecting to login in 3 seconds...
            </p>
            <Link to="/login" style={{
              display: 'inline-block',
              background: 'linear-gradient(135deg, #1B6B5A, #00B894)',
              color: 'white', padding: '12px 32px', borderRadius: '12px',
              fontWeight: '700', fontSize: '14px', textDecoration: 'none',
            }}>
              Go to Login
            </Link>
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
      `}</style>
    </div>
  );
};

export default ResetPasswordPage;