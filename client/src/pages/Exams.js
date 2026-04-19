import { useEffect, useState } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import {
  CalendarDays, Plus, Pencil, Trash2, Check, X,
  Clock3, BookOpen, Hash, MapPin, Users
} from 'lucide-react';

const DEPARTMENTS = ['CSE', 'ECE', 'EEE', 'MECH', 'BM'];
const today = new Date().toISOString().slice(0, 10);
const initialForm = {
  subject: '',
  subjectCode: '',
  department: DEPARTMENTS[0],
  date: today,
  startTime: '',
  endTime: '',
  venue: '',
  seatingArrangement: '',
};

export default function Exams() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const isStudent = user?.role === 'student';

  const [exams, setExams] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [editId, setEditId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [filterDate, setFilterDate] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('ALL');
  const [msg, setMsg] = useState({ text: '', type: '' });

  const flash = (text, type = 'success') => {
    setMsg({ text, type });
    setTimeout(() => setMsg({ text: '', type: '' }), 3000);
  };

  const loadExams = async () => {
    try {
      const params = new URLSearchParams();
      if (filterDate) params.set('date', filterDate);
      if (!isStudent && filterDepartment !== 'ALL') params.set('department', filterDepartment);

      const query = params.toString();
      const { data } = await api.get(`/exams${query ? `?${query}` : ''}`);
      setExams(data);
    } catch {
      flash('Failed to load exams.', 'error');
    }
  };

  useEffect(() => {
    loadExams();
  }, [filterDate, filterDepartment, isStudent]);

  const resetForm = () => {
    setForm(initialForm);
    setEditId(null);
    setShowForm(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editId) {
        await api.put(`/exams/${editId}`, form);
        flash('Exam updated successfully.');
      } else {
        await api.post('/exams', form);
        flash('Exam scheduled successfully.');
      }
      resetForm();
      loadExams();
    } catch (err) {
      flash(err.response?.data?.message || 'Failed to save exam.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this exam schedule?')) return;
    try {
      await api.delete(`/exams/${id}`);
      flash('Exam deleted.');
      loadExams();
    } catch (err) {
      flash(err.response?.data?.message || 'Failed to delete exam.', 'error');
    }
  };

  const startEdit = (exam) => {
    setEditId(exam._id);
    setForm({
      subject: exam.subject,
      subjectCode: exam.subjectCode,
      department: exam.department,
      date: exam.date,
      startTime: exam.startTime,
      endTime: exam.endTime,
      venue: exam.venue,
      seatingArrangement: exam.seatingArrangement,
    });
    setShowForm(true);
  };

  return (
    <div>
      <div className="page-header-row">
        <div className="page-header" style={{ marginBottom: 0 }}>
          <h1>Exam Scheduler</h1>
          <p>
            {isAdmin
              ? 'Create and manage student exam schedules with subject code, venue, seating, date, and timing.'
              : 'View your upcoming exam schedule with subject details, venue, seating, and timing.'}
          </p>
        </div>
        {isAdmin && (
          <button className="btn btn-primary" onClick={() => { if (showForm) resetForm(); else setShowForm(true); }}>
            <Plus size={15} /> New Exam
          </button>
        )}
      </div>

      {msg.text && <div className={`alert alert-${msg.type}`}><Check size={15} /> {msg.text}</div>}

      <div className="panel" style={{ marginBottom: 20 }}>
        <div className="panel-title"><CalendarDays size={15} /> Filter Exams</div>
        <div style={{ display: 'grid', gridTemplateColumns: isStudent ? '1fr' : '1fr 1fr', gap: 16 }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Date</label>
            <input className="form-input" type="date" value={filterDate} onChange={e => setFilterDate(e.target.value)} />
          </div>
          {!isStudent && (
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Department</label>
              <select className="form-input" value={filterDepartment} onChange={e => setFilterDepartment(e.target.value)}>
                <option value="ALL">All Departments</option>
                {DEPARTMENTS.map(department => (
                  <option key={department} value={department}>{department}</option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {isAdmin && showForm && (
        <div className="panel" style={{ marginBottom: 20 }}>
          <div className="panel-title">
            {editId ? <><Pencil size={15} /> Edit Exam</> : <><Plus size={15} /> Schedule Exam</>}
          </div>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div className="form-group">
                <label className="form-label">Subject</label>
                <div style={{ position: 'relative' }}>
                  <BookOpen size={14} style={iconStyle} />
                  <input
                    className="form-input"
                    style={{ paddingLeft: 32 }}
                    placeholder="e.g. Data Structures"
                    value={form.subject}
                    onChange={e => setForm({ ...form, subject: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Subject Code</label>
                <div style={{ position: 'relative' }}>
                  <Hash size={14} style={iconStyle} />
                  <input
                    className="form-input"
                    style={{ paddingLeft: 32 }}
                    placeholder="e.g. CS301"
                    value={form.subjectCode}
                    onChange={e => setForm({ ...form, subjectCode: e.target.value.toUpperCase() })}
                    required
                  />
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
              <div className="form-group">
                <label className="form-label">Department</label>
                <select className="form-input" value={form.department} onChange={e => setForm({ ...form, department: e.target.value })}>
                  {DEPARTMENTS.map(department => (
                    <option key={department} value={department}>{department}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Date</label>
                <input className="form-input" type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} required />
              </div>
              <div className="form-group">
                <label className="form-label">Venue</label>
                <div style={{ position: 'relative' }}>
                  <MapPin size={14} style={iconStyle} />
                  <input
                    className="form-input"
                    style={{ paddingLeft: 32 }}
                    placeholder="e.g. Seminar Hall A"
                    value={form.venue}
                    onChange={e => setForm({ ...form, venue: e.target.value })}
                    required
                  />
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div className="form-group">
                <label className="form-label">Start Time</label>
                <div style={{ position: 'relative' }}>
                  <Clock3 size={14} style={iconStyle} />
                  <input
                    className="form-input"
                    type="time"
                    style={{ paddingLeft: 32 }}
                    value={form.startTime}
                    onChange={e => setForm({ ...form, startTime: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">End Time</label>
                <div style={{ position: 'relative' }}>
                  <Clock3 size={14} style={iconStyle} />
                  <input
                    className="form-input"
                    type="time"
                    style={{ paddingLeft: 32 }}
                    value={form.endTime}
                    onChange={e => setForm({ ...form, endTime: e.target.value })}
                    required
                  />
                </div>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Seating Arrangement</label>
              <div style={{ position: 'relative' }}>
                <Users size={14} style={iconStyle} />
                <textarea
                  className="form-input"
                  style={{ minHeight: 88, paddingLeft: 32 }}
                  placeholder="e.g. Roll numbers 1-20 in Row A, seats 1-20"
                  value={form.seatingArrangement}
                  onChange={e => setForm({ ...form, seatingArrangement: e.target.value })}
                  required
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn btn-primary" type="submit" disabled={saving}>
                <Check size={14} /> {saving ? 'Saving...' : editId ? 'Update Exam' : 'Create Exam'}
              </button>
              <button className="btn btn-ghost" type="button" onClick={resetForm}>
                <X size={14} /> Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div style={{ display: 'grid', gap: 16 }}>
        {exams.map(exam => (
          <div className="card" key={exam._id}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, alignItems: 'flex-start', flexWrap: 'wrap' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 8 }}>
                  <span className="badge badge-blue">{exam.department}</span>
                  <span className="badge badge-green">{exam.subjectCode}</span>
                </div>
                <h3 style={{ margin: 0, fontSize: '1rem' }}>{exam.subject}</h3>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 6 }}>
                  Scheduled by {exam.createdBy?.name || 'Admin'}
                </div>
              </div>

              {isAdmin && (
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="btn btn-light btn-sm" onClick={() => startEdit(exam)}>
                    <Pencil size={12} /> Edit
                  </button>
                  <button className="btn btn-danger btn-sm" onClick={() => handleDelete(exam._id)}>
                    <Trash2 size={12} /> Delete
                  </button>
                </div>
              )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: 12, marginTop: 18 }}>
              <InfoCard icon={CalendarDays} label="Exam Date" value={formatDate(exam.date)} />
              <InfoCard icon={Clock3} label="Timing" value={`${exam.startTime} - ${exam.endTime}`} />
              <InfoCard icon={MapPin} label="Venue" value={exam.venue} />
              <InfoCard icon={Users} label="Seating Arrangement" value={exam.seatingArrangement} />
            </div>
          </div>
        ))}

        {exams.length === 0 && (
          <div className="card">
            <div className="empty-state" style={{ padding: '40px 12px' }}>
              <div className="empty-state-icon"><CalendarDays size={24} /></div>
              <h3>No exams scheduled</h3>
              <p>
                {isAdmin
                  ? 'Create the first exam schedule for students.'
                  : 'No exam schedule has been published for your department yet.'}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function InfoCard({ icon: Icon, label, value }) {
  return (
    <div style={{ border: '1px solid var(--border-light)', borderRadius: 'var(--radius)', padding: 14, background: 'var(--bg)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 7, color: 'var(--primary)', fontSize: '0.78rem', fontWeight: 700, marginBottom: 8 }}>
        <Icon size={14} /> {label}
      </div>
      <div style={{ fontSize: '0.88rem', color: 'var(--text)', lineHeight: 1.5 }}>{value}</div>
    </div>
  );
}

function formatDate(value) {
  if (!value) return 'Not set';
  return new Date(`${value}T00:00:00`).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
}

const iconStyle = {
  position: 'absolute',
  left: 11,
  top: '14px',
  color: 'var(--text-light)',
};
