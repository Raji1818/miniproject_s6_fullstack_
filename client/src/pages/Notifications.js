import { useEffect, useState } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { Bell, Check, Megaphone, Send, ShieldCheck, GraduationCap } from 'lucide-react';

export default function Notifications() {
  const { user, fetchUnread } = useAuth();
  const canSend = user?.role === 'admin' || user?.role === 'faculty';
  const [notifications, setNotifications] = useState([]);
  const [form, setForm] = useState({ title: '', message: '' });
  const [msg, setMsg] = useState({ text: '', type: '' });

  const flash = (text, type = 'success') => {
    setMsg({ text, type });
    setTimeout(() => setMsg({ text: '', type: '' }), 3000);
  };

  const loadAndMarkRead = async () => {
    try {
      const { data } = await api.get('/notifications');
      setNotifications(data);
      // mark all as read
      await api.put('/notifications/read-all/mark');
      fetchUnread();
    } catch {}
  };

  useEffect(() => { loadAndMarkRead(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/notifications', form);
      setForm({ title: '', message: '' });
      flash('Notification sent successfully.');
      loadAndMarkRead();
    } catch (err) {
      flash(err.response?.data?.message || 'Unable to send notification.', 'error');
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1>Notifications</h1>
        <p>{canSend ? 'Send updates to all students and view recent announcements.' : 'View the latest announcements from admin and faculty.'}</p>
      </div>

      {msg.text && <div className={`alert alert-${msg.type}`}><Check size={15} /> {msg.text}</div>}

      {canSend && (
        <div className="panel">
          <div className="panel-title"><Megaphone size={15} /> Send Notification</div>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Title</label>
              <input className="form-input" placeholder="Notification title"
                value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required />
            </div>
            <div className="form-group">
              <label className="form-label">Message</label>
              <textarea className="form-input" rows={4} placeholder="Write an announcement for students..."
                value={form.message} onChange={e => setForm({ ...form, message: e.target.value })}
                style={{ resize: 'vertical', minHeight: 120 }} required />
            </div>
            <button className="btn btn-primary" type="submit"><Send size={14} /> Send Notification</button>
          </form>
        </div>
      )}

      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 18 }}>
          <Bell size={16} color="var(--primary)" />
          <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>Recent Notifications</span>
        </div>

        {notifications.length === 0 ? (
          <div className="empty-state" style={{ padding: '32px 16px' }}>
            <div className="empty-state-icon"><Bell size={22} /></div>
            <h3>No notifications yet</h3>
            <p>Announcements from admin and faculty will appear here.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: 14 }}>
            {notifications.map(n => {
              const isAdmin = n.createdByRole === 'admin';
              const borderColor = isAdmin ? '#10b981' : '#ef4444';
              const bgColor = n.isRead
                ? '#fff'
                : isAdmin ? '#ecfdf5' : '#fef2f2';

              return (
                <div key={n._id} style={{
                  padding: 18,
                  border: `1.5px solid ${n.isRead ? 'var(--border-light)' : borderColor}`,
                  borderLeft: `4px solid ${borderColor}`,
                  borderRadius: 'var(--radius)',
                  background: bgColor,
                  position: 'relative',
                }}>
                  {!n.isRead && (
                    <span style={{
                      position: 'absolute', top: 14, right: 14,
                      width: 8, height: 8, borderRadius: '50%',
                      background: borderColor,
                    }} />
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 8 }}>
                    <div>
                      <div style={{ fontSize: '0.95rem', fontWeight: n.isRead ? 600 : 700 }}>{n.title}</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 4, display: 'flex', alignItems: 'center', gap: 5 }}>
                        {isAdmin
                          ? <ShieldCheck size={11} color="#10b981" />
                          : <GraduationCap size={11} color="#ef4444" />}
                        {n.createdByName} ({n.createdByRole}) •{' '}
                        {new Date(n.createdAt).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' })}
                      </div>
                    </div>
                    <span className={`badge ${isAdmin ? 'badge-green' : 'badge-red'}`}>
                      {n.createdByRole}
                    </span>
                  </div>
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.7, margin: 0 }}>{n.message}</p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
