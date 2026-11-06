import { useState, useEffect } from 'react';
import { resultService } from '../../services/dataService';
import toast from 'react-hot-toast';
import { FiSearch, FiDownload } from 'react-icons/fi';

const Results = () => {
  const [results, setResults] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedLogs, setSelectedLogs] = useState(null);
  const [loadingLogs, setLoadingLogs] = useState(false);

  useEffect(() => { fetchResults(); }, [page, search]);

  const viewLogs = async (attemptId) => {
    try {
      setLoadingLogs(true);
      const res = await resultService.getDetails(attemptId);
      setSelectedLogs(res.data.data.proctoringLogs || []);
    } catch {
      toast.error('Failed to load proctoring logs');
    } finally {
      setLoadingLogs(false);
    }
  };

  const fetchResults = async () => {
    try { setLoading(true); const res = await resultService.getAll({ page, limit: 10, search }); setResults(res.data.data.results); setTotalPages(res.data.data.totalPages); }
    catch { toast.error('Failed to load results'); }
    finally { setLoading(false); }
  };

  const gradeColors = { 'A+': '#10b981', 'A': '#10b981', 'B': '#3b82f6', 'C': '#f59e0b', 'F': '#ef4444' };

  return (
    <div className="animate-in">
      <div className="page-header"><h1>Exam Results</h1><p>View all student results</p></div>

      <div className="card">
        <div className="card-header">
          <div className="search-bar"><FiSearch className="search-icon" /><input placeholder="Search by student, exam, or subject..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} /></div>
        </div>
        <div className="data-table-container">
          {loading ? <div className="loader-container"><div className="spinner"></div></div> : (
            <table className="data-table">
              <thead><tr><th>#</th><th>Student</th><th>Exam</th><th>Subject</th><th>Score</th><th>Percentage</th><th>Grade</th><th>Status</th><th>Date</th><th>Actions</th></tr></thead>
              <tbody>
                {results.length === 0 ? <tr><td colSpan="9" className="text-center" style={{ padding: '40px' }}>No results found</td></tr> :
                results.map((r, i) => (
                  <tr key={r.id}>
                    <td>{(page-1)*10+i+1}</td>
                    <td style={{ fontWeight: 600 }}>{r.student_name}</td>
                    <td>{r.exam_name}</td>
                    <td>{r.subject_name}</td>
                    <td>{r.score}/{r.total_marks}</td>
                    <td>{r.percentage}%</td>
                    <td><span style={{ fontWeight: 700, color: gradeColors[r.grade] || '#64748b' }}>{r.grade}</span></td>
                    <td><span className={`badge ${r.status === 'pass' ? 'badge-success' : 'badge-danger'}`}>{r.status}</span></td>
                    <td>{new Date(r.created_at).toLocaleDateString()}</td>
                    <td>
                      <button className="btn btn-outline" style={{ padding: '4px 8px', fontSize: '0.75rem' }} onClick={() => viewLogs(r.attempt_id)}>
                        View AI Logs
                      </button>
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
      {/* Logs Modal */}
      {selectedLogs !== null && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="card animate-in" style={{ width: '90%', maxWidth: '500px', maxHeight: '80vh', overflowY: 'auto' }}>
            <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0 }}>AI Proctoring Logs</h3>
              <button style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: 'var(--text-muted)' }} onClick={() => setSelectedLogs(null)}>&times;</button>
            </div>
            <div className="card-body">
              {selectedLogs.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)' }}>No AI violations detected.</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {selectedLogs.map(log => (
                    <div key={log.id} style={{ padding: '12px', border: '1px solid var(--danger-bg)', borderRadius: 'var(--radius-md)', background: 'var(--bg-secondary)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <span style={{ fontWeight: 600, color: 'var(--danger)', textTransform: 'capitalize' }}>
                          {log.violation_type.replace('_', ' ')}
                        </span>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          {new Date(log.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      {log.description && <div style={{ fontSize: '0.875rem' }}>{log.description}</div>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Results;
