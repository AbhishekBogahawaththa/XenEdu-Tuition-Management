import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { School, ChevronRight, ChevronLeft, CheckCircle } from 'lucide-react';
import { GRADES, MEDIUMS, STREAMS } from '../../utils/constants';

const RegisterPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    studentName: '',
    studentEmail: '',
    school: '',
    grade: '',
    medium: '',
    stream: '',
    parentName: '',
    parentEmail: '',
    parentContact: '',
    parentAddress: '',
  });

  const update = (field, value) => setForm({ ...form, [field]: value });

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await api.post('/register/apply', form);
      setSubmitted(true);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Submission failed');
    } finally {
      setLoading(false);
    }
  };

  const validateStep1 = () => {
    if (!form.studentName || !form.studentEmail || !form.school || !form.grade || !form.medium || !form.stream) {
      toast.error('Please fill all student details');
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    if (!form.parentName || !form.parentEmail || !form.parentContact) {
      toast.error('Please fill all parent details');
      return false;
    }
    return true;
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-lg p-10 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle size={32} className="text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800">Application Submitted!</h2>
          <p className="text-gray-500 mt-3">
            Your registration request has been submitted successfully. Our admin will review your application and contact you shortly.
          </p>
          <div className="bg-gray-50 rounded-xl p-4 mt-5 text-left space-y-2">
            <p className="text-sm text-gray-600">
              <span className="font-semibold">Student:</span> {form.studentName}
            </p>
            <p className="text-sm text-gray-600">
              <span className="font-semibold">Email:</span> {form.studentEmail}
            </p>
            <p className="text-sm text-gray-600">
              <span className="font-semibold">Grade:</span> {form.grade}
            </p>
          </div>
          <p className="text-xs text-gray-400 mt-4">
            Once approved, you will receive login credentials via email.
          </p>
          <button
            onClick={() => navigate('/login')}
            className="mt-6 w-full bg-[#1B6B5A] text-white py-3 rounded-xl font-semibold hover:bg-[#155a4a] transition"
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-lg">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-2">
            <School size={28} className="text-[#1B6B5A]" />
            <span className="text-3xl font-bold text-[#1B6B5A]">XenEdu</span>
          </div>
          <p className="text-gray-500 text-sm">A/L Tuition Management System</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">

          {/* Progress bar */}
          <div className="flex">
            {[1, 2, 3].map(s => (
              <div
                key={s}
                className={`flex-1 h-1.5 transition-all ${
                  s <= step ? 'bg-[#1B6B5A]' : 'bg-gray-100'
                }`}
              />
            ))}
          </div>

          <div className="p-8">

            {/* Step indicator */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-xs font-bold text-[#1B6B5A] uppercase">
                  Step {step} of 3
                </p>
                <h2 className="text-xl font-bold text-gray-800 mt-0.5">
                  {step === 1 && 'Student Details'}
                  {step === 2 && 'Parent Details'}
                  {step === 3 && 'Review & Submit'}
                </h2>
              </div>
              <div className="flex gap-1">
                {[1, 2, 3].map(s => (
                  <div
                    key={s}
                    className={`w-2.5 h-2.5 rounded-full transition-all ${
                      s === step ? 'bg-[#1B6B5A]' : s < step ? 'bg-[#1B6B5A]/40' : 'bg-gray-200'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Step 1 — Student */}
            {step === 1 && (
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase mb-1 block">Full Name</label>
                  <input
                    type="text"
                    value={form.studentName}
                    onChange={e => update('studentName', e.target.value)}
                    placeholder="Your full name"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#1B6B5A]"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase mb-1 block">Email Address</label>
                  <input
                    type="email"
                    value={form.studentEmail}
                    onChange={e => update('studentEmail', e.target.value)}
                    placeholder="your@email.com"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#1B6B5A]"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase mb-1 block">School</label>
                  <input
                    type="text"
                    value={form.school}
                    onChange={e => update('school', e.target.value)}
                    placeholder="Your school name"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#1B6B5A]"
                  />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase mb-1 block">Grade</label>
                    <select
                      value={form.grade}
                      onChange={e => update('grade', e.target.value)}
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#1B6B5A]"
                    >
                      <option value="">Grade</option>
                      {GRADES.map(g => <option key={g}>{g}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase mb-1 block">Medium</label>
                    <select
                      value={form.medium}
                      onChange={e => update('medium', e.target.value)}
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#1B6B5A]"
                    >
                      <option value="">Medium</option>
                      {MEDIUMS.map(m => <option key={m}>{m}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase mb-1 block">Stream</label>
                    <select
                      value={form.stream}
                      onChange={e => update('stream', e.target.value)}
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#1B6B5A]"
                    >
                      <option value="">Stream</option>
                      {STREAMS.map(s => <option key={s}>{s}</option>)}
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2 — Parent */}
            {step === 2 && (
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase mb-1 block">Parent / Guardian Name</label>
                  <input
                    type="text"
                    value={form.parentName}
                    onChange={e => update('parentName', e.target.value)}
                    placeholder="Parent full name"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#1B6B5A]"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase mb-1 block">Parent Email</label>
                  <input
                    type="email"
                    value={form.parentEmail}
                    onChange={e => update('parentEmail', e.target.value)}
                    placeholder="parent@email.com"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#1B6B5A]"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase mb-1 block">Contact Number</label>
                  <input
                    type="text"
                    value={form.parentContact}
                    onChange={e => update('parentContact', e.target.value)}
                    placeholder="07XXXXXXXX"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#1B6B5A]"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase mb-1 block">Address</label>
                  <textarea
                    value={form.parentAddress}
                    onChange={e => update('parentAddress', e.target.value)}
                    placeholder="Home address"
                    rows={3}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#1B6B5A] resize-none"
                  />
                </div>
              </div>
            )}

            {/* Step 3 — Review */}
            {step === 3 && (
              <div className="space-y-4">
                <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                  <p className="text-xs font-bold text-gray-400 uppercase">Student Details</p>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div><p className="text-gray-400">Name</p><p className="font-semibold text-gray-800">{form.studentName}</p></div>
                    <div><p className="text-gray-400">Email</p><p className="font-semibold text-gray-800">{form.studentEmail}</p></div>
                    <div><p className="text-gray-400">School</p><p className="font-semibold text-gray-800">{form.school}</p></div>
                    <div><p className="text-gray-400">Grade</p><p className="font-semibold text-gray-800">{form.grade}</p></div>
                    <div><p className="text-gray-400">Medium</p><p className="font-semibold text-gray-800">{form.medium}</p></div>
                    <div><p className="text-gray-400">Stream</p><p className="font-semibold text-gray-800">{form.stream}</p></div>
                  </div>
                </div>
                <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                  <p className="text-xs font-bold text-gray-400 uppercase">Parent Details</p>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div><p className="text-gray-400">Name</p><p className="font-semibold text-gray-800">{form.parentName}</p></div>
                    <div><p className="text-gray-400">Email</p><p className="font-semibold text-gray-800">{form.parentEmail}</p></div>
                    <div><p className="text-gray-400">Contact</p><p className="font-semibold text-gray-800">{form.parentContact}</p></div>
                    <div><p className="text-gray-400">Address</p><p className="font-semibold text-gray-800">{form.parentAddress || 'N/A'}</p></div>
                  </div>
                </div>
                <p className="text-xs text-gray-400 text-center">
                  By submitting, you agree that this information is accurate. Admin will review your application.
                </p>
              </div>
            )}

            {/* Navigation buttons */}
            <div className="flex gap-3 mt-6">
              {step > 1 && (
                <button
                  onClick={() => setStep(step - 1)}
                  className="flex items-center gap-2 px-5 py-2.5 border border-gray-200 rounded-xl text-gray-600 font-semibold text-sm hover:bg-gray-50 transition"
                >
                  <ChevronLeft size={16} />
                  Back
                </button>
              )}
              {step < 3 && (
                <button
                  onClick={() => {
                    if (step === 1 && !validateStep1()) return;
                    if (step === 2 && !validateStep2()) return;
                    setStep(step + 1);
                  }}
                  className="flex-1 flex items-center justify-center gap-2 bg-[#1B6B5A] text-white py-2.5 rounded-xl font-semibold text-sm hover:bg-[#155a4a] transition"
                >
                  Next
                  <ChevronRight size={16} />
                </button>
              )}
              {step === 3 && (
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="flex-1 bg-[#1B6B5A] text-white py-2.5 rounded-xl font-semibold text-sm hover:bg-[#155a4a] transition disabled:opacity-50"
                >
                  {loading ? 'Submitting...' : 'Submit Application'}
                </button>
              )}
            </div>

          </div>
        </div>

        <p className="text-center text-gray-400 mt-4 text-sm">
          Already have an account?{' '}
          <Link to="/login" className="text-[#1B6B5A] font-semibold hover:underline">
            Sign in
          </Link>
        </p>

      </div>
    </div>
  );
};

export default RegisterPage;