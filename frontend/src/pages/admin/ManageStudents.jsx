import { useState, useEffect } from 'react';
import { studentService } from '../../services/dataService';
import toast from 'react-hot-toast';
import { FiPlus, FiEdit2, FiTrash2, FiSearch, FiX } from 'react-icons/fi';

const ManageStudents = () => {
  const [students, setStudents] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState({ open: false, mode: 'add', data: null });
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '', course: '' });
  const [deleteModal, setDeleteModal] = useState({ open: false, id: null, name: '' });

  useEffect(() => { fetchStudents(); }, [page, search]);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const res = await studentService.getAll({ page, limit: 10, search });
      setStudents(res.data.data.students);
      setTotal(res.data.data.total);
      setTotalPages(res.data.data.totalPages);
    } catch (err) { toast.error('Failed to load students'); }
    finally { setLoading(false); }
  };

  const openAddModal = () => {
    setForm({ name: '', email: '', password: '', phone: '', course: '' });
    setModal({ open: true, mode: 'add', data: null });
  };

  const openEditModal = (student) => {
    setForm({ name: student.name, email: student.email, password: '', phone: student.phone || '', course: student.course || '' });
    setModal({ open: true, mode: 'edit', data: student });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (modal.mode === 'add') {
        await studentService.create(form);
        toast.success('Student created successfully');
      } else {
        await studentService.update(modal.data.id, form);
        toast.success('Student updated successfully');
      }
      setModal({ open: false, mode: 'add', data: null });
      fetchStudents();
    } catch (err) { toast.error(err.response?.data?.message || 'Operation failed'); }
  };

  const handleDelete = async () => {
    try {
      await studentService.delete(deleteModal.id);
      toast.success('Student deleted');
      setDeleteModal({ open: false, id: null, name: '' });
      fetchStudents();
    } catch (err) { toast.error('Delete failed'); }
  };

  return (
    <div className="animate-in">
      <div className="page-header flex-between">
        <div>
          <h1>Manage Students</h1>
          <p>Total: {total} students</p>
        </div>
        <button className="btn btn-primary" onClick={openAddModal}><FiPlus /> Add Student</button>
      </div>

      <div className="card">
        <div className="card-header">
          <div className="search-bar">
            <FiSearch className="search-icon" />
            <input placeholder="Search students..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
          </div>
        </div>

        <div className="data-table-container">
          {loading ? <div className="loader-container"><div className="spinner"></div></div> : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>#</th><th>Name</th><th>Email</th><th>Phone</th><th>Course</th><th>Joined</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {students.length === 0 ? (
                  <tr><td colSpan="7" className="text-center" style={{ padding: '40px' }}>No students found</td></tr>
                ) : students.map((s, i) => (
                  <tr key={s.id}>
                    <td>{(page-1)*10 + i + 1}</td>
                    <td style={{ fontWeight: 600 }}>{s.name}</td>
                    <td>{s.email}</td>
                    <td>{s.phone || '-'}</td>
                    <td><span className="badge badge-primary">{s.course || 'N/A'}</span></td>
                    <td>{new Date(s.created_at).toLocaleDateString()}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button className="btn btn-ghost btn-sm" onClick={() => openEditModal(s)}><FiEdit2 /></button>
                        <button className="btn btn-ghost btn-sm" style={{ color: 'var(--danger)' }} onClick={() => setDeleteModal({ open: true, id: s.id, name: s.name })}><FiTrash2 /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {totalPages > 1 && (
          <div className="card-footer">
            <div className="pagination">
              <button className="pagination-btn" disabled={page===1} onClick={() => setPage(page-1)}>←</button>
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i+1).map(p => (
                <button key={p} className={`pagination-btn ${page===p?'active':''}`} onClick={() => setPage(p)}>{p}</button>
              ))}
              <button className="pagination-btn" disabled={page===totalPages} onClick={() => setPage(page+1)}>→</button>
            </div>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {modal.open && (
        <div className="modal-overlay" onClick={() => setModal({...modal, open: false})}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{modal.mode === 'add' ? 'Add Student' : 'Edit Student'}</h3>
              <button className="modal-close" onClick={() => setModal({...modal, open: false})}><FiX /></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input className="form-input" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input className="form-input" type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} required />
                </div>
                {modal.mode === 'add' && (
                  <div className="form-group">
                    <label className="form-label">Password</label>
                    <input className="form-input" type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} required minLength="6" />
                  </div>
                )}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="form-group">
                    <label className="form-label">Phone</label>
                    <input className="form-input" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Course</label>
                    <select className="form-select" value={form.course} onChange={e => setForm({...form, course: e.target.value})}>
                      <option value="">Select</option>
                      <option value="B.Tech CSE">B.Tech CSE</option>
                      <option value="B.Tech IT">B.Tech IT</option>
                      <option value="B.Tech ECE">B.Tech ECE</option>
                      <option value="BCA">BCA</option>
                      <option value="MCA">MCA</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={() => setModal({...modal, open: false})}>Cancel</button>
                <button type="submit" className="btn btn-primary">{modal.mode === 'add' ? 'Add Student' : 'Update'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {deleteModal.open && (
        <div className="modal-overlay" onClick={() => setDeleteModal({ open: false, id: null, name: '' })}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '420px' }}>
            <div className="modal-body text-center" style={{ padding: '32px' }}>
              <div style={{ fontSize: '3rem', marginBottom: '16px' }}>⚠️</div>
              <h3>Delete Student</h3>
              <p style={{ color: 'var(--text-muted)', margin: '12px 0 24px' }}>
                Are you sure you want to delete <strong>{deleteModal.name}</strong>? This action cannot be undone.
              </p>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                <button className="btn btn-ghost" onClick={() => setDeleteModal({ open: false, id: null, name: '' })}>Cancel</button>
                <button className="btn btn-danger" onClick={handleDelete}>Delete</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageStudents;
