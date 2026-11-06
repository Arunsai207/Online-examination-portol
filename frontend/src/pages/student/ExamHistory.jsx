import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { resultService } from '../../services/dataService';
import toast from 'react-hot-toast';
import { FiEye } from 'react-icons/fi';

const ExamHistory = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchResults(); }, []);

  const fetchResults = async () => {
    try { const res = await resultService.getMyResults(); setResults(res.data.data); }
    catch { toast.error('Failed to load history'); }
    finally { setLoading(false); }
  };

  const gradeColors = { 'A+': '#10b981', 'A': '#10b981', 'B': '#3b82f6', 'C': '#f59e0b', 'F': '#ef4444' };

  if (loading) return <div className="loader-container"><div className="spinner"></div></div>;

  return (
    <div className="animate-in">
      <div className="page-header"><h1>Exam History</h1><p>{results.length} exams completed</p></div>

      {results.length === 0 ? (
        <div className="card"><div className="card-body text-center" style={{ padding: '60px' }}>
          <div style={{ fontSize: '3rem', marginBottom: '16px' }}>📊</div>
          <h3>No Exam History</h3>
          <p style={{ color: 'var(--text-muted)', margin: '12px 0 24px' }}>You haven't taken any exams yet.</p>
          <Link to="/student/exams" className="btn btn-primary">Browse Exams</Link>
        </div></div>
      ) : (
        <div className="card">
          <div className="data-table-container">
            <table className="data-table">
              <thead><tr><th>#</th><th>Exam</th><th>Subject</th><th>Score</th><th>Percentage</th><th>Grade</th><th>Status</th><th>Date</th><th>Action</th></tr></thead>
              <tbody>
                {results.map((r, i) => (
                  <tr key={r.id}>
                    <td>{i+1}</td>
                    <td style={{ fontWeight: 600 }}>{r.exam_name}</td>
                    <td>{r.subject_name}</td>
                    <td>{r.score}/{r.total_marks}</td>
                    <td>{r.percentage}%</td>
                    <td><span style={{ fontWeight: 700, color: gradeColors[r.grade] }}>{r.grade}</span></td>
                    <td><span className={`badge ${r.status === 'pass' ? 'badge-success' : 'badge-danger'}`}>{r.status}</span></td>
                    <td>{new Date(r.created_at).toLocaleDateString()}</td>
                    <td><Link to={`/student/result/${r.attempt_id}`} className="btn btn-ghost btn-sm"><FiEye /> View</Link></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExamHistory;
