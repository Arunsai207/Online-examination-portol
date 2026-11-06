import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { dashboardService } from '../../services/dataService';
import { useAuth } from '../../hooks/useAuth';
import { FiFileText, FiCheckCircle, FiXCircle, FiTrendingUp } from 'react-icons/fi';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchStats(); }, []);

  const fetchStats = async () => {
    try { const res = await dashboardService.getStudentStats(); setStats(res.data.data); }
    catch { console.error('Failed to load dashboard'); }
    finally { setLoading(false); }
  };

  if (loading) return <div className="loader-container"><div className="spinner"></div></div>;

  const cards = [
    { icon: <FiFileText />, label: 'Exams Taken', value: stats?.totalExamsTaken || 0, color: '#6366f1', bg: 'rgba(99,102,241,0.1)' },
    { icon: <FiCheckCircle />, label: 'Passed', value: stats?.totalPassed || 0, color: '#10b981', bg: 'rgba(16,185,129,0.1)' },
    { icon: <FiXCircle />, label: 'Failed', value: stats?.totalFailed || 0, color: '#ef4444', bg: 'rgba(239,68,68,0.1)' },
    { icon: <FiTrendingUp />, label: 'Avg Score', value: `${stats?.avgPercentage || 0}%`, color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
  ];

  const gradeColors = { 'A+': '#10b981', 'A': '#10b981', 'B': '#3b82f6', 'C': '#f59e0b', 'F': '#ef4444' };

  return (
    <div className="animate-in">
      <div className="page-header">
        <h1>Welcome, {user?.name} 👋</h1>
        <p>Here's your exam performance overview</p>
      </div>

      <div className="stats-grid">
        {cards.map((c, i) => (
          <div className="stats-card" key={i}>
            <div className="stats-icon" style={{ background: c.bg, color: c.color }}>{c.icon}</div>
            <div className="stats-info"><h3>{c.value}</h3><p>{c.label}</p></div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginTop: '24px' }}>
        {/* Available Exams Quick Link */}
        <div className="card">
          <div className="card-body text-center" style={{ padding: '40px' }}>
            <div style={{ fontSize: '3rem', marginBottom: '16px' }}>📝</div>
            <h3>Available Exams</h3>
            <p style={{ color: 'var(--text-muted)', margin: '12px 0 24px' }}>{stats?.availableExams || 0} exams available to take</p>
            <Link to="/student/exams" className="btn btn-primary">View Exams</Link>
          </div>
        </div>

        {/* Recent Results */}
        <div className="card">
          <div className="card-header"><h4>Recent Results</h4></div>
          <div className="card-body">
            {!stats?.recentResults?.length ? (
              <p className="text-center text-muted" style={{ padding: '20px' }}>No results yet</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {stats.recentResults.map((r, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', borderRadius: 'var(--radius-md)', background: 'var(--bg-secondary)' }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{r.exam_name}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{r.subject_name}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontWeight: 700, color: gradeColors[r.grade] }}>{r.grade}</span>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginLeft: '8px' }}>{r.percentage}%</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
