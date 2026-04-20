import { useEffect, useState } from 'react';
import api from '../api/axios';
import { BookOpen, Clock, CheckCircle, Plus, CalendarCheck, X, Calendar, AlarmClock, Award } from 'lucide-react';

export default function Courses() {
  const [courses,    setCourses]    = useState([]);
  const [progress,   setProgress]   = useState([]);
  const [myBookings, setMyBookings] = useState([]);
  const [slots,      setSlots]      = useState([]);
  const [msg,        setMsg]        = useState({ text: '', type: '' });

  const [bookingModal, setBookingModal] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [booking,      setBooking]      = useState(false);

  const flash = (text, type = 'success') => {
    setMsg({ text, type });
    setTimeout(() => setMsg({ text: '', type: '' }), 4000);
  };

  const load = async () => {
    const [c, p, b, s] = await Promise.all([
      api.get('/courses'),
      api.get('/progress'),
      api.get('/slots/my'),
      api.get('/slots/available'),
    ]);
    setCourses(c.data);
    setProgress(p.data);
    setMyBookings(b.data);
    setSlots(s.data);
  };

  useEffect(() => { load(); }, []);

  const getProgress = (courseId) => progress.find(p => (p.courseId?._id || p.courseId) === courseId);
  const getBooking  = (courseId) => myBookings.find(b => (b.courseId?._id || b.courseId) === courseId);

  const handleEnroll = async (courseId) => {
    try {
      await api.post('/progress', { courseId, status: 'in_progress' });
      flash('Successfully enrolled in course.');
      load();
    } catch (err) {
      flash(err.response?.data?.message || 'Already enrolled.', 'error');
    }
  };

  // Mark complete AND auto-add course title as a skill
  const handleComplete = async (progressId, courseTitle) => {
    try {
      await api.put(`/progress/${progressId}`, { status: 'completed' });

      // Auto-add course as skill at Intermediate level (avoid duplicate)
      try {
        await api.post('/skills', { skillName: courseTitle, level: 'Intermediate' });
      } catch {
        // skill may already exist — silently ignore
      }

      flash(`"${courseTitle}" marked complete and added to your Skills!`);
      load();
    } catch (err) {
      flash(err.response?.data?.message || 'Error.', 'error');
    }
  };

  const handleBookSlot = async () => {
    if (!selectedSlot) return flash('Please select a time slot.', 'error');
    setBooking(true);
    try {
      await api.post('/slots', {
        courseId: bookingModal,
        date: selectedSlot.date,
        time: selectedSlot.time,
      });
      flash('Test slot booked successfully! Your slot is confirmed.');
      setBookingModal(null);
      setSelectedSlot(null);
      await load();
    } catch (err) {
      flash(err.response?.data?.message || 'Booking failed.', 'error');
    }
    setBooking(false);
  };

  const slotsByDate = slots.reduce((acc, s) => {
    if (!acc[s.date]) acc[s.date] = [];
    acc[s.date].push(s);
    return acc;
  }, {});

  const formatDate = (d) => new Date(d).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

  return (
    <div>
      <div className="page-header">
        <h1>My Courses</h1>
        <p>Enroll in courses, mark them complete, and book your test slot</p>
      </div>

      {msg.text && (
        <div className={`alert alert-${msg.type}`}>
          <CheckCircle size={15} /> {msg.text}
        </div>
      )}

      <div className="course-grid">
        {courses.map(c => {
          const prog       = getProgress(c._id);
          const slotBooked = getBooking(c._id);
          const isEnrolled  = !!prog;
          const isCompleted = prog?.status === 'completed';
          const isBooked    = !!slotBooked;

          return (
            <div key={c._id} className="course-card">
              <div className="course-card-icon">
                <BookOpen size={20} />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                <h3 className="course-title">{c.title}</h3>
                {isCompleted
                  ? <span className="badge badge-green"><CheckCircle size={10} /> Completed</span>
                  : isEnrolled
                  ? <span className="badge badge-blue"><Clock size={10} /> In Progress</span>
                  : null
                }
              </div>

              <p className="course-desc">{c.description}</p>
              <div className="course-meta"><Clock size={12} /> {c.duration}</div>

              {/* Booked slot info — NO cancel button */}
              {isBooked && (
                <div style={{
                  background: '#ecfdf5', border: '1px solid #a7f3d0',
                  borderRadius: 10, padding: '12px 14px',
                }}>
                  <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#065f46', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>
                    Test Slot Confirmed
                  </div>
                  <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.845rem', color: '#047857', fontWeight: 600 }}>
                      <Calendar size={13} /> {formatDate(slotBooked.date)}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.845rem', color: '#047857', fontWeight: 600 }}>
                      <AlarmClock size={13} /> {slotBooked.time}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: 6 }}>
                    Slot is locked. Contact admin to make changes.
                  </div>
                </div>
              )}

              <div className="course-actions">
                {!isEnrolled && (
                  <button className="btn btn-primary btn-sm" onClick={() => handleEnroll(c._id)}>
                    <Plus size={13} /> Enroll Now
                  </button>
                )}
                {isEnrolled && !isCompleted && (
                  <button className="btn btn-success btn-sm" onClick={() => handleComplete(prog._id, c.title)}>
                    <CheckCircle size={13} /> Mark Complete
                  </button>
                )}
                {isCompleted && !isBooked && (
                  <button className="btn btn-primary btn-sm" onClick={() => { setBookingModal(c._id); setSelectedSlot(null); }}>
                    <CalendarCheck size={13} /> Book Test Slot
                  </button>
                )}
                {isCompleted && isBooked && (
                  <span style={{ fontSize: '0.78rem', color: 'var(--success)', display: 'flex', alignItems: 'center', gap: 4, fontWeight: 600 }}>
                    <Award size={13} /> Slot Confirmed
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {courses.length === 0 && (
        <div className="empty-state">
          <div className="empty-state-icon"><BookOpen size={24} /></div>
          <h3>No courses available</h3>
          <p>Check back later for new courses.</p>
        </div>
      )}

      {/* Slot Booking Modal */}
      {bookingModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000, padding: 20,
        }}>
          <div style={{
            background: '#fff', borderRadius: 18, width: '100%', maxWidth: 520,
            boxShadow: '0 24px 64px rgba(0,0,0,0.22)', overflow: 'hidden',
          }}>
            {/* Header */}
            <div style={{ background: 'linear-gradient(135deg,#1e3a8a,#2563eb)', padding: '22px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ color: '#fff', fontWeight: 700, fontSize: '1.05rem' }}>Book Test Slot</div>
                <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.82rem', marginTop: 3 }}>
                  {courses.find(c => c._id === bookingModal)?.title}
                </div>
              </div>
              <button onClick={() => setBookingModal(null)} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: 8, padding: 8, cursor: 'pointer', color: '#fff', display: 'flex' }}>
                <X size={16} />
              </button>
            </div>

            {/* Warning banner */}
            <div style={{ background: '#fffbeb', borderBottom: '1px solid #fde68a', padding: '10px 24px', display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.82rem', color: '#92400e' }}>
              <Award size={14} color="#f59e0b" />
              Once confirmed, your slot cannot be cancelled. Choose carefully.
            </div>

            {/* Slots */}
            <div style={{ padding: '20px 24px', maxHeight: 340, overflowY: 'auto' }}>
              <p style={{ fontSize: '0.845rem', color: 'var(--text-muted)', marginBottom: 16 }}>
                Select a date and time for your test. Each session is 1 hour.
              </p>
              {Object.entries(slotsByDate).map(([date, dateSlots]) => (
                <div key={date} style={{ marginBottom: 18 }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Calendar size={12} /> {formatDate(date)}
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {dateSlots.map(s => {
                      const isSel = selectedSlot?.date === s.date && selectedSlot?.time === s.time;
                      return (
                        <button key={s.time} onClick={() => setSelectedSlot(s)} style={{
                          padding: '8px 16px', borderRadius: 8, cursor: 'pointer',
                          fontSize: '0.845rem', fontWeight: 600,
                          border: `2px solid ${isSel ? '#2563eb' : '#e5e7eb'}`,
                          background: isSel ? '#eff6ff' : '#fff',
                          color: isSel ? '#2563eb' : 'var(--text)',
                          display: 'flex', alignItems: 'center', gap: 6,
                          transition: 'all 0.15s ease',
                        }}>
                          <AlarmClock size={13} /> {s.time}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
              {slots.length === 0 && (
                <div className="empty-state" style={{ padding: '24px 8px' }}>
                  <div className="empty-state-icon"><CalendarCheck size={22} /></div>
                  <h3>No open slots right now</h3>
                  <p>All upcoming test slots are filled. Please check again later or contact admin.</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div style={{ padding: '14px 24px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--border-light)' }}>
              <div style={{ fontSize: '0.845rem', color: 'var(--text-muted)' }}>
                {selectedSlot
                  ? <span style={{ color: 'var(--primary)', fontWeight: 600 }}>
                      <CheckCircle size={13} style={{ verticalAlign: 'middle', marginRight: 4 }} />
                      {formatDate(selectedSlot.date)} at {selectedSlot.time}
                    </span>
                  : 'No slot selected'
                }
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button className="btn btn-ghost btn-sm" onClick={() => setBookingModal(null)}>
                  <X size={13} /> Close
                </button>
                <button className="btn btn-primary btn-sm" onClick={handleBookSlot} disabled={!selectedSlot || booking}>
                  <CalendarCheck size={13} /> {booking ? 'Booking...' : 'Confirm Booking'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
