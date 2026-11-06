import { useState, useEffect } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import { resultService } from '../../services/dataService';
import toast from 'react-hot-toast';
import { FiDownload, FiHome, FiCheckCircle, FiXCircle } from 'react-icons/fi';

const ExamResult = () => {
  const { attemptId } = useParams();
  const location = useLocation();
  const [result, setResult] = useState(location.state?.result || null);
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(!result);

  useEffect(() => { if (!result) fetchResult(); fetchDetails(); }, [attemptId]);

  const fetchResult = async () => {
    try { const res = await resultService.getDetails(attemptId); setResult(res.data.data.result); }
    catch { toast.error('Failed to load result'); }
    finally { setLoading(false); }
  };

  const fetchDetails = async () => {
    try { const res = await resultService.getDetails(attemptId); setDetails(res.data.data); }
    catch {}
  };

  if (loading) return <div className="loader-container"><div className="spinner"></div></div>;

  const gradeColors = { 'A+': '#10b981', 'A': '#10b981', 'B': '#3b82f6', 'C': '#f59e0b', 'F': '#ef4444' };
  const isPassed = result?.status === 'pass';

  return (
    <div className="animate-in">
      <div className="page-header"><h1>Exam Result</h1></div>

      {/* Result Summary Card */}
      <div className="card" style={{ marginBottom: '24px', overflow: 'visible' }}>
        <div style={{ background: isPassed ? 'linear-gradient(135deg, #10b981, #059669)' : 'linear-gradient(135deg, #ef4444, #dc2626)', padding: '40px', textAlign: 'center', color: 'white', borderRadius: 'var(--radius-lg) var(--radius-lg) 0 0' }}>
          <div style={{ fontSize: '4rem', marginBottom: '16px' }}>{isPassed ? '🎉' : '😞'}</div>
          <h2 style={{ color: 'white', fontSize: '1.75rem' }}>{isPassed ? 'Congratulations! You Passed!' : 'Better Luck Next Time'}</h2>
          <p style={{ opacity: 0.9, marginTop: '8px' }}>{result?.exam_name}</p>
        </div>

        <div className="card-body">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '24px', textAlign: 'center' }}>
            <div>
              <div style={{ fontSize: '2.5rem', fontWeight: 800, color: gradeColors[result?.grade] }}>{result?.percentage}%</div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Percentage</div>
            </div>
            <div>
              <div style={{ fontSize: '2.5rem', fontWeight: 800 }}>{result?.score}/{result?.total_marks}</div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Score</div>
            </div>
            <div>
              <div style={{ fontSize: '2.5rem', fontWeight: 800, color: gradeColors[result?.grade] }}>{result?.grade}</div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Grade</div>
            </div>
            <div>
              <div style={{ fontSize: '2.5rem', fontWeight: 800, color: isPassed ? '#10b981' : '#ef4444' }}>{isPassed ? 'PASS' : 'FAIL'}</div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Status</div>
            </div>
          </div>
        </div>

        <div className="card-footer" style={{ display: 'flex', justifyContent: 'center', gap: '16px' }}>
          <Link to="/student" className="btn btn-outline"><FiHome /> Dashboard</Link>
          <Link to="/student/exams" className="btn btn-primary">Take Another Exam</Link>
        </div>
      </div>

      {/* AI Feedback Section */}
      {result?.ai_feedback && (
        <div className="card" style={{ marginBottom: '24px', border: '2px solid var(--primary)' }}>
          <div className="card-header" style={{ background: 'linear-gradient(to right, rgba(99, 102, 241, 0.1), rgba(168, 85, 247, 0.1))', borderBottom: '1px solid var(--border-color)' }}>
            <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: 0, color: 'var(--primary)' }}>
              ✨ AI Performance Insights
            </h4>
          </div>
          <div className="card-body ai-feedback-container" 
               style={{ padding: '32px' }}
               dangerouslySetInnerHTML={{ __html: result.ai_feedback }} />
        </div>
      )}

      {/* Answer Details */}
      {details?.answers && (
        <div className="card">
          <div className="card-header"><h4>Answer Details</h4></div>
          <div className="card-body">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {details.answers.map((a, i) => (
                <div key={i} style={{ padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', background: a.selected_answer === a.correct_answer ? 'var(--success-bg)' : a.selected_answer ? 'var(--danger-bg)' : 'var(--bg-secondary)' }}>
                  <div style={{ display: 'flex', alignItems: 'start', gap: '12px' }}>
                    <span style={{ flexShrink: 0, marginTop: '2px' }}>
                      {a.selected_answer === a.correct_answer ? <FiCheckCircle color="#10b981" /> : <FiXCircle color="#ef4444" />}
                    </span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, marginBottom: '8px' }}>Q{i+1}. {a.question}</div>
                      <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                        Your Answer: <strong>{a.selected_answer || 'Not Answered'}</strong>
                        {a.selected_answer !== a.correct_answer && (
                          <span style={{ marginLeft: '16px', color: 'var(--success)' }}>Correct: <strong>{a.correct_answer}</strong></span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExamResult;
