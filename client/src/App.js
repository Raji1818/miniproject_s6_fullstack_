import { useEffect, useRef, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import { Menu, UserCircle } from 'lucide-react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Sidebar from './components/Sidebar';
import Login    from './pages/Login';
import Register from './pages/Register';
import Dashboard      from './pages/Dashboard';
import Courses        from './pages/Courses';
import Skills         from './pages/Skills';
import Resume         from './pages/Resume';
import Profile        from './pages/Profile';
import AdminOverview  from './pages/admin/AdminOverview';
import AdminCourses   from './pages/admin/AdminCourses';
import AdminUsers     from './pages/admin/AdminUsers';
import AdminProgress  from './pages/admin/AdminProgress';
import Notifications  from './pages/Notifications';
import Attendance     from './pages/Attendance';
import './index.css';

function ReloadAnimation() {
  return (
    <div className="reload-screen" role="status" aria-live="polite">
      <div className="reload-card">
        <div className="reload-mark">
          <div className="reload-ring" />
          <div className="reload-core">SD</div>
        </div>
        <h1>Reloading StudentDev</h1>
        <p>Preparing your dashboard and syncing the latest data.</p>
        <div className="reload-bar">
          <span className="reload-bar-fill" />
        </div>
      </div>
    </div>
  );
}

const PrivateRoute = ({ children }) => {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" replace />;
};

const AdminRoute = ({ children }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return user.role === 'admin' ? children : <Navigate to="/dashboard" replace />;
};

const FacultyRoute = ({ children }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return user.role === 'faculty' ? children : <Navigate to="/dashboard" replace />;
};

function AppShell() {
  const { user } = useAuth();
  const [showReloadAnimation, setShowReloadAnimation] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef(null);

  useEffect(() => {
    const timer = window.setTimeout(() => setShowReloadAnimation(false), 900);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    setSidebarOpen(false);
  }, [user?.role]);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setProfileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  if (showReloadAnimation) {
    return <ReloadAnimation />;
  }

  if (!user) {
    return (
      <Routes>
        <Route path="/login"    element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="*"         element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  return (
    <div className="app-shell">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <button className="mobile-menu-btn" onClick={() => setSidebarOpen(true)} aria-label="Open navigation">
        <Menu size={18} />
      </button>
      {sidebarOpen && <button className="sidebar-overlay" onClick={() => setSidebarOpen(false)} aria-label="Close navigation" />}
      <main className="main-content">
        <div className="app-topbar">
          <div className="profile-menu" ref={profileMenuRef}>
            <button
              className="profile-trigger"
              onClick={() => setProfileMenuOpen((open) => !open)}
              aria-label="Open profile menu"
              aria-expanded={profileMenuOpen}
            >
              <span className="profile-avatar" aria-hidden="true">
                {user?.name?.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2) || <UserCircle size={16} />}
              </span>
            </button>
            {profileMenuOpen && (
              <div className="profile-dropdown">
                <Link to="/profile" className="profile-dropdown-link" onClick={() => setProfileMenuOpen(false)}>
                  View Profile
                </Link>
              </div>
            )}
          </div>
        </div>
        <Routes>
          {/* Student routes */}
          <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/courses"   element={<PrivateRoute><Courses /></PrivateRoute>} />
          <Route path="/skills"    element={<PrivateRoute><Skills /></PrivateRoute>} />
          <Route path="/resume"    element={<PrivateRoute><Resume /></PrivateRoute>} />
          <Route path="/profile"   element={<PrivateRoute><Profile /></PrivateRoute>} />
          <Route path="/attendance" element={<PrivateRoute><Attendance /></PrivateRoute>} />
          <Route path="/notifications" element={<PrivateRoute><Notifications /></PrivateRoute>} />

          {/* Admin routes */}
          <Route path="/admin"          element={<AdminRoute><AdminOverview /></AdminRoute>} />
          <Route path="/admin/courses"  element={<AdminRoute><AdminCourses /></AdminRoute>} />
          <Route path="/admin/users"    element={<AdminRoute><AdminUsers /></AdminRoute>} />
          <Route path="/admin/progress" element={<AdminRoute><AdminProgress /></AdminRoute>} />

          {/* Faculty routes */}
          <Route path="/faculty"          element={<FacultyRoute><AdminOverview /></FacultyRoute>} />
          <Route path="/faculty/students" element={<FacultyRoute><AdminUsers /></FacultyRoute>} />
          <Route path="/faculty/progress" element={<FacultyRoute><AdminProgress /></FacultyRoute>} />

          {/* Default redirect based on role */}
          <Route
            path="*"
            element={<Navigate to={user.role === 'admin' ? '/admin' : user.role === 'faculty' ? '/faculty' : '/dashboard'} replace />}
          />
         </Routes>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <AppShell />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
// update timestamp: 12 April
