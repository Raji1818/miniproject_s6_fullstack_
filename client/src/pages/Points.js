import { useEffect, useState } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { Star, Award, CheckCircle, Users } from 'lucide-react';

const today = new Date().toISOString().slice(0, 10);

export default function Points() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const isStudent = user?.role === 'student';

  const [myPoints, setMyPoints] = useState({ total: 0, rewards: [] });
  const [students, setStudents] = useState([]);
  const [allPoints, setAllPoints] = useState([]);
  const [selectedId, setSelectedId] = useState('');
  const [studentDetail, setStudentDetail] = useState(null);
  const [form, setForm] = useState({ studentId: '', points: 1, reason: 'Attendance reward', date: today });
  const [msg, setMsg] = useState({ text: '', type: '' });
  const [saving, setSaving] = useState(false);

  const flash = (text, type = 'success') => {
    setMsg({ text, type });
    setTimeout(() => setMsg({ text: '', type: '' }), 3000);
  };

  const formatPointValue = (value) => `${value > 0 ? '+' : ''}${value} pts`;
  const badgeClassForPoints = (value) => `badge ${value < 0 ? 'badge-red' : 'badge-orange'}`;

  const loadStudentDetail = async (id) => {
    if (!id) {
      setStudentDetail(null);
      return;
    }

    try {
      const { data } = await api.get(`/points/student/${id}`);
      setStudentDetail(data);
    } catch {
      setStudentDetail(null);
    }
  };

  useEffect(() => {
    const load = async () => {
      try {
        if (isAdmin) {
          const [studentsResponse, pointsResponse] = await Promise.all([
            api.get('/admin/students'),
            api.get('/points/students'),
          ]);
          setStudents(studentsResponse.data);
          setAllPoints(pointsResponse.data);
          return;
        }

        if (isStudent) {
          const { data } = await api.get('/points/me');
          setMyPoints(data);
        }
      } catch {}
    };

    load();
  }, [isAdmin, isStudent]);

  const handleAward = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      await api.post('/points', form);
      flash(
        Number(form.points) < 0
          ? `${Math.abs(Number(form.points))} point(s) deducted successfully.`
          : `${form.points} point(s) awarded successfully.`
      );

      const { data } = await api.get('/points/students');
      setAllPoints(data);

      if (selectedId) {
        loadStudentDetail(selectedId);
      }

      setForm((current) => ({ ...current, points: 1, reason: 'Attendance reward' }));
    } catch (err) {
      flash(err.response?.data?.message || 'Failed to update reward points.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleSelectStudent = (id) => {
    setSelectedId(id);
    setForm((current) => ({ ...current, studentId: id }));
    loadStudentDetail(id);
  };

  if (isStudent) {
    return (
      <div>
        <div className="page-header">
          <h1>My Reward Points</h1>
          <p>See your own reward points, history, and any deductions.</p>
        </div>

        <div className="stat-grid" style={{ marginBottom: 24 }}>
          <div className="stat-card">
            <div className="stat-icon" style={{ background: '#fffbeb' }}><Star size={22} color="#f59e0b" /></div>
            <div className="stat-info">
              <div className="stat-value">{myPoints.total}</div>
              <div className="stat-label">Total Points</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{ background: '#ecfdf5' }}><Award size={22} color="#10b981" /></div>
            <div className="stat-info">
              <div className="stat-value">{myPoints.rewards.length}</div>
              <div className="stat-label">Point Updates</div>
            </div>
          </div>
        </div>

        <div className="card">
          <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Award size={16} color="var(--primary)" /> Points History
          </div>
          {myPoints.rewards.length === 0 ? (
            <div className="empty-state" style={{ padding: '34px 12px' }}>
              <div className="empty-state-icon"><Star size={22} /></div>
              <h3>No points yet</h3>
              <p>Your reward points and deductions will appear here.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: 10 }}>
              {myPoints.rewards.map((reward) => (
                <div key={reward._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 14px', border: '1px solid var(--border-light)', borderRadius: 'var(--radius)', background: 'var(--bg)' }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{reward.reason}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 3 }}>
                      {reward.date} | Updated by {reward.awardedBy?.name}
                    </div>
                  </div>
                  <span className={badgeClassForPoints(reward.points)}>{formatPointValue(reward.points)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div>
        <div className="page-header">
          <h1>Reward Points</h1>
          <p>Only admin can manage student reward points and leaderboard access.</p>
        </div>

        <div className="card">
          <p style={{ margin: 0, color: 'var(--text-muted)' }}>
            Students can view their own reward points, and admin can manage all student reward points from this module.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <h1>Student Reward Points</h1>
        <p>See all student totals, monitor the leaderboard, and add positive or negative reward points.</p>
      </div>

      {msg.text && <div className={`alert alert-${msg.type}`}><CheckCircle size={15} /> {msg.text}</div>}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20 }}>
        <div className="panel">
          <div className="panel-title"><Star size={15} /> Update Reward Points</div>
          <form onSubmit={handleAward}>
            <div className="form-group">
              <label className="form-label">Student</label>
              <select
                className="form-input"
                value={form.studentId}
                onChange={(e) => handleSelectStudent(e.target.value)}
                required
              >
                <option value="">Select student</option>
                {students.map((student) => (
                  <option key={student._id} value={student._id}>
                    {student.name} - {student.department || 'No dept'}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="form-group">
                <label className="form-label">Points</label>
                <input
                  className="form-input"
                  type="number"
                  min="-100"
                  max="100"
                  value={form.points}
                  onChange={(e) => setForm((current) => ({ ...current, points: e.target.value }))}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Date</label>
                <input
                  className="form-input"
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm((current) => ({ ...current, date: e.target.value }))}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Reason</label>
              <input
                className="form-input"
                placeholder="e.g. Attendance reward or discipline penalty"
                value={form.reason}
                onChange={(e) => setForm((current) => ({ ...current, reason: e.target.value }))}
              />
            </div>

            <button className="btn btn-primary btn-full" type="submit" disabled={saving}>
              {saving ? 'Saving...' : <><Star size={14} /> Save Point Update</>}
            </button>
          </form>
        </div>

        <div>
          {studentDetail ? (
            <div className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{studentDetail.student?.name}</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{studentDetail.student?.department}</div>
                </div>
                <span className={badgeClassForPoints(studentDetail.total)} style={{ fontSize: '1rem', padding: '6px 14px' }}>
                  {studentDetail.total} pts
                </span>
              </div>

              <div style={{ display: 'grid', gap: 8 }}>
                {studentDetail.rewards.length === 0 ? (
                  <p style={{ fontSize: '0.845rem', color: 'var(--text-muted)' }}>No point updates yet.</p>
                ) : studentDetail.rewards.map((reward) => (
                  <div key={reward._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', border: '1px solid var(--border-light)', borderRadius: 'var(--radius)', background: 'var(--bg)' }}>
                    <div>
                      <div style={{ fontSize: '0.845rem', fontWeight: 500 }}>{reward.reason}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{reward.date} | by {reward.awardedBy?.name}</div>
                    </div>
                    <span className={badgeClassForPoints(reward.points)}>{formatPointValue(reward.points)}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="card">
              <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Users size={16} color="var(--primary)" /> Student Leaderboard
              </div>
              {allPoints.length === 0 ? (
                <div className="empty-state" style={{ padding: '30px 12px' }}>
                  <div className="empty-state-icon"><Star size={22} /></div>
                  <h3>No points awarded yet</h3>
                  <p>Select a student to start adding reward points.</p>
                </div>
              ) : (
                <div style={{ display: 'grid', gap: 8 }}>
                  {allPoints.map((student, index) => (
                    <div
                      key={student.studentId}
                      style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', border: '1px solid var(--border-light)', borderRadius: 'var(--radius)', background: 'var(--bg)', cursor: 'pointer' }}
                      onClick={() => handleSelectStudent(String(student.studentId))}
                    >
                      <div style={{ width: 26, height: 26, borderRadius: '50%', background: index < 3 ? '#fffbeb' : 'var(--border-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.78rem', color: index < 3 ? '#f59e0b' : 'var(--text-muted)', flexShrink: 0 }}>
                        {index + 1}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{student.name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{student.department || 'No dept'}</div>
                      </div>
                      <span className={badgeClassForPoints(student.total)}>{student.total} pts</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
