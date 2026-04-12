import { useEffect, useState } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { Bell, Check, Megaphone, Send } from 'lucide-react';

export default function Notifications() {
  const { user } = useAuth();
  const canSendNotifications = user?.role === 'admin' || user?.role === 'faculty';
  const [notifications, setNotifications] = useState([]);
  const [form, setForm] = useState({ title: '', message: '' });
  const [msg, setMsg] = useState({ text: '', type: '' });

  const flash = (text, type = 'success') => {
    setMsg({ text, type });
    setTimeout(() => setMsg({ text: '', type: '' }), 3000);
  };

  const loadNotifications = async () => {
    try {
      const { data } = await api.get('/notifications');
      setNotifications(data);
    } catch {}
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/notifications', form);
      setForm({ title: '', message: '' });
      flash('Notification sent successfully.');
      loadNotifications();
    } catch (err) {
      flash(err.response?.data?.message || 'Unable to send notification.', 'error');
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1>Notifications</h1>
        <p>{canSendNotifications ? 'Send updates to all students and view recent announcements.' : 'View the latest announcements from admin and faculty.'}</p>
      </div>

      {msg.text && <div className={`alert alert-${msg.type}`}><Check size={15} /> {msg.text}</div>}

      {canSendNotifications && (
        <div className="panel">
          <div className="panel-title">
            <Megaphone size={15} /> Send Notification
          </div>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Title</label>
              <input
                className="form-input"
                placeholder="Notification title"
                value={form.title}
                onChange={e => setForm({ ...form, title: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Message</label>
              <textarea
                className="form-input"
                rows={4}
                placeholder="Write an announcement for students..."
                value={form.message}
                onChange={e => setForm({ ...form, message: e.target.value })}
                style={{ resize: 'vertical', minHeight: 120 }}
                required
              />
            </div>
            <button className="btn btn-primary" type="submit">
              <Send size={14} /> Send Notification
            </button>
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
            {notifications.map(notification => (
              <div key={notification._id} style={{ padding: 18, border: '1px solid var(--border-light)', borderRadius: 'var(--radius)', background: '#fff' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 8 }}>
                  <div>
                    <div style={{ fontSize: '0.95rem', fontWeight: 700 }}>{notification.title}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 4 }}>
                      {notification.createdByName} ({notification.createdByRole}) • {new Date(notification.createdAt).toLocaleString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        hour: 'numeric',
                        minute: '2-digit',
                      })}
                    </div>
                  </div>
                  <span className={`badge ${notification.createdByRole === 'admin' ? 'badge-blue' : 'badge-orange'}`}>
                    {notification.createdByRole}
                  </span>
                </div>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.7 }}>{notification.message}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
