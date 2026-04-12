import { useEffect, useState } from 'react';
import api from '../api/axios';
import { BookOpen, Clock, CheckCircle, Plus } from 'lucide-react';

export default function Courses() {
  const [courses,  setCourses]  = useState([]);
  const [enrolled, setEnrolled] = useState(new Set());
  const [msg,      setMsg]      = useState({ text: '', type: '' });

  useEffect(() => {
    const load = async () => {
      const [c, p] = await Promise.all([api.get('/courses'), api.get('/progress')]);
      setCourses(c.data);
      setEnrolled(new Set(p.data.map(x => x.courseId?._id || x.courseId)));
    };
    load();
  }, []);

  const handleEnroll = async (courseId) => {
    try {
      await api.post('/progress', { courseId, status: 'in_progress' });
      setEnrolled(prev => new Set([...prev, courseId]));
      setMsg({ text: 'Successfully enrolled in course.', type: 'success' });
    } catch (err) {
      setMsg({ text: err.response?.data?.message || 'Already enrolled.', type: 'error' });
    }
    setTimeout(() => setMsg({ text: '', type: '' }), 3000);
  };

  return (
    <div>
      <div className="page-header">
        <h1>Courses</h1>
        <p>Browse available courses and enroll to track your progress</p>
      </div>

      {msg.text && (
        <div className={`alert alert-${msg.type}`}>
          <CheckCircle size={15} /> {msg.text}
        </div>
      )}

      <div className="course-grid">
        {courses.map(c => {
          const isEnrolled = enrolled.has(c._id);
          return (
            <div key={c._id} className="course-card">
              <div className="course-card-icon">
                <BookOpen size={20} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <h3 className="course-title">{c.title}</h3>
                {isEnrolled && <span className="badge badge-green"><CheckCircle size={10} /> Enrolled</span>}
              </div>
              <p className="course-desc">{c.description}</p>
              <div className="course-meta">
                <Clock size={12} /> {c.duration}
              </div>
              <div className="course-actions">
                <button
                  className={`btn btn-sm ${isEnrolled ? 'btn-light' : 'btn-primary'}`}
                  onClick={() => !isEnrolled && handleEnroll(c._id)}
                  disabled={isEnrolled}
                >
                  {isEnrolled
                    ? <><CheckCircle size={13} /> Enrolled</>
                    : <><Plus size={13} /> Enroll Now</>
                  }
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {courses.length === 0 && (
        <div className="empty-state">
          <div className="empty-state-icon"><BookOpen size={24} /></div>
          <h3>No courses available</h3>
          <p>Check back later for new courses.</p>
        </div>
      )}
    </div>
  );
}
