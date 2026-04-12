import { useEffect, useState } from 'react';
import api from '../api/axios';
import { Wrench, Plus, Pencil, Trash2, X, Check } from 'lucide-react';

const LEVELS = ['Beginner', 'Intermediate', 'Advanced'];
const LEVEL_CONFIG = {
  Beginner:     { badge: 'badge-blue',   color: '#2563eb', pct: '33%'  },
  Intermediate: { badge: 'badge-orange', color: '#f59e0b', pct: '66%'  },
  Advanced:     { badge: 'badge-green',  color: '#10b981', pct: '100%' },
};

export default function Skills() {
  const [skills,   setSkills]   = useState([]);
  const [form,     setForm]     = useState({ skillName: '', level: 'Beginner' });
  const [editId,   setEditId]   = useState(null);
  const [showForm, setShowForm] = useState(false);

  const fetchSkills = async () => { const { data } = await api.get('/skills'); setSkills(data); };
  useEffect(() => { fetchSkills(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editId) { await api.put(`/skills/${editId}`, form); setEditId(null); }
    else        { await api.post('/skills', form); }
    setForm({ skillName: '', level: 'Beginner' });
    setShowForm(false);
    fetchSkills();
  };

  const handleDelete = async (id) => { await api.delete(`/skills/${id}`); fetchSkills(); };

  const startEdit = (s) => {
    setEditId(s._id);
    setForm({ skillName: s.skillName, level: s.level });
    setShowForm(true);
  };

  const cancel = () => {
    setEditId(null);
    setForm({ skillName: '', level: 'Beginner' });
    setShowForm(false);
  };

  return (
    <div>
      <div className="page-header-row">
        <div className="page-header" style={{ marginBottom: 0 }}>
          <h1>Skills</h1>
          <p>Track and manage your technical proficiencies</p>
        </div>
        <button className="btn btn-primary" onClick={() => { cancel(); setShowForm(!showForm); }}>
          <Plus size={15} /> Add Skill
        </button>
      </div>

      {showForm && (
        <div className="panel">
          <div className="panel-title">
            {editId ? <><Pencil size={15} /> Edit Skill</> : <><Plus size={15} /> New Skill</>}
          </div>
          <form onSubmit={handleSubmit} style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'flex-end' }}>
            <div className="form-group" style={{ flex: 1, minWidth: 200, marginBottom: 0 }}>
              <label className="form-label">Skill Name</label>
              <input className="form-input" placeholder="e.g. React, Python, AWS"
                value={form.skillName} onChange={e => setForm({ ...form, skillName: e.target.value })} required />
            </div>
            <div className="form-group" style={{ minWidth: 160, marginBottom: 0 }}>
              <label className="form-label">Proficiency Level</label>
              <select className="form-input" value={form.level} onChange={e => setForm({ ...form, level: e.target.value })}>
                {LEVELS.map(l => <option key={l}>{l}</option>)}
              </select>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn-primary" type="submit">
                <Check size={14} /> {editId ? 'Update' : 'Add'}
              </button>
              <button className="btn btn-ghost" type="button" onClick={cancel}>
                <X size={14} /> Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="skill-grid">
        {skills.map(s => {
          const cfg = LEVEL_CONFIG[s.level];
          return (
            <div key={s._id} className="skill-card">
              <div className="skill-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: `${cfg.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Wrench size={15} color={cfg.color} />
                  </div>
                  <span className="skill-name">{s.skillName}</span>
                </div>
                <span className={`badge ${cfg.badge}`}>{s.level}</span>
              </div>
              <div className="skill-bar-track">
                <div className="skill-bar-fill" style={{ width: cfg.pct, background: cfg.color }} />
              </div>
              <div className="skill-actions">
                <button className="btn btn-light btn-sm" onClick={() => startEdit(s)}>
                  <Pencil size={12} /> Edit
                </button>
                <button className="btn btn-danger btn-sm" onClick={() => handleDelete(s._id)}>
                  <Trash2 size={12} /> Delete
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {skills.length === 0 && !showForm && (
        <div className="empty-state">
          <div className="empty-state-icon"><Wrench size={24} /></div>
          <h3>No skills added yet</h3>
          <p>Click Add Skill to start tracking your proficiencies.</p>
        </div>
      )}
    </div>
  );
}
