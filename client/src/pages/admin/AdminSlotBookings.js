import { useEffect, useState } from 'react';
import api from '../../api/axios';
import { CalendarCheck, Search, Calendar, AlarmClock, User, Mail, Hash, BookOpen } from 'lucide-react';

export default function AdminSlotBookings() {
  const [bookings, setBookings] = useState([]);
  const [search,   setSearch]   = useState('');

  const fetchBookings = async () => {
    const { data } = await api.get('/slots/admin/all');
    setBookings(data);
  };

  useEffect(() => { fetchBookings(); }, []);

  const filtered = bookings.filter(b => {
    const q = search.toLowerCase();
    return (
      b.userId?.name?.toLowerCase().includes(q)  ||
      b.userId?.email?.toLowerCase().includes(q) ||
      b.userId?.idNumber?.toLowerCase().includes(q) ||
      b.courseId?.title?.toLowerCase().includes(q)
    );
  });

  const formatDate = (d) => new Date(d).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <div>
      <div className="page-header-row">
        <div className="page-header" style={{ marginBottom: 0 }}>
          <h1>Test Slot Bookings</h1>
          <p>All student test slot bookings — name, roll number, email, course and timing</p>
        </div>
        <div style={{ position: 'relative' }}>
          <Search size={14} style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)' }} />
          <input className="form-input" placeholder="Search by name, email, roll no, course..."
            value={search} onChange={e => setSearch(e.target.value)}
            style={{ paddingLeft: 32, width: 280 }} />
        </div>
      </div>

      {/* Summary cards */}
      <div className="stat-grid" style={{ marginTop: 20 }}>
        {[
          { label: 'Total Bookings', value: bookings.length,                                                   color: '#2563eb', bg: '#eff6ff',  icon: CalendarCheck },
          { label: 'Unique Students', value: new Set(bookings.map(b => b.userId?._id)).size,                   color: '#10b981', bg: '#ecfdf5',  icon: User          },
          { label: 'Courses Covered', value: new Set(bookings.map(b => b.courseId?._id)).size,                 color: '#f59e0b', bg: '#fffbeb',  icon: BookOpen      },
          { label: 'Today\'s Slots',  value: bookings.filter(b => b.date === new Date().toISOString().slice(0,10)).length, color: '#8b5cf6', bg: '#f5f3ff', icon: Calendar },
        ].map(({ label, value, color, bg, icon: Icon }) => (
          <div className="stat-card" key={label}>
            <div className="stat-icon" style={{ background: bg }}><Icon size={22} color={color} /></div>
            <div className="stat-info">
              <div className="stat-value">{value}</div>
              <div className="stat-label">{label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="table-wrap" style={{ marginTop: 24 }}>
        <div className="table-header">
          <span className="table-title">All Bookings ({filtered.length})</span>
        </div>
        <table>
          <thead>
            <tr>
              <th><div style={{ display: 'flex', alignItems: 'center', gap: 5 }}><User size={12} /> Student</div></th>
              <th><div style={{ display: 'flex', alignItems: 'center', gap: 5 }}><Hash size={12} /> Roll Number</div></th>
              <th><div style={{ display: 'flex', alignItems: 'center', gap: 5 }}><Mail size={12} /> Email</div></th>
              <th><div style={{ display: 'flex', alignItems: 'center', gap: 5 }}><BookOpen size={12} /> Course</div></th>
              <th><div style={{ display: 'flex', alignItems: 'center', gap: 5 }}><Calendar size={12} /> Date</div></th>
              <th><div style={{ display: 'flex', alignItems: 'center', gap: 5 }}><AlarmClock size={12} /> Time</div></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(b => {
              const initials = b.userId?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U';
              return (
                <tr key={b._id}>
                  {/* Student */}
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div className="avatar" style={{ background: '#2563eb', width: 32, height: 32, fontSize: '0.72rem' }}>{initials}</div>
                      <span style={{ fontWeight: 600 }}>{b.userId?.name || '—'}</span>
                    </div>
                  </td>
                  {/* Roll number */}
                  <td>
                    <span style={{ fontFamily: 'monospace', fontSize: '0.845rem', background: 'var(--border-light)', padding: '3px 8px', borderRadius: 6, color: 'var(--text)' }}>
                      {b.userId?.idNumber || '—'}
                    </span>
                  </td>
                  {/* Email */}
                  <td style={{ color: 'var(--text-muted)' }}>{b.userId?.email || '—'}</td>
                  {/* Course */}
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                      <div style={{ width: 28, height: 28, borderRadius: 7, background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <BookOpen size={13} color="#2563eb" />
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.845rem' }}>{b.courseId?.title || '—'}</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{b.courseId?.duration}</div>
                      </div>
                    </div>
                  </td>
                  {/* Date */}
                  <td>
                    <span className="badge badge-blue" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                      <Calendar size={10} /> {formatDate(b.date)}
                    </span>
                  </td>
                  {/* Time */}
                  <td>
                    <span className="badge badge-orange" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                      <AlarmClock size={10} /> {b.time}
                    </span>
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6}>
                  <div className="empty-state">
                    <div className="empty-state-icon"><CalendarCheck size={24} /></div>
                    <h3>No bookings found</h3>
                    <p>{search ? 'Try a different search term.' : 'No students have booked test slots yet.'}</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
