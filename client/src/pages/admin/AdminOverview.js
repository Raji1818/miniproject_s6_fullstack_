import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import { Users, BookOpen, ArrowRight, GraduationCap, LayoutDashboard, Bell, ClipboardCheck, AlertTriangle, CalendarCheck } from 'lucide-react';

export default function AdminOverview() {
  const { user } = useAuth();
  const isFaculty = user?.role === 'faculty';
  const [stats, setStats] = useState({ users: 0, courses: 0, students: 0, admins: 0 });
  const [recentUsers, setRecentUsers] = useState([]);
  const [attendanceOverview, setAttendanceOverview] = useState({ averageAttendance: 0, atRiskCount: 0, atRiskStudents: [] });

  useEffect(() => {
    const load = async () => {
      try {
        const userRequest = isFaculty ? api.get('/faculty/students') : api.get('/admin/users');
        const [users, courses, attendance] = await Promise.all([userRequest, api.get('/courses'), api.get('/attendance/overview')]);
        const students = users.data.filter(u => u.role === 'student').length;
        const admins = users.data.filter(u => u.role === 'admin').length;
        setStats({ users: users.data.length, courses: courses.data.length, students, admins });
        setRecentUsers(users.data.slice(0, 6));
        setAttendanceOverview(attendance.data);
      } catch {}
    };
    load();
  }, [isFaculty]);

  const statCards = isFaculty
    ? [
        { label: 'Students', value: stats.students, icon: GraduationCap, bg: '#fffbeb', color: '#f59e0b' },
        { label: 'Courses', value: stats.courses, icon: BookOpen, bg: '#ecfdf5', color: '#10b981' },
        { label: 'Attendance Avg', value: `${attendanceOverview.averageAttendance}%`, icon: ClipboardCheck, bg: '#eff6ff', color: '#2563eb' },
        { label: 'At Risk', value: attendanceOverview.atRiskCount, icon: AlertTriangle, bg: '#fff7ed', color: '#f59e0b' },
      ]
    : [
        { label: 'Total Users', value: stats.users, icon: Users, bg: '#eff6ff', color: '#2563eb' },
        { label: 'Total Courses', value: stats.courses, icon: BookOpen, bg: '#ecfdf5', color: '#10b981' },
        { label: 'Students', value: stats.students, icon: GraduationCap, bg: '#fffbeb', color: '#f59e0b' },
        { label: 'Attendance Avg', value: `${attendanceOverview.averageAttendance}%`, icon: ClipboardCheck, bg: '#f5f3ff', color: '#8b5cf6' },
      ];

  return (
    <div>
      <div className="page-header">
        <h1>{isFaculty ? 'Faculty Overview' : 'Overview'}</h1>
        <p>{isFaculty ? 'Manage students, track progress, and publish notifications.' : 'Platform-wide statistics and admin controls'}</p>
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
              <Users size={16} color="var(--primary)" />
              <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{isFaculty ? 'Recent Students' : 'Recent Users'}</span>
            </div>
            <Link to={isFaculty ? '/faculty/students' : '/admin/users'} style={{ fontSize: '0.78rem', color: 'var(--primary)', textDecoration: 'none', fontWeight: 500 }}>
              View all
            </Link>
          </div>
          {recentUsers.map(u => {
            const initials = u.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
            return (
              <div key={u._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '9px 0', borderBottom: '1px solid var(--border-light)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div className="avatar" style={{ background: u.role === 'admin' ? '#8b5cf6' : '#2563eb', width: 30, height: 30, fontSize: '0.72rem' }}>{initials}</div>
                  <div>
                    <div style={{ fontSize: '0.845rem', fontWeight: 600 }}>{u.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{u.email}</div>
                  </div>
                </div>
                <span className={`badge ${u.role === 'admin' ? 'badge-blue' : 'badge-green'}`}>{u.role}</span>
              </div>
            );
          })}
        </div>

        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 18 }}>
            <LayoutDashboard size={16} color="var(--primary)" />
            <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>Quick Actions</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {!isFaculty && <Link to="/admin/courses" className="btn btn-primary btn-full"><BookOpen size={15} /> Manage Courses</Link>}
            <Link to={isFaculty ? '/faculty/students' : '/admin/users'} className="btn btn-success btn-full"><Users size={15} /> Manage Students</Link>
            <Link to={isFaculty ? '/faculty/progress' : '/admin/progress'} className="btn btn-ghost btn-full"><ArrowRight size={15} /> View Progress</Link>
            {!isFaculty && <Link to="/admin/slot-bookings" className="btn btn-primary btn-full"><CalendarCheck size={15} /> Slot Bookings</Link>}
            <Link to="/attendance" className="btn btn-primary btn-full"><ClipboardCheck size={15} /> Attendance</Link>
            <Link to="/notifications" className="btn btn-light btn-full"><Bell size={15} /> Notifications</Link>
          </div>
        </div>
      </div>

      <div className="card" style={{ marginTop: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 18 }}>
          <AlertTriangle size={16} color="var(--warning)" />
          <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>Attendance Attention Needed</span>
        </div>
        {attendanceOverview.atRiskStudents?.length ? attendanceOverview.atRiskStudents.map(student => (
          <div key={student.studentId} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--border-light)' }}>
            <div>
              <div style={{ fontSize: '0.845rem', fontWeight: 600 }}>{student.name}</div>
              <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>{student.department || 'No dept'} • {student.email}</div>
            </div>
            <span className="badge badge-red">{student.percentage}%</span>
          </div>
        )) : (
          <div className="empty-state" style={{ padding: '26px 12px' }}>
            <div className="empty-state-icon"><ClipboardCheck size={22} /></div>
            <h3>No low-attendance students</h3>
            <p>Students with low attendance will appear here for quick follow-up.</p>
          </div>
        )}
      </div>
    </div>
  );
}
