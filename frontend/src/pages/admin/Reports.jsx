import { useState, useEffect } from 'react';
import { resultService, reportService } from '../../services/dataService';
import toast from 'react-hot-toast';
import { FiDownload, FiFileText, FiPieChart } from 'react-icons/fi';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend);

const Reports = () => {
  const [subjectPerf, setSubjectPerf] = useState([]);
  const [passFailStats, setPassFailStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [perfRes, statsRes] = await Promise.all([resultService.getSubjectPerformance(), resultService.getStats()]);
      setSubjectPerf(perfRes.data.data);
      setPassFailStats(statsRes.data.data);
    } catch { toast.error('Failed to load report data'); }
    finally { setLoading(false); }
  };

  const exportExcel = async () => {
    try {
      const res = await reportService.exportExcel();
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'exam_results.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Excel exported successfully');
    } catch { toast.error('Export failed'); }
  };

  if (loading) return <div className="loader-container"><div className="spinner"></div></div>;

  const barData = {
    labels: subjectPerf.map(s => s.subject_name),
    datasets: [
      { label: 'Passed', data: subjectPerf.map(s => s.passed), backgroundColor: '#10b981', borderRadius: 6 },
      { label: 'Failed', data: subjectPerf.map(s => s.failed), backgroundColor: '#ef4444', borderRadius: 6 },
    ]
  };

  return (
    <div className="animate-in">
      <div className="page-header flex-between">
        <div><h1>Reports & Analytics</h1><p>Performance analytics and data export</p></div>
        <button className="btn btn-success" onClick={exportExcel}><FiDownload /> Export Excel</button>
      </div>

      {/* Summary Cards */}
      <div className="stats-grid">
        <div className="stats-card">
          <div className="stats-icon" style={{ background: 'rgba(99,102,241,0.1)', color: '#6366f1' }}><FiFileText /></div>
          <div className="stats-info"><h3>{passFailStats?.total || 0}</h3><p>Total Results</p></div>
        </div>
        <div className="stats-card">
          <div className="stats-icon" style={{ background: 'rgba(16,185,129,0.1)', color: '#10b981' }}><FiPieChart /></div>
          <div className="stats-info"><h3>{passFailStats?.passed || 0}</h3><p>Students Passed</p></div>
        </div>
        <div className="stats-card">
          <div className="stats-icon" style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444' }}><FiPieChart /></div>
          <div className="stats-info"><h3>{passFailStats?.failed || 0}</h3><p>Students Failed</p></div>
        </div>
      </div>

      {/* Charts */}
      <div className="chart-grid">
        <div className="card">
          <div className="card-header"><h4>Subject-wise Pass/Fail</h4></div>
          <div className="card-body" style={{ height: '340px' }}>
            <Bar data={barData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } }, scales: { y: { beginAtZero: true } } }} />
          </div>
        </div>
        <div className="card">
          <div className="card-header"><h4>Overall Performance</h4></div>
          <div className="card-body" style={{ height: '340px', display: 'flex', justifyContent: 'center' }}>
            <Pie data={{ labels: ['Passed', 'Failed'], datasets: [{ data: [passFailStats?.passed || 0, passFailStats?.failed || 0], backgroundColor: ['#10b981', '#ef4444'], borderWidth: 0 }] }} options={{ responsive: true, maintainAspectRatio: false }} />
          </div>
        </div>
      </div>

      {/* Subject Table */}
      <div className="card" style={{ marginTop: '24px' }}>
        <div className="card-header"><h4>Subject-wise Performance Details</h4></div>
        <div className="data-table-container">
          <table className="data-table">
            <thead><tr><th>Subject</th><th>Total Attempts</th><th>Avg %</th><th>Passed</th><th>Failed</th><th>Pass Rate</th></tr></thead>
            <tbody>
              {subjectPerf.map((s, i) => (
                <tr key={i}>
                  <td style={{ fontWeight: 600 }}>{s.subject_name}</td>
                  <td>{s.total_attempts}</td>
                  <td>{s.avg_percentage}%</td>
                  <td style={{ color: 'var(--success)' }}>{s.passed}</td>
                  <td style={{ color: 'var(--danger)' }}>{s.failed}</td>
                  <td>{s.total_attempts > 0 ? ((s.passed / s.total_attempts) * 100).toFixed(1) : 0}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Reports;
