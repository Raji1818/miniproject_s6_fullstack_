import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Lock, ArrowRight, GraduationCap, ShieldCheck } from 'lucide-react';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'student' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await register(form.name, form.email, form.password, form.role);
      navigate(user.role === 'admin' ? '/admin' : user.role === 'faculty' ? '/faculty' : '/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-left">
        <div className="auth-left-content">
          <div className="auth-left-logo">
            <GraduationCap size={32} color="#fff" />
          </div>
          <h1>Join StudentDev</h1>
          <p>Create your account and start your learning journey today. Track progress, build skills, and grow your career.</p>
        </div>
      </div>

      <div className="auth-right">
        <div className="auth-form-wrap">
          <h2 className="auth-form-title">Create account</h2>
          <p className="auth-form-sub">Fill in your details to get started</p>

          {error && <div className="alert alert-error"><Lock size={15} /> {error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <div style={{ position: 'relative' }}>
                <User size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)' }} />
                <input className="form-input" placeholder="John Doe" style={{ paddingLeft: 36 }}
                  value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <div style={{ position: 'relative' }}>
                <Mail size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)' }} />
                <input className="form-input" type="email" placeholder="you@example.com" style={{ paddingLeft: 36 }}
                  value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)' }} />
                <input className="form-input" type="password" placeholder="Min 6 characters" style={{ paddingLeft: 36 }}
                  value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Account Type</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {[
                  { value: 'student', label: 'Student', Icon: GraduationCap, color: '#10b981' },
                  { value: 'admin', label: 'Administrator', Icon: ShieldCheck, color: '#2563eb' },
                ].map(({ value, label, Icon, color }) => (
                  <label key={value} style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '10px 14px', borderRadius: 'var(--radius)',
                    border: `1.5px solid ${form.role === value ? color : 'var(--border)'}`,
                    background: form.role === value ? `${color}10` : '#fff',
                    cursor: 'pointer', transition: 'all 0.15s'
                  }}>
                    <input type="radio" name="role" value={value} checked={form.role === value}
                      onChange={() => setForm({ ...form, role: value })} style={{ display: 'none' }} />
                    <Icon size={16} color={form.role === value ? color : 'var(--text-muted)'} />
                    <span style={{ fontSize: '0.845rem', fontWeight: 600, color: form.role === value ? color : 'var(--text-muted)' }}>{label}</span>
                  </label>
                ))}
              </div>
            </div>
            <button className="btn btn-primary btn-lg btn-full" type="submit" disabled={loading} style={{ marginTop: 4 }}>
              {loading ? 'Creating account...' : <><span>Create Account</span><ArrowRight size={16} /></>}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: 24, fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 600, textDecoration: 'none' }}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
