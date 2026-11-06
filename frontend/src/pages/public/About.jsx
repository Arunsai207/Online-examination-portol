const About = () => {
  const techStack = [
    { category: 'Frontend', items: ['React.js', 'React Router', 'Chart.js', 'Axios', 'CSS3'] },
    { category: 'Backend', items: ['Node.js', 'Express.js', 'JWT', 'bcrypt', 'Express Validator'] },
    { category: 'Database', items: ['MySQL', 'mysql2', 'Connection Pool'] },
    { category: 'Tools', items: ['Vite', 'PDFKit', 'ExcelJS', 'Nodemailer'] },
  ];

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '60px 24px' }}>
      <div className="animate-in">
        <h1 style={{ marginBottom: '16px' }}>About This Project</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.125rem', lineHeight: '1.8', marginBottom: '40px' }}>
          The <strong>Online Examination and Result Management System</strong> is a comprehensive full-stack web application 
          developed as a Final Year B.Tech Computer Science Project. It provides a secure and intuitive platform for 
          conducting online examinations, managing student records, and generating performance analytics.
        </p>

        <div className="card" style={{ marginBottom: '32px' }}>
          <div className="card-header"><h3>🎯 Project Objectives</h3></div>
          <div className="card-body">
            <ul style={{ paddingLeft: '20px', lineHeight: '2' }}>
              <li>Develop a secure online examination platform with MCQ-based tests</li>
              <li>Implement role-based access control for administrators and students</li>
              <li>Provide automated evaluation with instant result generation</li>
              <li>Create comprehensive analytics dashboards with visual charts</li>
              <li>Enable PDF and Excel report generation for results</li>
              <li>Build a responsive, mobile-friendly user interface</li>
            </ul>
          </div>
        </div>

        <h2 style={{ marginBottom: '24px' }}>🛠️ Technology Stack</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '40px' }}>
          {techStack.map((tech, i) => (
            <div className="card" key={i}>
              <div className="card-body">
                <h4 style={{ color: 'var(--primary)', marginBottom: '12px' }}>{tech.category}</h4>
                {tech.items.map((item, j) => (
                  <div key={j} style={{ padding: '6px 0', color: 'var(--text-secondary)', fontSize: '0.9375rem' }}>
                    • {item}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="card">
          <div className="card-header"><h3>📋 Key Features</h3></div>
          <div className="card-body" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            {['JWT Authentication', 'Role-Based Access', 'Timed MCQ Exams', 'Auto Evaluation', 'Grade Calculation', 'Performance Charts', 'PDF Reports', 'Excel Export', 'Dark Mode', 'Responsive Design', 'Leaderboard', 'Student Ranking'].map((f, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)' }}>
                <span style={{ color: 'var(--success)' }}>✓</span> {f}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
