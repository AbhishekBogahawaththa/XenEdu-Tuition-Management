import { useState } from 'react';
import StudentLayout from '../../layouts/StudentLayout';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import {
  BookOpen, Clock, Users, CreditCard, Search,
  ArrowLeft, Play, FileText, Upload, CheckCircle,
  AlertCircle, X
} from 'lucide-react';
import { SUBJECTS, GRADES, MEDIUMS } from '../../utils/constants';

// ─── Payment Modal ────────────────────────────────────────────────
const PaymentModal = ({ cls, feeRecord, onClose, onSuccess }) => {
  const [method, setMethod] = useState('cash');
  const [form, setForm] = useState({
    cardHolder: '', cardNumber: '', cardExpiry: '', cardCVV: '',
    bankName: '', transactionRef: '', notes: '',
  });
  const [slip, setSlip] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('classId', cls._id);
      formData.append('amount', cls.monthlyFee);
      formData.append('method', method);
      if (feeRecord) formData.append('feeRecordId', feeRecord._id);

      if (method === 'card') {
        formData.append('cardHolderName', form.cardHolder);
        formData.append('cardLastFour', form.cardNumber.slice(-4));
      } else if (method === 'bank_transfer') {
        formData.append('bankName', form.bankName);
        formData.append('transactionRef', form.transactionRef);
        if (slip) formData.append('slip', slip);
      } else {
        formData.append('notes', form.notes);
      }

      await api.post('/payment-requests', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      toast.success('Payment request submitted! Admin will approve shortly.');
      onSuccess();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Submission failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
      zIndex: 1100, display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <div style={{
        background: 'white', borderRadius: '20px', width: '480px',
        maxHeight: '90vh', overflowY: 'auto', padding: '28px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: '#1a1a1a' }}>Pay Fee</h3>
            <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#888' }}>
              {cls.name} — Rs. {cls.monthlyFee?.toLocaleString()}/month
            </p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#888' }}>
            <X size={22} />
          </button>
        </div>

        {/* Method selector */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginBottom: '24px' }}>
          {[
            { key: 'cash', label: 'Cash', icon: '💵' },
            { key: 'card', label: 'Card', icon: '💳' },
            { key: 'bank_transfer', label: 'Bank Transfer', icon: '🏦' },
          ].map(m => (
            <button
              key={m.key}
              onClick={() => setMethod(m.key)}
              style={{
                padding: '12px 8px', borderRadius: '12px', border: '2px solid',
                borderColor: method === m.key ? '#1B6B5A' : '#E8E8E8',
                background: method === m.key ? '#E8F5F0' : 'white',
                cursor: 'pointer', textAlign: 'center', transition: 'all 0.2s',
              }}
            >
              <div style={{ fontSize: '20px', marginBottom: '4px' }}>{m.icon}</div>
              <p style={{ margin: 0, fontSize: '12px', fontWeight: '600', color: method === m.key ? '#1B6B5A' : '#666' }}>
                {m.label}
              </p>
            </button>
          ))}
        </div>

        {/* Cash form */}
        {method === 'cash' && (
          <div style={{ background: '#F0FBF7', borderRadius: '12px', padding: '16px', marginBottom: '20px' }}>
            <p style={{ margin: '0 0 8px', fontWeight: '600', color: '#1B6B5A', fontSize: '14px' }}>
              💵 Pay at the institute counter
            </p>
            <p style={{ margin: 0, fontSize: '13px', color: '#666', lineHeight: '1.6' }}>
              Visit the institute with Rs. {cls.monthlyFee?.toLocaleString()} cash.
              The cashier will scan your barcode and record the payment.
            </p>
            <textarea
              placeholder="Add a note (optional)..."
              value={form.notes}
              onChange={e => setForm({ ...form, notes: e.target.value })}
              style={{
                width: '100%', marginTop: '12px', padding: '10px 12px',
                border: '1px solid #C8EDE2', borderRadius: '8px',
                fontSize: '13px', outline: 'none', resize: 'none',
                height: '70px', boxSizing: 'border-box',
              }}
            />
          </div>
        )}

        {/* Card form */}
        {method === 'card' && (
          <div style={{ marginBottom: '20px' }}>
            <div style={{
              background: 'linear-gradient(135deg, #1B6B5A, #00B894)',
              borderRadius: '14px', padding: '20px', marginBottom: '16px', color: 'white',
            }}>
              <p style={{ margin: '0 0 16px', fontSize: '12px', opacity: 0.8 }}>CARD DETAILS</p>
              <p style={{ margin: '0 0 8px', fontSize: '18px', fontFamily: 'monospace', letterSpacing: '2px' }}>
                {form.cardNumber.replace(/(\d{4})/g, '$1 ').trim() || '•••• •••• •••• ••••'}
              </p>
              <p style={{ margin: 0, fontSize: '13px', opacity: 0.9 }}>{form.cardHolder || 'CARD HOLDER NAME'}</p>
            </div>
            {[
              { label: 'Card Holder Name', key: 'cardHolder', type: 'text', placeholder: 'Full name on card' },
              { label: 'Card Number', key: 'cardNumber', type: 'text', placeholder: '1234 5678 9012 3456', maxLength: 16 },
              { label: 'Expiry Date', key: 'cardExpiry', type: 'text', placeholder: 'MM/YY' },
              { label: 'CVV', key: 'cardCVV', type: 'password', placeholder: '•••' },
            ].map(field => (
              <div key={field.key} style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#555', marginBottom: '6px' }}>
                  {field.label}
                </label>
                <input
                  type={field.type}
                  placeholder={field.placeholder}
                  maxLength={field.maxLength}
                  value={form[field.key]}
                  onChange={e => setForm({ ...form, [field.key]: e.target.value })}
                  style={{
                    width: '100%', padding: '10px 12px', border: '1.5px solid #E8E8E8',
                    borderRadius: '10px', fontSize: '13px', outline: 'none',
                    boxSizing: 'border-box', transition: 'border-color 0.2s',
                  }}
                  onFocus={e => e.target.style.borderColor = '#1B6B5A'}
                  onBlur={e => e.target.style.borderColor = '#E8E8E8'}
                />
              </div>
            ))}
            <div style={{
              background: '#FFF9E6', border: '1px solid #F5C518',
              borderRadius: '10px', padding: '12px', marginTop: '8px',
            }}>
              <p style={{ margin: 0, fontSize: '12px', color: '#856404' }}>
                ⚠️ This is a payment request. Admin will verify and approve your payment.
                No actual card charge occurs at this stage.
              </p>
            </div>
          </div>
        )}

        {/* Bank transfer form */}
        {method === 'bank_transfer' && (
          <div style={{ marginBottom: '20px' }}>
            <div style={{
              background: '#F0F4FF', borderRadius: '12px', padding: '14px', marginBottom: '16px',
            }}>
              <p style={{ margin: '0 0 8px', fontWeight: '600', color: '#3B5BDB', fontSize: '13px' }}>
                🏦 XenEdu Bank Details
              </p>
              <p style={{ margin: '2px 0', fontSize: '13px', color: '#444' }}>Bank: <strong>Bank of Ceylon</strong></p>
              <p style={{ margin: '2px 0', fontSize: '13px', color: '#444' }}>Account: <strong>1234-5678-9012</strong></p>
              <p style={{ margin: '2px 0', fontSize: '13px', color: '#444' }}>Branch: <strong>Mirigama</strong></p>
              <p style={{ margin: '2px 0', fontSize: '13px', color: '#444' }}>Name: <strong>XenEdu Institute</strong></p>
            </div>
            {[
              { label: 'Your Bank Name', key: 'bankName', placeholder: 'e.g. Sampath Bank' },
              { label: 'Transaction Reference', key: 'transactionRef', placeholder: 'Transaction ID from bank' },
            ].map(field => (
              <div key={field.key} style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#555', marginBottom: '6px' }}>
                  {field.label}
                </label>
                <input
                  type="text"
                  placeholder={field.placeholder}
                  value={form[field.key]}
                  onChange={e => setForm({ ...form, [field.key]: e.target.value })}
                  style={{
                    width: '100%', padding: '10px 12px', border: '1.5px solid #E8E8E8',
                    borderRadius: '10px', fontSize: '13px', outline: 'none',
                    boxSizing: 'border-box',
                  }}
                  onFocus={e => e.target.style.borderColor = '#1B6B5A'}
                  onBlur={e => e.target.style.borderColor = '#E8E8E8'}
                />
              </div>
            ))}
            {/* Slip upload */}
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#555', marginBottom: '6px' }}>
                Upload Bank Slip
              </label>
              <label style={{
                display: 'flex', alignItems: 'center', gap: '10px',
                border: '2px dashed #C8EDE2', borderRadius: '10px',
                padding: '14px', cursor: 'pointer', background: slip ? '#F0FBF7' : 'white',
                transition: 'all 0.2s',
              }}>
                <Upload size={20} color={slip ? '#1B6B5A' : '#999'} />
                <span style={{ fontSize: '13px', color: slip ? '#1B6B5A' : '#888' }}>
                  {slip ? slip.name : 'Click to upload slip (JPG, PNG, PDF)'}
                </span>
                <input
                  type="file"
                  accept=".jpg,.jpeg,.png,.pdf"
                  style={{ display: 'none' }}
                  onChange={e => setSlip(e.target.files[0])}
                />
              </label>
            </div>
          </div>
        )}

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={loading}
          style={{
            width: '100%', padding: '14px',
            background: loading ? '#ccc' : 'linear-gradient(135deg, #1B6B5A, #00B894)',
            color: 'white', border: 'none', borderRadius: '12px',
            fontSize: '15px', fontWeight: '700', cursor: loading ? 'not-allowed' : 'pointer',
            boxShadow: '0 4px 15px rgba(27,107,90,0.3)',
          }}
        >
          {loading ? 'Submitting...' : `Submit Payment Request — Rs. ${cls.monthlyFee?.toLocaleString()}`}
        </button>
      </div>
    </div>
  );
};

// ─── Class Detail View ────────────────────────────────────────────
const ClassDetail = ({ cls, onBack }) => {
  const queryClient = useQueryClient();
  const [tab, setTab] = useState('coursework');
  const [showPayModal, setShowPayModal] = useState(false);
  const [selectedFee, setSelectedFee] = useState(null);

  const { data: courseWork } = useQuery({
    queryKey: ['coursework', cls._id],
    queryFn: () => api.get(`/coursework/${cls._id}`).then(r => r.data),
  });

  const { data: myRequests } = useQuery({
    queryKey: ['my-payment-requests'],
    queryFn: () => api.get('/payment-requests/my').then(r => r.data),
  });

  const { data: dashboard } = useQuery({
    queryKey: ['student-dashboard'],
    queryFn: () => api.get('/dashboard/student').then(r => r.data),
  });

  const feeForClass = dashboard?.fees?.unpaidFees?.find(f => f.classId === cls._id || true);
  const requestForClass = myRequests?.requests?.find(r =>
    r.classId?._id === cls._id && r.status === 'pending'
  );

  const typeColors = {
    recording: { bg: '#EEF2FF', color: '#3B5BDB', icon: '🎥' },
    instruction: { bg: '#E8F5F0', color: '#1B6B5A', icon: '📋' },
    assignment: { bg: '#FFF9E6', color: '#856404', icon: '📝' },
    notes: { bg: '#F5F0FF', color: '#6B17CC', icon: '📄' },
  };

  const statusColors = {
    pending: { bg: '#FFF9E6', color: '#856404', label: 'Pending Review' },
    approved: { bg: '#E8F5F0', color: '#1B6B5A', label: 'Approved ✓' },
    rejected: { bg: '#FEF2F2', color: '#DC2626', label: 'Rejected' },
  };

  return (
    <div>
      {showPayModal && (
        <PaymentModal
          cls={cls}
          feeRecord={feeForClass}
          onClose={() => setShowPayModal(false)}
          onSuccess={() => queryClient.invalidateQueries(['my-payment-requests'])}
        />
      )}

      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #1B6B5A, #00B894)',
        borderRadius: '16px', padding: '24px', marginBottom: '24px', color: 'white',
      }}>
        <button
          onClick={onBack}
          style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            background: 'rgba(255,255,255,0.15)', border: 'none',
            borderRadius: '8px', padding: '6px 12px', cursor: 'pointer',
            color: 'white', fontSize: '13px', marginBottom: '16px',
          }}
        >
          <ArrowLeft size={16} /> Back to classes
        </button>
        <h2 style={{ margin: '0 0 6px', fontSize: '22px', fontWeight: '800' }}>{cls.name}</h2>
        <p style={{ margin: 0, opacity: 0.85, fontSize: '14px' }}>
          {cls.subject} • {cls.grade} • {cls.medium} • {cls.hall}
        </p>
        <p style={{ margin: '6px 0 0', opacity: 0.75, fontSize: '13px' }}>
          {cls.schedule?.dayOfWeek} at {cls.schedule?.startTime} •
          Teacher: {cls.teacherId?.userId?.name || 'Not assigned'}
        </p>
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex', gap: '8px', marginBottom: '24px',
        background: 'white', padding: '6px', borderRadius: '12px',
        boxShadow: '0 1px 4px rgba(0,0,0,0.06)', width: 'fit-content',
      }}>
        {[
          { key: 'coursework', label: '📚 Course Work' },
          { key: 'payment', label: '💳 Payment' },
        ].map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            style={{
              padding: '10px 20px', borderRadius: '8px', border: 'none',
              background: tab === t.key ? '#1B6B5A' : 'transparent',
              color: tab === t.key ? 'white' : '#666',
              fontWeight: '600', fontSize: '14px', cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Course Work Tab */}
      {tab === 'coursework' && (
        <div>
          {courseWork?.items?.length === 0 && (
            <div style={{
              background: 'white', borderRadius: '16px', padding: '48px',
              textAlign: 'center', boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
            }}>
              <p style={{ fontSize: '32px', marginBottom: '12px' }}>📚</p>
              <p style={{ color: '#888', fontSize: '15px', fontWeight: '600' }}>No course work yet</p>
              <p style={{ color: '#aaa', fontSize: '13px', marginTop: '4px' }}>
                Your teacher hasn't uploaded any materials yet.
              </p>
            </div>
          )}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {courseWork?.items?.map((item, i) => {
              const style = typeColors[item.type] || typeColors.instruction;
              return (
                <div key={i} style={{
                  background: 'white', borderRadius: '14px', padding: '18px 20px',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
                  border: '1px solid #F0F0F0',
                  display: 'flex', gap: '16px', alignItems: 'flex-start',
                }}>
                  <div style={{
                    width: '44px', height: '44px', borderRadius: '12px',
                    background: style.bg, display: 'flex',
                    alignItems: 'center', justifyContent: 'center',
                    fontSize: '20px', flexShrink: 0,
                  }}>
                    {style.icon}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <p style={{ margin: 0, fontWeight: '700', color: '#1a1a1a', fontSize: '15px' }}>
                          {item.title}
                        </p>
                        <span style={{
                          display: 'inline-block', marginTop: '4px',
                          background: style.bg, color: style.color,
                          fontSize: '11px', fontWeight: '600',
                          padding: '2px 10px', borderRadius: '20px', textTransform: 'capitalize',
                        }}>
                          {item.type}
                        </span>
                      </div>
                      <p style={{ margin: 0, fontSize: '12px', color: '#aaa' }}>
                        {new Date(item.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    {item.description && (
                      <p style={{ margin: '8px 0 0', fontSize: '13px', color: '#666', lineHeight: '1.5' }}>
                        {item.description}
                      </p>
                    )}
                    {item.link && (
                      <a
                        href={item.link}
                        target="_blank"
                        rel="noreferrer"
                        style={{
                          display: 'inline-flex', alignItems: 'center', gap: '6px',
                          marginTop: '10px', color: '#1B6B5A', fontSize: '13px',
                          fontWeight: '600', textDecoration: 'none',
                        }}
                      >
                        <Play size={14} /> Watch Recording
                      </a>
                    )}
                    {item.fileUrl && (
                      <a
                        href={`http://localhost:5000${item.fileUrl}`}
                        target="_blank"
                        rel="noreferrer"
                        style={{
                          display: 'inline-flex', alignItems: 'center', gap: '6px',
                          marginTop: '10px', color: '#1B6B5A', fontSize: '13px',
                          fontWeight: '600', textDecoration: 'none',
                        }}
                      >
                        <FileText size={14} /> {item.fileName || 'Download File'}
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Payment Tab */}
      {tab === 'payment' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

          {/* Fee summary */}
          <div style={{
            background: 'white', borderRadius: '16px', padding: '20px',
            boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
          }}>
            <h3 style={{ margin: '0 0 16px', fontSize: '16px', fontWeight: '700', color: '#1a1a1a' }}>
              Fee Summary
            </h3>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <p style={{ margin: 0, fontSize: '14px', color: '#666' }}>Monthly Fee</p>
                <p style={{ margin: '4px 0 0', fontSize: '28px', fontWeight: '800', color: '#1B6B5A' }}>
                  Rs. {cls.monthlyFee?.toLocaleString()}
                </p>
              </div>
              {requestForClass ? (
                <div style={{
                  background: statusColors[requestForClass.status]?.bg,
                  color: statusColors[requestForClass.status]?.color,
                  padding: '8px 16px', borderRadius: '20px',
                  fontWeight: '700', fontSize: '13px',
                }}>
                  {statusColors[requestForClass.status]?.label}
                </div>
              ) : (
                <button
                  onClick={() => setShowPayModal(true)}
                  style={{
                    background: 'linear-gradient(135deg, #1B6B5A, #00B894)',
                    color: 'white', border: 'none', borderRadius: '12px',
                    padding: '12px 24px', fontWeight: '700', fontSize: '14px',
                    cursor: 'pointer', boxShadow: '0 4px 15px rgba(27,107,90,0.3)',
                  }}
                >
                  Pay Now
                </button>
              )}
            </div>
          </div>

          {/* Payment methods info */}
          <div style={{
            background: 'white', borderRadius: '16px', padding: '20px',
            boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
          }}>
            <h3 style={{ margin: '0 0 16px', fontSize: '15px', fontWeight: '700', color: '#1a1a1a' }}>
              Available Payment Methods
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {[
                { icon: '💵', title: 'Cash', desc: 'Pay at the institute counter. Cashier scans your barcode.' },
                { icon: '💳', title: 'Card', desc: 'Submit card details. Admin verifies and approves.' },
                { icon: '🏦', title: 'Bank Transfer', desc: 'Transfer to institute account and upload slip for approval.' },
              ].map((m, i) => (
                <div key={i} style={{
                  display: 'flex', gap: '12px', padding: '12px',
                  background: '#FAFAF8', borderRadius: '10px',
                }}>
                  <span style={{ fontSize: '22px', flexShrink: 0 }}>{m.icon}</span>
                  <div>
                    <p style={{ margin: 0, fontWeight: '600', fontSize: '14px', color: '#1a1a1a' }}>{m.title}</p>
                    <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#888' }}>{m.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* My payment requests for this class */}
          {myRequests?.requests?.filter(r => r.classId?._id === cls._id)?.length > 0 && (
            <div style={{
              background: 'white', borderRadius: '16px', padding: '20px',
              boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
            }}>
              <h3 style={{ margin: '0 0 16px', fontSize: '15px', fontWeight: '700', color: '#1a1a1a' }}>
                Payment History
              </h3>
              {myRequests.requests
                .filter(r => r.classId?._id === cls._id)
                .map((req, i) => (
                  <div key={i} style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '12px', background: '#FAFAF8', borderRadius: '10px', marginBottom: '8px',
                  }}>
                    <div>
                      <p style={{ margin: 0, fontWeight: '600', fontSize: '14px', color: '#1a1a1a' }}>
                        {req.method.replace('_', ' ').toUpperCase()} — Rs. {req.amount?.toLocaleString()}
                      </p>
                      <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#888' }}>
                        {new Date(req.createdAt).toLocaleDateString()}
                      </p>
                      {req.rejectReason && (
                        <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#DC2626' }}>
                          Reason: {req.rejectReason}
                        </p>
                      )}
                    </div>
                    <span style={{
                      background: statusColors[req.status]?.bg,
                      color: statusColors[req.status]?.color,
                      padding: '4px 12px', borderRadius: '20px',
                      fontWeight: '700', fontSize: '12px',
                    }}>
                      {statusColors[req.status]?.label}
                    </span>
                  </div>
                ))
              }
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────
const StudentClasses = () => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('browse');
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({ subject: '', grade: '', medium: '' });
  const [selectedClass, setSelectedClass] = useState(null);

  const { data: classes, isLoading } = useQuery({
    queryKey: ['available-classes', filters],
    queryFn: () => {
      const params = new URLSearchParams();
      if (filters.subject) params.append('subject', filters.subject);
      if (filters.grade) params.append('grade', filters.grade);
      if (filters.medium) params.append('medium', filters.medium);
      return api.get(`/classes?${params}`).then(r => r.data);
    },
  });

  const { data: dashboard } = useQuery({
    queryKey: ['student-dashboard'],
    queryFn: () => api.get('/dashboard/student').then(r => r.data),
  });

  const enrollMutation = useMutation({
    mutationFn: (classId) => api.post(`/classes/${classId}/enroll`),
    onSuccess: (res) => {
      toast.success(res.data.message);
      queryClient.invalidateQueries(['available-classes']);
      queryClient.invalidateQueries(['student-dashboard']);
    },
    onError: err => toast.error(err.response?.data?.message || 'Enrollment failed'),
  });

  const unenrollMutation = useMutation({
    mutationFn: (classId) => api.delete(`/classes/${classId}/unenroll`),
    onSuccess: (res) => {
      toast.success(res.data.message);
      queryClient.invalidateQueries(['available-classes']);
      queryClient.invalidateQueries(['student-dashboard']);
    },
    onError: err => toast.error(err.response?.data?.message || 'Failed'),
  });

  const enrolledIds = dashboard?.enrolledClasses?.map(c => String(c.classId)) ?? [];
  const enrolledClasses = classes?.classes?.filter(c => enrolledIds.includes(c._id)) ?? [];

  const filtered = classes?.classes?.filter(cls =>
    cls.name?.toLowerCase().includes(search.toLowerCase()) ||
    cls.subject?.toLowerCase().includes(search.toLowerCase())
  );

  const hallColors = {
    'Hall 1': 'bg-blue-100 text-blue-700',
    'Hall 2': 'bg-purple-100 text-purple-700',
    'Hall 3': 'bg-orange-100 text-orange-700',
  };

  if (selectedClass) {
    return (
      <StudentLayout>
        <ClassDetail cls={selectedClass} onBack={() => setSelectedClass(null)} />
      </StudentLayout>
    );
  }

  return (
    <StudentLayout>
      <div className="space-y-6">

        <div>
          <h2 className="text-xl font-bold text-gray-800">Classes</h2>
          <p className="text-sm text-gray-400 mt-1">Browse, enroll and manage your classes</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 bg-white rounded-xl p-1 shadow-sm w-fit">
          {[
            { key: 'browse', label: 'Browse Classes' },
            { key: 'myclasses', label: `My Classes (${enrolledClasses.length})` },
          ].map(t => (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              className={`px-5 py-2 rounded-lg text-sm font-semibold transition ${
                activeTab === t.key
                  ? 'bg-[#1B6B5A] text-white'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Browse tab */}
        {activeTab === 'browse' && (
          <>
            <div className="bg-white rounded-xl shadow-sm p-4 space-y-3">
              <div className="relative">
                <Search size={16} className="absolute left-3 top-3 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search classes..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#1B6B5A]"
                />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <select value={filters.subject} onChange={e => setFilters({ ...filters, subject: e.target.value })}
                  className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#1B6B5A]">
                  <option value="">All Subjects</option>
                  {SUBJECTS.map(s => <option key={s}>{s}</option>)}
                </select>
                <select value={filters.grade} onChange={e => setFilters({ ...filters, grade: e.target.value })}
                  className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#1B6B5A]">
                  <option value="">All Grades</option>
                  {GRADES.map(g => <option key={g}>{g}</option>)}
                </select>
                <select value={filters.medium} onChange={e => setFilters({ ...filters, medium: e.target.value })}
                  className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#1B6B5A]">
                  <option value="">All Mediums</option>
                  {MEDIUMS.map(m => <option key={m}>{m}</option>)}
                </select>
              </div>
            </div>

            {isLoading && <div className="text-center text-gray-400 py-12">Loading classes...</div>}

            <div className="grid grid-cols-2 gap-4">
              {filtered?.map(cls => {
                const isEnrolled = enrolledIds.includes(String(cls._id));
                const isFull = cls.availableSlots <= 0;
                return (
                  <div key={cls._id} className={`bg-white rounded-xl shadow-sm overflow-hidden border-2 transition ${
                    isEnrolled ? 'border-[#1B6B5A]' : 'border-transparent hover:border-gray-200'
                  }`}>
                    <div className="p-5">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-bold text-gray-800">{cls.name}</h3>
                          <p className="text-xs text-gray-400 mt-0.5">{cls.subject} • {cls.grade} • {cls.medium}</p>
                        </div>
                        {isEnrolled && <span className="bg-[#1B6B5A] text-white text-xs font-bold px-2 py-1 rounded-full">Enrolled</span>}
                        {isFull && !isEnrolled && <span className="bg-red-100 text-red-600 text-xs font-bold px-2 py-1 rounded-full">Full</span>}
                      </div>
                      <div className="space-y-2 text-sm text-gray-500">
                        <div className="flex items-center gap-2">
                          <BookOpen size={14} className="text-gray-400" />
                          <span>Teacher: {cls.teacherId?.userId?.name || 'Not assigned'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock size={14} className="text-gray-400" />
                          <span>{cls.schedule?.dayOfWeek} at {cls.schedule?.startTime} ({cls.schedule?.durationMins} mins)</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users size={14} className="text-gray-400" />
                          <span>{cls.enrolledCount} / {cls.maxCapacity} students</span>
                          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${hallColors[cls.hall]}`}>{cls.hall}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CreditCard size={14} className="text-gray-400" />
                          <span className="font-bold text-gray-800">Rs. {cls.monthlyFee?.toLocaleString()} / month</span>
                        </div>
                      </div>
                      <div className="mt-3">
                        <div className="w-full h-1.5 bg-gray-100 rounded-full">
                          <div className={`h-1.5 rounded-full ${isFull ? 'bg-red-500' : 'bg-[#1B6B5A]'}`}
                            style={{ width: `${Math.min((cls.enrolledCount / cls.maxCapacity) * 100, 100)}%` }} />
                        </div>
                        <p className="text-xs text-gray-400 mt-1">{cls.availableSlots} slots available</p>
                      </div>
                    </div>
                    <div className="px-5 pb-5 flex gap-2">
                      {isEnrolled ? (
                        <>
                          <button
                            onClick={() => setSelectedClass(cls)}
                            className="flex-1 py-2.5 bg-[#1B6B5A] text-white rounded-xl font-semibold text-sm hover:bg-[#155a4a] transition"
                          >
                            View Class
                          </button>
                          <button
                            onClick={() => { if (window.confirm('Unenroll from this class?')) unenrollMutation.mutate(cls._id); }}
                            className="py-2.5 px-4 bg-red-50 text-red-600 rounded-xl font-semibold text-sm hover:bg-red-100 transition"
                          >
                            Leave
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => enrollMutation.mutate(cls._id)}
                          disabled={isFull || enrollMutation.isPending}
                          className="w-full py-2.5 bg-[#1B6B5A] text-white rounded-xl font-semibold text-sm hover:bg-[#155a4a] transition disabled:opacity-50"
                        >
                          {isFull ? 'Class Full' : 'Enroll Now'}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
              {filtered?.length === 0 && !isLoading && (
                <div className="col-span-2 text-center py-12 text-gray-400">No classes found</div>
              )}
            </div>
          </>
        )}

        {/* My Classes tab */}
        {activeTab === 'myclasses' && (
          <div>
            {enrolledClasses.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                <p className="text-4xl mb-3">📚</p>
                <p className="text-gray-600 font-semibold">No classes enrolled yet</p>
                <p className="text-gray-400 text-sm mt-1">Go to Browse Classes to enroll</p>
                <button
                  onClick={() => setActiveTab('browse')}
                  className="mt-4 bg-[#1B6B5A] text-white px-6 py-2.5 rounded-xl font-semibold text-sm hover:bg-[#155a4a] transition"
                >
                  Browse Classes
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                {enrolledClasses.map(cls => {
                  const attData = dashboard?.enrolledClasses?.find(c => 
                    String(c.classId) === String(cls._id)
                  );
                  return (
                    <div
                      key={cls._id}
                      onClick={() => setSelectedClass(cls)}
                      className="bg-white rounded-xl shadow-sm overflow-hidden border-2 border-[#1B6B5A] cursor-pointer hover:shadow-md transition"
                    >
                      <div className="p-5">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h3 className="font-bold text-gray-800">{cls.name}</h3>
                            <p className="text-xs text-gray-400 mt-0.5">{cls.subject} • {cls.grade}</p>
                          </div>
                          <span className="bg-[#1B6B5A] text-white text-xs font-bold px-2 py-1 rounded-full">
                            Enrolled
                          </span>
                        </div>
                        <div className="space-y-1.5 text-sm text-gray-500">
                          <p>👨‍🏫 {cls.teacherId?.userId?.name || 'Not assigned'}</p>
                          <p>🕐 {cls.schedule?.dayOfWeek} at {cls.schedule?.startTime}</p>
                          <p>📍 {cls.hall}</p>
                          <p className="font-bold text-gray-800">💰 Rs. {cls.monthlyFee?.toLocaleString()}/month</p>
                        </div>
                        {attData && (
                          <div className="mt-3">
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-xs text-gray-400">Attendance</span>
                              <span className={`text-xs font-bold ${attData.atRisk ? 'text-red-500' : 'text-green-600'}`}>
                                {attData.percentage}
                              </span>
                            </div>
                            {attData.percentage !== 'No sessions yet' && (
                              <div className="w-full h-1.5 bg-gray-100 rounded-full">
                                <div
                                  className={`h-1.5 rounded-full ${attData.atRisk ? 'bg-red-500' : 'bg-green-500'}`}
                                  style={{ width: attData.percentage }}
                                />
                              </div>
                            )}
                          </div>
                        )}
                        <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
                          <span className="text-xs text-[#1B6B5A] font-semibold">
                            Click to view details →
                          </span>
                          <div className="flex gap-1">
                            <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full font-medium">📚 Course Work</span>
                            <span className="text-xs bg-green-50 text-green-600 px-2 py-0.5 rounded-full font-medium">💳 Pay</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

      </div>
    </StudentLayout>
  );
};

export default StudentClasses;