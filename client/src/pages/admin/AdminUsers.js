import { useEffect, useState } from 'react';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { Users, Search, Trash2, ShieldCheck, GraduationCap, Check, Mail, Phone, School, Globe, Pencil, Plus, X, KeyRound } from 'lucide-react';

const DEPARTMENTS = ['CSE', 'ECE', 'EEE', 'MECH', 'BM'];
const YEAR_OPTIONS = Array.from({ length: 11 }, (_, index) => String(new Date().getFullYear() - 2 + index));

const emptyForm = {
  name: '',
  email: '',
  password: '',
  role: 'student',
  phone: '',
  college: '',
  degree: '',
  department: '',
  graduationYear: '',
  github: '',
  linkedin: '',
  website: '',
  bio: '',
};

export default function AdminUsers() {
  const { user: me } = useAuth();
  const isFaculty = me?.role === 'faculty';
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [msg, setMsg] = useState({ text: '', type: '' });
  const [selectedUser, setSelectedUser] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editForm, setEditForm] = useState(emptyForm);
  const [editingStudentId, setEditingStudentId] = useState(null);
  const [attendanceSummaries, setAttendanceSummaries] = useState([]);
  const [selectedAttendance, setSelectedAttendance] = useState(null);

  const userListEndpoint = isFaculty ? '/faculty/students' : '/admin/users';
  const studentUpdateEndpoint = isFaculty ? '/faculty/students' : '/admin/students';

  const syncUsers = (data, currentSelectedUser = selectedUser) => {
    setUsers(data);
    if (currentSelectedUser) {
      const nextSelected = data.find(u => u._id === currentSelectedUser._id) || null;
      setSelectedUser(nextSelected);
    }
  };

  const fetchUsers = async (currentSelectedUser = selectedUser) => {
    try {
      const [usersResponse, attendanceResponse] = await Promise.all([
        api.get(userListEndpoint),
        api.get('/attendance/students'),
      ]);
      const data = usersResponse.data;
      setAttendanceSummaries(attendanceResponse.data);
      syncUsers(data, currentSelectedUser);
    } catch (err) {
      flash(err.response?.data?.message || 'Unable to connect to the server. Please make sure the backend is running.', 'error');
    }
  };

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const [usersResponse, attendanceResponse] = await Promise.all([
          api.get(userListEndpoint),
          api.get('/attendance/students'),
        ]);
        const data = usersResponse.data;
        setUsers(data);
        setAttendanceSummaries(attendanceResponse.data);
      } catch (err) {
        flash(err.response?.data?.message || 'Unable to connect to the server. Please make sure the backend is running.', 'error');
      }
    };
    loadUsers();
  }, [userListEndpoint]);

  const flash = (text, type = 'success') => {
    setMsg({ text, type });
    setTimeout(() => setMsg({ text: '', type: '' }), 3000);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Permanently delete this user?')) return;
    await api.delete(`/admin/users/${id}`);
    flash('User deleted.');
    if (selectedUser?._id === id) setSelectedUser(null);
    fetchUsers(selectedUser?._id === id ? null : selectedUser);
  };

  const handleRoleChange = async (id, role) => {
    await api.put(`/admin/users/${id}/role`, { role });
    flash(`Role updated to ${role}.`);
    fetchUsers(selectedUser);
  };

  const resetCreateForm = () => {
    setForm(emptyForm);
    setShowCreateForm(false);
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.post('/admin/users', form);
      flash('User created successfully.');
      resetCreateForm();
      setSelectedUser(data);
      fetchUsers(data);
    } catch (err) {
      flash(err.response?.data?.message || 'Unable to create user.', 'error');
    }
  };

  const beginEditStudent = (user) => {
    setEditingStudentId(user._id);
    setEditForm({
      name: user.name || '',
      email: user.email || '',
      password: '',
      role: user.role || 'student',
      phone: user.phone || '',
      college: user.college || '',
      degree: user.degree || '',
      department: user.department || '',
      graduationYear: user.graduationYear || '',
      github: user.github || '',
      linkedin: user.linkedin || '',
      website: user.website || '',
      bio: user.bio || '',
    });
    setShowEditForm(true);
  };

  const loadSelectedAttendance = async (user) => {
    setSelectedUser(user);
    if (user.role !== 'student') {
      setSelectedAttendance(null);
      return;
    }

    try {
      const endpoint = isFaculty ? `/faculty/students/${user._id}/attendance` : `/admin/students/${user._id}/attendance`;
      const { data } = await api.get(endpoint);
      setSelectedAttendance(data);
    } catch {
      setSelectedAttendance(null);
    }
  };

  const resetEditForm = () => {
    setEditingStudentId(null);
    setEditForm(emptyForm);
    setShowEditForm(false);
  };

  const handleUpdateStudent = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...editForm };
      if (!payload.password) delete payload.password;
      const { data } = await api.put(`${studentUpdateEndpoint}/${editingStudentId}`, payload);
      flash('Student details updated.');
      setSelectedUser(data);
      resetEditForm();
      fetchUsers(data);
    } catch (err) {
      flash(err.response?.data?.message || 'Unable to update student.', 'error');
    }
  };

  const filtered = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase()) ||
    (u.college || '').toLowerCase().includes(search.toLowerCase()) ||
    (u.degree || '').toLowerCase().includes(search.toLowerCase()) ||
    (u.department || '').toLowerCase().includes(search.toLowerCase())
  );

  const renderDetail = (label, value, Icon) => (
    <div style={{ padding: '12px 14px', border: '1px solid var(--border-light)', borderRadius: 'var(--radius)', background: '#fff' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, color: 'var(--text-muted)', fontSize: '0.78rem', fontWeight: 600 }}>
        <Icon size={14} />
        {label}
      </div>
      <div style={{ fontSize: '0.88rem', color: 'var(--text)' }}>{value || 'Not provided'}</div>
    </div>
  );

  const attendanceMap = new Map(attendanceSummaries.map(item => [String(item.studentId), item]));

  return (
    <div>
      <div className="page-header-row">
        <div className="page-header" style={{ marginBottom: 0 }}>
          <h1>{isFaculty ? 'Students' : 'Users'}</h1>
          <p>{isFaculty ? 'Faculty can view and manage all student details.' : 'Admin has full access to view details, change roles, and manage all users.'}</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ position: 'relative' }}>
            <Search size={14} style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)' }} />
            <input className="form-input" placeholder="Search users..." value={search}
              onChange={e => setSearch(e.target.value)} style={{ paddingLeft: 32, width: 240 }} />
          </div>
          {!isFaculty && (
            <button className="btn btn-primary" onClick={() => setShowCreateForm(true)}>
              <Plus size={15} /> New User
            </button>
          )}
        </div>
      </div>

      {msg.text && <div className={`alert alert-${msg.type}`}><Check size={15} /> {msg.text}</div>}

      {showCreateForm && (
        <div className="panel" style={{ marginBottom: 22 }}>
          <div className="panel-title">
            <Plus size={15} /> Create User
          </div>
          <form onSubmit={handleCreateUser}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input className="form-input" placeholder="User full name" value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })} required />
              </div>
              <div className="form-group">
                <label className="form-label">Email</label>
                <div style={{ position: 'relative' }}>
                  <Mail size={14} style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)' }} />
                  <input className="form-input" type="email" placeholder="user@example.com" style={{ paddingLeft: 32 }}
                    value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Password</label>
                <div style={{ position: 'relative' }}>
                  <KeyRound size={14} style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)' }} />
                  <input className="form-input" type="password" placeholder="Create a password" style={{ paddingLeft: 32 }}
                    value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Role</label>
                <select className="form-input" value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>
                  <option value="student">Student</option>
                  <option value="faculty">Faculty</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Phone</label>
                <div style={{ position: 'relative' }}>
                  <Phone size={14} style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)' }} />
                  <input className="form-input" placeholder="Phone number" style={{ paddingLeft: 32 }}
                    value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">College</label>
                <input className="form-input" placeholder="College name"
                  value={form.college} onChange={e => setForm({ ...form, college: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Degree</label>
                <input className="form-input" placeholder="Degree or program"
                  value={form.degree} onChange={e => setForm({ ...form, degree: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Department</label>
                <select className="form-input" value={form.department} onChange={e => setForm({ ...form, department: e.target.value })}>
                  <option value="">Select department</option>
                  {DEPARTMENTS.map(department => (
                    <option key={department} value={department}>{department}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Graduation Year</label>
                <select className="form-input" value={form.graduationYear} onChange={e => setForm({ ...form, graduationYear: e.target.value })}>
                  <option value="">Select year</option>
                  {YEAR_OPTIONS.map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">GitHub</label>
                <input className="form-input" placeholder="GitHub profile URL"
                  value={form.github} onChange={e => setForm({ ...form, github: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">LinkedIn</label>
                <input className="form-input" placeholder="LinkedIn profile URL"
                  value={form.linkedin} onChange={e => setForm({ ...form, linkedin: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Website</label>
                <input className="form-input" placeholder="Personal website URL"
                  value={form.website} onChange={e => setForm({ ...form, website: e.target.value })} />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Bio</label>
              <textarea className="form-input" rows={4} placeholder="User profile details"
                value={form.bio} onChange={e => setForm({ ...form, bio: e.target.value })}
                style={{ resize: 'vertical', minHeight: 100 }} />
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn btn-primary" type="submit">
                <Check size={14} /> Create User
              </button>
              <button className="btn btn-ghost" type="button" onClick={resetCreateForm}>
                <X size={14} /> Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {showEditForm && (
        <div className="panel" style={{ marginBottom: 22 }}>
          <div className="panel-title">
            <Pencil size={15} /> Update Student
          </div>
          <form onSubmit={handleUpdateStudent}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input className="form-input" value={editForm.name} onChange={e => setEditForm({ ...editForm, name: e.target.value })} required />
              </div>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input className="form-input" type="email" value={editForm.email} onChange={e => setEditForm({ ...editForm, email: e.target.value })} required />
              </div>
              <div className="form-group">
                <label className="form-label">New Password</label>
                <input className="form-input" type="password" placeholder="Leave blank to keep current password"
                  value={editForm.password} onChange={e => setEditForm({ ...editForm, password: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Phone</label>
                <input className="form-input" value={editForm.phone} onChange={e => setEditForm({ ...editForm, phone: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">College</label>
                <input className="form-input" value={editForm.college} onChange={e => setEditForm({ ...editForm, college: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Degree</label>
                <input className="form-input" value={editForm.degree} onChange={e => setEditForm({ ...editForm, degree: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Department</label>
                <select className="form-input" value={editForm.department} onChange={e => setEditForm({ ...editForm, department: e.target.value })}>
                  <option value="">Select department</option>
                  {DEPARTMENTS.map(department => (
                    <option key={department} value={department}>{department}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Graduation Year</label>
                <select className="form-input" value={editForm.graduationYear} onChange={e => setEditForm({ ...editForm, graduationYear: e.target.value })}>
                  <option value="">Select year</option>
                  {YEAR_OPTIONS.map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Bio</label>
              <textarea className="form-input" rows={4} value={editForm.bio} onChange={e => setEditForm({ ...editForm, bio: e.target.value })} style={{ resize: 'vertical', minHeight: 100 }} />
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn btn-primary" type="submit"><Check size={14} /> Save Student</button>
              <button className="btn btn-ghost" type="button" onClick={resetEditForm}><X size={14} /> Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: selectedUser ? 'repeat(auto-fit, minmax(320px, 1fr))' : '1fr', gap: 20 }}>
        <div className="table-wrap">
          <div className="table-header">
            <span className="table-title">{isFaculty ? `All Students (${filtered.length})` : `All Users (${filtered.length})`}</span>
          </div>
          <table>
            <thead>
              <tr>
                <th>User</th>
                <th>Email</th>
                <th>{isFaculty ? 'Department' : 'Role'}</th>
                <th>Attendance</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(u => {
                const initials = u.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
                const isMe = u._id === me?.id;
                const isSelected = selectedUser?._id === u._id;
                const attendanceSummary = attendanceMap.get(String(u._id));
                return (
                  <tr key={u._id} style={isSelected ? { background: '#f8fafc' } : undefined}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div className="avatar" style={{ background: u.role === 'admin' ? '#8b5cf6' : '#2563eb', width: 34, height: 34 }}>{initials}</div>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{u.name}</div>
                          {isMe && <span className="badge badge-green" style={{ fontSize: '0.68rem' }}>You</span>}
                        </div>
                      </div>
                    </td>
                    <td style={{ color: 'var(--text-muted)' }}>{u.email}</td>
                    <td>
                      {isFaculty ? (
                        <span className="badge badge-blue">{u.department || 'Not set'}</span>
                      ) : (
                        <select
                          value={u.role}
                          onChange={e => handleRoleChange(u._id, e.target.value)}
                          disabled={isMe}
                          style={{
                            padding: '5px 10px', borderRadius: 'var(--radius)',
                            border: '1.5px solid var(--border)',
                            background: '#fff', color: 'var(--text)',
                            fontSize: '0.82rem', fontWeight: 500,
                            cursor: isMe ? 'not-allowed' : 'pointer',
                            opacity: isMe ? 0.5 : 1,
                            fontFamily: 'inherit',
                          }}
                        >
                          <option value="student">Student</option>
                          <option value="faculty">Faculty</option>
                          <option value="admin">Admin</option>
                        </select>
                      )}
                    </td>
                    <td>
                      {u.role === 'student'
                        ? <span className={`badge ${attendanceSummary?.total > 0 && attendanceSummary.percentage < 75 ? 'badge-red' : 'badge-green'}`}>
                            {attendanceSummary?.total ? `${attendanceSummary.percentage}%` : 'No data'}
                          </span>
                        : <span className="badge badge-gray">N/A</span>
                      }
                    </td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                      {new Date(u.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button className="btn btn-light btn-sm" onClick={() => setSelectedUser(u)}>
                          <Pencil size={12} /> View
                        </button>
                        {u.role === 'student' && (
                          <button className="btn btn-ghost btn-sm" onClick={() => loadSelectedAttendance(u)}>
                            <Check size={12} /> Attendance
                          </button>
                        )}
                        {u.role === 'student' && (
                          <button className="btn btn-success btn-sm" onClick={() => beginEditStudent(u)}>
                            <Pencil size={12} /> Edit
                          </button>
                        )}
                        {!isFaculty && (
                          <button className="btn btn-danger btn-sm" onClick={() => handleDelete(u._id)} disabled={isMe}>
                            <Trash2 size={12} /> Delete
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5}>
                    <div className="empty-state">
                      <div className="empty-state-icon"><Users size={22} /></div>
                      <h3>No users found</h3>
                      <p>Try adjusting your search.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {selectedUser && (
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 18 }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1rem' }}>{selectedUser.name}</h3>
                <p style={{ margin: '6px 0 0', color: 'var(--text-muted)', fontSize: '0.84rem' }}>
                  {isFaculty ? 'Faculty can view and manage student details.' : 'Full user details visible to admin'}
                </p>
              </div>
              <span className={`badge ${selectedUser.role === 'admin' ? 'badge-blue' : selectedUser.role === 'faculty' ? 'badge-orange' : 'badge-green'}`}>
                {selectedUser.role === 'admin' || selectedUser.role === 'faculty' ? <ShieldCheck size={10} /> : <GraduationCap size={10} />}
                {selectedUser.role}
              </span>
            </div>

            <div style={{ display: 'grid', gap: 12 }}>
              {renderDetail('Email Address', selectedUser.email, Mail)}
              {renderDetail('Phone Number', selectedUser.phone, Phone)}
              {renderDetail('College', selectedUser.college, School)}
              {renderDetail('Degree', selectedUser.degree, GraduationCap)}
                  {renderDetail('Department', selectedUser.department, School)}
                  {renderDetail('Graduation Year', selectedUser.graduationYear, GraduationCap)}
                  {selectedUser.role === 'student' && renderDetail('Attendance', selectedAttendance?.summary?.total ? `${selectedAttendance.summary.percentage}% (${selectedAttendance.summary.total} records)` : 'No attendance records yet', Check)}
                  {renderDetail('GitHub / LinkedIn / Website', [selectedUser.github, selectedUser.linkedin, selectedUser.website].filter(Boolean).join(' | '), Globe)}
                  {renderDetail('Bio', selectedUser.bio, Users)}
                </div>
          </div>
        )}
      </div>
    </div>
  );
}
