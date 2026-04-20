import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import ZenyaChat from '../../components/common/ZenyaChat';

const stats = [
  { number: '500+', label: 'Students Enrolled' },
  { number: '50+', label: 'Expert Teachers' },
  { number: '30+', label: 'Classes Available' },
  { number: '14+', label: 'Subjects Offered' },
];

const subjects = [
  { name: 'Physics', icon: '⚛️', teachers: 3 },
  { name: 'Combined Mathematics', icon: '📐', teachers: 4 },
  { name: 'Chemistry', icon: '🧪', teachers: 3 },
  { name: 'Biology', icon: '🧬', teachers: 3 },
  { name: 'Economics', icon: '📊', teachers: 2 },
  { name: 'Accounting', icon: '📒', teachers: 2 },
  { name: 'ICT', icon: '💻', teachers: 2 },
  { name: 'English', icon: '📝', teachers: 3 },
];

const steps = [
  {
    number: '01',
    title: 'Register Online',
    desc: "Fill out our simple registration form with your details and your parent's information.",
  },
  {
    number: '02',
    title: 'Admin Approval',
    desc: 'Our admin reviews your application and sends your login credentials via email.',
  },
  {
    number: '03',
    title: 'Browse & Enroll',
    desc: 'Login to your portal, browse available classes and enroll in the subjects you need.',
  },
];

const faqs = [
  { q: 'How do I register at XenEdu?', a: "Click the Register button, fill in the online form, and wait for admin approval. You'll receive your login credentials via email." },
  { q: 'What subjects are available?', a: 'We offer Physics, Combined Mathematics, Chemistry, Biology, Economics, Accounting, ICT, English and more for A/L students.' },
  { q: 'What are the class fees?', a: 'Fees vary by subject and class. Typically between Rs. 2,000 - Rs. 3,500 per month. Contact us for specific pricing.' },
  { q: 'How does attendance work?', a: 'We use a barcode-based attendance system. Your student ID card has a barcode that teachers scan at each session.' },
  { q: 'Can parents monitor their child?', a: 'Yes! Parents get their own portal to monitor attendance, fee payments and enrolled classes in real-time.' },
  { q: 'What is the AI tutor?', a: 'XenEdu has a built-in AI learning platform that helps students with subject explanations and study tips.' },
];

// ─── Teacher Cards Data ───────────────────────────────────────────
const teacherCards = [
  {
    name: 'Samanthi Jayawardena',
    subject: 'Biology',
    icon: '🧬',
    photo: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop&crop=face',
    bg: '#1B6B5A',
    accent: '#F5C518',
  },
  {
    name: 'Kamal Fernando',
    subject: 'Physics',
    icon: '⚛️',
    photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face',
    bg: '#00B894',
    accent: '#ffffff',
  },
  {
    name: 'Nuwan Perera',
    subject: 'Mathematics',
    icon: '📐',
    photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&crop=face',
    bg: '#F5C518',
    accent: '#1B6B5A',
  },
  {
    name: 'Harshani De Silva',
    subject: 'Accounting',
    icon: '📒',
    photo: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&h=400&fit=crop&crop=face',
    bg: '#155a4a',
    accent: '#F5C518',
  },
  {
    name: 'Priya Bandara',
    subject: 'Chemistry',
    icon: '🧪',
    photo: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=face',
    bg: '#00cec9',
    accent: '#ffffff',
  },
  {
    name: 'Roshan Silva',
    subject: 'Economics',
    icon: '📊',
    photo: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face',
    bg: '#1B6B5A',
    accent: '#F5C518',
  },
];

