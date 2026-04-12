import { useEffect, useState } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { ClipboardCheck, CheckCircle, Clock3, XCircle, AlertTriangle, Users } from 'lucide-react';

const today = new Date().toISOString().slice(0, 10);

export default function Attendance() {
  const { user } = useAuth();
  const canManageAttendance = user?.role === 'admin' || user?.role === 'faculty';
  const [courses, setCourses] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [studentAttendance, setStudentAttendance] = useState(null);
  const [overview, setOverview] = useState(null);
  const [myAttendance, setMyAttendance] = useState(null);
  const [form, setForm] = useState({ studentId: '', courseId: '', date: today, status: 'present' });
  const [msg, setMsg] = useState({ text: '', type: '' });

  const flash = (text, type = 'success') => {
    setMsg({ text, type });
    setTimeout(() => setMsg({ text: '', type: '' }), 3000);
  };

  const loadStudentAttendance = async (studentId) => {
    if (!studentId) {
      setStudentAttendance(null);
      setSelectedStudentId('');
      setForm(current => ({ ...current, studentId: '' }));
      return;
    }

    try {
      const { data } = await api.get(`/attendance/student/${studentId}`);
      setStudentAttendance(data);
      setSelectedStudentId(studentId);
      setForm(current => ({ ...current, studentId }));
    } catch {
      setStudentAttendance(null);
    }
  };

  useEffect(() => {
    const load = async () => {
      try {
        if (canManageAttendance) {
          const studentEndpoint = user?.role === 'faculty' ? '/faculty/students' : '/admin/students';
          const [studentRes, courseRes, overviewRes] = await Promise.all([
            api.get(studentEndpoint),
            api.get('/courses'),
            api.get('/attendance/overview'),
          ]);
          setStudents(studentRes.data);
          setCourses(courseRes.data);
          setOverview(overviewRes.data);
        } else {
          const { data } = await api.get('/attendance/me');
          setMyAttendance(data);
        }
      } catch {}
    };
    load();
  }, [canManageAttendance, user?.role]);

  const handleMarkAttendance = async (e) => {
    e.preventDefault();
    try {
      await api.post('/attendance', form);
      flash('Attendance saved successfully.');
      const { data } = await api.get('/attendance/overview');
      setOverview(data);
      loadStudentAttendance(form.studentId);
    } catch (err) {
      flash(err.response?.data?.message || 'Unable to save attendance.', 'error');
    }
  };

  const summaryCards = canManageAttendance
    ? [
        { label: 'Average Attendance', value: `${overview?.averageAttendance || 0}%`, icon: ClipboardCheck, bg: '#eff6ff', color: '#2563eb' },
        { label: 'Attendance Records', value: overview?.totalRecords || 0, icon: CheckCircle, bg: '#ecfdf5', color: '#10b981' },
        { label: 'At Risk Students', value: overview?.atRiskCount || 0, icon: AlertTriangle, bg: '#fff7ed', color: '#f59e0b' },
      ]
    : [
        { label: 'Attendance', value: `${myAttendance?.summary?.percentage || 0}%`, icon: ClipboardCheck, bg: '#eff6ff', color: '#2563eb' },
        { label: 'Present', value: myAttendance?.summary?.present || 0, icon: CheckCircle, bg: '#ecfdf5', color: '#10b981' },
        { label: 'Absent', value: myAttendance?.summary?.absent || 0, icon: XCircle, bg: '#fef2f2', color: '#ef4444' },
        { label: 'Late', value: myAttendance?.summary?.late || 0, icon: Clock3, bg: '#fff7ed', color: '#f59e0b' },
      ];

  const records = canManageAttendance ? studentAttendance?.records || [] : myAttendance?.records || [];
  const summary = canManageAttendance ? studentAttendance?.summary : myAttendance?.summary;

  return (
    <div>
      <div className="page-header">
        <h1>Attendance</h1>
        <p>{canManageAttendance ? 'Mark student attendance and monitor attendance risk.' : 'Track your attendance percentage and attendance history.'}</p>
      </div>

      {msg.text && <div className={`alert alert-${msg.type}`}><CheckCircle size={15} /> {msg.text}</div>}

      <div className="stat-grid">
        {summaryCards.map(({ label, value, icon: Icon, bg, color }) => (
          <div className="stat-card" key={label}>
            <div className="stat-icon" style={{ background: bg }}>
              <Icon size={22} color={color} />
            </div>
            <div className="stat-info">
              <div className="stat-value">{value}</div>
              <div className="stat-label">{label}</div>
            </div>
          </div>
        ))}
      </div>

      {canManageAttendance && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20, marginBottom: 22 }}>
          <div className="panel">
            <div className="panel-title"><ClipboardCheck size={15} /> Mark Attendance</div>
            <form onSubmit={handleMarkAttendance}>
              <div className="form-group">
                <label className="form-label">Student</label>
                <select className="form-input" value={form.studentId} onChange={e => loadStudentAttendance(e.target.value)} required>
                  <option value="">Select student</option>
                  {students.map(student => (
                    <option key={student._id} value={student._id}>{student.name} - {student.department || 'No dept'}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Course</label>
                <select className="form-input" value={form.courseId} onChange={e => setForm({ ...form, courseId: e.target.value })} required>
                  <option value="">Select course</option>
                  {courses.map(course => (
                    <option key={course._id} value={course._id}>{course.title}</option>
                  ))}
                </select>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14 }}>
                <div className="form-group">
                  <label className="form-label">Date</label>
                  <input className="form-input" type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Status</label>
                  <select className="form-input" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} required>
                    <option value="present">Present</option>
                    <option value="late">Late</option>
                    <option value="absent">Absent</option>
                  </select>
                </div>
              </div>
              <button className="btn btn-primary" type="submit"><ClipboardCheck size={14} /> Save Attendance</button>
            </form>
          </div>

          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 18 }}>
              <Users size={16} color="var(--primary)" />
              <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>Students Requiring Attention</span>
            </div>
            {overview?.atRiskStudents?.length ? overview.atRiskStudents.map(student => (
              <div key={student.studentId} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--border-light)' }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{student.name}</div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>{student.department || 'No dept'} • {student.email}</div>
                </div>
                <span className="badge badge-red">{student.percentage}%</span>
              </div>
            )) : (
              <div className="empty-state" style={{ padding: '30px 12px' }}>
                <div className="empty-state-icon"><CheckCircle size={22} /></div>
                <h3>No attendance alerts</h3>
                <p>All tracked students are currently above the alert threshold.</p>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18, gap: 12 }}>
          <div>
            <div style={{ fontSize: '0.95rem', fontWeight: 700 }}>
              {canManageAttendance ? (selectedStudentId ? 'Selected Student Attendance' : 'Attendance History') : 'My Attendance History'}
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 4 }}>
              {summary ? `${summary.percentage}% attendance • ${summary.total} records` : 'No attendance records yet.'}
            </div>
          </div>
        </div>

        {records.length === 0 ? (
          <div className="empty-state" style={{ padding: '34px 12px' }}>
            <div className="empty-state-icon"><ClipboardCheck size={22} /></div>
            <h3>No attendance records</h3>
            <p>{canManageAttendance ? 'Select a student and mark attendance to begin tracking.' : 'Attendance records marked by faculty will appear here.'}</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: 12 }}>
            {records.map(record => (
              <div key={record._id} style={{ padding: 16, border: '1px solid var(--border-light)', borderRadius: 'var(--radius)', background: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{record.courseId?.title || 'Course'}</div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.78rem', marginTop: 4 }}>{record.date}</div>
                </div>
                <span className={`badge ${record.status === 'present' ? 'badge-green' : record.status === 'late' ? 'badge-orange' : 'badge-red'}`}>
                  {record.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
