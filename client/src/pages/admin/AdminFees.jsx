import { useState } from 'react';
import AdminLayout from '../../layouts/AdminLayout';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { Scan, AlertCircle, Camera } from 'lucide-react';
import { PAYMENT_METHODS } from '../../utils/constants';
import { generateMonthlyPDF, generateDateRangePDF, generateTeacherPDF } from '../../utils/pdfReports';
import QRScanner from '../../components/common/QRScanner';

const PaymentRequestsTab = () => {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState('pending');
  const { data } = useQuery({ queryKey:['payment-requests',filter], queryFn:()=>api.get(`/payment-requests?status=${filter}`).then(r=>r.data) });
  const approveMutation = useMutation({
    mutationFn:(id)=>api.patch(`/payment-requests/${id}/approve`),
    onSuccess:(res)=>{toast.success(`Approved! Receipt: ${res.data.receiptNumber}`);queryClient.invalidateQueries(['payment-requests']);queryClient.invalidateQueries(['outstanding']);},
    onError:err=>toast.error(err.response?.data?.message||'Failed'),
  });
  const rejectMutation = useMutation({
    mutationFn:({id,reason})=>api.patch(`/payment-requests/${id}/reject`,{reason}),
    onSuccess:()=>{toast.success('Rejected');queryClient.invalidateQueries(['payment-requests']);},
    onError:err=>toast.error(err.response?.data?.message||'Failed'),
  });
  const statusColors = { pending:'bg-yellow-100 text-yellow-700', approved:'bg-green-100 text-green-700', rejected:'bg-red-100 text-red-600' };
  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        {['pending','approved','rejected'].map(s=>(
          <button key={s} onClick={()=>setFilter(s)} className={`px-4 py-2 rounded-lg text-sm font-semibold capitalize transition ${filter===s?'bg-[#0d6b7a] text-white':'bg-white text-gray-600 shadow-sm hover:bg-gray-50'}`}>{s}</button>
        ))}
      </div>
      <div className="space-y-3">
        {data?.requests?.map(req=>(
          <div key={req._id} className="bg-white rounded-xl shadow-sm p-5">
            <div className="flex justify-between items-start">
              <div className="flex gap-4 items-start">
                <div className="w-10 h-10 rounded-full bg-[#0d6b7a] flex items-center justify-center text-white font-bold flex-shrink-0">{req.studentId?.userId?.name?.charAt(0)}</div>
                <div>
                  <p className="font-bold text-gray-800">{req.studentId?.userId?.name}</p>
                  <p className="text-sm text-gray-500">{req.studentId?.admissionNumber} • {req.classId?.name}</p>
                  <p className="text-sm text-gray-500 capitalize mt-0.5">Method: <span className="font-semibold">{req.method?.replace('_',' ')}</span></p>
                  {req.cardHolderName && <p className="text-xs text-gray-400 mt-0.5">Card: {req.cardHolderName} ••••{req.cardLastFour}</p>}
                  {req.bankName && <p className="text-xs text-gray-400 mt-0.5">Bank: {req.bankName} | Ref: {req.transactionRef}</p>}
                  {req.notes && <p className="text-xs text-gray-400 mt-0.5">Note: {req.notes}</p>}
                  {req.slipUrl && <a href={`http://localhost:5000${req.slipUrl}`} target="_blank" rel="noreferrer" className="text-xs text-blue-600 hover:underline mt-0.5 inline-block">📎 View Bank Slip</a>}
                  <p className="text-xs text-gray-400 mt-1">Submitted: {new Date(req.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="text-right flex-shrink-0 ml-4">
                <p className="text-xl font-bold text-gray-800">Rs. {req.amount?.toLocaleString()}</p>
                <span className={`text-xs font-bold px-2 py-1 rounded-full capitalize ${statusColors[req.status]}`}>{req.status}</span>
              </div>
            </div>
            {req.status==='pending' && (
              <div className="flex gap-3 mt-4 pt-4 border-t border-gray-100">
                <button onClick={()=>approveMutation.mutate(req._id)} disabled={approveMutation.isPending}
                  className="flex-1 bg-[#0d6b7a] text-white py-2.5 rounded-lg font-semibold text-sm hover:bg-[#0a505d] transition disabled:opacity-50">✓ Approve Payment</button>
                <button onClick={()=>{const r=window.prompt('Rejection reason:');if(r!==null)rejectMutation.mutate({id:req._id,reason:r});}} disabled={rejectMutation.isPending}
                  className="flex-1 bg-red-50 text-red-600 py-2.5 rounded-lg font-semibold text-sm hover:bg-red-100 transition">✗ Reject</button>
              </div>
            )}
            {req.rejectReason && <p className="text-xs text-red-500 mt-2">Reason: {req.rejectReason}</p>}
          </div>
        ))}
        {data?.requests?.length===0 && <div className="bg-white rounded-xl p-12 text-center text-gray-400">No {filter} payment requests</div>}
      </div>
    </div>
  );
};

const ReportsTab = () => {
  const [reportType, setReportType] = useState('monthly');
  const [monthlyMonth, setMonthlyMonth] = useState(()=>{const n=new Date();return `${n.getFullYear()}-${String(n.getMonth()+1).padStart(2,'0')}`;});
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [teacherId, setTeacherId] = useState('');
  const [teacherMonth, setTeacherMonth] = useState(()=>{const n=new Date();return `${n.getFullYear()}-${String(n.getMonth()+1).padStart(2,'0')}`;});
  const { data: teachers } = useQuery({ queryKey:['teachers'], queryFn:()=>api.get('/teachers').then(r=>r.data) });
  const { data: monthlyReport, isLoading: loadingMonthly } = useQuery({
    queryKey:['monthly-report',monthlyMonth],
    queryFn:()=>api.get(`/fees/reports/monthly?month=${monthlyMonth}`).then(r=>r.data),
    enabled:reportType==='monthly'&&!!monthlyMonth,
  });
  const { data: dateReport, isLoading: loadingDate, refetch: fetchDateReport } = useQuery({
    queryKey:['date-report',dateFrom,dateTo],
    queryFn:()=>api.get(`/fees/reports/daterange?from=${dateFrom}&to=${dateTo}`).then(r=>r.data),
    enabled:false,
  });
  const { data: teacherReport, isLoading: loadingTeacher, refetch: fetchTeacherReport } = useQuery({
    queryKey:['teacher-report',teacherId,teacherMonth],
    queryFn:()=>api.get(`/fees/reports/teacher/${teacherId}?month=${teacherMonth}`).then(r=>r.data),
    enabled:false,
  });
  const statusColors = { unpaid:'bg-red-100 text-red-600', paid:'bg-green-100 text-green-700', overdue:'bg-orange-100 text-orange-600' };
  const inp = "w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#0d6b7a]";
  return (
    <div className="space-y-6">
      <div className="flex gap-3">
        {[{key:'monthly',label:'📅 Monthly Report',desc:'All fees by month'},{key:'daterange',label:'📆 Date Range',desc:'Payments in a period'},{key:'teacher',label:'👨‍🏫 Teacher-wise',desc:'Income per teacher'}].map(t=>(
          <button key={t.key} onClick={()=>setReportType(t.key)}
            className={`flex-1 py-3 px-4 rounded-xl border-2 transition text-left ${reportType===t.key?'border-[#0d6b7a] bg-[#0d6b7a]/5':'border-gray-200 bg-white hover:border-gray-300'}`}>
            <p className={`font-bold text-sm ${reportType===t.key?'text-[#0d6b7a]':'text-gray-700'}`}>{t.label}</p>
            <p className="text-xs text-gray-400 mt-0.5">{t.desc}</p>
          </button>
        ))}
      </div>

      {reportType==='monthly' && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl shadow-sm p-5 flex items-end gap-4">
            <div className="flex-1"><label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Select Month</label><input type="month" value={monthlyMonth} onChange={e=>setMonthlyMonth(e.target.value)} className={inp}/></div>
            {monthlyReport && <button onClick={()=>generateMonthlyPDF(monthlyReport,monthlyMonth)} className="flex items-center gap-2 bg-[#0d6b7a] text-white px-5 py-2.5 rounded-lg font-semibold text-sm hover:bg-[#0a505d] transition">📥 Download PDF</button>}
          </div>
          {loadingMonthly && <div className="text-center text-gray-400 py-8">Loading report...</div>}
          {monthlyReport && (
            <div className="space-y-4">
              <div className="grid grid-cols-4 gap-4">
                {[{label:'Total Generated',value:`Rs. ${monthlyReport.summary?.totalGenerated?.toLocaleString()}`,color:'text-gray-800'},{label:'Collected',value:`Rs. ${monthlyReport.summary?.totalCollected?.toLocaleString()}`,color:'text-green-600'},{label:'Unpaid',value:`Rs. ${monthlyReport.summary?.totalUnpaid?.toLocaleString()}`,color:'text-red-600'},{label:'Collection Rate',value:monthlyReport.summary?.collectionRate,color:'text-[#0d6b7a]'}].map(card=>(
                  <div key={card.label} className="bg-white rounded-xl p-5 shadow-sm"><p className="text-gray-500 text-sm">{card.label}</p><p className={`text-2xl font-bold mt-1 ${card.color}`}>{card.value}</p></div>
                ))}
              </div>
              <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50"><tr>{['Student','Class','Amount','Due Date','Status'].map(h=><th key={h} className="text-left px-6 py-3 text-gray-500 font-semibold">{h}</th>)}</tr></thead>
                  <tbody>
                    {monthlyReport.records?.map(fee=>(
                      <tr key={fee._id} className="border-t border-gray-100 hover:bg-gray-50">
                        <td className="px-6 py-3 font-semibold text-gray-800">{fee.studentId?.userId?.name}</td>
                        <td className="px-6 py-3 text-gray-600">{fee.classId?.name}</td>
                        <td className="px-6 py-3 font-semibold">Rs. {fee.amount?.toLocaleString()}</td>
                        <td className="px-6 py-3 text-gray-500">{fee.dueDate?new Date(fee.dueDate).toLocaleDateString('en-GB'):'N/A'}</td>
                        <td className="px-6 py-3"><span className={`text-xs font-bold px-2 py-1 rounded-full capitalize ${statusColors[fee.status]}`}>{fee.status}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {reportType==='daterange' && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl shadow-sm p-5">
            <div className="grid grid-cols-3 gap-4 items-end">
              <div><label className="block text-xs font-semibold text-gray-500 uppercase mb-1">From Date</label><input type="date" value={dateFrom} onChange={e=>setDateFrom(e.target.value)} className={inp}/></div>
              <div><label className="block text-xs font-semibold text-gray-500 uppercase mb-1">To Date</label><input type="date" value={dateTo} onChange={e=>setDateTo(e.target.value)} className={inp}/></div>
              <button onClick={()=>fetchDateReport()} disabled={!dateFrom||!dateTo||loadingDate} className="bg-[#0d6b7a] text-white px-5 py-2.5 rounded-lg font-semibold text-sm hover:bg-[#0a505d] transition disabled:opacity-50">{loadingDate?'Loading...':'🔍 Generate Report'}</button>
            </div>
          </div>
          {dateReport && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                {[{label:'Total Payments',value:dateReport.totalPayments?.toString(),color:'text-gray-800'},{label:'Total Collected',value:`Rs. ${dateReport.totalCollected?.toLocaleString()}`,color:'text-green-600'},{label:'Period',value:`${dateFrom} → ${dateTo}`,color:'text-[#0d6b7a]'}].map(card=>(
                  <div key={card.label} className="bg-white rounded-xl p-5 shadow-sm"><p className="text-gray-500 text-sm">{card.label}</p><p className={`text-xl font-bold mt-1 ${card.color}`}>{card.value}</p></div>
                ))}
              </div>
              <div className="flex justify-end"><button onClick={()=>generateDateRangePDF(dateReport,dateFrom,dateTo)} className="flex items-center gap-2 bg-[#0d6b7a] text-white px-5 py-2.5 rounded-lg font-semibold text-sm hover:bg-[#0a505d] transition">📥 Download PDF</button></div>
              <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100"><h4 className="font-bold text-gray-700">Daily Breakdown</h4></div>
                <table className="w-full text-sm"><thead className="bg-gray-50"><tr>{['Date','Payments','Total'].map(h=><th key={h} className="text-left px-6 py-3 text-gray-500 font-semibold">{h}</th>)}</tr></thead>
                  <tbody>{dateReport.byDate?.map((d,i)=><tr key={i} className="border-t border-gray-100 hover:bg-gray-50"><td className="px-6 py-3 font-semibold text-gray-800">{d.date}</td><td className="px-6 py-3 text-gray-600">{d.count} payment{d.count>1?'s':''}</td><td className="px-6 py-3 font-bold text-green-600">Rs. {d.total?.toLocaleString()}</td></tr>)}</tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {reportType==='teacher' && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl shadow-sm p-5">
            <div className="grid grid-cols-3 gap-4 items-end">
              <div><label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Select Teacher</label>
                <select value={teacherId} onChange={e=>setTeacherId(e.target.value)} className={inp}>
                  <option value="">Choose teacher...</option>
                  {teachers?.teachers?.map(t=><option key={t._id} value={t._id}>{t.userId?.name} — {t.subjectExpertise?.join(', ')}</option>)}
                </select>
              </div>
              <div><label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Month</label><input type="month" value={teacherMonth} onChange={e=>setTeacherMonth(e.target.value)} className={inp}/></div>
              <button onClick={()=>fetchTeacherReport()} disabled={!teacherId||loadingTeacher} className="bg-[#0d6b7a] text-white px-5 py-2.5 rounded-lg font-semibold text-sm hover:bg-[#0a505d] transition disabled:opacity-50">{loadingTeacher?'Loading...':'🔍 Generate Report'}</button>
            </div>
          </div>
          {teacherReport && (
            <div className="space-y-4">
              <div className="bg-[#0d6b7a] rounded-xl p-5 text-white flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-xl font-bold">{teacherReport.teacher?.name?.charAt(0)}</div>
                  <div><h3 className="font-bold text-lg">{teacherReport.teacher?.name}</h3><p className="text-white/70 text-sm">{teacherReport.teacher?.email}</p><p className="text-white/60 text-xs mt-0.5">{teacherReport.teacher?.subjects?.join(' • ')}</p></div>
                </div>
                <button onClick={()=>generateTeacherPDF(teacherReport)} className="flex items-center gap-2 bg-white text-[#0d6b7a] px-5 py-2.5 rounded-lg font-bold text-sm hover:bg-gray-100 transition">📥 Download PDF</button>
              </div>
              <div className="grid grid-cols-4 gap-4">
                {[{label:'Classes',value:teacherReport.totalClasses?.toString(),color:'text-gray-800'},{label:'Generated',value:`Rs. ${teacherReport.totalGenerated?.toLocaleString()}`,color:'text-gray-800'},{label:'Collected',value:`Rs. ${teacherReport.totalCollected?.toLocaleString()}`,color:'text-green-600'},{label:'Collection Rate',value:`${teacherReport.collectionRate}%`,color:'text-[#0d6b7a]'}].map(card=>(
                  <div key={card.label} className="bg-white rounded-xl p-5 shadow-sm"><p className="text-gray-500 text-sm">{card.label}</p><p className={`text-2xl font-bold mt-1 ${card.color}`}>{card.value}</p></div>
                ))}
              </div>
              <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100"><h4 className="font-bold text-gray-700">Class-wise Breakdown — {teacherReport.month}</h4></div>
                <table className="w-full text-sm">
                  <thead className="bg-gray-50"><tr>{['Class','Students','Fee/Month','Generated','Collected','Unpaid','Rate'].map(h=><th key={h} className="text-left px-6 py-3 text-gray-500 font-semibold">{h}</th>)}</tr></thead>
                  <tbody>
                    {teacherReport.classReports?.map((cls,i)=>(
                      <tr key={i} className="border-t border-gray-100 hover:bg-gray-50">
                        <td className="px-6 py-3"><p className="font-semibold text-gray-800">{cls.className}</p><p className="text-xs text-gray-400">{cls.subject}</p></td>
                        <td className="px-6 py-3 text-gray-600">{cls.enrolledCount}</td>
                        <td className="px-6 py-3 text-gray-600">Rs. {cls.monthlyFee?.toLocaleString()}</td>
                        <td className="px-6 py-3 text-gray-700">Rs. {cls.totalGenerated?.toLocaleString()}</td>
                        <td className="px-6 py-3 font-semibold text-green-600">Rs. {cls.totalCollected?.toLocaleString()}</td>
                        <td className="px-6 py-3 font-semibold text-red-500">Rs. {cls.totalUnpaid?.toLocaleString()}</td>
                        <td className="px-6 py-3"><span className={`text-xs font-bold px-2 py-1 rounded-full ${cls.collectionRate>=80?'bg-green-100 text-green-700':cls.collectionRate>=50?'bg-yellow-100 text-yellow-700':'bg-red-100 text-red-600'}`}>{cls.collectionRate}%</span></td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-[#0d6b7a]/5 border-t-2 border-[#0d6b7a]/20">
                      <td className="px-6 py-3 font-bold text-gray-800">TOTAL</td><td className="px-6 py-3"></td><td className="px-6 py-3"></td>
                      <td className="px-6 py-3 font-bold text-gray-800">Rs. {teacherReport.totalGenerated?.toLocaleString()}</td>
                      <td className="px-6 py-3 font-bold text-green-600">Rs. {teacherReport.totalCollected?.toLocaleString()}</td>
                      <td className="px-6 py-3 font-bold text-red-500">Rs. {(teacherReport.totalGenerated-teacherReport.totalCollected)?.toLocaleString()}</td>
                      <td className="px-6 py-3 font-bold text-[#0d6b7a]">{teacherReport.collectionRate}%</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const AdminFees = () => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('outstanding');
  const [scanValue, setScanValue] = useState('');
  const [scannedStudent, setScannedStudent] = useState(null);
  const [selectedFee, setSelectedFee] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [generateMonth, setGenerateMonth] = useState('');
  const [showScanner, setShowScanner] = useState(false);

  const { data: outstanding, isLoading: loadingOutstanding } = useQuery({
    queryKey:['outstanding'],
    queryFn:()=>api.get('/fees/outstanding').then(r=>r.data),
    enabled:activeTab==='outstanding',
  });

  const generateMutation = useMutation({
    mutationFn:(month)=>api.post('/fees/generate',{month}),
    onSuccess:(res)=>{toast.success(`Generated ${res.data.generated} fee records for ${res.data.month}`);queryClient.invalidateQueries(['outstanding']);},
    onError:err=>toast.error(err.response?.data?.message||'Failed'),
  });

  const payMutation = useMutation({
    mutationFn:({feeRecordId,method})=>api.post('/fees/pay',{feeRecordId,method}),
    onSuccess:(res)=>{toast.success(`Payment recorded! Receipt: ${res.data.receipt.receiptNumber}`);queryClient.invalidateQueries(['outstanding']);setScannedStudent(null);setSelectedFee(null);setScanValue('');},
    onError:err=>toast.error(err.response?.data?.message||'Failed'),
  });

  const handleScan = async () => {
    if (!scanValue.trim()) return;
    try { const res = await api.get(`/scan/${scanValue.trim()}`); setScannedStudent(res.data); toast.success(`Student found: ${res.data.student.name}`); }
    catch (err) { toast.error(err.response?.data?.message||'Student not found'); }
  };

  const handleQRScan = async (admissionNumber) => {
    setShowScanner(false); setScanValue(admissionNumber);
    try { const res = await api.get(`/scan/${admissionNumber.trim()}`); setScannedStudent(res.data); toast.success(`Student found: ${res.data.student.name}`); }
    catch (err) { toast.error(err.response?.data?.message||'Student not found'); }
  };

  const statusColors = { unpaid:'bg-red-100 text-red-600', paid:'bg-green-100 text-green-700', overdue:'bg-orange-100 text-orange-600', waived:'bg-gray-100 text-gray-600' };
  const tabs = ['outstanding','scan & pay','payment requests','generate','reports'];
  const inp = "w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#0d6b7a]";

  return (
    <AdminLayout>
      {showScanner && <QRScanner onScan={handleQRScan} onClose={()=>setShowScanner(false)} title="Scan Student ID"/>}
      <div className="space-y-6">
        <div><h2 className="text-xl font-bold text-gray-800">Fees & Payments</h2><p className="text-sm text-gray-400 mt-1">Manage student fee collection</p></div>

        <div className="flex gap-2 bg-white rounded-xl p-1 shadow-sm w-fit flex-wrap">
          {tabs.map(tab=>(
            <button key={tab} onClick={()=>setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold capitalize transition ${activeTab===tab?'bg-[#0d6b7a] text-white':'text-gray-600 hover:bg-gray-50'}`}>
              {tab==='payment requests'?'💳 Payment Requests':tab==='reports'?'📊 Reports':tab}
            </button>
          ))}
        </div>

        {activeTab==='outstanding' && (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white rounded-xl p-5 shadow-sm"><p className="text-gray-500 text-sm">Total Outstanding</p><p className="text-2xl font-bold text-red-600 mt-1">Rs. {outstanding?.totalOutstanding?.toLocaleString()??'...'}</p></div>
              <div className="bg-white rounded-xl p-5 shadow-sm"><p className="text-gray-500 text-sm">Unpaid Records</p><p className="text-2xl font-bold text-gray-800 mt-1">{outstanding?.count??'...'}</p></div>
              <div className="bg-white rounded-xl p-5 shadow-sm"><p className="text-gray-500 text-sm">Students Affected</p><p className="text-2xl font-bold text-gray-800 mt-1">{outstanding?new Set(outstanding.fees?.map(f=>f.studentId?._id)).size:'...'}</p></div>
            </div>
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50"><tr>{['Student','Class','Month','Amount','Due Date','Status','Parent'].map(h=><th key={h} className="text-left px-6 py-3 text-gray-500 font-semibold">{h}</th>)}</tr></thead>
                <tbody>
                  {loadingOutstanding && <tr><td colSpan="7" className="px-6 py-8 text-center text-gray-400">Loading...</td></tr>}
                  {outstanding?.fees?.map(fee=>(
                    <tr key={fee._id} className="border-t border-gray-100 hover:bg-gray-50">
                      <td className="px-6 py-4"><p className="font-semibold text-gray-800">{fee.studentId?.userId?.name}</p><p className="text-xs text-gray-400">{fee.studentId?.admissionNumber}</p></td>
                      <td className="px-6 py-4 text-gray-600">{fee.classId?.name}</td>
                      <td className="px-6 py-4 text-gray-500">{fee.month}</td>
                      <td className="px-6 py-4 font-semibold text-gray-800">Rs. {fee.amount?.toLocaleString()}</td>
                      <td className="px-6 py-4 text-gray-500">{new Date(fee.dueDate).toLocaleDateString()}</td>
                      <td className="px-6 py-4"><span className={`text-xs font-bold px-2 py-1 rounded-full capitalize ${statusColors[fee.status]}`}>{fee.status}</span></td>
                      <td className="px-6 py-4"><p className="text-gray-600 text-xs">{fee.studentId?.parentId?.userId?.name}</p><p className="text-gray-400 text-xs">{fee.studentId?.parentId?.contactNumber}</p></td>
                    </tr>
                  ))}
                  {outstanding?.fees?.length===0&&!loadingOutstanding&&<tr><td colSpan="7" className="px-6 py-8 text-center text-gray-400">No outstanding fees</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab==='scan & pay' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-base font-bold text-gray-800 mb-4">Scan Student ID</h3>
              <div className="flex gap-3">
                <div className="relative flex-1">
                  <Scan size={16} className="absolute left-3 top-3 text-gray-400"/>
                  <input type="text" value={scanValue} onChange={e=>setScanValue(e.target.value)} onKeyDown={e=>e.key==='Enter'&&handleScan()}
                    placeholder="Scan barcode or enter admission number (e.g. XE0001)"
                    className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#0d6b7a]"/>
                </div>
                <button onClick={handleScan} className="bg-[#0d6b7a] text-white px-6 py-2.5 rounded-lg font-semibold text-sm hover:bg-[#0a505d] transition">Search</button>
                <button onClick={()=>setShowScanner(true)} className="flex items-center gap-2 bg-[#00b8c8] text-white px-4 py-2.5 rounded-lg font-semibold text-sm hover:bg-[#008fa0] transition">
                  <Camera size={16}/> 📷 Camera
                </button>
              </div>
            </div>
            {scannedStudent && (
              <div className="bg-white rounded-xl shadow-sm p-6 space-y-5">
                <div className="flex items-center gap-4 pb-4 border-b border-gray-100">
                  <div className="w-12 h-12 rounded-full bg-[#0d6b7a] flex items-center justify-center text-white font-bold text-lg">{scannedStudent.student.name?.charAt(0)}</div>
                  <div><p className="font-bold text-gray-800 text-lg">{scannedStudent.student.name}</p><p className="text-gray-400 text-sm">{scannedStudent.student.admissionNumber} • {scannedStudent.student.grade}</p></div>
                  <div className="ml-auto text-right"><p className="text-sm text-gray-500">Outstanding</p><p className="text-xl font-bold text-red-600">Rs. {scannedStudent.outstandingFees.total.toLocaleString()}</p></div>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-700 mb-3">Select class to pay:</h4>
                  <div className="space-y-3">
                    {scannedStudent.enrolledClasses.map(cls=>(
                      <div key={cls.classId} onClick={()=>!cls.feePaidThisMonth&&setSelectedFee(cls)}
                        className={`border rounded-xl p-4 cursor-pointer transition ${selectedFee?.classId===cls.classId?'border-[#0d6b7a] bg-[#0d6b7a]/5':cls.feePaidThisMonth?'border-gray-100 bg-gray-50 cursor-not-allowed opacity-60':'border-gray-200 hover:border-[#0d6b7a] hover:bg-gray-50'}`}>
                        <div className="flex justify-between items-center">
                          <div><p className="font-semibold text-gray-800">{cls.name}</p><p className="text-xs text-gray-400 mt-0.5">{cls.subject} • {cls.hall} • {cls.schedule?.dayOfWeek}</p></div>
                          <div className="text-right">
                            <p className="font-bold text-gray-800">Rs. {cls.monthlyFee?.toLocaleString()}</p>
                            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${cls.feePaidThisMonth?'bg-green-100 text-green-700':'bg-red-100 text-red-600'}`}>{cls.feePaidThisMonth?'Paid':'Unpaid'}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                {selectedFee && (
                  <div className="bg-[#0d6b7a]/5 border border-[#0d6b7a]/20 rounded-xl p-4 space-y-3">
                    <p className="font-semibold text-gray-800">Paying for: <span className="text-[#0d6b7a]">{selectedFee.name}</span></p>
                    <div>
                      <label className="text-xs font-semibold text-gray-500 uppercase mb-1 block">Payment Method</label>
                      <select value={paymentMethod} onChange={e=>setPaymentMethod(e.target.value)} className={inp}>
                        {PAYMENT_METHODS.map(m=><option key={m} value={m} className="capitalize">{m}</option>)}
                      </select>
                    </div>
                    <button onClick={()=>payMutation.mutate({feeRecordId:selectedFee.feeRecordId,method:paymentMethod})} disabled={payMutation.isPending||!selectedFee.feeRecordId}
                      className="w-full bg-[#0d6b7a] text-white py-3 rounded-xl font-bold hover:bg-[#0a505d] transition disabled:opacity-50">
                      {payMutation.isPending?'Processing...':`Confirm Payment — Rs. ${selectedFee.monthlyFee?.toLocaleString()}`}
                    </button>
                    {!selectedFee.feeRecordId && <p className="text-xs text-orange-600 flex items-center gap-1"><AlertCircle size={12}/> Fee record not generated yet. Generate fees first.</p>}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {activeTab==='payment requests' && <PaymentRequestsTab/>}

        {activeTab==='generate' && (
          <div className="bg-white rounded-xl shadow-sm p-6 max-w-md">
            <h3 className="text-base font-bold text-gray-800 mb-2">Generate Monthly Fees</h3>
            <p className="text-sm text-gray-400 mb-5">Create fee records for all enrolled students for the selected month.</p>
            <div className="space-y-4">
              <div><label className="text-xs font-semibold text-gray-500 uppercase mb-1 block">Select Month</label><input type="month" value={generateMonth} onChange={e=>setGenerateMonth(e.target.value)} className={inp}/></div>
              <button onClick={()=>generateMutation.mutate(generateMonth)} disabled={!generateMonth||generateMutation.isPending}
                className="w-full bg-[#0d6b7a] text-white py-3 rounded-xl font-bold hover:bg-[#0a505d] transition disabled:opacity-50">
                {generateMutation.isPending?'Generating...':'Generate Fees'}
              </button>
            </div>
          </div>
        )}

        {activeTab==='reports' && <ReportsTab/>}
      </div>
    </AdminLayout>
  );
};

export default AdminFees;