// ─── Rolling Card (side cards) ────────────────────────────────────
const RollingCard = ({ interval, startIndex }) => {
  const [currentIndex, setCurrentIndex] = useState(startIndex % teacherCards.length);
  const [isRolling, setIsRolling] = useState(false);
  const [nextIndex, setNextIndex] = useState((startIndex + 1) % teacherCards.length);

  useEffect(() => {
    const timer = setInterval(() => {
      const next = (currentIndex + 1) % teacherCards.length;
      setNextIndex(next);
      setIsRolling(true);
      setTimeout(() => {
        setCurrentIndex(next);
        setIsRolling(false);
      }, 500);
    }, interval);
    return () => clearInterval(timer);
  }, [currentIndex, interval]);

  const current = teacherCards[currentIndex];
  const next = teacherCards[nextIndex];

  const CardContent = ({ teacher }) => (
    <>
      <img src={teacher.photo} alt={teacher.name}
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, height: '65%',
        background: `linear-gradient(to top, ${teacher.bg}F5, transparent)`, zIndex: 1,
      }} />
      <div style={{ position: 'absolute', bottom: 24, left: 0, right: 0, zIndex: 2, textAlign: 'center', padding: '0 14px' }}>
        <p style={{ margin: '0 0 4px', fontSize: '17px', fontWeight: '800', color: teacher.accent }}>
          {teacher.name.split(' ')[0]}
        </p>
        <p style={{ margin: '0 0 10px', fontSize: '13px', fontWeight: '600', color: 'rgba(255,255,255,0.8)' }}>
          {teacher.name.split(' ').slice(1).join(' ')}
        </p>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '6px',
          background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(8px)',
          borderRadius: '14px', padding: '7px 16px',
          border: '1px solid rgba(255,255,255,0.3)',
        }}>
          <span style={{ fontSize: '15px' }}>{teacher.icon}</span>
          <span style={{ fontSize: '13px', fontWeight: '700', color: 'white' }}>{teacher.subject}</span>
        </div>
      </div>
    </>
  );

  return (
    <div style={{
      width: '260px', height: '380px',
      position: 'relative', overflow: 'hidden',
      borderRadius: '28px',
      boxShadow: '0 20px 56px rgba(0,0,0,0.18)',
      flexShrink: 0, border: '3px solid white',
    }}>
      <div style={{
        position: 'absolute', inset: 0, background: current.bg,
        transform: isRolling ? 'translateY(-100%)' : 'translateY(0)',
        transition: isRolling ? 'transform 0.5s cubic-bezier(0.4,0,0.2,1)' : 'none',
        zIndex: 2,
      }}>
        <CardContent teacher={current} />
      </div>
      <div style={{
        position: 'absolute', inset: 0, background: next.bg,
        transform: isRolling ? 'translateY(0)' : 'translateY(100%)',
        transition: isRolling ? 'transform 0.5s cubic-bezier(0.4,0,0.2,1)' : 'none',
        zIndex: 1,
      }}>
        <CardContent teacher={next} />
      </div>
    </div>
  );
};

// ─── Rolling Card Inner (tall center card) ────────────────────────
const RollingCardInner = ({ interval, startIndex }) => {
  const [currentIndex, setCurrentIndex] = useState(startIndex % teacherCards.length);
  const [isRolling, setIsRolling] = useState(false);
  const [nextIndex, setNextIndex] = useState((startIndex + 1) % teacherCards.length);

  useEffect(() => {
    const timer = setInterval(() => {
      const next = (currentIndex + 1) % teacherCards.length;
      setNextIndex(next);
      setIsRolling(true);
      setTimeout(() => {
        setCurrentIndex(next);
        setIsRolling(false);
      }, 500);
    }, interval);
    return () => clearInterval(timer);
  }, [currentIndex, interval]);

  const current = teacherCards[currentIndex];
  const next = teacherCards[nextIndex];

  const CardContent = ({ teacher }) => (
    <>
      <img src={teacher.photo} alt={teacher.name}
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, height: '65%',
        background: `linear-gradient(to top, ${teacher.bg}F5, transparent)`, zIndex: 1,
      }} />
      <div style={{ position: 'absolute', bottom: 28, left: 0, right: 0, zIndex: 2, textAlign: 'center', padding: '0 16px' }}>
        <p style={{ margin: '0 0 5px', fontSize: '19px', fontWeight: '800', color: teacher.accent }}>
          {teacher.name.split(' ')[0]}
        </p>
        <p style={{ margin: '0 0 12px', fontSize: '14px', fontWeight: '600', color: 'rgba(255,255,255,0.8)' }}>
          {teacher.name.split(' ').slice(1).join(' ')}
        </p>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '7px',
          background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(10px)',
          borderRadius: '16px', padding: '8px 18px',
          border: '1px solid rgba(255,255,255,0.35)',
        }}>
          <span style={{ fontSize: '17px' }}>{teacher.icon}</span>
          <span style={{ fontSize: '14px', fontWeight: '700', color: 'white' }}>{teacher.subject}</span>
        </div>
      </div>
    </>
  );

  return (
    <>
      <div style={{
        position: 'absolute', inset: 0, background: current.bg,
        transform: isRolling ? 'translateY(-100%)' : 'translateY(0)',
        transition: isRolling ? 'transform 0.5s cubic-bezier(0.4,0,0.2,1)' : 'none',
        zIndex: 2,
      }}>
        <CardContent teacher={current} />
      </div>
      <div style={{
        position: 'absolute', inset: 0, background: next.bg,
        transform: isRolling ? 'translateY(0)' : 'translateY(100%)',
        transition: isRolling ? 'transform 0.5s cubic-bezier(0.4,0,0.2,1)' : 'none',
        zIndex: 1,
      }}>
        <CardContent teacher={next} />
      </div>
    </>
  );
};

// ─── Hero Right ───────────────────────────────────────────────────
const HeroRight = ({ visible }) => (
  <div style={{
    flex: '0 0 50%', zIndex: 1,
    opacity: visible ? 1 : 0,
    transform: visible ? 'translateX(0)' : 'translateX(40px)',
    transition: 'opacity 0.9s ease 0.2s, transform 0.9s ease 0.2s',
    position: 'relative',
    display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center',
    minHeight: '600px',
  }}>

    {/* Background blobs */}
    <div style={{
      position: 'absolute', top: '5%', right: '5%',
      width: '300px', height: '300px', borderRadius: '50%',
      background: '#F5C518', opacity: 0.1, zIndex: 0, pointerEvents: 'none',
    }} />
    <div style={{
      position: 'absolute', bottom: '5%', left: '5%',
      width: '240px', height: '240px', borderRadius: '50%',
      background: '#1B6B5A', opacity: 0.08, zIndex: 0, pointerEvents: 'none',
    }} />
    <div style={{
      position: 'absolute', top: '50%', left: '50%',
      width: '200px', height: '200px', borderRadius: '50%',
      background: '#00B894', opacity: 0.05, zIndex: 0, pointerEvents: 'none',
      transform: 'translate(-50%, -50%)',
    }} />

    {/* Label */}
    <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', marginBottom: '36px' }}>
      <div style={{
        display: 'inline-flex', alignItems: 'center', gap: '8px',
        background: '#E8F5F0', border: '1px solid #C8EDE2',
        borderRadius: '20px', padding: '8px 20px',
      }}>
        <div style={{
          width: '8px', height: '8px', borderRadius: '50%', background: '#00B894',
          boxShadow: '0 0 0 3px rgba(0,184,148,0.2)',
        }} />
        <span style={{ color: '#1B6B5A', fontSize: '13px', fontWeight: '700' }}>
          Meet Our Expert Teachers
        </span>
      </div>
    </div>

    {/* 3 Rolling cards */}
    <div style={{
      position: 'relative', zIndex: 1,
      display: 'flex', gap: '24px',
      alignItems: 'flex-end', justifyContent: 'center',
    }}>
      {/* Left card */}
      <div style={{ transform: 'translateY(40px)' }}>
        <RollingCard interval={2500} startIndex={0} />
      </div>

      {/* Center card — tallest */}
      <div style={{ transform: 'translateY(-24px)' }}>
        <div style={{
          width: '260px', height: '460px',
          position: 'relative', overflow: 'hidden',
          borderRadius: '28px',
          boxShadow: '0 28px 72px rgba(27,107,90,0.3)',
          border: '4px solid white',
        }}>
          <RollingCardInner interval={3500} startIndex={2} />
        </div>
      </div>

      {/* Right card */}
      <div style={{ transform: 'translateY(40px)' }}>
        <RollingCard interval={4500} startIndex={4} />
      </div>
    </div>

    {/* Subtle text */}
    <div style={{ position: 'relative', zIndex: 1, marginTop: '40px', textAlign: 'center' }}>
      <p style={{ margin: 0, fontSize: '14px', color: '#888', fontWeight: '500' }}>
        Qualified A/L specialists across{' '}
        <span style={{ color: '#1B6B5A', fontWeight: '700' }}>14+ subjects</span>
      </p>
    </div>
  </div>
);

