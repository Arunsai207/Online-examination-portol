import { Link } from 'react-router-dom';
import { FiCheckCircle, FiClock, FiShield, FiBarChart2, FiUsers, FiAward } from 'react-icons/fi';

const Home = () => {
  const features = [
    { icon: <FiCheckCircle />, title: 'Online MCQ Exams', desc: 'Take multiple-choice exams from anywhere with our secure online platform.', color: '#6366f1' },
    { icon: <FiClock />, title: 'Timer-Based Tests', desc: 'Timed examinations with auto-submit to ensure fair testing conditions.', color: '#8b5cf6' },
    { icon: <FiBarChart2 />, title: 'Instant Results', desc: 'Get your results and detailed analysis immediately after exam submission.', color: '#10b981' },
    { icon: <FiShield />, title: 'Secure Platform', desc: 'JWT authentication, encrypted passwords, and role-based access control.', color: '#f59e0b' },
    { icon: <FiUsers />, title: 'Admin Dashboard', desc: 'Comprehensive admin panel to manage exams, students, and results.', color: '#ef4444' },
    { icon: <FiAward />, title: 'Performance Analytics', desc: 'Charts, rankings, and subject-wise analysis to track student performance.', color: '#3b82f6' },
  ];

  return (
    <div>
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content animate-in">
          <h1>Online Examination & Result Management System</h1>
          <p>
            A comprehensive platform for conducting online examinations, managing results, 
            and tracking academic performance with real-time analytics and secure assessment tools.
          </p>
          <div className="hero-buttons">
            <Link to="/register" className="btn btn-primary btn-lg">
              Get Started — Register Now
            </Link>
            <Link to="/login" className="btn btn-lg" style={{ background: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid rgba(255,255,255,0.2)' }}>
              Login to Dashboard
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="text-center">
          <h2>Powerful Features</h2>
          <p className="text-muted" style={{ marginTop: '12px', fontSize: '1.1rem' }}>
            Everything you need for online examination management
          </p>
        </div>
        <div className="features-grid">
          {features.map((feature, index) => (
            <div className="feature-card" key={index}>
              <div className="feature-icon" style={{ background: `${feature.color}15`, color: feature.color }}>
                {feature.icon}
              </div>
              <h3>{feature.title}</h3>
              <p>{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Stats Section */}
      <section style={{ background: 'linear-gradient(135deg, #0f172a, #1e1b4b)', padding: '80px 24px', textAlign: 'center', color: 'white' }}>
        <h2 style={{ color: 'white', marginBottom: '48px' }}>Built for Excellence</h2>
        <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '48px', maxWidth: '900px', margin: '0 auto' }}>
          {[
            { value: '100%', label: 'Secure' },
            { value: 'Real-time', label: 'Results' },
            { value: 'MCQ', label: 'Based Exams' },
            { value: 'PDF/Excel', label: 'Reports' },
          ].map((stat, i) => (
            <div key={i} style={{ minWidth: '150px' }}>
              <div style={{ fontSize: '2.5rem', fontWeight: 800, background: 'linear-gradient(135deg, #818cf8, #c084fc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                {stat.value}
              </div>
              <div style={{ color: '#94a3b8', marginTop: '8px', fontSize: '1rem' }}>{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section style={{ padding: '80px 24px', textAlign: 'center' }}>
        <h2>Ready to Get Started?</h2>
        <p className="text-muted" style={{ marginTop: '12px', fontSize: '1.1rem', marginBottom: '32px' }}>
          Join our platform and experience seamless online examinations
        </p>
        <div className="hero-buttons">
          <Link to="/register" className="btn btn-primary btn-lg">Create Account</Link>
          <Link to="/about" className="btn btn-outline btn-lg">Learn More</Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
