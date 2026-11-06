import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { examService } from '../../services/dataService';
import toast from 'react-hot-toast';
import { FiClock, FiFileText, FiPlay } from 'react-icons/fi';

const AvailableExams = () => {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;
    examService.getAvailable()
      .then(res => { if (isMounted) setExams(res.data.data); })
      .catch(() => { if (isMounted) toast.error('Failed to load exams'); })
      .finally(() => { if (isMounted) setLoading(false); });
    return () => { isMounted = false; };
  }, []);

  const startExam = (exam) => {
    if (Number(exam.attempted) > 0) {
      return toast.error('You have already completed this exam');
    }
    if (Number(exam.can_start) !== 1) {
      return toast.error('This exam is not ready to start yet. Check its status, schedule, and questions.');
    }
    if (confirm(`Start "${exam.exam_name}"?\n\nDuration: ${exam.duration} minutes\nTotal Marks: ${exam.total_marks}\nQuestions: ${exam.question_count}\n\nOnce started, the timer cannot be paused.`)) {
      navigate(`/student/exam/${exam.id}`);
    }
  };

  if (loading) return <div className="loader-container"><div className="spinner"></div></div>;

  return (
    <div className="animate-in">
      <div className="page-header"><h1>Available Exams</h1><p>{exams.length} exams available</p></div>

      {exams.length === 0 ? (
        <div className="card"><div className="card-body text-center" style={{ padding: '60px' }}>
          <div style={{ fontSize: '3rem', marginBottom: '16px' }}>📋</div>
          <h3>No Exams Available</h3>
          <p style={{ color: 'var(--text-muted)', marginTop: '8px' }}>Check back later for new exams.</p>
        </div></div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '20px' }}>
          {exams.map(exam => (
            <div className="card" key={exam.id} style={{ transition: 'all 0.3s' }}>
              <div className="card-body">
                <div className="flex-between" style={{ marginBottom: '16px' }}>
                  <span className="badge badge-primary">{exam.subject_name}</span>
                  {Number(exam.attempted) > 0
                    ? <span className="badge badge-success">Completed</span>
                    : <span className={`badge ${exam.status === 'active' ? 'badge-success' : 'badge-warning'}`}>{exam.status === 'active' ? 'Active' : 'Upcoming'}</span>}
                </div>
                <h3 style={{ fontSize: '1.125rem', marginBottom: '12px' }}>{exam.exam_name}</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><FiClock /> {exam.duration} minutes</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><FiFileText /> {exam.question_count} questions • {exam.total_marks} marks</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>📅 {new Date(exam.exam_date).toLocaleDateString()}</div>
                </div>
              </div>
              <div className="card-footer">
                <button className="btn btn-primary w-full" style={{ justifyContent: 'center' }} onClick={() => startExam(exam)} disabled={Number(exam.attempted) > 0 || Number(exam.can_start) !== 1}>
                  <FiPlay />
                  {Number(exam.attempted) > 0
                    ? 'Already Completed'
                    : Number(exam.can_start) === 1
                      ? 'Start Exam'
                      : Number(exam.question_count) < 1
                        ? 'Questions Pending'
                        : exam.status !== 'active'
                          ? 'Awaiting Activation'
                          : 'Not Yet Available'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AvailableExams;
