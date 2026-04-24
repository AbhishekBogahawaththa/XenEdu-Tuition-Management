import { useState } from 'react';
import AdminLayout from '../../layouts/AdminLayout';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import {
  Plus, X, Search, Users, Clock, Calendar,
  ChevronDown, ChevronUp, UserMinus, UserX, UserCheck
} from 'lucide-react';
import { SUBJECTS, GRADES, MEDIUMS, HALLS, DAYS } from '../../utils/constants';

const AdminClasses = () => {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState('');
  const [expandedClass, setExpandedClass] = useState(null);

  const [form, setForm] = useState({
    name: '', subject: '', grade: '', medium: '',
    hall: '', teacherId: '',
    dayOfWeek: '', startTime: '', endTime: '',
    maxCapacity: 40, monthlyFee: 2500,
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
  });

  const { data: classes, isLoading } = useQuery({
    queryKey: ['classes'],
    queryFn: () => api.get('/classes').then(r => r.data),
  });

  const { data: teachers } = useQuery({
    queryKey: ['teachers'],
    queryFn: () => api.get('/teachers').then(r => r.data),
  });

  const { data: classDetail } = useQuery({
    queryKey: ['class-detail', expandedClass],
    queryFn: () => api.get(`/classes/${expandedClass}`).then(r => r.data),
    enabled: !!expandedClass,
  });

  const createMutation = useMutation({
    mutationFn: (data) => api.post('/classes', data),
    onSuccess: (res) => {
      toast.success(`Class created! ${res.data.sessionsGenerated || 0} sessions auto-generated`);
      queryClient.invalidateQueries(['classes']);
      setShowForm(false);
      resetForm();
    },
    onError: err => toast.error(err.response?.data?.message || 'Failed'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/classes/${id}`),
    onSuccess: () => {
      toast.success('Class deleted');
      queryClient.invalidateQueries(['classes']);
    },
    onError: err => toast.error(err.response?.data?.message || 'Failed'),
  });

  const removeStudentMutation = useMutation({
    mutationFn: ({ classId, studentId }) =>
      api.delete(`/classes/${classId}/students/${studentId}`),
    onSuccess: (res) => {
      toast.success(res.data.message);
      queryClient.invalidateQueries(['class-detail', expandedClass]);
      queryClient.invalidateQueries(['classes']);
    },
    onError: err => toast.error(err.response?.data?.message || 'Failed'),
  });

  const suspendMutation = useMutation({
    mutationFn: ({ studentId, action }) =>
      api.patch(`/classes/students/${studentId}/suspend`, { action }),
    onSuccess: (res) => {
      toast.success(res.data.message);
      queryClient.invalidateQueries(['class-detail', expandedClass]);
    },
    onError: err => toast.error(err.response?.data?.message || 'Failed'),
  });

  const resetForm = () => setForm({
    name: '', subject: '', grade: '', medium: '',
    hall: '', teacherId: '',
    dayOfWeek: '', startTime: '', endTime: '',
    maxCapacity: 40, monthlyFee: 2500,
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
  });

  const calcDuration = (start, end) => {
    if (!start || !end) return null;
    const [sh, sm] = start.split(':').map(Number);
    const [eh, em] = end.split(':').map(Number);
    const mins = (eh * 60 + em) - (sh * 60 + sm);
    if (mins <= 0) return null;
    return {
      mins,
      label: `${Math.floor(mins / 60)}h${mins % 60 > 0 ? ` ${mins % 60}m` : ''}`,
    };
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name || !form.subject || !form.grade || !form.dayOfWeek || !form.startTime || !form.endTime) {
      toast.error('Please fill all required fields');
      return;
    }
    const duration = calcDuration(form.startTime, form.endTime);
    if (!duration) {
      toast.error('End time must be after start time');
      return;
    }
    createMutation.mutate({
      name: form.name, subject: form.subject, grade: form.grade,
      medium: form.medium, hall: form.hall,
      teacherId: form.teacherId || undefined,
      monthlyFee: parseInt(form.monthlyFee),
      maxCapacity: parseInt(form.maxCapacity),
      startDate: form.startDate,
      endDate: form.endDate || undefined,
      schedule: {
        dayOfWeek: form.dayOfWeek, startTime: form.startTime,
        endTime: form.endTime, durationMins: duration.mins,
      },
    });
  };

  const filtered = classes?.classes?.filter(cls =>
    cls.name?.toLowerCase().includes(search.toLowerCase()) ||
    cls.subject?.toLowerCase().includes(search.toLowerCase())
  );

  const inputClass = "w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#1B6B5A]";
  const labelClass = "block text-xs font-semibold text-gray-500 uppercase mb-1";

  const hallColors = {
    'Hall 1': 'bg-blue-100 text-blue-700',
    'Hall 2': 'bg-purple-100 text-purple-700',
    'Hall 3': 'bg-orange-100 text-orange-700',
  };

  return (
    <AdminLayout>
      <div className="space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-800">Classes</h2>
            <p className="text-sm text-gray-400 mt-1">Sessions auto-generate when a class is created</p>
          </div>
          <button onClick={() => setShowForm(true)}
            className="flex items-center gap-2 bg-[#1B6B5A] text-white px-4 py-2.5 rounded-lg font-semibold text-sm hover:bg-[#155a4a] transition">
            <Plus size={18} /> Create Class
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search size={16} className="absolute left-3 top-3 text-gray-400" />
          <input type="text" placeholder="Search by class name or subject..."
            value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#1B6B5A] bg-white" />
        </div>

        {/* Create Form Modal */}
        {showForm && (
          <div style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
            zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px',
          }}>
            <div className="bg-white rounded-2xl w-full max-w-2xl max-h-screen overflow-y-auto shadow-2xl">
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white z-10">
                <h3 className="font-bold text-gray-800 text-lg">Create New Class</h3>
                <button onClick={() => { setShowForm(false); resetForm(); }}>
                  <X size={22} className="text-gray-400 hover:text-gray-600" />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="p-6 space-y-5">
                <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 flex items-start gap-3">
                  <Calendar size={16} className="text-blue-500 mt-0.5 flex-shrink-0" />
                  <p className="text-blue-700 text-sm">
                    Sessions will be <strong>automatically generated</strong> for the current and next month.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className={labelClass}>Class Name *</label>
                    <input type="text" placeholder="e.g. Physics Grade 13 - Sinhala 2026"
                      value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                      className={inputClass} required />
                  </div>
                  <div>
                    <label className={labelClass}>Subject *</label>
                    <select value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })}
                      className={inputClass} required>
                      <option value="">Select subject</option>
                      {SUBJECTS.map(s => <option key={s}>{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>Grade *</label>
                    <select value={form.grade} onChange={e => setForm({ ...form, grade: e.target.value })}
                      className={inputClass} required>
                      <option value="">Select grade</option>
                      {GRADES.map(g => <option key={g}>{g}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>Medium</label>
                    <select value={form.medium} onChange={e => setForm({ ...form, medium: e.target.value })}
                      className={inputClass}>
                      <option value="">Select medium</option>
                      {MEDIUMS.map(m => <option key={m}>{m}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>Hall</label>
                    <select value={form.hall} onChange={e => setForm({ ...form, hall: e.target.value })}
                      className={inputClass}>
                      <option value="">Select hall</option>
                      {HALLS.map(h => <option key={h}>{h}</option>)}
                    </select>
                  </div>
                  <div className="col-span-2">
                    <label className={labelClass}>Teacher</label>
                    <select value={form.teacherId} onChange={e => setForm({ ...form, teacherId: e.target.value })}
                      className={inputClass}>
                      <option value="">Select teacher (optional)</option>
                      {teachers?.teachers?.map(t => (
                        <option key={t._id} value={t._id}>
                          {t.userId?.name} — {t.subjectExpertise?.join(', ')}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="col-span-2">
                    <p className="text-xs font-bold text-gray-600 uppercase tracking-wide mb-3">📅 Weekly Schedule</p>
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className={labelClass}>Day *</label>
                        <select value={form.dayOfWeek} onChange={e => setForm({ ...form, dayOfWeek: e.target.value })}
                          className={inputClass} required>
                          <option value="">Select day</option>
                          {DAYS.map(d => <option key={d}>{d}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className={labelClass}>Start Time *</label>
                        <input type="time" value={form.startTime}
                          onChange={e => setForm({ ...form, startTime: e.target.value })}
                          className={inputClass} required />
                      </div>
                      <div>
                        <label className={labelClass}>End Time *</label>
                        <input type="time" value={form.endTime}
                          onChange={e => setForm({ ...form, endTime: e.target.value })}
                          className={inputClass} required />
                      </div>
                    </div>
                    {form.startTime && form.endTime && (() => {
                      const d = calcDuration(form.startTime, form.endTime);
                      if (!d) return (
                        <div className="mt-2 bg-red-50 border border-red-200 rounded-lg px-4 py-2">
                          <p className="text-red-600 text-sm">⚠️ End time must be after start time</p>
                        </div>
                      );
                      return (
                        <div className="mt-2 bg-[#1B6B5A]/5 border border-[#1B6B5A]/20 rounded-lg px-4 py-2.5">
                          <span className="text-[#1B6B5A] text-sm font-bold">
                            {form.startTime} — {form.endTime} ({d.label} · {d.mins} mins)
                          </span>
                        </div>
                      );
                    })()}
                  </div>
                  <div>
                    <label className={labelClass}>Start Date *</label>
                    <input type="date" value={form.startDate}
                      onChange={e => setForm({ ...form, startDate: e.target.value })}
                      className={inputClass} required />
                  </div>
                  <div>
                    <label className={labelClass}>End Date</label>
                    <input type="date" value={form.endDate}
                      onChange={e => setForm({ ...form, endDate: e.target.value })}
                      className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Max Capacity</label>
                    <input type="number" value={form.maxCapacity}
                      onChange={e => setForm({ ...form, maxCapacity: e.target.value })}
                      className={inputClass} min="1" />
                  </div>
                  <div>
                    <label className={labelClass}>Monthly Fee (Rs.)</label>
                    <input type="number" value={form.monthlyFee}
                      onChange={e => setForm({ ...form, monthlyFee: e.target.value })}
                      className={inputClass} min="0" />
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => { setShowForm(false); resetForm(); }}
                    className="flex-1 py-3 border border-gray-200 rounded-xl text-gray-600 font-semibold hover:bg-gray-50 transition">
                    Cancel
                  </button>
                  <button type="submit" disabled={createMutation.isPending}
                    className="flex-1 py-3 bg-[#1B6B5A] text-white rounded-xl font-bold hover:bg-[#155a4a] transition disabled:opacity-50">
                    {createMutation.isPending ? 'Creating...' : '✓ Create Class + Auto-Generate Sessions'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Classes list */}
        {isLoading ? (
          <div className="text-center text-gray-400 py-12">Loading...</div>
        ) : (
          <div className="space-y-3">
            {filtered?.map(cls => (
              <div key={cls._id} className="bg-white rounded-xl shadow-sm overflow-hidden">

                {/* Class row */}
                <div className="p-5 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-[#1B6B5A]/10 flex items-center justify-center text-2xl flex-shrink-0">
                      📚
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-800">{cls.name}</h3>
                      <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                        <span className="text-xs text-gray-500">{cls.subject}</span>
                        <span className="text-gray-300">•</span>
                        <span className="text-xs text-gray-500">{cls.grade}</span>
                        <span className="text-gray-300">•</span>
                        <span className="text-xs text-gray-500">{cls.medium}</span>
                        {cls.hall && (
                          <>
                            <span className="text-gray-300">•</span>
                            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${hallColors[cls.hall] || 'bg-gray-100 text-gray-600'}`}>
                              {cls.hall}
                            </span>
                          </>
                        )}
                      </div>
                      <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                        <span className="flex items-center gap-1 text-xs text-gray-500">
                          <Clock size={11} />
                          {cls.schedule?.dayOfWeek} {cls.schedule?.startTime}
                          {cls.schedule?.endTime ? ` — ${cls.schedule?.endTime}` : ''}
                        </span>
                        <span className="text-gray-300">•</span>
                        <span className="flex items-center gap-1 text-xs text-gray-500">
                          <Users size={11} />
                          {cls.enrolledCount}/{cls.maxCapacity} enrolled
                        </span>
                        <span className="text-gray-300">•</span>
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                          cls.availableSlots === 0 ? 'bg-red-100 text-red-600'
                          : cls.availableSlots <= 10 ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-green-100 text-green-700'
                        }`}>
                          {cls.availableSlots === 0 ? '🔴 Full' : `${cls.availableSlots} slots left`}
                        </span>
                        <span className="text-gray-300">•</span>
                        <span className="text-xs font-bold text-[#1B6B5A]">
                          Rs. {cls.monthlyFee?.toLocaleString()}/month
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 flex-shrink-0 ml-4">
                    <div className="text-right hidden md:block">
                      <p className="text-xs text-gray-400">Teacher</p>
                      <p className="text-sm font-semibold text-gray-700">
                        {cls.teacherId?.userId?.name || 'Not assigned'}
                      </p>
                    </div>
                    <button
                      onClick={() => setExpandedClass(expandedClass === cls._id ? null : cls._id)}
                      className="flex items-center gap-1 px-3 py-2 bg-gray-100 text-gray-600 rounded-lg text-xs font-semibold hover:bg-gray-200 transition">
                      <Users size={14} />
                      Students
                      {expandedClass === cls._id ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm(`Delete "${cls.name}"? This cannot be undone.`)) {
                          deleteMutation.mutate(cls._id);
                        }
                      }}
                      className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition">
                      <X size={16} />
                    </button>
                  </div>
                </div>

                {/* Expanded students panel */}
                {expandedClass === cls._id && (
                  <div className="border-t border-gray-100 bg-gray-50">
                    <div className="px-5 py-3 border-b border-gray-100">
                      <h4 className="font-semibold text-gray-700 text-sm">
                        Enrolled Students ({classDetail?.class?.enrolledStudents?.length || 0})
                      </h4>
                    </div>

                    {!classDetail ? (
                      <div className="px-5 py-4 text-sm text-gray-400">Loading students...</div>
                    ) : classDetail?.class?.enrolledStudents?.length === 0 ? (
                      <div className="px-5 py-8 text-center text-gray-400 text-sm">
                        No students enrolled yet
                      </div>
                    ) : (
                      <div className="divide-y divide-gray-100">
                        {classDetail.class.enrolledStudents.map((student, i) => (
                          <div key={i} className="px-5 py-3 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-full bg-[#1B6B5A] flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                                {student.userId?.name?.charAt(0)?.toUpperCase()}
                              </div>
                              <div>
                                <p className="font-semibold text-gray-800 text-sm">
                                  {student.userId?.name}
                                </p>
                                <p className="text-xs text-gray-400">
                                  {student.admissionNumber} • {student.grade} • {student.school}
                                </p>
                                {student.parentId && (
                                  <p className="text-xs text-gray-400 mt-0.5">
                                    👨‍👩‍👧 Parent: {student.parentId?.userId?.name}
                                    {student.parentId?.contactNumber && (
                                      <span className="ml-1 font-semibold text-[#1B6B5A]">
                                        📞 {student.parentId.contactNumber}
                                      </span>
                                    )}
                                  </p>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full capitalize ${
                                student.status === 'active'
                                  ? 'bg-green-100 text-green-700'
                                  : 'bg-red-100 text-red-600'
                              }`}>
                                {student.status}
                              </span>

                              {/* Suspend/Activate */}
                              <button
                                onClick={() => {
                                  const action = student.status === 'active' ? 'suspend' : 'activate';
                                  if (window.confirm(`${action === 'suspend' ? 'Suspend' : 'Activate'} ${student.userId?.name}?`)) {
                                    suspendMutation.mutate({ studentId: student._id, action });
                                  }
                                }}
                                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition ${
                                  student.status === 'active'
                                    ? 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100'
                                    : 'bg-green-50 text-green-700 hover:bg-green-100'
                                }`}>
                                {student.status === 'active'
                                  ? <><UserX size={12} /> Suspend</>
                                  : <><UserCheck size={12} /> Activate</>
                                }
                              </button>

                              {/* Remove from class */}
                              <button
                                onClick={() => {
                                  if (window.confirm(`Remove ${student.userId?.name} from ${cls.name}?`)) {
                                    removeStudentMutation.mutate({
                                      classId: cls._id,
                                      studentId: student._id,
                                    });
                                  }
                                }}
                                className="flex items-center gap-1 px-2.5 py-1.5 bg-red-50 text-red-600 rounded-lg text-xs font-semibold hover:bg-red-100 transition">
                                <UserMinus size={12} /> Remove
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}

            {filtered?.length === 0 && !isLoading && (
              <div className="bg-white rounded-xl p-12 text-center">
                <p className="text-4xl mb-3">📚</p>
                <p className="text-gray-500 font-semibold">No classes found</p>
                <p className="text-gray-400 text-sm mt-1">
                  {search ? 'Try a different search term' : 'Create your first class to get started'}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminClasses;