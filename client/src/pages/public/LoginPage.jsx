import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import api from '../../api/axios';
import toast from 'react-hot-toast';

const LoginPage = () => {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [visible, setVisible] = useState(false);
  const [success, setSuccess] = useState(false);
  const [successRole, setSuccessRole] = useState('');

  useEffect(() => {
    setTimeout(() => setVisible(true), 80);
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/auth/login', formData);
      const { user, accessToken, refreshToken } = res.data;
      setAuth(user, accessToken, refreshToken);
      setSuccessRole(user.role);
      setSuccess(true);
      setTimeout(() => {
        if (user.role === 'admin') navigate('/admin');
        else if (user.role === 'teacher') navigate('/teacher');
        else if (user.role === 'student') navigate('/student');
        else if (user.role === 'parent') navigate('/parent');
      }, 2000);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed');
      setLoading(false);
    }
  };

  const roleColors = {
    admin: '#1B6B5A',
    teacher: '#3B82F6',
    student: '#8B5CF6',
    parent: '#F59E0B',
  };

  const roleLabels = {
    admin: 'Admin Portal',
    teacher: 'Teacher Portal',
    student: 'Student Portal',
    parent: 'Parent Portal',
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      fontFamily: 'Roboto, sans-serif',
    }}>

      {/* Success overlay */}
      {success && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 1000,
          background: 'rgba(255,255,255,0.95)',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          animation: 'fadeIn 0.4s ease',
        }}>
          {/* Ripple circles */}
          <div style={{ position: 'relative', marginBottom: '32px' }}>
            {[1, 2, 3].map(i => (
              <div key={i} style={{
                position: 'absolute',
                top: '50%', left: '50%',
                transform: 'translate(-50%, -50%)',
                width: `${i * 60}px`, height: `${i * 60}px`,
                borderRadius: '50%',
                border: `2px solid ${roleColors[successRole] || '#1B6B5A'}`,
                opacity: 0,
                animation: `ripple 1.8s ease-out ${i * 0.3}s infinite`,
              }} />
            ))}
            {/* Center ball */}
            <div style={{
              width: '80px', height: '80px', borderRadius: '50%',
              background: `linear-gradient(135deg, #1B6B5A, #00B894)`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: `0 0 40px rgba(27,107,90,0.4)`,
              animation: 'successPulse 1s ease-in-out infinite',
              position: 'relative', zIndex: 1,
            }}>
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            </div>
          </div>

          <h2 style={{
            fontSize: '26px', fontWeight: '800',
            color: '#1a1a1a', margin: '0 0 8px',
            animation: 'slideUp 0.5s ease 0.2s both',
          }}>
            Login Successful!
          </h2>
          <p style={{
            color: '#888', fontSize: '15px', margin: '0 0 20px',
            animation: 'slideUp 0.5s ease 0.35s both',
          }}>
            Redirecting to {roleLabels[successRole]}...
          </p>

          {/* Loading bar */}
          <div style={{
            width: '200px', height: '4px',
            background: '#F0F0F0', borderRadius: '4px',
            overflow: 'hidden',
            animation: 'slideUp 0.5s ease 0.4s both',
          }}>
            <div style={{
              height: '100%', borderRadius: '4px',
              background: `linear-gradient(135deg, #1B6B5A, #00B894)`,
              animation: 'loadBar 1.8s ease forwards',
            }} />
          </div>

          <style>{`
            @keyframes fadeIn {
              from { opacity: 0; }
              to { opacity: 1; }
            }
            @keyframes ripple {
              0% { transform: translate(-50%, -50%) scale(0.8); opacity: 0.6; }
              100% { transform: translate(-50%, -50%) scale(2.5); opacity: 0; }
            }
            @keyframes successPulse {
              0%, 100% { transform: scale(1); }
              50% { transform: scale(1.08); }
            }
            @keyframes slideUp {
              from { opacity: 0; transform: translateY(16px); }
              to { opacity: 1; transform: translateY(0); }
            }
            @keyframes loadBar {
              from { width: 0%; }
              to { width: 100%; }
            }
          `}</style>
        </div>
      )}

      {/* Left side */}
      <div style={{
        flex: '0 0 50%',
        background: 'linear-gradient(135deg, #0d1f18 0%, #1B6B5A 60%, #00B894 100%)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '40px',
        position: 'relative',
        overflow: 'hidden',
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateX(0)' : 'translateX(-30px)',
        transition: 'opacity 0.9s ease, transform 0.9s ease',
      }}>

        {/* Background circles */}
        <div style={{
          position: 'absolute', top: '-80px', right: '-80px',
          width: '300px', height: '300px', borderRadius: '50%',
          background: 'rgba(245,197,24,0.1)',
        }} />
        <div style={{
          position: 'absolute', bottom: '-60px', left: '-60px',
          width: '250px', height: '250px', borderRadius: '50%',
          background: 'rgba(0,255,180,0.08)',
        }} />

        {/* Logo */}
        <div style={{
          display: 'flex', alignItems: 'center',
          gap: '10px', zIndex: 1,
        }}>
          <div style={{
            width: '40px', height: '40px', borderRadius: '12px',
            background: 'rgba(245,197,24,0.2)',
            border: '2px solid rgba(245,197,24,0.4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#F5C518', fontWeight: '800', fontSize: '18px',
          }}>X</div>
          <span style={{ color: '#F5C518', fontWeight: '800', fontSize: '24px' }}>XenEdu</span>
        </div>

        {/* Center content */}
        <div style={{ zIndex: 1 }}>
          <div style={{
            width: '80px', height: '80px', borderRadius: '50%',
            background: 'radial-gradient(circle at 30% 30%, #00FFD1, #00B894 40%, #1B6B5A)',
            boxShadow: '0 0 40px rgba(0,255,180,0.4)',
            marginBottom: '32px',
            animation: 'ballPulse 3s ease-in-out infinite',
          }} />

          <h2 style={{
            color: 'white', fontSize: '36px', fontWeight: '800',
            margin: '0 0 16px', lineHeight: '1.2',
          }}>
            Welcome back to<br />
            <span style={{ color: '#F5C518' }}>XenEdu</span>
          </h2>
          <p style={{
            color: 'rgba(255,255,255,0.65)', fontSize: '15px',
            lineHeight: '1.7', maxWidth: '340px',
          }}>
            Sri Lanka's smart A/L tuition management system with AI-powered learning.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '32px' }}>
            {[
              { icon: '🤖', text: 'AI-powered learning assistant' },
              { icon: '📊', text: 'Real-time attendance tracking' },
              { icon: '👨‍👩‍👧', text: 'Parent monitoring portal' },
            ].map((item, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: '12px',
                background: 'rgba(255,255,255,0.08)',
                borderRadius: '12px', padding: '12px 16px',
                border: '1px solid rgba(255,255,255,0.1)',
                opacity: visible ? 1 : 0,
                transform: visible ? 'translateX(0)' : 'translateX(-20px)',
                transition: `opacity 0.7s ease ${0.4 + i * 0.15}s, transform 0.7s ease ${0.4 + i * 0.15}s`,
              }}>
                <span style={{ fontSize: '20px' }}>{item.icon}</span>
                <span style={{ color: 'rgba(255,255,255,0.85)', fontSize: '14px', fontWeight: '500' }}>
                  {item.text}
                </span>
              </div>
            ))}
          </div>
        </div>

        <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '13px', margin: 0, zIndex: 1 }}>
          © 2026 XenEdu Mirigama
        </p>

        <style>{`
          @keyframes ballPulse {
            0%, 100% { transform: scale(1); box-shadow: 0 0 40px rgba(0,255,180,0.4); }
            50% { transform: scale(1.07); box-shadow: 0 0 60px rgba(0,255,180,0.65); }
          }
        `}</style>
      </div>

      {/* Right side — form */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px',
        background: '#FAFAF8',
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateX(0)' : 'translateX(30px)',
        transition: 'opacity 0.9s ease 0.1s, transform 0.9s ease 0.1s',
      }}>
        <div style={{ width: '100%', maxWidth: '400px' }}>

          <Link to="/" style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            color: '#888', fontSize: '13px', textDecoration: 'none',
            marginBottom: '40px', transition: 'color 0.2s',
          }}
            onMouseEnter={e => e.currentTarget.style.color = '#1B6B5A'}
            onMouseLeave={e => e.currentTarget.style.color = '#888'}
          >
            ← Back to home
          </Link>

          <h1 style={{ fontSize: '30px', fontWeight: '800', color: '#1a1a1a', margin: '0 0 8px' }}>
            Sign in
          </h1>
          <p style={{ color: '#888', fontSize: '15px', margin: '0 0 36px' }}>
            Welcome back! Enter your credentials to continue.
          </p>

          <form onSubmit={handleSubmit}>

            {/* Email */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block', fontSize: '13px',
                fontWeight: '600', color: '#444', marginBottom: '8px',
              }}>
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@xenedu.com"
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

            {/* Password */}
            <div style={{ marginBottom: '28px' }}>
              <label style={{
                display: 'block', fontSize: '13px',
                fontWeight: '600', color: '#444', marginBottom: '8px',
              }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  required
                  style={{
                    width: '100%', padding: '13px 48px 13px 16px',
                    border: '1.5px solid #E8E8E8',
                    borderRadius: '12px', fontSize: '14px',
                    outline: 'none', background: 'white',
                    transition: 'border-color 0.2s',
                    boxSizing: 'border-box', color: '#1a1a1a',
                  }}
                  onFocus={e => e.target.style.borderColor = '#1B6B5A'}
                  onBlur={e => e.target.style.borderColor = '#E8E8E8'}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute', right: '14px', top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none', border: 'none',
                    cursor: 'pointer', color: '#888', fontSize: '16px',
                  }}
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%', padding: '14px',
                background: loading
                  ? 'linear-gradient(135deg, #155a4a, #00B894)'
                  : '#1B6B5A',
                color: 'white', border: 'none',
                borderRadius: '12px', fontSize: '15px',
                fontWeight: '700',
                cursor: loading ? 'not-allowed' : 'pointer',
                boxShadow: '0 4px 15px rgba(27,107,90,0.3)',
                transition: 'all 0.3s ease',
                position: 'relative', overflow: 'hidden',
              }}
              onMouseEnter={e => { if (!loading) e.currentTarget.style.background = '#155a4a'; }}
              onMouseLeave={e => { if (!loading) e.currentTarget.style.background = '#1B6B5A'; }}
            >
              {loading ? (
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                  <span style={{
                    width: '18px', height: '18px', borderRadius: '50%',
                    border: '2.5px solid rgba(255,255,255,0.3)',
                    borderTopColor: 'white',
                    animation: 'spin 0.7s linear infinite',
                    display: 'inline-block',
                  }} />
                  Signing in...
                </span>
              ) : 'Sign In'}
            </button>

          </form>

          <div style={{
            display: 'flex', alignItems: 'center', gap: '12px',
            margin: '24px 0',
          }}>
            <div style={{ flex: 1, height: '1px', background: '#E8E8E8' }} />
            <span style={{ color: '#BBB', fontSize: '13px' }}>or</span>
            <div style={{ flex: 1, height: '1px', background: '#E8E8E8' }} />
          </div>

          <p style={{ textAlign: 'center', fontSize: '14px', color: '#888', margin: 0 }}>
            New student?{' '}
            <div style={{ textAlign: 'center', marginBottom: '12px' }}>
              <Link to="/forgot-password" style={{
                color: '#888', fontSize: '14px', textDecoration: 'none',
                transition: 'color 0.2s',
              }}
                onMouseEnter={e => e.currentTarget.style.color = '#1B6B5A'}
                onMouseLeave={e => e.currentTarget.style.color = '#888'}
              >
                Forgot your password?
              </Link>
            </div>
            <Link to="/register" style={{ color: '#1B6B5A', fontWeight: '700', textDecoration: 'none' }}>
              Apply for registration
            </Link>
          </p>

        </div>

        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    </div>
  );
};

export default LoginPage;