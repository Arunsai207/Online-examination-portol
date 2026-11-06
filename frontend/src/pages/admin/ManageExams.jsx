import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { examService, subjectService } from '../../services/dataService';
import toast from 'react-hot-toast';
import { FiPlus, FiEdit2, FiTrash2, FiSearch, FiX, FiList, FiUpload } from 'react-icons/fi';
import PdfPreviewModal from '../../components/admin/PdfPreviewModal';

const ManageExams = () => {
  const [exams, setExams] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState({ open: false, mode: 'add', data: null });
  const [form, setForm] = useState({ exam_name: '', subject_id: '', question_count: '10', duration: '', total_marks: '10', exam_date: '', start_time: '', end_time: '', status: 'upcoming', is_adaptive: false });
  const [deleteId, setDeleteId] = useState(null);
  const [pdfModal, setPdfModal] = useState(false);
  const [pdfForm, setPdfForm] = useState({ exam_name: '', subject_id: '', duration: '', exam_date: '', start_time: '', end_time: '', is_adaptive: false });
  const [pdfFile, setPdfFile] = useState(null);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [previewData, setPreviewData] = useState(null); // Parsed questions for preview
  const [publishLoading, setPublishLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => { fetchExams(); fetchSubjects(); }, [page, search]);

  const fetchExams = async () => {
    try { setLoading(true); const res = await examService.getAll({ page, limit: 10, search }); setExams(res.data.data.exams); setTotalPages(res.data.data.totalPages); }
    catch { toast.error('Failed to load exams'); }
    finally { setLoading(false); }
  };

  const fetchSubjects = async () => {
    try { const res = await subjectService.getAll(); setSubjects(res.data.data); } catch {}
  };

  const openAdd = () => { setForm({ exam_name: '', subject_id: '', question_count: '10', duration: '', total_marks: '10', exam_date: '', start_time: '', end_time: '', status: 'upcoming', is_adaptive: false }); setModal({ open: true, mode: 'add', data: null }); };
  const openEdit = (exam) => { setForm({ exam_name: exam.exam_name, subject_id: exam.subject_id, duration: exam.duration, total_marks: exam.total_marks, exam_date: exam.exam_date?.split('T')[0] || '', start_time: exam.start_time ? new Date(new Date(exam.start_time).getTime() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16) : '', end_time: exam.end_time ? new Date(new Date(exam.end_time).getTime() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16) : '', status: exam.status, is_adaptive: exam.is_adaptive === 1 }); setModal({ open: true, mode: 'edit', data: exam }); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (modal.mode === 'add') {
        await examService.createFromQuestionBank({
          ...form,
          subject_id: Number(form.subject_id),
          question_count: Number(form.question_count),
          duration: Number(form.duration),
          total_marks: Number(form.total_marks),
          is_adaptive: false
        });
        toast.success(`Exam created with ${form.question_count} selected questions`);
      }
      else { await examService.update(modal.data.id, form); toast.success('Exam updated'); }
      setModal({ open: false, mode: 'add', data: null }); fetchExams();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const handleDelete = async () => {
    try { await examService.delete(deleteId); toast.success('Exam deleted'); setDeleteId(null); fetchExams(); }
    catch { toast.error('Delete failed'); }
  };

  // Step 1: Parse PDF → get questions for preview
  const handlePdfParse = async (e) => {
    e.preventDefault();
    if (!pdfFile) { toast.error('Please select a PDF file'); return; }
    try {
      setPdfLoading(true);
      const formData = new FormData();
      formData.append('pdf', pdfFile);
      const res = await examService.parsePdf(formData);
      const parsed = res.data.data;
      if (parsed.questions.length === 0) {
        toast.error('No questions could be extracted from this PDF.');
        return;
      }
      toast.success(res.data.message);
      setPreviewData(parsed.questions);
      setPdfModal(false);
    } catch (err) { toast.error(err.response?.data?.message || 'PDF parsing failed'); }
    finally { setPdfLoading(false); }
  };

      // Step 2: Publish reviewed questions
  const handlePublish = async (validQuestions) => {
    try {
      setPublishLoading(true);
      await examService.createFromJson({
        exam_name: pdfForm.exam_name,
        subject_id: parseInt(pdfForm.subject_id),
        duration: parseInt(pdfForm.duration),
        exam_date: pdfForm.exam_date,
        start_time: pdfForm.start_time || null,
        end_time: pdfForm.end_time || null,
        status: 'active',
        is_adaptive: pdfForm.is_adaptive,
        questions: validQuestions
      });
      toast.success(`Exam published with ${validQuestions.length} questions!`);
      setPreviewData(null);
      setPdfFile(null);
      setPdfForm({ exam_name: '', subject_id: '', duration: '', exam_date: '', start_time: '', end_time: '' });
      fetchExams();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to publish exam'); }
    finally { setPublishLoading(false); }
  };

  const statusColors = { upcoming: 'badge-warning', active: 'badge-success', completed: 'badge-info' };

  return (
    <div className="animate-in">
      <div className="page-header flex-between">
        <div><h1>Manage Exams</h1></div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="btn btn-outline" onClick={() => setPdfModal(true)}><FiUpload /> Create from PDF</button>
          <button className="btn btn-primary" onClick={openAdd}><FiPlus /> Create Exam</button>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <div className="search-bar"><FiSearch className="search-icon" /><input placeholder="Search exams..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} /></div>
        </div>
        <div className="data-table-container">
          {loading ? <div className="loader-container"><div className="spinner"></div></div> : (
            <table className="data-table">
              <thead><tr><th>#</th><th>Exam Name</th><th>Subject</th><th>Duration</th><th>Type</th><th>Questions</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>
                {exams.length === 0 ? <tr><td colSpan="9" className="text-center" style={{ padding: '40px' }}>No exams found</td></tr> :
                exams.map((e, i) => (
                  <tr key={e.id}>
                    <td>{(page-1)*10+i+1}</td>
                    <td style={{ fontWeight: 600 }}>{e.exam_name}</td>
                    <td>{e.subject_name}</td>
                    <td>{e.duration} min</td>
                    <td>{e.is_adaptive ? <span className="badge badge-info">Adaptive</span> : 'Standard'}</td>
                    <td><span className="badge badge-primary">{e.question_count}</span></td>
                    <td><span className={`badge ${statusColors[e.status]}`}>{e.status}</span></td>
                    <td>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button className="btn btn-ghost btn-sm" title="Manage Questions" onClick={() => navigate(`/admin/questions/${e.id}`)}><FiList /></button>
                        <button className="btn btn-ghost btn-sm" onClick={() => openEdit(e)}><FiEdit2 /></button>
                        <button className="btn btn-ghost btn-sm" style={{ color: 'var(--danger)' }} onClick={() => setDeleteId(e.id)}><FiTrash2 /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        {totalPages > 1 && (
          <div className="card-footer"><div className="pagination">
            <button className="pagination-btn" disabled={page===1} onClick={() => setPage(page-1)}>←</button>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i+1).map(p => <button key={p} className={`pagination-btn ${page===p?'active':''}`} onClick={() => setPage(p)}>{p}</button>)}
            <button className="pagination-btn" disabled={page===totalPages} onClick={() => setPage(page+1)}>→</button>
          </div></div>
        )}
      </div>

      {modal.open && (
        <div className="modal-overlay" onClick={() => setModal({...modal, open: false})}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header"><h3>{modal.mode === 'add' ? 'Create Exam' : 'Edit Exam'}</h3><button className="modal-close" onClick={() => setModal({...modal, open: false})}><FiX /></button></div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group"><label className="form-label">Exam Name</label><input className="form-input" value={form.exam_name} onChange={e => setForm({...form, exam_name: e.target.value})} required /></div>
                <div className="form-group"><label className="form-label">Subject</label>
                  <select className="form-select" value={form.subject_id} onChange={e => setForm({...form, subject_id: e.target.value})} required>
                    <option value="">Select Subject</option>
                    {subjects.map(s => <option key={s.id} value={s.id}>{s.subject_name}</option>)}
                  </select>
                </div>
                {modal.mode === 'add' && (
                  <div className="form-group">
                    <label className="form-label">Number of Questions (1–400)</label>
                    <input
                      className="form-input"
                      type="number"
                      min="1"
                      max="400"
                      value={form.question_count}
                      onChange={e => {
                        const count = e.target.value;
                        setForm({ ...form, question_count: count, total_marks: count });
                      }}
                      required
                    />
                    <small style={{ color: 'var(--text-muted)' }}>
                      Questions will be randomly selected from the chosen subject's question bank. Total marks defaults to the question count; you can change it.
                    </small>
                  </div>
                )}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="form-group"><label className="form-label">Duration (min)</label><input className="form-input" type="number" min="1" value={form.duration} onChange={e => setForm({...form, duration: e.target.value})} required /></div>
                  <div className="form-group"><label className="form-label">Total Marks</label><input className="form-input" type="number" min="1" value={form.total_marks} onChange={e => setForm({...form, total_marks: e.target.value})} required /></div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="form-group"><label className="form-label">Exam Date</label><input className="form-input" type="date" value={form.exam_date} onChange={e => setForm({...form, exam_date: e.target.value})} required /></div>
                  <div className="form-group"><label className="form-label">Status</label>
                    <select className="form-select" value={form.status} onChange={e => setForm({...form, status: e.target.value})}>
                      <option value="upcoming">Upcoming</option><option value="active">Active</option><option value="completed">Completed</option>
                    </select>
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="form-group"><label className="form-label">Open Time (Optional)</label><input className="form-input" type="datetime-local" value={form.start_time} onChange={e => setForm({...form, start_time: e.target.value})} /></div>
                  <div className="form-group"><label className="form-label">Close Time (Optional)</label><input className="form-input" type="datetime-local" value={form.end_time} onChange={e => setForm({...form, end_time: e.target.value})} /></div>
                </div>
                {modal.mode === 'edit' && (
                  <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '16px' }}>
                    <input type="checkbox" id="is_adaptive" checked={form.is_adaptive} onChange={e => setForm({...form, is_adaptive: e.target.checked})} style={{ width: '16px', height: '16px' }} />
                    <label htmlFor="is_adaptive" style={{ margin: 0, fontWeight: 600 }}>Enable Adaptive Mode (Difficulty scales based on performance)</label>
                  </div>
                )}
              </div>
              <div className="modal-footer"><button type="button" className="btn btn-ghost" onClick={() => setModal({...modal, open: false})}>Cancel</button><button type="submit" className="btn btn-primary">{modal.mode === 'add' ? 'Create' : 'Update'}</button></div>
            </form>
          </div>
        </div>
      )}

      {deleteId && (
        <div className="modal-overlay" onClick={() => setDeleteId(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '400px' }}>
            <div className="modal-body text-center" style={{ padding: '32px' }}>
              <div style={{ fontSize: '3rem', marginBottom: '16px' }}>⚠️</div><h3>Delete Exam?</h3>
              <p style={{ color: 'var(--text-muted)', margin: '12px 0 24px' }}>This will delete all questions and attempts too.</p>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}><button className="btn btn-ghost" onClick={() => setDeleteId(null)}>Cancel</button><button className="btn btn-danger" onClick={handleDelete}>Delete</button></div>
            </div>
          </div>
        </div>
      )}

      {/* PDF Upload Modal — Step 1: upload file + exam details */}
      {pdfModal && (
        <div className="modal-overlay" onClick={() => setPdfModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header"><h3>Create Exam from PDF or Image</h3><button className="modal-close" onClick={() => setPdfModal(false)}><FiX /></button></div>
            <form onSubmit={handlePdfParse}>
              <div className="modal-body">
                <div style={{ background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', padding: '20px', marginBottom: '20px', textAlign: 'center', border: '2px dashed var(--border-color)' }}>
                  <FiUpload size={32} style={{ color: 'var(--primary)', marginBottom: '8px' }} />
                  <p style={{ fontWeight: 600, marginBottom: '4px' }}>Upload MCQ PDF or Image</p>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '12px' }}>Supports: Scanned Images (PNG/JPG) using OCR, or text PDFs.</p>
                  <input type="file" accept=".pdf,image/png,image/jpeg,image/jpg" onChange={e => setPdfFile(e.target.files[0])} style={{ width: '100%' }} />
                  {pdfFile && <p style={{ marginTop: '8px', color: 'var(--success)', fontSize: '0.85rem' }}>Selected: {pdfFile.name}</p>}
                </div>
                <div className="form-group"><label className="form-label">Exam Name</label><input className="form-input" value={pdfForm.exam_name} onChange={e => setPdfForm({...pdfForm, exam_name: e.target.value})} required /></div>
                <div className="form-group"><label className="form-label">Subject</label>
                  <select className="form-select" value={pdfForm.subject_id} onChange={e => setPdfForm({...pdfForm, subject_id: e.target.value})} required>
                    <option value="">Select Subject</option>
                    {subjects.map(s => <option key={s.id} value={s.id}>{s.subject_name}</option>)}
                  </select>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="form-group"><label className="form-label">Duration (min)</label><input className="form-input" type="number" min="1" value={pdfForm.duration} onChange={e => setPdfForm({...pdfForm, duration: e.target.value})} required /></div>
                  <div className="form-group"><label className="form-label">Exam Date</label><input className="form-input" type="date" value={pdfForm.exam_date} onChange={e => setPdfForm({...pdfForm, exam_date: e.target.value})} required /></div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="form-group"><label className="form-label">Open Time (Optional)</label><input className="form-input" type="datetime-local" value={pdfForm.start_time} onChange={e => setPdfForm({...pdfForm, start_time: e.target.value})} /></div>
                  <div className="form-group"><label className="form-label">Close Time (Optional)</label><input className="form-input" type="datetime-local" value={pdfForm.end_time} onChange={e => setPdfForm({...pdfForm, end_time: e.target.value})} /></div>
                </div>
                <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '16px' }}>
                  <input type="checkbox" id="pdf_is_adaptive" checked={pdfForm.is_adaptive} onChange={e => setPdfForm({...pdfForm, is_adaptive: e.target.checked})} style={{ width: '16px', height: '16px' }} />
                  <label htmlFor="pdf_is_adaptive" style={{ margin: 0, fontWeight: 600 }}>Enable Adaptive Mode (Difficulty scales based on performance)</label>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={() => setPdfModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={pdfLoading}>
                  {pdfLoading ? 'Parsing PDF...' : '📄 Parse & Preview Questions'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Preview Modal — Step 2: review & publish */}
      {previewData && (
        <PdfPreviewModal
          questions={previewData}
          onPublish={handlePublish}
          onClose={() => setPreviewData(null)}
          loading={publishLoading}
        />
      )}
    </div>
  );
};

export default ManageExams;