// ─── Main Component ───────────────────────────────────────────────
const LandingPage = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [visible, setVisible] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);

  useEffect(() => {
    if (user) {
      if (user.role === 'admin') navigate('/admin');
      else if (user.role === 'teacher') navigate('/teacher');
      else if (user.role === 'student') navigate('/student');
      else if (user.role === 'parent') navigate('/parent');
    } else {
      setTimeout(() => setVisible(true), 100);
    }
  }, []);

  return (
    <div style={{ fontFamily: 'Roboto, sans-serif', background: '#FAFAF8', color: '#2D2D2D' }}>

      {/* Navbar */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: 'white', borderBottom: '1px solid #F0F0F0',
        padding: '0 48px', display: 'flex', alignItems: 'center',
        height: '68px', boxShadow: '0 2px 10px rgba(0,0,0,0.06)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginRight: '40px' }}>
          <div style={{
            width: '36px', height: '36px', borderRadius: '10px',
            background: 'linear-gradient(135deg, #1B6B5A, #00B894)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#F5C518', fontWeight: '800', fontSize: '16px',
          }}>X</div>
          <span style={{ fontWeight: '800', fontSize: '20px', color: '#1B6B5A' }}>XenEdu</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '32px', flex: 1 }}>
          {[['Browse Classes', '#classes'], ['How It Works', '#how'], ['Subjects', '#subjects'], ['For Parents', '#parents'], ['FAQ', '#faq']].map(([label, href]) => (
            <a key={label} href={href} style={{
              color: '#666', fontSize: '14px', fontWeight: '500',
              textDecoration: 'none', transition: 'color 0.2s',
            }}
              onMouseEnter={e => e.target.style.color = '#1B6B5A'}
              onMouseLeave={e => e.target.style.color = '#666'}
            >{label}</a>
          ))}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <a href="tel:03322422589" style={{
            color: '#1B6B5A', fontSize: '14px', fontWeight: '600',
            textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px',
          }}>
            <span>📞</span> Contact Us
          </a>
          <Link to="/register" style={{
            padding: '8px 18px', borderRadius: '8px',
            border: '1.5px solid #1B6B5A', color: '#1B6B5A',
            fontSize: '14px', fontWeight: '600', textDecoration: 'none',
          }}
            onMouseEnter={e => { e.target.style.background = '#1B6B5A'; e.target.style.color = 'white'; }}
            onMouseLeave={e => { e.target.style.background = 'transparent'; e.target.style.color = '#1B6B5A'; }}
          >Register</Link>
          <Link to="/login" style={{
            padding: '8px 18px', borderRadius: '8px',
            background: '#1B6B5A', color: 'white',
            fontSize: '14px', fontWeight: '600', textDecoration: 'none',
            boxShadow: '0 2px 10px rgba(27,107,90,0.3)',
          }}
            onMouseEnter={e => e.target.style.background = '#155a4a'}
            onMouseLeave={e => e.target.style.background = '#1B6B5A'}
          >Login</Link>
        </div>
      </nav>

      {/* Hero */}
      <section style={{
        minHeight: '92vh', background: '#FAFAF8',
        display: 'flex', alignItems: 'center',
        padding: '0 48px', gap: '40px',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', top: '-60px', right: '45%',
          width: '300px', height: '300px', borderRadius: '50%',
          background: '#F5C518', opacity: 0.1, zIndex: 0, pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', bottom: '-80px', right: '55%',
          width: '250px', height: '250px', borderRadius: '50%',
          background: '#1B6B5A', opacity: 0.06, zIndex: 0, pointerEvents: 'none',
        }} />

        {/* Left content */}
        <div style={{
          flex: 1, zIndex: 1,
          opacity: visible ? 1 : 0,
          transform: visible ? 'translateX(0)' : 'translateX(-40px)',
          transition: 'opacity 0.9s ease, transform 0.9s ease',
        }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            background: '#E8F5F0', border: '1px solid #C8EDE2',
            borderRadius: '20px', padding: '6px 16px', marginBottom: '24px',
          }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#1B6B5A' }} />
            <span style={{ color: '#1B6B5A', fontSize: '13px', fontWeight: '600' }}>
              Sri Lanka's Smart Tuition System
            </span>
          </div>

          <h1 style={{ fontSize: '54px', fontWeight: '800', lineHeight: '1.15', margin: '0 0 20px', color: '#1a1a1a' }}>
            Study smarter.<br />
            <span style={{
              background: 'linear-gradient(135deg, #1B6B5A, #00B894)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}>Score higher.</span>
          </h1>

          <p style={{ fontSize: '17px', color: '#666', lineHeight: '1.7', margin: '0 0 36px', maxWidth: '480px' }}>
            XenEdu combines expert A/L teachers with AI-powered learning tools —
            built for Sri Lankan students who aim for the top.
          </p>

          <div style={{ marginBottom: '24px' }}>
            <p style={{ fontSize: '13px', color: '#888', fontWeight: '600', marginBottom: '10px' }}>BROWSE BY GRADE</p>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '12px' }}>
              {['Grade 12', 'Grade 13', 'Both'].map(g => (
                <button key={g} onClick={() => navigate('/register')} style={{
                  padding: '7px 16px', borderRadius: '20px',
                  border: '1.5px solid #1B6B5A', background: 'transparent',
                  color: '#1B6B5A', fontSize: '13px', fontWeight: '600', cursor: 'pointer',
                }}
                  onMouseEnter={e => { e.target.style.background = '#1B6B5A'; e.target.style.color = 'white'; }}
                  onMouseLeave={e => { e.target.style.background = 'transparent'; e.target.style.color = '#1B6B5A'; }}
                >{g}</button>
              ))}
            </div>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {['Sinhala', 'Tamil', 'English'].map(m => (
                <button key={m} onClick={() => navigate('/register')} style={{
                  padding: '7px 16px', borderRadius: '20px',
                  border: '1.5px solid #F5C518', background: 'transparent',
                  color: '#b8860b', fontSize: '13px', fontWeight: '600', cursor: 'pointer',
                }}
                  onMouseEnter={e => { e.target.style.background = '#F5C518'; e.target.style.color = '#1B6B5A'; }}
                  onMouseLeave={e => { e.target.style.background = 'transparent'; e.target.style.color = '#b8860b'; }}
                >{m}</button>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <Link to="/register" style={{
              padding: '14px 32px', borderRadius: '12px',
              background: '#1B6B5A', color: 'white',
              fontSize: '15px', fontWeight: '700', textDecoration: 'none',
              boxShadow: '0 4px 20px rgba(27,107,90,0.35)',
            }}
              onMouseEnter={e => { e.target.style.background = '#155a4a'; e.target.style.transform = 'translateY(-2px)'; }}
              onMouseLeave={e => { e.target.style.background = '#1B6B5A'; e.target.style.transform = 'translateY(0)'; }}
            >Find a Class</Link>
            <a href="#how" style={{
              padding: '14px 32px', borderRadius: '12px',
              border: '1.5px solid #ddd', color: '#444',
              fontSize: '15px', fontWeight: '600', textDecoration: 'none',
            }}
              onMouseEnter={e => { e.target.style.borderColor = '#1B6B5A'; e.target.style.color = '#1B6B5A'; }}
              onMouseLeave={e => { e.target.style.borderColor = '#ddd'; e.target.style.color = '#444'; }}
            >How it works</a>
          </div>
        </div>

        {/* Right — Rolling Teacher Cards */}
        <HeroRight visible={visible} />
      </section>

      {/* Stats */}
      <section style={{
        background: '#1B6B5A', padding: '32px 48px',
        display: 'flex', justifyContent: 'center', gap: '80px',
      }}>
        {stats.map((stat, i) => (
          <div key={i} style={{ textAlign: 'center' }}>
            <p style={{ margin: 0, fontSize: '36px', fontWeight: '800', color: '#F5C518' }}>{stat.number}</p>
            <p style={{ margin: '4px 0 0', fontSize: '14px', color: 'rgba(255,255,255,0.8)', fontWeight: '500' }}>{stat.label}</p>
          </div>
        ))}
      </section>

      {/* How it works */}
      <section id="how" style={{ padding: '80px 48px', background: 'white' }}>
        <div style={{ textAlign: 'center', marginBottom: '56px' }}>
          <p style={{ color: '#1B6B5A', fontWeight: '700', fontSize: '13px', letterSpacing: '2px', marginBottom: '12px' }}>HOW IT WORKS</p>
          <h2 style={{ fontSize: '36px', fontWeight: '800', margin: '0 0 16px', color: '#1a1a1a' }}>Get started in 3 simple steps</h2>
          <p style={{ color: '#888', fontSize: '16px', maxWidth: '480px', margin: '0 auto' }}>
            From registration to learning — our process is simple, fast and fully online.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '32px', maxWidth: '900px', margin: '0 auto' }}>
          {steps.map((step, i) => (
            <div key={i} style={{
              flex: 1, textAlign: 'center', padding: '32px 24px', borderRadius: '20px',
              background: i === 1 ? '#1B6B5A' : '#FAFAF8',
              border: i === 1 ? 'none' : '1px solid #F0F0F0',
              boxShadow: i === 1 ? '0 10px 40px rgba(27,107,90,0.25)' : '0 2px 10px rgba(0,0,0,0.04)',
              transform: i === 1 ? 'translateY(-12px)' : 'translateY(0)',
            }}>
              <div style={{
                width: '56px', height: '56px', borderRadius: '16px',
                background: i === 1 ? 'rgba(245,197,24,0.2)' : '#E8F5F0',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 20px', fontSize: '22px', fontWeight: '800',
                color: i === 1 ? '#F5C518' : '#1B6B5A',
              }}>{step.number}</div>
              <h3 style={{ fontSize: '18px', fontWeight: '700', margin: '0 0 12px', color: i === 1 ? 'white' : '#1a1a1a' }}>
                {step.title}
              </h3>
              <p style={{ fontSize: '14px', lineHeight: '1.6', margin: 0, color: i === 1 ? 'rgba(255,255,255,0.75)' : '#888' }}>
                {step.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Subjects */}
      <section id="subjects" style={{ padding: '80px 48px', background: '#FAFAF8' }}>
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <p style={{ color: '#1B6B5A', fontWeight: '700', fontSize: '13px', letterSpacing: '2px', marginBottom: '12px' }}>OUR SUBJECTS</p>
          <h2 style={{ fontSize: '36px', fontWeight: '800', margin: 0, color: '#1a1a1a' }}>Expert teachers for every subject</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', maxWidth: '1000px', margin: '0 auto' }}>
          {subjects.map((subj, i) => (
            <div key={i} onClick={() => navigate('/register')}
              style={{
                background: 'white', borderRadius: '16px', padding: '24px',
                border: '1px solid #F0F0F0', boxShadow: '0 2px 10px rgba(0,0,0,0.04)',
                cursor: 'pointer', transition: 'all 0.3s ease', textAlign: 'center',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-6px)';
                e.currentTarget.style.boxShadow = '0 12px 30px rgba(27,107,90,0.15)';
                e.currentTarget.style.borderColor = '#1B6B5A';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 10px rgba(0,0,0,0.04)';
                e.currentTarget.style.borderColor = '#F0F0F0';
              }}
            >
              <div style={{ fontSize: '32px', marginBottom: '12px' }}>{subj.icon}</div>
              <p style={{ margin: '0 0 6px', fontWeight: '700', fontSize: '14px', color: '#1a1a1a' }}>{subj.name}</p>
              <p style={{ margin: 0, fontSize: '12px', color: '#1B6B5A', fontWeight: '600' }}>{subj.teachers} teachers</p>
            </div>
          ))}
        </div>
      </section>

      {/* Why XenEdu */}
      <section id="parents" style={{ padding: '80px 48px', background: 'white' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'flex', gap: '60px', alignItems: 'center' }}>
          <div style={{ flex: 1 }}>
            <p style={{ color: '#1B6B5A', fontWeight: '700', fontSize: '13px', letterSpacing: '2px', marginBottom: '12px' }}>WHY XENEDU</p>
            <h2 style={{ fontSize: '36px', fontWeight: '800', margin: '0 0 32px', color: '#1a1a1a' }}>
              Everything your child needs to succeed
            </h2>
            {[
              { icon: '🤖', title: 'AI-Powered Learning', desc: 'Personal AI tutor available 24/7 for subject help and study guidance.' },
              { icon: '📱', title: 'Barcode Attendance', desc: 'Fast and accurate attendance tracking using student ID barcodes.' },
              { icon: '💳', title: 'Easy Fee Payments', desc: 'Pay fees at the institute counter with barcode scan — instant receipt.' },
              { icon: '👨‍👩‍👧', title: 'Parent Monitoring', desc: 'Parents get real-time access to attendance, fees and class schedules.' },
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', gap: '16px', alignItems: 'flex-start', marginBottom: '24px' }}>
                <div style={{
                  width: '48px', height: '48px', borderRadius: '14px',
                  background: '#E8F5F0', flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px',
                }}>{item.icon}</div>
                <div>
                  <p style={{ margin: '0 0 4px', fontWeight: '700', fontSize: '15px', color: '#1a1a1a' }}>{item.title}</p>
                  <p style={{ margin: 0, fontSize: '14px', color: '#888', lineHeight: '1.5' }}>{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{
              background: 'linear-gradient(135deg, #1B6B5A, #00B894)',
              borderRadius: '24px', padding: '40px', color: 'white', textAlign: 'center',
            }}>
              <p style={{ fontSize: '18px', fontWeight: '700', margin: '0 0 8px' }}>Ready to get started?</p>
              <p style={{ fontSize: '14px', opacity: 0.8, margin: '0 0 28px', lineHeight: '1.6' }}>
                Join hundreds of A/L students already excelling with XenEdu's smart tuition system.
              </p>
              <Link to="/register" style={{
                display: 'inline-block', background: '#F5C518', color: '#1B6B5A',
                padding: '14px 36px', borderRadius: '12px',
                fontWeight: '800', fontSize: '15px', textDecoration: 'none',
                boxShadow: '0 4px 15px rgba(245,197,24,0.4)',
              }}
                onMouseEnter={e => e.target.style.transform = 'scale(1.05)'}
                onMouseLeave={e => e.target.style.transform = 'scale(1)'}
              >Register Now — It's Free</Link>
              <p style={{ margin: '16px 0 0', fontSize: '12px', opacity: 0.7 }}>No credit card required</p>
              <div style={{
                marginTop: '32px', paddingTop: '24px',
                borderTop: '1px solid rgba(255,255,255,0.2)',
                display: 'flex', gap: '24px', justifyContent: 'center',
              }}>
                {[['📍', 'XenEdu Mirigama'], ['📧', 'xenedu@gmail.com'], ['📞', '033-2242-2589']].map(([icon, text]) => (
                  <div key={text} style={{ fontSize: '12px', opacity: 0.85 }}>{icon} {text}</div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" style={{ padding: '80px 48px', background: '#FAFAF8' }}>
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <p style={{ color: '#1B6B5A', fontWeight: '700', fontSize: '13px', letterSpacing: '2px', marginBottom: '12px' }}>FAQ</p>
          <h2 style={{ fontSize: '36px', fontWeight: '800', margin: '0 0 12px', color: '#1a1a1a' }}>Frequently asked questions</h2>
          <p style={{ color: '#888', fontSize: '15px' }}>Can't find what you're looking for? Ask Zenya — our AI assistant!</p>
        </div>
        <div style={{ maxWidth: '700px', margin: '0 auto' }}>
          {faqs.map((faq, i) => (
            <div key={i} style={{
              background: 'white', borderRadius: '14px', marginBottom: '12px',
              border: openFaq === i ? '1.5px solid #1B6B5A' : '1px solid #F0F0F0',
              overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
            }}>
              <button onClick={() => setOpenFaq(openFaq === i ? null : i)}
                style={{
                  width: '100%', padding: '18px 24px',
                  background: 'none', border: 'none', cursor: 'pointer',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  textAlign: 'left',
                }}>
                <span style={{ fontWeight: '600', fontSize: '15px', color: '#1a1a1a' }}>{faq.q}</span>
                <span style={{
                  color: '#1B6B5A', fontSize: '20px', fontWeight: '300',
                  transform: openFaq === i ? 'rotate(45deg)' : 'rotate(0)',
                  transition: 'transform 0.3s ease', flexShrink: 0, marginLeft: '12px',
                }}>+</span>
              </button>
              {openFaq === i && (
                <div style={{ padding: '0 24px 18px' }}>
                  <p style={{ margin: 0, fontSize: '14px', color: '#666', lineHeight: '1.6' }}>{faq.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer style={{ background: '#1a1a1a', color: 'white', padding: '48px 48px 24px' }}>
        <div style={{
          display: 'flex', gap: '60px', paddingBottom: '40px',
          borderBottom: '1px solid rgba(255,255,255,0.1)', marginBottom: '24px',
        }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <div style={{
                width: '32px', height: '32px', borderRadius: '8px',
                background: 'linear-gradient(135deg, #1B6B5A, #00B894)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#F5C518', fontWeight: '800', fontSize: '14px',
              }}>X</div>
              <span style={{ fontWeight: '800', fontSize: '18px', color: '#F5C518' }}>XenEdu</span>
            </div>
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '14px', lineHeight: '1.6', maxWidth: '280px' }}>
              Sri Lanka's smart A/L tuition management system with AI-powered learning.
            </p>
          </div>
          {[
            { title: 'Quick Links', links: ['Browse Classes', 'Register', 'Login', 'How It Works'] },
            { title: 'Subjects', links: ['Physics', 'Mathematics', 'Chemistry', 'Biology', 'Economics'] },
          ].map(col => (
            <div key={col.title}>
              <p style={{ fontWeight: '700', fontSize: '14px', marginBottom: '16px', color: '#F5C518' }}>{col.title}</p>
              {col.links.map(link => (
                <p key={link} style={{ margin: '0 0 8px', fontSize: '14px', color: 'rgba(255,255,255,0.6)' }}>{link}</p>
              ))}
            </div>
          ))}
          <div>
            <p style={{ fontWeight: '700', fontSize: '14px', marginBottom: '16px', color: '#F5C518' }}>Contact Us</p>
            {[['📍', 'XenEdu Mirigama'], ['📧', 'xenedu@gmail.com'], ['📞', '033-2242-2589']].map(([icon, text]) => (
              <p key={text} style={{ margin: '0 0 10px', fontSize: '14px', color: 'rgba(255,255,255,0.6)', display: 'flex', gap: '8px' }}>
                <span>{icon}</span> {text}
              </p>
            ))}
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <p style={{ margin: 0, fontSize: '13px', color: 'rgba(255,255,255,0.4)' }}>© 2026 XenEdu Mirigama. All rights reserved.</p>
          <p style={{ margin: 0, fontSize: '13px', color: 'rgba(255,255,255,0.4)' }}>
            Powered by <span style={{ color: '#00B894' }}>Vyosity</span>
          </p>
        </div>
      </footer>

      <ZenyaChat />
    </div>
  );
};

export default LandingPage;