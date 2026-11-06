import { useState, useEffect } from 'react';
import { subjectService } from '../../services/dataService';
import toast from 'react-hot-toast';
import { FiPlus, FiEdit2, FiTrash2, FiX } from 'react-icons/fi';

const ManageSubjects = () => {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState({ open: false, mode: 'add', data: null });
  const [name, setName] = useState('');
  const [deleteId, setDeleteId] = useState(null);

  useEffect(() => { fetchSubjects(); }, []);

  const fetchSubjects = async () => {
    try { const res = await subjectService.getAll(); setSubjects(res.data.data); }
    catch { toast.error('Failed to load subjects'); }
    finally { setLoading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (modal.mode === 'add') { await subjectService.create({ subject_name: name }); toast.success('Subject created'); }
      else { await subjectService.update(modal.data.id, { subject_name: name }); toast.success('Subject updated'); }
      setModal({ open: false, mode: 'add', data: null }); fetchSubjects();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const handleDelete = async () => {
    try { await subjectService.delete(deleteId); toast.success('Subject deleted'); setDeleteId(null); fetchSubjects(); }
    catch { toast.error('Delete failed'); }
  };

  return (
    <div className="animate-in">
      <div className="page-header flex-between">
        <div><h1>Manage Subjects</h1><p>{subjects.length} subjects</p></div>
        <button className="btn btn-primary" onClick={() => { setName(''); setModal({ open: true, mode: 'add', data: null }); }}><FiPlus /> Add Subject</button>
      </div>

      <div className="card">
        <div className="data-table-container">
          {loading ? <div className="loader-container"><div className="spinner"></div></div> : (
            <table className="data-table">
              <thead><tr><th>#</th><th>Subject Name</th><th>Created At</th><th>Actions</th></tr></thead>
              <tbody>
                {subjects.length === 0 ? (
                  <tr><td colSpan="4" className="text-center" style={{ padding: '40px' }}>No subjects found</td></tr>
                ) : subjects.map((s, i) => (
                  <tr key={s.id}>
                    <td>{i+1}</td>
                    <td style={{ fontWeight: 600 }}>{s.subject_name}</td>
                    <td>{new Date(s.created_at).toLocaleDateString()}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button className="btn btn-ghost btn-sm" onClick={() => { setName(s.subject_name); setModal({ open: true, mode: 'edit', data: s }); }}><FiEdit2 /></button>
                        <button className="btn btn-ghost btn-sm" style={{ color: 'var(--danger)' }} onClick={() => setDeleteId(s.id)}><FiTrash2 /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {modal.open && (
        <div className="modal-overlay" onClick={() => setModal({...modal, open: false})}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '440px' }}>
            <div className="modal-header">
              <h3>{modal.mode === 'add' ? 'Add Subject' : 'Edit Subject'}</h3>
              <button className="modal-close" onClick={() => setModal({...modal, open: false})}><FiX /></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Subject Name</label>
                  <input className="form-input" placeholder="e.g. Data Structures" value={name} onChange={e => setName(e.target.value)} required />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={() => setModal({...modal, open: false})}>Cancel</button>
                <button type="submit" className="btn btn-primary">{modal.mode === 'add' ? 'Create' : 'Update'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteId && (
        <div className="modal-overlay" onClick={() => setDeleteId(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '400px' }}>
            <div className="modal-body text-center" style={{ padding: '32px' }}>
              <div style={{ fontSize: '3rem', marginBottom: '16px' }}>⚠️</div>
              <h3>Delete Subject?</h3>
              <p style={{ color: 'var(--text-muted)', margin: '12px 0 24px' }}>This will also delete all associated exams and questions.</p>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                <button className="btn btn-ghost" onClick={() => setDeleteId(null)}>Cancel</button>
                <button className="btn btn-danger" onClick={handleDelete}>Delete</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageSubjects;
