import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { BookOpen, Wrench, ArrowRight, TrendingUp, ClipboardCheck, AlertTriangle, Bell, X, ShieldCheck, GraduationCap } from 'lucide-react';

export default function Dashboard() {
  const { user } = useAuth();
  const [stats,    setStats]    = useState({ courses: 0, skills: 0, completed: 0, inProgress: 0 });
  const [progress, setProgress] = useState([]);
  const [attendance, setAttendance] = useState({ percentage: 0, total: 0, absent: 0 });
  const [popups, setPopups] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        const [c, s, p, a] = await Promise.all([
          api.get('/courses'), api.get('/skills'), api.get('/progress'),
          api.get('/attendance/me'),
        ]);
        setProgress(p.data.slice(0, 5));
        setAttendance({
          percentage: a.data.summary?.percentage || 0,
          total: a.data.summary?.total || 0,
          absent: a.data.summary?.absent || 0,
        });

        // unread notifications popup (students only)
        if (user?.role === 'student') {
          const nRes = await api.get('/notifications');
          const unread = nRes.data.filter(n => !n.isRead).slice(0, 3);
          setPopups(unread);
          if (unread.length > 0) setTimeout(() => setPopups([]), 10000);
        }

        setStats({
          courses:    c.data.length,
          skills:     s.data.length,
          completed:  p.data.filter(x => x.status === 'completed').length,
          inProgress: p.data.filter(x => x.status === 'in_progress').length,
        });
      } catch {}
    };
    load();
  }, [user?.role]);

  const statCards = [
    { label: 'Available Courses', value: stats.courses,    icon: BookOpen,      bg: '#eff6ff', color: '#2563eb' },
    { label: 'My Skills',         value: stats.skills,     icon: Wrench,        bg: '#ecfdf5', color: '#10b981' },
    { label: 'Attendance',        value: `${attendance.percentage}%`, icon: ClipboardCheck, bg: '#fffbeb', color: '#f59e0b' },
    { label: 'In Progress',       value: stats.inProgress, icon: TrendingUp,     bg: '#f5f3ff', color: '#7c3aed' },
  ];

  const statusBadge = {
    completed:   <span className="badge badge-green">Completed</span>,
    in_progress: <span className="badge badge-blue">In Progress</span>,
    not_started: <span className="badge badge-gray">Not Started</span>,
  };

  return (
    <div>
      {/* Notification popups */}
      {popups.length > 0 && (
        <div style={{ display: 'grid', gap: 10, marginBottom: 20 }}>
          {popups.map(n => {
            const isAdmin = n.createdByRole === 'admin';
            return (
              <div key={n._id} style={{
                display: 'flex', alignItems: 'flex-start', gap: 12,
                padding: '14px 16px',
                borderRadius: 'var(--radius)',
                borderLeft: `4px solid ${isAdmin ? '#10b981' : '#ef4444'}`,
                background: isAdmin ? '#ecfdf5' : '#fef2f2',
                border: `1px solid ${isAdmin ? '#10b981' : '#ef4444'}`,
              }}>
                <div style={{ marginTop: 1, flexShrink: 0 }}>
                  {isAdmin
                    ? <ShieldCheck size={16} color="#10b981" />
                    : <GraduationCap size={16} color="#ef4444" />}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: '0.875rem', color: isAdmin ? '#065f46' : '#991b1b' }}>
                    {n.title}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: isAdmin ? '#047857' : '#b91c1c', marginTop: 2 }}>
                    {n.message}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 4 }}>
                    From {n.createdByName} ({n.createdByRole})
                  </div>
                </div>
                <button style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2, flexShrink: 0 }}
                  onClick={() => setPopups(prev => prev.filter(p => p._id !== n._id))}>
                  <X size={14} color="var(--text-muted)" />
                </button>
              </div>
            );
          })}
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Link to="/notifications" style={{ fontSize: '0.78rem', color: 'var(--primary)', fontWeight: 500, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>
              <Bell size={12} /> View all notifications
            </Link>
          </div>
        </div>
      )}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.02em' }}>
            Good day, {user?.name?.split(' ')[0]}
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: 3 }}>
            Here's your learning overview
          </p>
        </div>
      </div>

      <div className="stat-grid">
        {statCards.map(({ label, value, icon: Icon, bg, color }) => (
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

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <TrendingUp size={16} color="var(--primary)" />
              <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>Recent Enrollments</span>
            </div>
            <Link to="/courses" style={{ fontSize: '0.78rem', color: 'var(--primary)', textDecoration: 'none', fontWeight: 500 }}>View all</Link>
          </div>
          {progress.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '24px 0' }}>
              <div className="empty-state-icon" style={{ margin: '0 auto 10px' }}><BookOpen size={22} /></div>
              <p style={{ fontSize: '0.845rem', color: 'var(--text-muted)' }}>No enrollments yet.</p>
              <Link to="/courses" className="btn btn-primary btn-sm" style={{ marginTop: 12 }}>
                Browse Courses <ArrowRight size={13} />
              </Link>
            </div>
          ) : (
            progress.map(p => (
              <div key={p._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--border-light)' }}>
                <span style={{ fontSize: '0.845rem', fontWeight: 500 }}>{p.courseId?.title}</span>
                {statusBadge[p.status]}
              </div>
            ))
          )}
        </div>

        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 18 }}>
            <ClipboardCheck size={16} color="var(--primary)" />
            <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>Attendance Snapshot</span>
          </div>
          <div style={{ display: 'grid', gap: 12 }}>
            <div style={{ padding: 16, border: '1px solid var(--border-light)', borderRadius: 'var(--radius)', background: '#fff' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 6 }}>Current Attendance</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>{attendance.percentage}%</div>
              <div className="progress-track" style={{ marginTop: 10 }}>
                <div className="progress-fill" style={{ width: `${attendance.percentage}%`, background: attendance.percentage >= 75 ? '#10b981' : '#f59e0b' }} />
              </div>
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <div style={{ flex: 1, padding: 14, borderRadius: 'var(--radius)', background: 'var(--border-light)' }}>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Classes Marked</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 700 }}>{attendance.total}</div>
              </div>
              <div style={{ flex: 1, padding: 14, borderRadius: 'var(--radius)', background: attendance.absent > 0 ? '#fff7ed' : 'var(--border-light)' }}>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Absences</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 700 }}>{attendance.absent}</div>
              </div>
            </div>
            {attendance.total > 0 && attendance.percentage < 75 && (
              <div className="alert alert-info" style={{ marginBottom: 0 }}>
                <AlertTriangle size={15} /> Your attendance is below 75%. Please follow up with faculty if needed.
              </div>
            )}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <Link to="/attendance" className="btn btn-primary btn-full"><ClipboardCheck size={15} /> View Attendance</Link>
              <Link to="/skills" className="btn btn-success btn-full"><Wrench size={15} /> Manage Skills</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
