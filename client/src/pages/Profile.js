import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import {
  User, Mail, Phone, BookOpen, Wrench,
  CheckCircle, Github, Linkedin, Globe, GraduationCap,
  Pencil, Save, X, Lock, Eye, EyeOff, TrendingUp,
  Calendar, Award, Star, Clock
} from 'lucide-react';

const DEPARTMENTS = ['CSE', 'ECE', 'EEE', 'MECH', 'BM'];
const YEAR_OPTIONS = Array.from({ length: 11 }, (_, index) => String(new Date().getFullYear() - 2 + index));

export default function Profile() {
  const { updateUser, user } = useAuth();
  const isStudent = user?.role === 'student';
  const showStudentStats = isStudent;

  const [profile,   setProfile]   = useState(null);
  const [stats,     setStats]     = useState({ courses: 0, skills: 0, completed: 0, inProgress: 0 });
  const [progress,  setProgress]  = useState([]);
  const [skills,    setSkills]    = useState([]);
  const [editing,   setEditing]   = useState(false);
  const [tab,       setTab]       = useState('info');   // info | activity | security
  const [msg,       setMsg]       = useState({ text: '', type: '' });
  const [saving,    setSaving]    = useState(false);
  const [showPwd,   setShowPwd]   = useState({ cur: false, nw: false });

  const [form, setForm] = useState({});
  const [pwdForm, setPwdForm] = useState({ currentPassword: '', newPassword: '', confirm: '' });

  const flash = (text, type = 'success') => {
    setMsg({ text, type });
    setTimeout(() => setMsg({ text: '', type: '' }), 3500);
  };

  useEffect(() => {
    const load = async () => {
      try {
        const [p, c, s, pr] = await Promise.all([
          api.get('/profile'),
          api.get('/courses'),
          api.get('/skills'),
          api.get('/progress'),
        ]);
        setProfile(p.data);
        setForm({
          name: p.data.name || '', phone: p.data.phone || '',
          bio: p.data.bio || '', github: p.data.github || '',
          linkedin: p.data.linkedin || '', website: p.data.website || '',
          college: p.data.college || '', degree: p.data.degree || '',
          department: p.data.department || '',
          graduationYear: p.data.graduationYear || '',
        });
        setSkills(s.data);
        setProgress(pr.data);
        setStats({
          courses:    c.data.length,
          skills:     s.data.length,
          completed:  pr.data.filter(x => x.status === 'completed').length,
          inProgress: pr.data.filter(x => x.status === 'in_progress').length,
        });
      } catch {}
    };
    load();
  }, []);

  const handleSave = async () => {
    if (isStudent) {
      flash('Students are not allowed to edit profile.', 'error');
      return;
    }
    setSaving(true);
    try {
      const { data } = await api.put('/profile', form);
      setProfile(data);
      updateUser({ name: data.name });
      setEditing(false);
      flash('Profile updated successfully.');
    } catch (err) {
      flash(err.response?.data?.message || 'Failed to save.', 'error');
    }
    setSaving(false);
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (isStudent) {
      flash('Students are not allowed to edit profile.', 'error');
      return;
    }
    if (pwdForm.newPassword !== pwdForm.confirm)
      return flash('New passwords do not match.', 'error');
    if (pwdForm.newPassword.length < 6)
      return flash('Password must be at least 6 characters.', 'error');
    setSaving(true);
    try {
      await api.put('/profile', {
        currentPassword: pwdForm.currentPassword,
        newPassword:     pwdForm.newPassword,
      });
      setPwdForm({ currentPassword: '', newPassword: '', confirm: '' });
      flash('Password changed successfully.');
    } catch (err) {
      flash(err.response?.data?.message || 'Failed to change password.', 'error');
    }
    setSaving(false);
  };

  const initials = profile?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U';
  const joinDate  = profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : '';
  const completionPct = stats.courses > 0 ? Math.round((stats.completed / stats.courses) * 100) : 0;

  const LEVEL_COLOR = { Beginner: '#2563eb', Intermediate: '#f59e0b', Advanced: '#10b981' };
  const LEVEL_PCT   = { Beginner: 33, Intermediate: 66, Advanced: 100 };

  const statusBadge = {
    completed:   <span className="badge badge-green"><CheckCircle size={10} /> Completed</span>,
    in_progress: <span className="badge badge-blue"><Clock size={10} /> In Progress</span>,
    not_started: <span className="badge badge-gray">Not Started</span>,
  };

  if (!profile) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', color: 'var(--text-muted)' }}>
      Loading profile...
    </div>
  );

  return (
    <div>
      {/* ── Hero Banner ── */}
      <div style={{
        background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 60%, #0ea5e9 100%)',
        borderRadius: 'var(--radius-xl)', padding: '36px 40px', marginBottom: 24,
        position: 'relative', overflow: 'hidden',
      }}>
        {/* decorative circles */}
        <div style={{ position:'absolute', top:-40, right:-40, width:200, height:200, borderRadius:'50%', background:'rgba(255,255,255,0.05)' }} />
        <div style={{ position:'absolute', bottom:-60, right:80, width:160, height:160, borderRadius:'50%', background:'rgba(255,255,255,0.04)' }} />

        <div style={{ display:'flex', alignItems:'flex-end', gap:24, position:'relative', zIndex:1 }}>
          {/* Avatar */}
          <div style={{
            width:88, height:88, borderRadius:'50%',
            background:'rgba(255,255,255,0.2)',
            border:'3px solid rgba(255,255,255,0.4)',
            display:'flex', alignItems:'center', justifyContent:'center',
            fontSize:'2rem', fontWeight:800, color:'#fff',
            flexShrink:0, backdropFilter:'blur(8px)',
          }}>
            {initials}
          </div>

          <div style={{ flex:1 }}>
            <h1 style={{ color:'#fff', fontSize:'1.6rem', fontWeight:800, letterSpacing:'-0.02em', marginBottom:4 }}>
              {profile.name}
            </h1>
            <div style={{ display:'flex', flexWrap:'wrap', gap:16, color:'rgba(255,255,255,0.75)', fontSize:'0.845rem' }}>
              <span style={{ display:'flex', alignItems:'center', gap:5 }}><Mail size={13}/> {profile.email}</span>
              {profile.college && <span style={{ display:'flex', alignItems:'center', gap:5 }}><GraduationCap size={13}/> {profile.college}</span>}
              {profile.phone   && <span style={{ display:'flex', alignItems:'center', gap:5 }}><Phone size={13}/> {profile.phone}</span>}
              <span style={{ display:'flex', alignItems:'center', gap:5 }}><Calendar size={13}/> Joined {joinDate}</span>
            </div>
            {profile.bio && <p style={{ color:'rgba(255,255,255,0.7)', fontSize:'0.875rem', marginTop:8, maxWidth:600 }}>{profile.bio}</p>}
          </div>

          {!isStudent && (
            <button
              className="btn btn-ghost"
              style={{ background:'rgba(255,255,255,0.15)', color:'#fff', border:'1px solid rgba(255,255,255,0.3)', backdropFilter:'blur(8px)' }}
              onClick={() => { setEditing(!editing); setTab('info'); }}
            >
              {editing ? <><X size={14}/> Cancel</> : <><Pencil size={14}/> Edit Profile</>}
            </button>
          )}
        </div>

        {showStudentStats && (
          <div style={{ display:'flex', gap:32, marginTop:28, paddingTop:24, borderTop:'1px solid rgba(255,255,255,0.15)', position:'relative', zIndex:1 }}>
            {[
              { icon: BookOpen,    label:'Courses',    value: stats.courses    },
              { icon: Wrench,      label:'Skills',     value: stats.skills     },
              { icon: CheckCircle, label:'Completed',  value: stats.completed  },
              { icon: TrendingUp,  label:'In Progress',value: stats.inProgress },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} style={{ textAlign:'center' }}>
                <div style={{ color:'#fff', fontSize:'1.4rem', fontWeight:800 }}>{value}</div>
                <div style={{ color:'rgba(255,255,255,0.6)', fontSize:'0.75rem', display:'flex', alignItems:'center', gap:4, justifyContent:'center', marginTop:2 }}>
                  <Icon size={11}/> {label}
                </div>
              </div>
            ))}
            <div style={{ marginLeft:'auto', textAlign:'right' }}>
              <div style={{ color:'#fff', fontSize:'1.4rem', fontWeight:800 }}>{completionPct}%</div>
              <div style={{ color:'rgba(255,255,255,0.6)', fontSize:'0.75rem', marginTop:2 }}>Completion Rate</div>
              <div style={{ width:120, height:5, background:'rgba(255,255,255,0.2)', borderRadius:99, marginTop:6 }}>
                <div style={{ width:`${completionPct}%`, height:'100%', background:'#34d399', borderRadius:99, transition:'width 0.6s ease' }}/>
              </div>
            </div>
          </div>
        )}
      </div>

      {msg.text && (
        <div className={`alert alert-${msg.type}`} style={{ marginBottom:20 }}>
          {msg.type === 'success' ? <CheckCircle size={15}/> : <X size={15}/>} {msg.text}
        </div>
      )}

      {/* ── Tabs ── */}
      <div style={{ display:'flex', gap:4, marginBottom:22, background:'var(--card)', border:'1px solid var(--border)', borderRadius:'var(--radius-lg)', padding:5, width:'fit-content', boxShadow:'var(--shadow-sm)' }}>
        {[
          { key:'info',     label:'Personal Info', icon: User      },
          { key:'activity', label:'Activity',      icon: TrendingUp },
          ...(!isStudent ? [{ key:'security', label:'Security', icon: Lock }] : []),
        ].map(({ key, label, icon: Icon }) => (
          <button key={key} onClick={() => setTab(key)} style={{
            display:'flex', alignItems:'center', gap:7,
            padding:'8px 18px', borderRadius:'var(--radius)',
            border:'none', cursor:'pointer', fontFamily:'inherit',
            fontSize:'0.845rem', fontWeight:600,
            background: tab === key ? 'var(--primary)' : 'transparent',
            color:       tab === key ? '#fff' : 'var(--text-muted)',
            transition:'all 0.18s ease',
          }}>
            <Icon size={14}/> {label}
          </button>
        ))}
      </div>

      {/* ── TAB: Personal Info ── */}
      {tab === 'info' && (
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20 }}>
          {/* Left col */}
          <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
            {/* Basic Info */}
            <div className="card">
              <SectionTitle icon={User} title="Basic Information" />
              {editing ? (
                <div>
                  <Field label="Full Name">
                    <input className="form-input" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
                  </Field>
                  <Field label="Phone Number">
                    <div style={{ position:'relative' }}>
                      <Phone size={14} style={iconStyle} />
                      <input className="form-input" style={{ paddingLeft:32 }} placeholder="+1 (555) 000-0000" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} />
                    </div>
                  </Field>
                  <Field label="Bio" last>
                    <textarea className="form-input" placeholder="Tell us about yourself..." value={form.bio} onChange={e => setForm({...form, bio: e.target.value})} style={{ minHeight:80 }} />
                  </Field>
                </div>
              ) : (
                <div>
                  <InfoRow icon={User}  label="Full Name" value={profile.name} />
                  <InfoRow icon={Mail}  label="Email"     value={profile.email} />
                  <InfoRow icon={Phone} label="Phone"     value={profile.phone || '—'} last />
                  {profile.bio && <p style={{ marginTop:14, fontSize:'0.875rem', color:'var(--text-muted)', lineHeight:1.7, paddingTop:14, borderTop:'1px solid var(--border-light)' }}>{profile.bio}</p>}
                </div>
              )}
            </div>

            {/* Education */}
            <div className="card">
              <SectionTitle icon={GraduationCap} title="Education" />
              {editing ? (
                <div>
                  <Field label="College / University">
                    <input className="form-input" placeholder="e.g. MIT, Stanford" value={form.college} onChange={e => setForm({...form, college: e.target.value})} />
                  </Field>
                  <Field label="Degree">
                    <input className="form-input" placeholder="e.g. B.Tech Computer Science" value={form.degree} onChange={e => setForm({...form, degree: e.target.value})} />
                  </Field>
                  <Field label="Department">
                    <select className="form-input" value={form.department} onChange={e => setForm({...form, department: e.target.value})}>
                      <option value="">Select department</option>
                      {DEPARTMENTS.map(department => (
                        <option key={department} value={department}>{department}</option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Graduation Year" last>
                    <select className="form-input" value={form.graduationYear} onChange={e => setForm({...form, graduationYear: e.target.value})}>
                      <option value="">Select year</option>
                      {YEAR_OPTIONS.map(year => (
                        <option key={year} value={year}>{year}</option>
                      ))}
                    </select>
                  </Field>
                </div>
              ) : (
                <div>
                  <InfoRow icon={GraduationCap} label="College"         value={profile.college        || '—'} />
                  <InfoRow icon={Award}         label="Degree"          value={profile.degree         || '—'} />
                  <InfoRow icon={Calendar}      label="Graduation Year" value={profile.graduationYear || '—'} last />
                </div>
              )}
            </div>
          </div>

          {/* Right col */}
          <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
            {/* Social Links */}
            <div className="card">
              <SectionTitle icon={Globe} title="Social & Links" />
              {editing ? (
                <div>
                  <Field label="GitHub">
                    <div style={{ position:'relative' }}>
                      <Github size={14} style={iconStyle} />
                      <input className="form-input" style={{ paddingLeft:32 }} placeholder="github.com/username" value={form.github} onChange={e => setForm({...form, github: e.target.value})} />
                    </div>
                  </Field>
                  <Field label="LinkedIn">
                    <div style={{ position:'relative' }}>
                      <Linkedin size={14} style={iconStyle} />
                      <input className="form-input" style={{ paddingLeft:32 }} placeholder="linkedin.com/in/username" value={form.linkedin} onChange={e => setForm({...form, linkedin: e.target.value})} />
                    </div>
                  </Field>
                  <Field label="Website / Portfolio" last>
                    <div style={{ position:'relative' }}>
                      <Globe size={14} style={iconStyle} />
                      <input className="form-input" style={{ paddingLeft:32 }} placeholder="yourwebsite.com" value={form.website} onChange={e => setForm({...form, website: e.target.value})} />
                    </div>
                  </Field>
                </div>
              ) : (
                <div>
                  <SocialLink icon={Github}   label="GitHub"    value={profile.github}   href={profile.github   ? `https://${profile.github.replace(/^https?:\/\//,'')}` : null} />
                  <SocialLink icon={Linkedin} label="LinkedIn"  value={profile.linkedin} href={profile.linkedin ? `https://${profile.linkedin.replace(/^https?:\/\//,'')}` : null} />
                  <SocialLink icon={Globe}    label="Website"   value={profile.website}  href={profile.website  ? `https://${profile.website.replace(/^https?:\/\//,'')}` : null} last />
                </div>
              )}
            </div>

            {/* Skills snapshot */}
            <div className="card">
              <SectionTitle icon={Star} title="Top Skills" />
              {skills.length === 0
                ? <p style={{ color:'var(--text-muted)', fontSize:'0.845rem' }}>No skills added yet.</p>
                : skills.slice(0, 5).map(s => (
                  <div key={s._id} style={{ marginBottom:12 }}>
                    <div style={{ display:'flex', justifyContent:'space-between', marginBottom:5 }}>
                      <span style={{ fontSize:'0.845rem', fontWeight:600 }}>{s.skillName}</span>
                      <span style={{ fontSize:'0.75rem', color: LEVEL_COLOR[s.level], fontWeight:600 }}>{s.level}</span>
                    </div>
                    <div style={{ background:'var(--border-light)', borderRadius:99, height:5 }}>
                      <div style={{ width:`${LEVEL_PCT[s.level]}%`, height:'100%', background: LEVEL_COLOR[s.level], borderRadius:99, transition:'width 0.6s ease' }}/>
                    </div>
                  </div>
                ))
              }
            </div>

            {/* Save button */}
            {editing && (
              <button className="btn btn-primary btn-lg btn-full" onClick={handleSave} disabled={saving}>
                <Save size={15}/> {saving ? 'Saving...' : 'Save Changes'}
              </button>
            )}
          </div>
        </div>
      )}

      {/* ── TAB: Activity ── */}
      {tab === 'activity' && (
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20 }}>
          <div className="card">
            <SectionTitle icon={BookOpen} title="Course Enrollments" />
            {progress.length === 0
              ? <p style={{ color:'var(--text-muted)', fontSize:'0.845rem' }}>No enrollments yet.</p>
              : progress.map(p => (
                <div key={p._id} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'10px 0', borderBottom:'1px solid var(--border-light)' }}>
                  <div>
                    <div style={{ fontSize:'0.875rem', fontWeight:600 }}>{p.courseId?.title || 'Course'}</div>
                    <div style={{ fontSize:'0.75rem', color:'var(--text-muted)', marginTop:2 }}>{p.courseId?.duration}</div>
                  </div>
                  {statusBadge[p.status]}
                </div>
              ))
            }
          </div>

          <div className="card">
            <SectionTitle icon={Wrench} title="All Skills" />
            {skills.length === 0
              ? <p style={{ color:'var(--text-muted)', fontSize:'0.845rem' }}>No skills added yet.</p>
              : skills.map(s => (
                <div key={s._id} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'8px 0', borderBottom:'1px solid var(--border-light)' }}>
                  <span style={{ fontSize:'0.875rem', fontWeight:500 }}>{s.skillName}</span>
                  <span className={`badge ${s.level === 'Advanced' ? 'badge-green' : s.level === 'Intermediate' ? 'badge-orange' : 'badge-blue'}`}>{s.level}</span>
                </div>
              ))
            }
          </div>
        </div>
      )}

      {/* ── TAB: Security ── */}
      {tab === 'security' && (
        <div style={{ maxWidth:480 }}>
          <div className="card">
            <SectionTitle icon={Lock} title="Change Password" />
            <form onSubmit={handlePasswordChange}>
              <Field label="Current Password">
                <div style={{ position:'relative' }}>
                  <Lock size={14} style={iconStyle} />
                  <input className="form-input" type={showPwd.cur ? 'text' : 'password'} style={{ paddingLeft:32, paddingRight:36 }}
                    placeholder="Enter current password" value={pwdForm.currentPassword}
                    onChange={e => setPwdForm({...pwdForm, currentPassword: e.target.value})} required />
                  <button type="button" onClick={() => setShowPwd(p => ({...p, cur:!p.cur}))}
                    style={{ position:'absolute', right:10, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', color:'var(--text-muted)' }}>
                    {showPwd.cur ? <EyeOff size={14}/> : <Eye size={14}/>}
                  </button>
                </div>
              </Field>
              <Field label="New Password">
                <div style={{ position:'relative' }}>
                  <Lock size={14} style={iconStyle} />
                  <input className="form-input" type={showPwd.nw ? 'text' : 'password'} style={{ paddingLeft:32, paddingRight:36 }}
                    placeholder="Min 6 characters" value={pwdForm.newPassword}
                    onChange={e => setPwdForm({...pwdForm, newPassword: e.target.value})} required />
                  <button type="button" onClick={() => setShowPwd(p => ({...p, nw:!p.nw}))}
                    style={{ position:'absolute', right:10, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', color:'var(--text-muted)' }}>
                    {showPwd.nw ? <EyeOff size={14}/> : <Eye size={14}/>}
                  </button>
                </div>
              </Field>
              <Field label="Confirm New Password" last>
                <div style={{ position:'relative' }}>
                  <Lock size={14} style={iconStyle} />
                  <input className="form-input" type="password" style={{ paddingLeft:32 }}
                    placeholder="Repeat new password" value={pwdForm.confirm}
                    onChange={e => setPwdForm({...pwdForm, confirm: e.target.value})} required />
                </div>
              </Field>
              <button className="btn btn-primary" type="submit" disabled={saving}>
                <Lock size={14}/> {saving ? 'Updating...' : 'Update Password'}
              </button>
            </form>
          </div>

          <div className="card" style={{ marginTop:20 }}>
            <SectionTitle icon={User} title="Account Details" />
            <InfoRow icon={Mail}     label="Email"      value={profile.email} />
            <InfoRow icon={Calendar} label="Member Since" value={joinDate} />
            <InfoRow icon={GraduationCap} label="Role"  value={profile.role ? profile.role.charAt(0).toUpperCase() + profile.role.slice(1) : 'User'} last />
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Small reusable sub-components ── */
const iconStyle = { position:'absolute', left:11, top:'50%', transform:'translateY(-50%)', color:'var(--text-light)' };

function SectionTitle({ icon: Icon, title }) {
  return (
    <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:18, paddingBottom:14, borderBottom:'1px solid var(--border-light)' }}>
      <div style={{ width:30, height:30, borderRadius:8, background:'var(--primary-light)', display:'flex', alignItems:'center', justifyContent:'center' }}>
        <Icon size={15} color="var(--primary)" />
      </div>
      <span style={{ fontWeight:700, fontSize:'0.9rem' }}>{title}</span>
    </div>
  );
}

function Field({ label, children, last }) {
  return (
    <div className="form-group" style={{ marginBottom: last ? 0 : 16 }}>
      <label className="form-label">{label}</label>
      {children}
    </div>
  );
}

function InfoRow({ icon: Icon, label, value, last }) {
  return (
    <div style={{ display:'flex', alignItems:'center', gap:12, padding:'10px 0', borderBottom: last ? 'none' : '1px solid var(--border-light)' }}>
      <div style={{ width:32, height:32, borderRadius:8, background:'var(--border-light)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
        <Icon size={14} color="var(--text-muted)" />
      </div>
      <div>
        <div style={{ fontSize:'0.72rem', color:'var(--text-muted)', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.04em' }}>{label}</div>
        <div style={{ fontSize:'0.875rem', fontWeight:500, color:'var(--text)', marginTop:1 }}>{value}</div>
      </div>
    </div>
  );
}

function SocialLink({ icon: Icon, label, value, href, last }) {
  return (
    <div style={{ display:'flex', alignItems:'center', gap:12, padding:'10px 0', borderBottom: last ? 'none' : '1px solid var(--border-light)' }}>
      <div style={{ width:32, height:32, borderRadius:8, background:'var(--border-light)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
        <Icon size={14} color="var(--text-muted)" />
      </div>
      <div style={{ flex:1 }}>
        <div style={{ fontSize:'0.72rem', color:'var(--text-muted)', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.04em' }}>{label}</div>
        {value
          ? <a href={href} target="_blank" rel="noreferrer" style={{ fontSize:'0.875rem', color:'var(--primary)', fontWeight:500, textDecoration:'none' }}>{value}</a>
          : <span style={{ fontSize:'0.875rem', color:'var(--text-muted)' }}>—</span>
        }
      </div>
    </div>
  );
}
