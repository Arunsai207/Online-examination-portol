import { useState } from 'react';
import { FiCheck, FiAlertTriangle, FiTrash2, FiEdit2, FiX, FiSave, FiCheckCircle } from 'react-icons/fi';

const PdfPreviewModal = ({ questions: initialQuestions, onPublish, onClose, loading }) => {
  const [questions, setQuestions] = useState(initialQuestions || []);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});

  const validCount = questions.filter(q => q.isValid).length;
  const invalidCount = questions.filter(q => !q.isValid).length;

  const handleDelete = (id) => {
    setQuestions(prev => prev.filter(q => q.id !== id));
  };

  const handleEditStart = (q) => {
    setEditingId(q.id);
    setEditForm({
      question: q.question,
      option_a: q.option_a,
      option_b: q.option_b,
      option_c: q.option_c,
      option_d: q.option_d,
      correct_answer: q.correct_answer
    });
  };

  const handleEditSave = (id) => {
    setQuestions(prev => prev.map(q => {
      if (q.id !== id) return q;
      const updated = { ...q, ...editForm };
      // Re-validate
      const errors = [];
      if (!updated.question || updated.question.trim().length < 5) errors.push('Question text is too short');
      if (!updated.option_a) errors.push('Option A is missing');
      if (!updated.option_b) errors.push('Option B is missing');
      if (!updated.option_c) errors.push('Option C is missing');
      if (!updated.option_d) errors.push('Option D is missing');
      if (!['A', 'B', 'C', 'D'].includes((updated.correct_answer || '').toUpperCase())) errors.push('Invalid answer');
      updated.isValid = errors.length === 0;
      updated.errors = errors;
      updated.correct_answer = (updated.correct_answer || '').toUpperCase();
      return updated;
    }));
    setEditingId(null);
  };

  const handlePublish = () => {
    const validQuestions = questions.filter(q => q.isValid);
    if (validQuestions.length === 0) return;
    onPublish(validQuestions);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '900px', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
        
        {/* Header */}
        <div className="modal-header">
          <h3>📝 Review Extracted Questions</h3>
          <button className="modal-close" onClick={onClose}><FiX /></button>
        </div>

        {/* Stats Bar */}
        <div style={{ display: 'flex', gap: '16px', padding: '12px 24px', background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem' }}>
            <FiCheckCircle style={{ color: 'var(--success)' }} />
            <span><strong>{validCount}</strong> Valid</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem' }}>
            <FiAlertTriangle style={{ color: 'var(--warning)' }} />
            <span><strong>{invalidCount}</strong> Need Review</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem' }}>
            <span>📄 <strong>{questions.length}</strong> Total</span>
          </div>
        </div>

        {/* Scrollable Question List */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 24px' }}>
          {questions.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
              <p>No questions extracted. Please try a different PDF.</p>
            </div>
          ) : (
            questions.map((q, idx) => (
              <div key={q.id} style={{
                border: `1px solid ${q.isValid ? 'var(--border-color)' : 'var(--danger)'}`,
                borderRadius: 'var(--radius-md)',
                padding: '16px',
                marginBottom: '12px',
                background: q.isValid ? 'var(--bg-primary)' : 'rgba(239, 68, 68, 0.05)',
                transition: 'all 0.2s ease'
              }}>
                {/* Question Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{
                      background: q.isValid ? 'var(--success)' : 'var(--danger)',
                      color: '#fff',
                      borderRadius: '50%',
                      width: '28px',
                      height: '28px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      flexShrink: 0
                    }}>
                      {idx + 1}
                    </span>
                    {!q.isValid && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                        {q.errors.map((err, ei) => (
                          <span key={ei} style={{
                            background: 'rgba(239, 68, 68, 0.1)',
                            color: 'var(--danger)',
                            padding: '2px 8px',
                            borderRadius: '12px',
                            fontSize: '0.7rem',
                            fontWeight: 500
                          }}>{err}</span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: '4px', flexShrink: 0 }}>
                    {editingId === q.id ? (
                      <button className="btn btn-sm btn-primary" onClick={() => handleEditSave(q.id)} style={{ padding: '4px 8px' }}>
                        <FiSave size={14} /> Save
                      </button>
                    ) : (
                      <button className="btn btn-ghost btn-sm" onClick={() => handleEditStart(q)} style={{ padding: '4px 8px' }}>
                        <FiEdit2 size={14} />
                      </button>
                    )}
                    <button className="btn btn-ghost btn-sm" onClick={() => handleDelete(q.id)} style={{ padding: '4px 8px', color: 'var(--danger)' }}>
                      <FiTrash2 size={14} />
                    </button>
                  </div>
                </div>

                {/* Question Content */}
                {editingId === q.id ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <textarea
                      className="form-input"
                      value={editForm.question}
                      onChange={e => setEditForm({ ...editForm, question: e.target.value })}
                      rows={2}
                      style={{ resize: 'vertical', fontSize: '0.9rem' }}
                    />
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontWeight: 700, color: 'var(--primary)', minWidth: '20px' }}>A.</span>
                        <input className="form-input" value={editForm.option_a} onChange={e => setEditForm({ ...editForm, option_a: e.target.value })} style={{ fontSize: '0.85rem' }} />
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontWeight: 700, color: 'var(--primary)', minWidth: '20px' }}>B.</span>
                        <input className="form-input" value={editForm.option_b} onChange={e => setEditForm({ ...editForm, option_b: e.target.value })} style={{ fontSize: '0.85rem' }} />
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontWeight: 700, color: 'var(--primary)', minWidth: '20px' }}>C.</span>
                        <input className="form-input" value={editForm.option_c} onChange={e => setEditForm({ ...editForm, option_c: e.target.value })} style={{ fontSize: '0.85rem' }} />
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontWeight: 700, color: 'var(--primary)', minWidth: '20px' }}>D.</span>
                        <input className="form-input" value={editForm.option_d} onChange={e => setEditForm({ ...editForm, option_d: e.target.value })} style={{ fontSize: '0.85rem' }} />
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>Correct:</span>
                      <select className="form-select" value={editForm.correct_answer} onChange={e => setEditForm({ ...editForm, correct_answer: e.target.value })} style={{ width: '80px', fontSize: '0.85rem' }}>
                        <option value="">-</option>
                        <option value="A">A</option>
                        <option value="B">B</option>
                        <option value="C">C</option>
                        <option value="D">D</option>
                      </select>
                    </div>
                  </div>
                ) : (
                  <div>
                    <p style={{ fontWeight: 500, marginBottom: '8px', lineHeight: 1.5, fontSize: '0.95rem' }}>{q.question}</p>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px 16px' }}>
                      {['A', 'B', 'C', 'D'].map(letter => {
                        const optKey = `option_${letter.toLowerCase()}`;
                        const isCorrect = q.correct_answer === letter;
                        return (
                          <div key={letter} style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '4px 8px',
                            borderRadius: 'var(--radius-sm)',
                            background: isCorrect ? 'rgba(16, 185, 129, 0.1)' : 'transparent',
                            border: isCorrect ? '1px solid var(--success)' : '1px solid transparent',
                            fontSize: '0.85rem'
                          }}>
                            {isCorrect && <FiCheck style={{ color: 'var(--success)', flexShrink: 0 }} size={14} />}
                            <span style={{ fontWeight: isCorrect ? 600 : 400 }}>
                              <strong>{letter}.</strong> {q[optKey] || <span style={{ color: 'var(--danger)', fontStyle: 'italic' }}>Missing</span>}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="modal-footer" style={{ borderTop: '1px solid var(--border-color)' }}>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            {invalidCount > 0 && `⚠️ ${invalidCount} invalid questions will be skipped. `}
            <strong>{validCount}</strong> questions will be published.
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button
              className="btn btn-primary"
              onClick={handlePublish}
              disabled={validCount === 0 || loading}
            >
              {loading ? 'Publishing...' : `✅ Publish ${validCount} Questions`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PdfPreviewModal;
