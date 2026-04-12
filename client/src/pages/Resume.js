import { useEffect, useState } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { FileText, Printer, Mail, Phone, MapPin, CheckCircle } from 'lucide-react';

const LEVEL_COLOR = { Beginner: '#2563eb', Intermediate: '#f59e0b', Advanced: '#10b981' };

export default function Resume() {
  const { user } = useAuth();
  const [skills,   setSkills]   = useState([]);
  const [progress, setProgress] = useState([]);
  const [extra, setExtra] = useState({ objective: '', education: '', experience: '', phone: '', location: '' });

  useEffect(() => {
    Promise.all([api.get('/skills'), api.get('/progress')]).then(([s, p]) => {
      setSkills(s.data);
      setProgress(p.data.filter(x => x.status === 'completed'));
    });
  }, []);

  return (
    <div>
      <div className="page-header-row">
        <div className="page-header" style={{ marginBottom: 0 }}>
          <h1>Resume Builder</h1>
          <p>Auto-populated from your skills and completed courses</p>
        </div>
        <button className="btn btn-primary no-print" onClick={() => window.print()}>
          <Printer size={15} /> Print / Save PDF
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: 24 }}>
        {/* Editor */}
        <div className="card no-print" style={{ height: 'fit-content' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
            <FileText size={16} color="var(--primary)" />
            <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>Customize</span>
          </div>
          {[
            { key: 'phone',      label: 'Phone',           placeholder: '+1 (555) 000-0000',         icon: Phone    },
            { key: 'location',   label: 'Location',        placeholder: 'City, Country',              icon: MapPin   },
            { key: 'objective',  label: 'Career Objective',placeholder: 'Brief summary of your goals...', multi: true },
            { key: 'education',  label: 'Education',       placeholder: 'B.Tech CSE, XYZ University, 2024', multi: true },
            { key: 'experience', label: 'Work Experience', placeholder: 'Company · Role · Duration',  multi: true },
          ].map(f => (
            <div className="form-group" key={f.key}>
              <label className="form-label">{f.label}</label>
              {f.multi
                ? <textarea className="form-input" placeholder={f.placeholder} value={extra[f.key]}
                    onChange={e => setExtra({ ...extra, [f.key]: e.target.value })} />
                : <div style={{ position: 'relative' }}>
                    {f.icon && <f.icon size={14} style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)' }} />}
                    <input className="form-input" placeholder={f.placeholder} value={extra[f.key]}
                      style={{ paddingLeft: f.icon ? 32 : 13 }}
                      onChange={e => setExtra({ ...extra, [f.key]: e.target.value })} />
                  </div>
              }
            </div>
          ))}
        </div>

        {/* Preview */}
        <div style={{ background: '#fff', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)', overflow: 'hidden' }}>
          {/* Resume header */}
          <div style={{ background: 'linear-gradient(135deg, #1e3a8a, #2563eb)', padding: '36px 40px', color: '#fff' }}>
            <h1 style={{ fontSize: '1.8rem', fontWeight: 800, letterSpacing: '-0.02em' }}>{user?.name}</h1>
            <div style={{ display: 'flex', gap: 20, marginTop: 10, flexWrap: 'wrap', fontSize: '0.845rem', opacity: 0.85 }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><Mail size={13} /> {user?.email}</span>
              {extra.phone    && <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><Phone size={13} /> {extra.phone}</span>}
              {extra.location && <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><MapPin size={13} /> {extra.location}</span>}
            </div>
          </div>

          <div style={{ padding: '36px 40px' }}>
            {extra.objective  && <ResumeSection title="Career Objective"><p style={{ color: '#4b5563', lineHeight: 1.7, fontSize: '0.9rem' }}>{extra.objective}</p></ResumeSection>}
            {extra.education  && <ResumeSection title="Education"><p style={{ color: '#4b5563', lineHeight: 1.7, whiteSpace: 'pre-line', fontSize: '0.9rem' }}>{extra.education}</p></ResumeSection>}
            {extra.experience && <ResumeSection title="Work Experience"><p style={{ color: '#4b5563', lineHeight: 1.7, whiteSpace: 'pre-line', fontSize: '0.9rem' }}>{extra.experience}</p></ResumeSection>}

            {skills.length > 0 && (
              <ResumeSection title="Technical Skills">
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {skills.map(s => (
                    <span key={s._id} style={{
                      padding: '4px 12px', borderRadius: 20, fontSize: '0.8rem', fontWeight: 600,
                      background: `${LEVEL_COLOR[s.level]}12`,
                      color: LEVEL_COLOR[s.level],
                      border: `1px solid ${LEVEL_COLOR[s.level]}30`
                    }}>
                      {s.skillName} · {s.level}
                    </span>
                  ))}
                </div>
              </ResumeSection>
            )}

            {progress.length > 0 && (
              <ResumeSection title="Completed Courses">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  {progress.map(p => (
                    <div key={p._id} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.875rem', color: '#4b5563' }}>
                      <CheckCircle size={14} color="#10b981" /> {p.courseId?.title}
                    </div>
                  ))}
                </div>
              </ResumeSection>
            )}

            {!extra.objective && skills.length === 0 && progress.length === 0 && (
              <div className="empty-state">
                <div className="empty-state-icon"><FileText size={24} /></div>
                <h3>Resume is empty</h3>
                <p>Add skills, complete courses, and fill in the form to build your resume.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function ResumeSection({ title, children }) {
  return (
    <div style={{ marginBottom: 28 }}>
      <h3 style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#2563eb', marginBottom: 12, paddingBottom: 8, borderBottom: '2px solid #eff6ff' }}>
        {title}
      </h3>
      {children}
    </div>
  );
}
