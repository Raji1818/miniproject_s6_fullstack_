import { useEffect, useState } from 'react';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { BarChart2, ChevronDown, Clock, CheckCircle, Circle, Loader } from 'lucide-react';

const STATUS_CONFIG = {
  completed: { badge: 'badge-green', label: 'Completed', icon: CheckCircle },
  in_progress: { badge: 'badge-blue', label: 'In Progress', icon: Loader },
  not_started: { badge: 'badge-gray', label: 'Not Started', icon: Circle },
};

export default function AdminProgress() {
  const { user } = useAuth();
  const isFaculty = user?.role === 'faculty';
  const [users, setUsers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [selected, setSelected] = useState('');
  const [progress, setProgress] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const userRequest = isFaculty ? api.get('/faculty/students') : api.get('/admin/users');
    Promise.all([userRequest, api.get('/courses')]).then(([u, c]) => {
      setUsers(u.data);
      setCourses(c.data);
    });
  }, [isFaculty]);

  const loadProgress = async (userId) => {
    setSelected(userId);
    if (!userId) {
      setProgress([]);
      return;
    }
    setLoading(true);
    try {
      const { data } = await api.get(`${isFaculty ? '/faculty' : '/admin'}/progress/${userId}`);
      setProgress(data);
    } catch {
      setProgress([]);
    }
    setLoading(false);
  };

  const handleStatusChange = async (progressId, status) => {
    await api.put(`/progress/${progressId}`, { status });
    loadProgress(selected);
  };

  const selectedUser = users.find(u => u._id === selected);
  const students = isFaculty ? users : users.filter(u => u.role === 'student');

  return (
    <div>
      <div className="page-header">
        <h1>Student Progress</h1>
        <p>Monitor and update course enrollment status for all students</p>
      </div>

      <div className="card" style={{ marginBottom: 22, display: 'flex', alignItems: 'center', gap: 16 }}>
        <BarChart2 size={18} color="var(--primary)" style={{ flexShrink: 0 }} />
        <div style={{ flex: 1 }}>
          <label className="form-label" style={{ marginBottom: 6 }}>Select Student</label>
          <div style={{ position: 'relative', maxWidth: 360 }}>
            <select className="form-input" value={selected} onChange={e => loadProgress(e.target.value)}
              style={{ paddingRight: 36, appearance: 'none' }}>
              <option value="">Choose a student...</option>
              {students.map(u => (
                <option key={u._id} value={u._id}>{u.name} - {u.email}</option>
              ))}
            </select>
            <ChevronDown size={14} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
          </div>
        </div>
        {selectedUser && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 16px', background: 'var(--border-light)', borderRadius: 'var(--radius)' }}>
            <div className="avatar" style={{ background: '#2563eb', width: 30, height: 30, fontSize: '0.72rem' }}>
              {selectedUser.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
            </div>
            <div>
              <div style={{ fontSize: '0.845rem', fontWeight: 600 }}>{selectedUser.name}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{progress.length} enrollments</div>
            </div>
          </div>
        )}
      </div>

      {selected ? (
        <div className="table-wrap">
          <div className="table-header">
            <span className="table-title">Enrollments for {selectedUser?.name}</span>
          </div>
          <table>
            <thead>
              <tr>
                <th>Course</th>
                <th>Duration</th>
                <th>Current Status</th>
                <th>Update Status</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr><td colSpan={4} style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>Loading...</td></tr>
              )}
              {!loading && progress.length === 0 && (
                <tr>
                  <td colSpan={4}>
                    <div className="empty-state">
                      <div className="empty-state-icon"><BarChart2 size={22} /></div>
                      <h3>No enrollments</h3>
                      <p>This student hasn't enrolled in any courses yet.</p>
                    </div>
                  </td>
                </tr>
              )}
              {!loading && progress.map(p => {
                const course = courses.find(c => c._id === (p.courseId?._id || p.courseId));
                const cfg = STATUS_CONFIG[p.status] || STATUS_CONFIG.not_started;
                const Icon = cfg.icon;
                return (
                  <tr key={p._id}>
                    <td style={{ fontWeight: 600 }}>{p.courseId?.title || course?.title || '-'}</td>
                    <td>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                        <Clock size={12} /> {course?.duration || '-'}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${cfg.badge}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                        <Icon size={10} /> {cfg.label}
                      </span>
                    </td>
                    <td>
                      <select
                        value={p.status}
                        onChange={e => handleStatusChange(p._id, e.target.value)}
                        style={{
                          padding: '5px 10px', borderRadius: 'var(--radius)',
                          border: '1.5px solid var(--border)',
                          background: '#fff', color: 'var(--text)',
                          fontSize: '0.82rem', cursor: 'pointer', fontFamily: 'inherit',
                        }}
                      >
                        <option value="not_started">Not Started</option>
                        <option value="in_progress">In Progress</option>
                        <option value="completed">Completed</option>
                      </select>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="empty-state card">
          <div className="empty-state-icon"><BarChart2 size={24} /></div>
          <h3>Select a student</h3>
          <p>Choose a student from the dropdown above to view and manage their progress.</p>
        </div>
      )}
    </div>
  );
}
