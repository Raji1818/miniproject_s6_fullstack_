import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, ArrowRight, GraduationCap, BookOpen, BarChart2, FileText, ShieldCheck } from 'lucide-react';

export default function Login() {
  const [form,    setForm]    = useState({ email: '', password: '' });
  const [error,   setError]   = useState('');
  const [loading, setLoading] = useState(false);
  const { login }  = useAuth();
  const navigate   = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const user = await login(form.email, form.password);
      navigate(user.role === 'admin' ? '/admin' : user.role === 'faculty' ? '/faculty' : '/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password');
    } finally { setLoading(false); }
  };

  return (
    <div className="auth-page">
      {/* Left panel */}
      <div className="auth-left">
        <div className="auth-left-content">
          <div className="auth-left-logo">
            <GraduationCap size={32} color="#fff" />
          </div>
          <h1 style={{ fontSize: '2.4rem' }}>StudentDev Platform</h1>
          <p style={{ fontSize: '1.05rem' }}>A complete learning management system to track your courses, skills, and career growth.</p>
          <div className="auth-features">
            {[
              { icon: BookOpen,    text: 'Browse and enroll in courses' },
              { icon: BarChart2,   text: 'Track your learning progress'  },
              { icon: FileText,    text: 'Build a professional resume'   },
              { icon: ShieldCheck, text: 'Secure role-based access'      },
            ].map(({ icon: Icon, text }) => (
              <div className="auth-feature" key={text} style={{ fontSize: '1rem' }}>
                <div className="auth-feature-icon"><Icon size={17} /></div>
                {text}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="auth-right">
        <div className="auth-form-wrap">
          <h2 className="auth-form-title" style={{ fontSize: '1.9rem' }}>Welcome back</h2>
          <p className="auth-form-sub" style={{ fontSize: '1rem' }}>Sign in to your account to continue</p>

          {error && (
            <div className="alert alert-error">
              <Lock size={15} /> {error}
            </div>
          )}

          {/* Demo credentials */}
          <div className="demo-box">
            <div className="demo-box-title" style={{ fontSize: '0.85rem' }}>Demo Credentials</div>
            <div className="demo-row" style={{ fontSize: '0.9rem' }}>
              <div className="demo-role-icon" style={{ background: '#eff6ff' }}>
                <ShieldCheck size={13} color="#2563eb" />
              </div>
              Admin:&nbsp;
              <span className="demo-cred">admin@demo.com</span>
              <span className="demo-cred">admin123</span>
            </div>
            <div className="demo-row" style={{ fontSize: '0.9rem' }}>
              <div className="demo-role-icon" style={{ background: '#fff7ed' }}>
                <ShieldCheck size={13} color="#f59e0b" />
              </div>
              Faculty:&nbsp;
              <span className="demo-cred">faculty@demo.com</span>
              <span className="demo-cred">faculty123</span>
            </div>
            <div className="demo-row" style={{ fontSize: '0.9rem' }}>
              <div className="demo-role-icon" style={{ background: '#ecfdf5' }}>
                <GraduationCap size={13} color="#10b981" />
              </div>
              Student:&nbsp;
              <span className="demo-cred">student@demo.com</span>
              <span className="demo-cred">student123</span>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" style={{ fontSize: '0.9rem' }}>Email Address</label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)' }} />
                <input className="form-input" type="email" placeholder="you@example.com"
                  style={{ paddingLeft: 36, fontSize: '0.95rem', padding: '11px 13px 11px 36px' }}
                  value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label" style={{ fontSize: '0.9rem' }}>Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)' }} />
                <input className="form-input" type="password" placeholder="Enter your password"
                  style={{ paddingLeft: 36, fontSize: '0.95rem', padding: '11px 13px 11px 36px' }}
                  value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required />
              </div>
            </div>
            <button className="btn btn-primary btn-lg btn-full" type="submit" disabled={loading} style={{ marginTop: 4, fontSize: '1rem', padding: '13px' }}>
              {loading ? 'Signing in...' : <><span>Sign In</span><ArrowRight size={17} /></>}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: 24, fontSize: '0.95rem', color: 'var(--text-muted)' }}>
            Don't have an account?{' '}
            <Link to="/register" style={{ color: 'var(--primary)', fontWeight: 600, textDecoration: 'none' }}>
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
