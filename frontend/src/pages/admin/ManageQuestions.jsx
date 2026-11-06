import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { questionService, examService } from '../../services/dataService';
import toast from 'react-hot-toast';
import { FiPlus, FiEdit2, FiTrash2, FiX, FiArrowLeft } from 'react-icons/fi';

const ManageQuestions = () => {
  const { examId } = useParams();
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [exam, setExam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState({ open: false, mode: 'add', data: null });
  const [form, setForm] = useState({ question: '', option_a: '', option_b: '', option_c: '', option_d: '', correct_answer: 'A', difficulty: 'medium' });

  useEffect(() => { fetchData(); }, [examId]);

  const fetchData = async () => {
    try {
      const [qRes, eRes] = await Promise.all([questionService.getByExamId(examId), examService.getById(examId)]);
      setQuestions(qRes.data.data);
      setExam(eRes.data.data);
    } catch { toast.error('Failed to load data'); }
    finally { setLoading(false); }
  };

  const openAdd = () => { setForm({ question: '', option_a: '', option_b: '', option_c: '', option_d: '', correct_answer: 'A', difficulty: 'medium' }); setModal({ open: true, mode: 'add', data: null }); };
  const openEdit = (q) => { setForm({ question: q.question, option_a: q.option_a, option_b: q.option_b, option_c: q.option_c, option_d: q.option_d, correct_answer: q.correct_answer, difficulty: q.difficulty || 'medium' }); setModal({ open: true, mode: 'edit', data: q }); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (modal.mode === 'add') { await questionService.create({ ...form, exam_id: examId }); toast.success('Question added'); }
      else { await questionService.update(modal.data.id, form); toast.success('Question updated'); }
      setModal({ open: false, mode: 'add', data: null }); fetchData();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this question?')) return;
    try { await questionService.delete(id); toast.success('Question deleted'); fetchData(); }
    catch { toast.error('Delete failed'); }
  };

  const optionLabels = { A: 'option_a', B: 'option_b', C: 'option_c', D: 'option_d' };

  if (loading) return <div className="loader-container"><div className="spinner"></div></div>;

  return (
    <div className="animate-in">
      <div className="page-header flex-between">
        <div>
          <button className="btn btn-ghost btn-sm" onClick={() => navigate('/admin/exams')} style={{ marginBottom: '8px' }}><FiArrowLeft /> Back to Exams</button>
          <h1>Manage Questions</h1>
          <p>{exam?.exam_name} — {questions.length} questions</p>
        </div>
        <button className="btn btn-primary" onClick={openAdd}><FiPlus /> Add Question</button>
      </div>

      {questions.length === 0 ? (
        <div className="card"><div className="card-body text-center" style={{ padding: '60px' }}>
          <div style={{ fontSize: '3rem', marginBottom: '16px' }}>📝</div>
          <h3>No Questions Yet</h3>
          <p style={{ color: 'var(--text-muted)', margin: '12px 0 24px' }}>Start adding MCQ questions to this exam.</p>
          <button className="btn btn-primary" onClick={openAdd}><FiPlus /> Add First Question</button>
        </div></div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {questions.map((q, i) => (
            <div className="card" key={q.id}>
              <div className="card-body">
                <div className="flex-between" style={{ marginBottom: '16px' }}>
                  <div>
                    <span className="badge badge-primary" style={{ marginRight: '8px' }}>Q{i + 1}</span>
                    <span className={`badge ${q.difficulty === 'easy' ? 'badge-success' : q.difficulty === 'hard' ? 'badge-danger' : 'badge-warning'}`}>
                      {q.difficulty ? q.difficulty.charAt(0).toUpperCase() + q.difficulty.slice(1) : 'Medium'}
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button className="btn btn-ghost btn-sm" onClick={() => openEdit(q)}><FiEdit2 /></button>
                    <button className="btn btn-ghost btn-sm" style={{ color: 'var(--danger)' }} onClick={() => handleDelete(q.id)}><FiTrash2 /></button>
                  </div>
                </div>
                <p style={{ fontWeight: 600, fontSize: '1rem', marginBottom: '16px' }}>{q.question}</p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  {['A', 'B', 'C', 'D'].map(opt => (
                    <div key={opt} style={{
                      padding: '10px 14px', borderRadius: 'var(--radius-md)',
                      border: `2px solid ${q.correct_answer === opt ? 'var(--success)' : 'var(--border-color)'}`,
                      background: q.correct_answer === opt ? 'var(--success-bg)' : 'transparent',
                      display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem'
                    }}>
                      <span style={{ fontWeight: 700, color: q.correct_answer === opt ? 'var(--success)' : 'var(--text-muted)' }}>{opt}.</span>
                      {q[optionLabels[opt]]}
                      {q.correct_answer === opt && <span style={{ marginLeft: 'auto', color: 'var(--success)', fontWeight: 600, fontSize: '0.75rem' }}>✓ Correct</span>}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {modal.open && (
        <div className="modal-overlay" onClick={() => setModal({...modal, open: false})}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '640px' }}>
            <div className="modal-header"><h3>{modal.mode === 'add' ? 'Add Question' : 'Edit Question'}</h3><button className="modal-close" onClick={() => setModal({...modal, open: false})}><FiX /></button></div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group"><label className="form-label">Question</label><textarea className="form-input" rows="3" value={form.question} onChange={e => setForm({...form, question: e.target.value})} required /></div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  {['A', 'B', 'C', 'D'].map(opt => (
                    <div className="form-group" key={opt}>
                      <label className="form-label">Option {opt}</label>
                      <input className="form-input" value={form[optionLabels[opt]]} onChange={e => setForm({...form, [optionLabels[opt]]: e.target.value})} required />
                    </div>
                  ))}
                </div>
                <div className="form-group" style={{ marginTop: '16px' }}><label className="form-label">Difficulty</label>
                  <select className="form-select" value={form.difficulty} onChange={e => setForm({...form, difficulty: e.target.value})}>
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>
                <div className="form-group" style={{ marginTop: '16px' }}><label className="form-label">Correct Answer</label>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    {['A', 'B', 'C', 'D'].map(opt => (
                      <label key={opt} style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', padding: '8px 16px', borderRadius: 'var(--radius-md)', border: `2px solid ${form.correct_answer === opt ? 'var(--success)' : 'var(--border-color)'}`, background: form.correct_answer === opt ? 'var(--success-bg)' : 'transparent', fontWeight: 600 }}>
                        <input type="radio" name="correct" value={opt} checked={form.correct_answer === opt} onChange={e => setForm({...form, correct_answer: e.target.value})} style={{ display: 'none' }} />
                        {opt}
                      </label>
                    ))}
                  </div>
                </div>
              </div>
              <div className="modal-footer"><button type="button" className="btn btn-ghost" onClick={() => setModal({...modal, open: false})}>Cancel</button><button type="submit" className="btn btn-primary">{modal.mode === 'add' ? 'Add' : 'Update'}</button></div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageQuestions;
