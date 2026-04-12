import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <nav style={styles.nav}>
      <Link to="/dashboard" style={styles.brand}>🎓 StudentDev</Link>
      {user && (
        <div style={styles.links}>
          <Link to="/dashboard" style={styles.link}>Dashboard</Link>
          <Link to="/courses" style={styles.link}>Courses</Link>
          <Link to="/skills" style={styles.link}>Skills</Link>
          {user.role === 'admin' && <Link to="/admin" style={styles.link}>Admin</Link>}
          <span style={styles.user}>👤 {user.name}</span>
          <button onClick={handleLogout} style={styles.btn}>Logout</button>
        </div>
      )}
    </nav>
  );
}

const styles = {
  nav:   { display:'flex', justifyContent:'space-between', alignItems:'center', padding:'12px 24px', background:'#1a1a2e', color:'#fff' },
  brand: { color:'#e94560', fontWeight:'bold', fontSize:'1.2rem', textDecoration:'none' },
  links: { display:'flex', alignItems:'center', gap:'16px' },
  link:  { color:'#eee', textDecoration:'none', fontSize:'0.9rem' },
  user:  { color:'#aaa', fontSize:'0.85rem' },
  btn:   { background:'#e94560', color:'#fff', border:'none', padding:'6px 14px', borderRadius:'4px', cursor:'pointer' }
};
