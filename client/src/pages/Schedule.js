import { useEffect, useState } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { CalendarDays, Plus, Trash2, Clock, BookOpen, CheckCircle } from 'lucide-react';

const today = new Date().toISOString().slice(0, 10);
const DEPARTMENTS = ['CSE', 'ECE', 'EEE', 'MECH', 'BM'];
const emptySlot = { startTime: '', endTime: '', subject: '', room: '' };

export default function Schedule() {
  const { user } = useAuth();
  const isStaff = user?.role === 'admin' || user?.role === 'faculty';

  const [date, setDate] = useState(today);
  const [schedules, setSchedules] = useState([]);
  const [msg, setMsg] = useState({ text: '', type: '' });

  // Faculty form state
  const [dept, setDept] = useState(DEPARTMENTS[0]);
  const [slots, setSlots] = useState([{ ...emptySlot }]);
  const [saving, setSaving] = useState(false);

  const flash = (text, type = 'success') => {
    setMsg({ text, type });
    setTimeout(() => setMsg({ text: '', type: '' }), 3000);
  };

  const load = async (d) => {
    try {
      const { data } = await api.get(`/schedule?date=${d}`);
      setSchedules(data);
    } catch {}
  };

  useEffect(() => { load(date); }, [date]);

  const updateSlot = (i, field, value) => {
    setSlots(prev => prev.map((s, idx) => idx === i ? { ...s, [field]: value } : s));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/schedule', { date, department: dept, slots });
      flash('Schedule saved successfully.');
      load(date);
      setSlots([{ ...emptySlot }]);
    } catch (err) {
      flash(err.response?.data?.message || 'Failed to save schedule.', 'error');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/schedule/${id}`);
      flash('Schedule deleted.');
      load(date);
    } catch { flash('Failed to delete.', 'error'); }
  };

  return (
    <div>
      <div className="page-header">
        <h1>Schedule</h1>
        <p>{isStaff ? 'Create and manage daily hour-based class schedules per department.' : 'View your daily class timetable assigned by faculty.'}</p>
      </div>

      {msg.text && (
        <div className={`alert alert-${msg.type}`}>
          <CheckCircle size={15} /> {msg.text}
        </div>
      )}

      {/* Date picker */}
      <div className="panel" style={{ marginBottom: 20, display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
        <CalendarDays size={16} color="var(--primary)" />
        <label style={{ fontWeight: 600, fontSize: '0.9rem' }}>Select Date</label>
        <input
          className="form-input"
          type="date"
          value={date}
          onChange={e => setDate(e.target.value)}
          style={{ width: 180 }}
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: isStaff ? 'repeat(auto-fit, minmax(320px, 1fr))' : '1fr', gap: 20 }}>

        {/* Faculty: create schedule form */}
        {isStaff && (
          <div className="panel">
            <div className="panel-title"><Plus size={15} /> Create Schedule</div>
            <form onSubmit={handleSave}>
              <div className="form-group">
                <label className="form-label">Department</label>
                <select className="form-input" value={dept} onChange={e => setDept(e.target.value)}>
                  {DEPARTMENTS.map(d => <option key={d}>{d}</option>)}
                </select>
              </div>

              <div style={{ marginBottom: 10, fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Time Slots
              </div>

              {slots.map((slot, i) => (
                <div key={i} style={{ border: '1px solid var(--border-light)', borderRadius: 'var(--radius)', padding: 12, marginBottom: 10, background: 'var(--bg)' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                    <div className="form-group" style={{ marginBottom: 8 }}>
                      <label className="form-label">Start</label>
                      <input className="form-input" type="time" value={slot.startTime} onChange={e => updateSlot(i, 'startTime', e.target.value)} required />
                    </div>
                    <div className="form-group" style={{ marginBottom: 8 }}>
                      <label className="form-label">End</label>
                      <input className="form-input" type="time" value={slot.endTime} onChange={e => updateSlot(i, 'endTime', e.target.value)} required />
                    </div>
                  </div>
                  <div className="form-group" style={{ marginBottom: 8 }}>
                    <label className="form-label">Subject</label>
                    <input className="form-input" placeholder="e.g. Data Structures" value={slot.subject} onChange={e => updateSlot(i, 'subject', e.target.value)} required />
                  </div>
                  <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end' }}>
                    <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                      <label className="form-label">Room (optional)</label>
                      <input className="form-input" placeholder="e.g. Lab 3" value={slot.room} onChange={e => updateSlot(i, 'room', e.target.value)} />
                    </div>
                    {slots.length > 1 && (
                      <button type="button" className="btn btn-ghost btn-sm" onClick={() => setSlots(prev => prev.filter((_, idx) => idx !== i))}>
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                </div>
              ))}

              <button type="button" className="btn btn-ghost btn-sm" style={{ marginBottom: 14 }}
                onClick={() => setSlots(prev => [...prev, { ...emptySlot }])}>
                <Plus size={13} /> Add Slot
              </button>

              <button className="btn btn-primary btn-full" type="submit" disabled={saving}>
                {saving ? 'Saving...' : <><CheckCircle size={14} /> Save Schedule</>}
              </button>
            </form>
          </div>
        )}

        {/* Schedule view */}
        <div>
          {schedules.length === 0 ? (
            <div className="card">
              <div className="empty-state" style={{ padding: '40px 12px' }}>
                <div className="empty-state-icon"><CalendarDays size={24} /></div>
                <h3>No schedule for this date</h3>
                <p>{isStaff ? 'Create a schedule using the form.' : 'No timetable has been assigned for this date yet.'}</p>
              </div>
            </div>
          ) : (
            schedules.map(sch => (
              <div className="card" key={sch._id} style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <div>
                    <span className="badge badge-blue" style={{ marginRight: 8 }}>{sch.department}</span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      {sch.slots.length} slot{sch.slots.length !== 1 ? 's' : ''} • by {sch.createdBy?.name}
                    </span>
                  </div>
                  {isStaff && (
                    <button className="btn btn-ghost btn-sm" onClick={() => handleDelete(sch._id)}>
                      <Trash2 size={13} />
                    </button>
                  )}
                </div>

                <div style={{ display: 'grid', gap: 10 }}>
                  {sch.slots
                    .slice()
                    .sort((a, b) => a.startTime.localeCompare(b.startTime))
                    .map((slot, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 14px', border: '1px solid var(--border-light)', borderRadius: 'var(--radius)', background: 'var(--bg)' }}>
                        <div style={{ minWidth: 90, display: 'flex', alignItems: 'center', gap: 6, color: 'var(--primary)', fontWeight: 700, fontSize: '0.82rem' }}>
                          <Clock size={13} /> {slot.startTime} – {slot.endTime}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 600, fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: 6 }}>
                            <BookOpen size={13} color="var(--text-muted)" /> {slot.subject}
                          </div>
                          {slot.room && <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>Room: {slot.room}</div>}
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
