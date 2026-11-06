import { useState, useEffect } from 'react';
import { dashboardService, resultService } from '../../services/dataService';
import { FiUsers, FiFileText, FiBookOpen, FiCheckCircle, FiTrendingUp, FiTrendingDown } from 'react-icons/fi';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, PointElement, LineElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import { Bar, Pie, Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, PointElement, LineElement, Title, Tooltip, Legend, Filler);

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await dashboardService.getAdminStats();
      setStats(response.data.data);
    } catch (error) {
      console.error('Failed to load dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loader-container"><div className="spinner"></div></div>;

  const statCards = [
    { icon: <FiUsers />, label: 'Total Students', value: stats?.totalStudents || 0, color: '#6366f1', bg: 'rgba(99,102,241,0.1)' },
    { icon: <FiFileText />, label: 'Total Exams', value: stats?.totalExams || 0, color: '#8b5cf6', bg: 'rgba(139,92,246,0.1)' },
    { icon: <FiBookOpen />, label: 'Total Subjects', value: stats?.totalSubjects || 0, color: '#10b981', bg: 'rgba(16,185,129,0.1)' },
    { icon: <FiCheckCircle />, label: 'Total Attempts', value: stats?.totalAttempts || 0, color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
  ];

  const passFailData = {
    labels: ['Passed', 'Failed'],
    datasets: [{
      data: [stats?.passPercentage || 0, stats?.failPercentage || 0],
      backgroundColor: ['#10b981', '#ef4444'],
      borderWidth: 0,
      hoverOffset: 8
    }]
  };

  const subjectData = {
    labels: stats?.subjectPerformance?.map(s => s.subject_name) || [],
    datasets: [{
      label: 'Avg Percentage',
      data: stats?.subjectPerformance?.map(s => s.avg_percentage) || [],
      backgroundColor: ['#6366f1', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#3b82f6', '#ec4899', '#14b8a6'],
      borderRadius: 8,
      borderSkipped: false,
    }]
  };

  const monthlyData = {
    labels: stats?.monthlyStats?.map(m => m.month) || [],
    datasets: [{
      label: 'Avg Score (%)',
      data: stats?.monthlyStats?.map(m => m.avg_percentage) || [],
      borderColor: '#6366f1',
      backgroundColor: 'rgba(99,102,241,0.1)',
      fill: true,
      tension: 0.4,
      pointBackgroundColor: '#6366f1',
      pointRadius: 5,
    }]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: 'bottom', labels: { padding: 20, usePointStyle: true, font: { family: 'Inter' } } } },
    scales: { y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.05)' } }, x: { grid: { display: false } } }
  };

  return (
    <div className="animate-in">
      <div className="page-header">
        <h1>Admin Dashboard</h1>
        <p>Overview of your examination platform</p>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        {statCards.map((card, i) => (
          <div className="stats-card" key={i}>
            <div className="stats-icon" style={{ background: card.bg, color: card.color }}>
              {card.icon}
            </div>
            <div className="stats-info">
              <h3>{card.value}</h3>
              <p>{card.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Pass/Fail Stats */}
      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
        <div className="stats-card">
          <div className="stats-icon" style={{ background: 'rgba(16,185,129,0.1)', color: '#10b981' }}><FiTrendingUp /></div>
          <div className="stats-info">
            <h3>{stats?.passPercentage || 0}%</h3>
            <p>Pass Rate</p>
          </div>
        </div>
        <div className="stats-card">
          <div className="stats-icon" style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444' }}><FiTrendingDown /></div>
          <div className="stats-info">
            <h3>{stats?.failPercentage || 0}%</h3>
            <p>Fail Rate</p>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="chart-grid" style={{ marginTop: '24px' }}>
        <div className="card">
          <div className="card-header"><h4>Subject-wise Performance</h4></div>
          <div className="card-body" style={{ height: '320px' }}>
            <Bar data={subjectData} options={chartOptions} />
          </div>
        </div>

        <div className="card">
          <div className="card-header"><h4>Pass / Fail Distribution</h4></div>
          <div className="card-body" style={{ height: '320px', display: 'flex', justifyContent: 'center' }}>
            <Pie data={passFailData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { padding: 20, usePointStyle: true, font: { family: 'Inter' } } } } }} />
          </div>
        </div>
      </div>

      <div className="card" style={{ marginTop: '24px' }}>
        <div className="card-header"><h4>Monthly Performance Trend</h4></div>
        <div className="card-body" style={{ height: '320px' }}>
          <Line data={monthlyData} options={chartOptions} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
