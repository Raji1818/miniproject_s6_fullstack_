import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard, BookOpen, Wrench,
  BarChart2, Users, GraduationCap, LogOut, Bell, X, ClipboardCheck, CalendarCheck
} from 'lucide-react';

const adminLinks = [
  { to: '/admin',               icon: LayoutDashboard, label: 'Overview'      },
  { to: '/admin/courses',       icon: BookOpen,        label: 'Courses'       },
  { to: '/admin/users',         icon: Users,           label: 'Users'         },
  { to: '/admin/progress',      icon: BarChart2,       label: 'Progress'      },
  { to: '/admin/slot-bookings', icon: CalendarCheck,   label: 'Test Slot Bookings' },
  { to: '/attendance',          icon: ClipboardCheck,  label: 'Attendance'    },
  { to: '/notifications',       icon: Bell,            label: 'Notifications' },
];

const facultyLinks = [
  { to: '/faculty',          icon: LayoutDashboard, label: 'Overview' },
  { to: '/faculty/students', icon: Users,           label: 'Students' },
  { to: '/faculty/progress', icon: BarChart2,       label: 'Progress' },
  { to: '/exams',             icon: CalendarDays,    label: 'Exams' },
  { to: '/attendance',       icon: ClipboardCheck,  label: 'Attendance' },
  { to: '/notifications',    icon: Bell,            label: 'Notifications' },
];

const studentLinks = [
  { to: '/dashboard',     icon: LayoutDashboard, label: 'Dashboard'   },
  { to: '/courses',       icon: BookOpen,        label: 'Courses'     },
  { to: '/skills',        icon: Wrench,          label: 'Skills'      },
  { to: '/attendance',    icon: ClipboardCheck,  label: 'Attendance'  },
  { to: '/notifications', icon: Bell,            label: 'Notifications' },
];

export default function Sidebar({ isOpen = false, onClose = () => {} }) {
  const { user, logout, unreadCount } = useAuth();
  const navigate = useNavigate();
  const links = user?.role === 'admin' ? adminLinks : user?.role === 'faculty' ? facultyLinks : studentLinks;

  const handleLogout = () => { logout(); onClose(); navigate('/login'); };
  const homePath = user?.role === 'admin' ? '/admin' : user?.role === 'faculty' ? '/faculty' : '/dashboard';
  const sectionLabel = user?.role === 'admin' ? 'Administration' : user?.role === 'faculty' ? 'Faculty Panel' : 'Navigation';

  return (
    <aside className={`sidebar${isOpen ? ' open' : ''}`}>
      <button className="sidebar-close-btn" onClick={onClose} aria-label="Close navigation">
        <X size={16} />
      </button>
      {/* Brand */}
      <NavLink to={homePath} className="sidebar-brand" onClick={onClose}>
        <div className="sidebar-brand-icon">
          <GraduationCap size={18} />
        </div>
        <span className="sidebar-brand-text">Student<span>Dev</span></span>
      </NavLink>

      {/* Nav */}
      <nav className="sidebar-nav">
        <div className="sidebar-section-label">{sectionLabel}</div>
        {links.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/admin' || to === '/faculty' || to === '/dashboard'}
            onClick={onClose}
            className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}
          >
            <Icon size={16} />
            {label}
            {to === '/notifications' && unreadCount > 0 && (
              <span style={{ marginLeft: 'auto', width: 8, height: 8, borderRadius: '50%', background: '#ef4444', flexShrink: 0 }} />
            )}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="sidebar-footer">
        <div className="sidebar-footer-email">
          <strong>{user?.email || ''}</strong>
          {user?.role ? <span> | {user.role}</span> : null}
        </div>
        <button className="btn btn-ghost btn-sm btn-full" onClick={handleLogout}>
          <LogOut size={14} /> Sign Out
        </button>
      </div>
    </aside>
  );
}
