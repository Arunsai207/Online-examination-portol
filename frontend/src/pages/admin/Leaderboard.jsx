import { useEffect, useState } from 'react';
import { resultService } from '../../services/dataService';
import toast from 'react-hot-toast';
import { FiAward, FiRefreshCw, FiSearch } from 'react-icons/fi';

const Leaderboard = () => {
  const [data, setData] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      const response = await resultService.getLeaderboard({ page, limit: 20, search });
      const result = response.data.data;
      setData(result.results || []);
      setTotal(result.total || 0);
      setTotalPages(Math.max(result.totalPages || 1, 1));
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to load global leaderboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchLeaderboard(); }, [page, search]);

  return (
    <div className="animate-in">
      <div className="page-header">
        <h1><FiAward style={{ marginRight: 8 }} /> Global Student Performance</h1>
        <p>Admin-only overview of every registered student's completed examination performance.</p>
      </div>
      <div className="card">
        <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
          <div><h4 style={{ margin: 0 }}>All Students</h4><small>{total} registered students</small></div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            <div className="search-bar"><FiSearch className="search-icon" /><input aria-label="Search students" placeholder="Search name or email..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} /></div>
            <button className="btn btn-outline" onClick={fetchLeaderboard} disabled={loading}><FiRefreshCw /> Refresh</button>
          </div>
        </div>
        <div className="data-table-container">
          {loading ? <div className="loader-container"><div className="spinner" /></div> : (
            <table className="data-table">
              <thead><tr><th>Rank</th><th>Student</th><th>Email</th><th>Average Score</th><th>Exams Taken</th><th>Passed</th><th>Performance</th></tr></thead>
              <tbody>
                {data.length === 0 ? <tr><td colSpan="7" className="text-center" style={{ padding: 40 }}>No students found.</td></tr> : data.map((student, index) => (
                  <tr key={student.student_id}>
                    <td style={{ fontWeight: 700 }}>{student.rank_position ? `#${student.rank_position}` : '—'}</td>
                    <td style={{ fontWeight: 600 }}>{student.student_name}</td>
                    <td>{student.student_email}</td>
                    <td>{student.avg_percentage === null ? '—' : `${Number(student.avg_percentage).toFixed(2)}%`}</td>
                    <td>{student.exams_taken}</td>
                    <td><span className="badge badge-success">{student.passed}</span></td>
                    <td>{student.exams_taken === 0 ? <span className="badge">Not attempted</span> : Number(student.avg_percentage) >= 75 ? <span className="badge badge-success">Strong</span> : Number(student.avg_percentage) >= 40 ? <span className="badge">Average</span> : <span className="badge badge-danger">Needs improvement</span>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        {totalPages > 1 && <div className="card-footer"><div className="pagination">
          <button className="pagination-btn" disabled={page <= 1 || loading} onClick={() => setPage(p => p - 1)}>←</button>
          <span style={{ padding: '8px 12px' }}>Page {page} of {totalPages}</span>
          <button className="pagination-btn" disabled={page >= totalPages || loading} onClick={() => setPage(p => p + 1)}>→</button>
        </div></div>}
      </div>
    </div>
  );
};

export default Leaderboard;
