import { useState, useRef, useEffect } from 'react';
import api from '../../api/axios';
import useAuthStore from '../../store/authStore';

const faqs = [
  'What classes are available?',
  'How do I pay my fees?',
  'What is the attendance policy?',
  'How do I enroll in a class?',
  'What are the class timings?',
  'How can I view my results?',
];

const popoutSequence = [
  { text: "Hi there! I'm Zenya 👋", delay: 1500 },
  { text: "Your XenEdu AI Assistant!", delay: 4000 },
  { text: "Ask me anything about classes, fees or studies 📚", delay: 7000 },
];

const AVATAR = "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&h=200&fit=crop&crop=face&auto=format";

const ZenyaChat = () => {
  const { user } = useAuthStore();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [started, setStarted] = useState(false);
  const [pendingMessage, setPendingMessage] = useState(null);
  const [popouts, setPopouts] = useState([]);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (open) { setPopouts([]); return; }
    const timers = popoutSequence.map((item, i) =>
      setTimeout(() => {
        setPopouts(prev => [...prev, { id: i, text: item.text }]);
        setTimeout(() => {
          setPopouts(prev => prev.filter(p => p.id !== i));
        }, 4000);
      }, item.delay)
    );
    return () => timers.forEach(clearTimeout);
  }, [open]);

  useEffect(() => {
    if (started && pendingMessage) {
      sendMessage(pendingMessage);
      setPendingMessage(null);
    }
  }, [started, pendingMessage]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (open && started) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open, started]);

  const startChat = (faqMessage = null) => {
    const welcomeText = `Hi${user ? `, ${user.name.split(' ')[0]}` : ''}! 👋 I'm Zenya, your XenEdu AI assistant.\n\nI can help you with classes, fees, attendance, and anything about your studies. What would you like to know?`;
    setMessages([{ role: 'assistant', content: welcomeText }]);
    setStarted(true);
    if (faqMessage) setPendingMessage(faqMessage);
  };

  const sendMessage = async (text) => {
    const messageText = text || input.trim();
    if (!messageText || loading) return;
    const userMessage = { role: 'user', content: messageText };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setLoading(true);
    try {
      const res = await api.post('/ai/chat', {
        message: messageText,
        conversationHistory: newMessages.slice(0, -1).map(m => ({
          role: m.role, content: m.content,
        })),
      });
      setMessages(prev => [...prev, { role: 'assistant', content: res.data.reply }]);
    } catch {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, I had trouble responding. Please try again!',
      }]);
    } finally {
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  return (
    <>
      <style>{`
        @keyframes bounce {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-7px); }
        }
        @keyframes onlinePulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.5); }
        }
        @keyframes chatSlideUp {
          from { opacity: 0; transform: translateY(28px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes popoutIn {
          from { opacity: 0; transform: translateX(12px) scale(0.94); }
          to { opacity: 1; transform: translateX(0) scale(1); }
        }
        @keyframes floatBtn {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-7px); }
        }
        .zenya-faq-btn:hover {
          background: #F0FBF7 !important;
          border-color: #1B6B5A !important;
          transform: translateX(5px);
        }
        .zenya-chip:hover {
          background: #1B6B5A !important;
          color: white !important;
        }
        .zenya-send:hover:not(:disabled) {
          transform: scale(1.08);
        }
        .zenya-start:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(27,107,90,0.4) !important;
        }
        .zenya-scroll::-webkit-scrollbar { width: 4px; }
        .zenya-scroll::-webkit-scrollbar-track { background: transparent; }
        .zenya-scroll::-webkit-scrollbar-thumb {
          background: rgba(27,107,90,0.2);
          border-radius: 4px;
        }
      `}</style>

      {/* Popout bubbles */}
      {!open && popouts.map((p, i) => (
        <div key={p.id} onClick={() => { setOpen(true); setPopouts([]); }}
          style={{
            position: 'fixed', bottom: `${120 + i * 58}px`, right: '108px',
            background: 'white', borderRadius: '16px 16px 4px 16px',
            padding: '12px 18px',
            boxShadow: '0 8px 30px rgba(27,107,90,0.18)',
            border: '1px solid rgba(27,107,90,0.12)',
            zIndex: 999, maxWidth: '240px', cursor: 'pointer',
            animation: 'popoutIn 0.4s ease',
          }}>
          <p style={{ margin: 0, fontSize: '14px', fontWeight: '600', color: '#1B6B5A', lineHeight: '1.4' }}>
            {p.text}
          </p>
          <div style={{
            position: 'absolute', bottom: '-6px', right: '16px',
            width: '12px', height: '12px', background: 'white',
            borderRight: '1px solid rgba(27,107,90,0.12)',
            borderBottom: '1px solid rgba(27,107,90,0.12)',
            transform: 'rotate(45deg)',
          }} />
        </div>
      ))}

      {/* Floating button */}
      <button
        onClick={() => { setOpen(!open); setPopouts([]); }}
        style={{
          position: 'fixed', bottom: '32px', right: '28px',
          width: '68px', height: '68px', borderRadius: '50%',
          border: '3px solid white', cursor: 'pointer',
          background: 'transparent', padding: '0', zIndex: 1000,
          overflow: 'hidden',
          boxShadow: '0 4px 20px rgba(27,107,90,0.4), 0 0 0 4px rgba(27,107,90,0.1)',
          animation: open ? 'none' : 'floatBtn 3s ease-in-out infinite',
          transition: 'transform 0.25s ease, box-shadow 0.25s ease',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.transform = 'scale(1.1)';
          e.currentTarget.style.boxShadow = '0 8px 28px rgba(27,107,90,0.5), 0 0 0 6px rgba(27,107,90,0.15)';
        }}
        onMouseLeave={e => {
          e.currentTarget.style.transform = 'scale(1)';
          e.currentTarget.style.boxShadow = '0 4px 20px rgba(27,107,90,0.4), 0 0 0 4px rgba(27,107,90,0.1)';
        }}
      >
        {open ? (
          <div style={{
            width: '100%', height: '100%', borderRadius: '50%',
            background: 'linear-gradient(135deg, #1B6B5A, #00B894)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
              stroke="white" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </div>
        ) : (
          <img src={AVATAR} alt="Zenya"
            style={{
              width: '100%', height: '100%',
              objectFit: 'cover', borderRadius: '50%', display: 'block',
            }}
          />
        )}
      </button>

      {/* Chat window */}
      {open && (
        <div style={{
          position: 'fixed', bottom: '116px', right: '28px',
          width: '440px', height: '640px',
          background: '#FFFFFF', borderRadius: '24px',
          boxShadow: '0 24px 80px rgba(27,107,90,0.18), 0 8px 32px rgba(0,0,0,0.1)',
          border: '1px solid rgba(27,107,90,0.1)',
          display: 'flex', flexDirection: 'column',
          zIndex: 999, overflow: 'hidden',
          fontFamily: 'Roboto, sans-serif',
          animation: 'chatSlideUp 0.35s cubic-bezier(0.34,1.56,0.64,1)',
        }}>

          {/* Header */}
          <div style={{
            background: 'linear-gradient(135deg, #1B6B5A 0%, #155a4a 60%, #00B894 100%)',
            padding: '11px 18px',
            display: 'flex', alignItems: 'center', gap: '12px',
            flexShrink: 0,
          }}>
            <div style={{ position: 'relative', flexShrink: 0 }}>
              <img src={AVATAR} alt="Zenya"
                style={{
                  width: '42px', height: '42px', borderRadius: '50%',
                  objectFit: 'cover',
                  border: '2px solid rgba(255,255,255,0.5)',
                  display: 'block',
                }}
              />
              <div style={{
                position: 'absolute', bottom: '1px', right: '1px',
                width: '11px', height: '11px', borderRadius: '50%',
                background: '#00FF9D', border: '2px solid white',
                animation: 'onlinePulse 2s ease-in-out infinite',
              }} />
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ margin: 0, color: 'white', fontWeight: '800', fontSize: '15px' }}>
                Zenya
              </p>
              <p style={{ margin: '1px 0 0', color: 'rgba(255,255,255,0.75)', fontSize: '11px' }}>
                Online — XenEdu AI Assistant
              </p>
            </div>
            <button onClick={() => setOpen(false)}
              style={{
                background: 'rgba(255,255,255,0.15)', border: 'none',
                borderRadius: '10px', padding: '7px 9px',
                cursor: 'pointer', color: 'white', fontSize: '16px', lineHeight: 1,
                transition: 'background 0.2s',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.25)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
            >
              ✕
            </button>
          </div>

          {/* Welcome screen */}
          {!started ? (
            <div style={{
              flex: 1, display: 'flex', flexDirection: 'column',
              background: '#FAFFFE', overflow: 'hidden',
            }}>
              {/* Scrollable content */}
              <div className="zenya-scroll" style={{
                flex: 1, overflowY: 'auto',
                padding: '28px 24px 16px',
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', textAlign: 'center',
              }}>

                {/* Big avatar */}
                <div style={{ position: 'relative', marginBottom: '18px', flexShrink: 0 }}>
                  <img src={AVATAR} alt="Zenya"
                    style={{
                      width: '96px', height: '96px', borderRadius: '50%',
                      objectFit: 'cover',
                      border: '4px solid #1B6B5A',
                      boxShadow: '0 8px 28px rgba(27,107,90,0.25)',
                      display: 'block',
                    }}
                  />
                  <div style={{
                    position: 'absolute', bottom: '4px', right: '4px',
                    width: '18px', height: '18px', borderRadius: '50%',
                    background: '#00C853', border: '3px solid white',
                  }} />
                </div>

                <h3 style={{ margin: '0 0 5px', color: '#1a1a1a', fontSize: '24px', fontWeight: '800' }}>
                  Hi, I'm <span style={{ color: '#1B6B5A' }}>Zenya</span> 👋
                </h3>
                <p style={{ margin: '0 0 4px', color: '#00B894', fontSize: '13px', fontWeight: '600' }}>
                  Your intelligent AI assistant
                </p>
                <p style={{ margin: '0 0 22px', color: '#888', fontSize: '13.5px', lineHeight: '1.6', maxWidth: '320px' }}>
                  Ask me about classes, fees, attendance or anything about your studies!
                </p>

                {/* FAQ buttons */}
                <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {faqs.slice(0, 4).map((faq, i) => (
                    <button key={i} onClick={() => startChat(faq)}
                      className="zenya-faq-btn"
                      style={{
                        background: 'white', border: '1.5px solid #E8F5F0',
                        borderRadius: '12px', padding: '12px 15px',
                        textAlign: 'left', cursor: 'pointer', color: '#1B6B5A',
                        fontSize: '13.5px', fontWeight: '500',
                        transition: 'all 0.2s',
                        display: 'flex', alignItems: 'center', gap: '10px',
                        boxShadow: '0 1px 4px rgba(27,107,90,0.06)',
                        width: '100%',
                      }}>
                      <span style={{
                        width: '26px', height: '26px', borderRadius: '8px',
                        background: '#E8F5F0', display: 'flex',
                        alignItems: 'center', justifyContent: 'center',
                        fontSize: '13px', flexShrink: 0,
                      }}>→</span>
                      {faq}
                    </button>
                  ))}
                </div>
              </div>

              {/* Fixed Start button */}
              <div style={{
                padding: '14px 24px 20px',
                background: '#FAFFFE',
                borderTop: '1px solid rgba(27,107,90,0.06)',
                flexShrink: 0,
              }}>
                <button onClick={() => startChat()}
                  className="zenya-start"
                  style={{
                    width: '100%',
                    background: 'linear-gradient(135deg, #1B6B5A, #00B894)',
                    color: 'white', border: 'none', borderRadius: '14px',
                    padding: '15px', fontWeight: '700', fontSize: '15px',
                    cursor: 'pointer',
                    boxShadow: '0 4px 16px rgba(27,107,90,0.3)',
                    transition: 'all 0.25s ease',
                    letterSpacing: '0.01em',
                  }}>
                  Start Conversation →
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Messages */}
              <div className="zenya-scroll" style={{
                flex: 1, overflowY: 'auto', padding: '18px 16px',
                display: 'flex', flexDirection: 'column', gap: '14px',
                background: '#F8FFFE',
              }}>
                {messages.map((msg, i) => (
                  <div key={i} style={{
                    display: 'flex',
                    justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                    gap: '9px', alignItems: 'flex-end',
                  }}>
                    {/* Zenya avatar */}
                    {msg.role === 'assistant' && (
                      <img src={AVATAR} alt="Zenya"
                        style={{
                          width: '34px', height: '34px', borderRadius: '50%',
                          objectFit: 'cover', flexShrink: 0,
                          border: '2px solid #1B6B5A',
                          display: 'block',
                          boxShadow: '0 2px 8px rgba(27,107,90,0.2)',
                        }}
                      />
                    )}

                    {/* Message bubble */}
                    <div style={{
                      maxWidth: '78%', padding: '11px 15px',
                      borderRadius: msg.role === 'user'
                        ? '20px 20px 4px 20px'
                        : '20px 20px 20px 4px',
                      background: msg.role === 'user'
                        ? 'linear-gradient(135deg, #1B6B5A, #155a4a)'
                        : 'white',
                      color: msg.role === 'user' ? 'white' : '#2D2D2D',
                      fontSize: '14px', lineHeight: '1.65',
                      whiteSpace: 'pre-wrap',
                      boxShadow: msg.role === 'user'
                        ? '0 2px 12px rgba(27,107,90,0.28)'
                        : '0 2px 8px rgba(0,0,0,0.06)',
                      border: msg.role === 'assistant' ? '1px solid #EEF8F4' : 'none',
                      wordBreak: 'break-word',
                    }}>
                      {msg.content}
                    </div>

                    {/* User avatar */}
                    {msg.role === 'user' && (
                      <div style={{
                        width: '34px', height: '34px', borderRadius: '50%',
                        background: '#F5C518',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        flexShrink: 0, fontWeight: '800', fontSize: '14px',
                        color: '#1B6B5A', border: '2px solid white',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                      }}>
                        {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                      </div>
                    )}
                  </div>
                ))}

                {/* Typing indicator */}
                {loading && (
                  <div style={{ display: 'flex', gap: '9px', alignItems: 'flex-end' }}>
                    <img src={AVATAR} alt="Zenya"
                      style={{
                        width: '34px', height: '34px', borderRadius: '50%',
                        objectFit: 'cover', flexShrink: 0,
                        border: '2px solid #1B6B5A', display: 'block',
                        boxShadow: '0 2px 8px rgba(27,107,90,0.2)',
                      }}
                    />
                    <div style={{
                      padding: '13px 16px', background: 'white',
                      borderRadius: '20px 20px 20px 4px',
                      border: '1px solid #EEF8F4',
                      display: 'flex', gap: '5px', alignItems: 'center',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                    }}>
                      {[0, 1, 2].map(i => (
                        <div key={i} style={{
                          width: '8px', height: '8px', borderRadius: '50%',
                          background: '#1B6B5A',
                          animation: 'bounce 1.2s infinite',
                          animationDelay: `${i * 0.2}s`,
                        }} />
                      ))}
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* FAQ chips */}
              <div className="zenya-scroll" style={{
                padding: '9px 13px',
                display: 'flex', gap: '7px',
                overflowX: 'auto', background: 'white',
                borderTop: '1px solid #F0F0F0', flexShrink: 0,
              }}>
                {faqs.map((faq, i) => (
                  <button key={i} onClick={() => sendMessage(faq)}
                    className="zenya-chip"
                    style={{
                      flexShrink: 0, background: '#F0FBF7',
                      border: '1px solid #C8EDE2', borderRadius: '20px',
                      padding: '6px 13px', fontSize: '12px', color: '#1B6B5A',
                      cursor: 'pointer', fontWeight: '600',
                      whiteSpace: 'nowrap', transition: 'all 0.2s',
                    }}>
                    {faq}
                  </button>
                ))}
              </div>

              {/* Input */}
              <div style={{
                padding: '12px 16px 14px',
                borderTop: '1px solid #F0F0F0',
                background: 'white', flexShrink: 0,
              }}>
                <div style={{
                  display: 'flex', gap: '10px', alignItems: 'flex-end',
                  background: '#F8FFFE', border: '1.5px solid #E0F0EA',
                  borderRadius: '18px', padding: '10px 14px',
                }}>
                  <textarea
                    ref={inputRef}
                    value={input}
                    onChange={e => {
                      setInput(e.target.value);
                      e.target.style.height = 'auto';
                      e.target.style.height = Math.min(e.target.scrollHeight, 100) + 'px';
                    }}
                    onKeyDown={e => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        sendMessage();
                      }
                    }}
                    placeholder="Type your message..."
                    rows={1}
                    style={{
                      flex: 1, border: 'none', outline: 'none',
                      fontSize: '14px', fontFamily: 'Roboto, sans-serif',
                      background: 'transparent', color: '#2D2D2D',
                      resize: 'none', lineHeight: '1.5',
                      minHeight: '24px', maxHeight: '100px',
                    }}
                  />
                  <button
                    onClick={() => sendMessage()}
                    disabled={loading || !input.trim()}
                    className="zenya-send"
                    style={{
                      width: '40px', height: '40px', borderRadius: '12px',
                      background: input.trim() && !loading
                        ? 'linear-gradient(135deg, #1B6B5A, #00B894)'
                        : '#E8E8E8',
                      border: 'none',
                      cursor: input.trim() && !loading ? 'pointer' : 'not-allowed',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0, transition: 'all 0.2s',
                      boxShadow: input.trim() && !loading
                        ? '0 2px 10px rgba(27,107,90,0.3)' : 'none',
                    }}
                  >
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none"
                      stroke="white" strokeWidth="2.5">
                      <line x1="22" y1="2" x2="11" y2="13"/>
                      <polygon points="22 2 15 22 11 13 2 9 22 2"/>
                    </svg>
                  </button>
                </div>
                <p style={{
                  margin: '5px 0 0', fontSize: '11px',
                  color: '#CCC', textAlign: 'center',
                }}>
                  Enter to send • Shift+Enter for new line
                </p>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
};

export default ZenyaChat;