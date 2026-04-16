import { useEffect, useState } from 'react';
import api from '../../api/axios';
import { BookOpen, Plus, Pencil, Trash2, Clock, X, Check } from 'lucide-react';

export default function AdminCourses() {
  const [courses, setCourses] = useState([]);
  const [form, setForm] = useState({ title: '', description: '', duration: '', videoLink: '' });
  const [editId, setEditId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [msg, setMsg] = useState({ text: '', type: '' });

  const fetchCourses = async () => {
    const { data } = await api.get('/courses');
    setCourses(data);
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const flash = (text, type = 'success') => {
    setMsg({ text, type });
    setTimeout(() => setMsg({ text: '', type: '' }), 3000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editId) {
        await api.put(`/courses/${editId}`, form);
        flash('Course updated successfully.');
      } else {
        await api.post('/courses', form);
        flash('Course created successfully.');
      }
      setForm({ title: '', description: '', duration: '', videoLink: '' });
      setEditId(null);
      setShowForm(false);
      fetchCourses();
    } catch (err) {
      flash(err.response?.data?.message || 'An error occurred.', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this course? This cannot be undone.')) return;
    await api.delete(`/courses/${id}`);
    flash('Course deleted.');
    fetchCourses();
  };

  const startEdit = (course) => {
    setEditId(course._id);
    setForm({
      title: course.title,
      description: course.description,
      duration: course.duration,
      videoLink: course.videoLink || '',
    });
    setShowForm(true);
  };

  const cancel = () => {
    setEditId(null);
    setForm({ title: '', description: '', duration: '', videoLink: '' });
    setShowForm(false);
  };

  return (
    <div>
      <div className="page-header-row">
        <div className="page-header" style={{ marginBottom: 0 }}>
          <h1>Courses</h1>
          <p>Create, edit and remove courses from the platform</p>
        </div>
        <button className="btn btn-primary" onClick={() => { cancel(); setShowForm(!showForm); }}>
          <Plus size={15} /> New Course
        </button>
      </div>

      {msg.text && <div className={`alert alert-${msg.type}`}><Check size={15} /> {msg.text}</div>}

      {showForm && (
        <div className="panel">
          <div className="panel-title">
            {editId ? <><Pencil size={15} /> Edit Course</> : <><Plus size={15} /> New Course</>}
          </div>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div className="form-group">
                <label className="form-label">Course Title</label>
                <input className="form-input" placeholder="e.g. React Fundamentals" value={form.title}
                  onChange={e => setForm({ ...form, title: e.target.value })} required />
              </div>
              <div className="form-group">
                <label className="form-label">Duration</label>
                <div style={{ position: 'relative' }}>
                  <Clock size={14} style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)' }} />
                  <input className="form-input" placeholder="e.g. 4 weeks" style={{ paddingLeft: 32 }} value={form.duration}
                    onChange={e => setForm({ ...form, duration: e.target.value })} required />
                </div>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Description</label>
              <input className="form-input" placeholder="Brief course description" value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })} required />
            </div>
            <div className="form-group">
              <label className="form-label">Video Link</label>
              <input
                className="form-input"
                type="url"
                placeholder="https://www.youtube.com/watch?v=..."
                value={form.videoLink}
                onChange={e => setForm({ ...form, videoLink: e.target.value })}
              />
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn btn-primary" type="submit"><Check size={14} /> {editId ? 'Update Course' : 'Create Course'}</button>
              <button className="btn btn-ghost" type="button" onClick={cancel}><X size={14} /> Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="table-wrap">
        <div className="table-header">
          <span className="table-title">All Courses ({courses.length})</span>
        </div>
        <table>
          <thead>
            <tr>
              <th>Course</th>
              <th>Description</th>
              <th>Duration</th>
              <th>Video</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {courses.map(course => (
              <tr key={course._id}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 32, height: 32, borderRadius: 8, background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <BookOpen size={15} color="#2563eb" />
                    </div>
                    <span style={{ fontWeight: 600 }}>{course.title}</span>
                  </div>
                </td>
                <td style={{ color: 'var(--text-muted)', maxWidth: 300 }}>{course.description}</td>
                <td><span className="badge badge-blue"><Clock size={10} /> {course.duration}</span></td>
                <td>
                  {course.videoLink ? (
                    <a href={course.videoLink} target="_blank" rel="noreferrer" className="btn btn-light btn-sm">
                      Open Video
                    </a>
                  ) : (
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Not added</span>
                  )}
                </td>
                <td>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button className="btn btn-light btn-sm" onClick={() => startEdit(course)}><Pencil size={12} /> Edit</button>
                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(course._id)}><Trash2 size={12} /> Delete</button>
                  </div>
                </td>
              </tr>
            ))}
            {courses.length === 0 && (
              <tr>
                <td colSpan={5}>
                  <div className="empty-state">
                    <div className="empty-state-icon"><BookOpen size={22} /></div>
                    <h3>No courses yet</h3>
                    <p>Click New Course to add the first one.</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
