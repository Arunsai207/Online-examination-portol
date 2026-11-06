import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { examService } from '../../services/dataService';
import { useTimer } from '../../hooks/useTimer';
import { useProctoring } from '../../hooks/useProctoring';
import toast from 'react-hot-toast';
import { FiChevronLeft, FiChevronRight, FiClock, FiAlertTriangle, FiLock, FiShield } from 'react-icons/fi';
import FaceVerificationModal from '../../components/proctoring/FaceVerificationModal';
import { useAuth } from '../../hooks/useAuth';

const TakeExam = () => {
  const { user } = useAuth();
  const { examId } = useParams();
  const navigate = useNavigate();
  const [examData, setExamData] = useState(null);
  
  // Standard Exam State
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [currentQ, setCurrentQ] = useState(0);
  
  // Adaptive Exam State
  const [adaptiveQuestion, setAdaptiveQuestion] = useState(null);
  const [adaptiveQNum, setAdaptiveQNum] = useState(1);
  const [adaptiveTotal, setAdaptiveTotal] = useState(10);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [attemptId, setAttemptId] = useState(null);

  // Verification State
  const [isVerified, setIsVerified] = useState(false);

  // Anti-Cheating State
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [violationMessage, setViolationMessage] = useState('');

  const { isReady: isProctoringReady, error: proctoringError, videoRef, warnings } = useProctoring(attemptId);

  // Handle General Violations Threshold (5 Strikes)
  useEffect(() => {
    if (warnings.length > 0 && !submitting && examData) {
      const latest = warnings[warnings.length - 1];
      toast.error(`Proctoring Alert: ${latest.description}`, { duration: 5000 });

      const totalViolations = tabSwitchCount + warnings.length;
      if (totalViolations >= 5) {
        toast.error('Maximum violations (5) reached. Auto-submitting exam.');
        submitExam(true);
      }
    }
  }, [warnings, tabSwitchCount, submitting, examData]);

  const handleTimeout = useCallback(() => {
    toast.error('Time is up! Auto-submitting your exam...');
    submitExam(true);
  }, [answers, attemptId, examData, adaptiveQuestion]);

  const { formattedTime, isWarning, isDanger, start, reset } = useTimer(
    examData?.exam?.duration || 0,
    handleTimeout
  );

  const startExam = async () => {
    try {
      const res = await examService.startExam(examId);
      const data = res.data.data;
      setExamData(data);
      setAttemptId(data.attempt_id);
      
      if (data.exam.is_adaptive) {
        setAdaptiveQuestion(data.question);
        setAdaptiveQNum(data.question_number);
        setAdaptiveTotal(data.total_questions);
      } else {
        setQuestions(data.questions);
      }

      setLoading(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to start exam');
      navigate('/student/exams');
    }
  };

  useEffect(() => {
    if (examData && isProctoringReady) {
      reset(examData.exam.duration);
      start();
    }
  }, [examData, isProctoringReady]);

  // Anti-Cheating: Tab Switch Detection
  useEffect(() => {
    if (!examData || submitting) return;

    const handleVisibilityChange = async () => {
      if (document.hidden) {
        const newCount = tabSwitchCount + 1;
        setTabSwitchCount(newCount);
        
        try {
          await examService.recordViolation(attemptId, {
            violation_type: 'tab_switch',
            description: `User switched tabs or minimized browser (Count: ${newCount})`
          });
        } catch (e) {
          console.error('Failed to log violation', e);
        }

        const totalViolations = newCount + warnings.length;
        if (totalViolations >= 5) {
          toast.error('Max violations reached. Auto-submitting exam.');
          submitExam(true);
        } else {
          setViolationMessage(`Tab switch detected. You have ${5 - totalViolations} strikes remaining.`);
          setShowWarningModal(true);
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [examData, submitting, tabSwitchCount, attemptId, warnings.length]);

  const selectAnswer = (questionId, answer) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }));
  };

  const submitAdaptiveQuestion = async () => {
    if (submitting) return;
    
    const selected = answers[adaptiveQuestion.id];
    if (!selected && !confirm('Are you sure you want to skip this question? You cannot go back in an adaptive exam.')) {
      return;
    }

    setSubmitting(true);
    try {
      const res = await examService.submitAdaptiveAnswer(attemptId, {
        question_id: adaptiveQuestion.id,
        selected_answer: selected || null
      });

      const data = res.data.data;
      if (data.completed) {
        toast.success('Adaptive exam completed!');
        navigate(`/student/result/${attemptId}`, { state: { result: data.result } });
      } else {
        setAdaptiveQuestion(data.next_question);
        setAdaptiveQNum(data.question_number);
        setAdaptiveTotal(data.total_questions);
        setSubmitting(false);
      }
    } catch (err) {
      toast.error('Failed to submit answer.');
      setSubmitting(false);
    }
  };

  const submitExam = async (auto = false) => {
    if (submitting) return;
    
    // For adaptive exam auto-submit
    if (examData?.exam?.is_adaptive) {
        if (!auto && !confirm('Submit your final answer and finish?')) return;
        return submitAdaptiveQuestion();
    }

    if (!auto && !confirm('Are you sure you want to submit? You cannot change your answers after submission.')) return;

    setSubmitting(true);
    try {
      const answerList = questions.map(q => ({
        question_id: q.id,
        selected_answer: answers[q.id] || null
      }));

      const res = await examService.submitExam(attemptId, { answers: answerList });
      toast.success('Exam submitted successfully!');
      navigate(`/student/result/${attemptId}`, { state: { result: res.data.data } });
    } catch (err) {
      toast.error('Submission failed. Please try again.');
      setSubmitting(false);
    }
  };

  if (proctoringError) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-secondary)', padding: '20px', textAlign: 'center' }}>
      <div className="card" style={{ maxWidth: '500px' }}>
        <FiAlertTriangle size={48} color="var(--danger)" style={{ marginBottom: '16px' }} />
        <h2 style={{ color: 'var(--danger)' }}>Proctoring Error</h2>
        <p>{proctoringError}</p>
        <button className="btn btn-primary" style={{ marginTop: '20px' }} onClick={() => window.location.reload()}>Try Again</button>
      </div>
    </div>
  );

  // 1. Require Face Registration
  if (user && !user.face_descriptor) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-secondary)', padding: '20px', textAlign: 'center' }}>
        <div className="card" style={{ maxWidth: '500px' }}>
          <FiLock size={48} color="var(--primary)" style={{ marginBottom: '16px' }} />
          <h2>Face Registration Required</h2>
          <p style={{ marginTop: '12px', color: 'var(--text-muted)' }}>
            This exam is proctored. You must register your biometric face profile before you can start.
          </p>
          <button className="btn btn-primary" style={{ marginTop: '20px' }} onClick={() => navigate('/student/profile')}>
            Go to Profile Setup
          </button>
        </div>
      </div>
    );
  }

  // 2. Face Verification Step
  if (!isVerified) {
    return (
      <FaceVerificationModal 
        userDescriptor={user?.face_descriptor} 
        onVerified={() => {
          setIsVerified(true);
          startExam();
        }} 
        onCancel={() => navigate('/student/exams')} 
      />
    );
  }

  if (loading || !isProctoringReady || !examData) return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-secondary)', gap: '16px' }}>
      <div className="spinner"></div>
      <div style={{ color: 'var(--text-muted)' }}>
        {loading ? 'Loading Exam...' : 'Initializing AI Proctoring System...'}
      </div>
    </div>
  );

  const isAdaptive = examData.exam.is_adaptive;
  const currentQuestion = isAdaptive ? adaptiveQuestion : questions[currentQ];
  const answeredCount = Object.keys(answers).length;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-secondary)' }}>
      {/* Sidebar: Proctoring Info */}
      <div style={{ position: 'fixed', left: 0, top: 0, bottom: 0, width: '280px', background: 'var(--bg-primary)', borderRight: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '20px', borderBottom: '1px solid var(--border-color)' }}>
            <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.1rem' }}>
                <FiShield color="var(--primary)" /> Proctoring Active
            </h3>
        </div>
        <div style={{ padding: '20px', flex: 1 }}>
            {/* Proctoring Webcam PIP */}
            <div style={{ position: 'relative', width: '100%', aspectRatio: '4/3', borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '2px solid var(--border-color)', background: '#000', marginBottom: '20px' }}>
                <video ref={videoRef} autoPlay playsInline muted style={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'scaleX(-1)' }} />
                <div style={{ position: 'absolute', top: 8, right: 8, fontSize: '0.75rem', background: 'rgba(0,0,0,0.7)', padding: '4px 8px', borderRadius: '4px', color: '#fff', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--danger)', display: 'inline-block', animation: 'pulse 1.5s infinite' }}></span> REC
                </div>
            </div>

            <div style={{ background: 'var(--bg-secondary)', padding: '16px', borderRadius: 'var(--radius-md)' }}>
                <h4 style={{ margin: '0 0 12px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Status</h4>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', fontSize: '0.9rem' }}>
                    <FiClock color="var(--primary)" /> {formattedTime} left
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', color: (warnings.length + tabSwitchCount) > 0 ? 'var(--warning)' : 'var(--success)' }}>
                    <FiAlertTriangle /> {warnings.length + tabSwitchCount} Violations
                </div>
                <div style={{ marginTop: '12px', height: '6px', background: 'var(--border-color)', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ width: `${((warnings.length + tabSwitchCount) / 5) * 100}%`, height: '100%', background: (warnings.length + tabSwitchCount) >= 3 ? 'var(--danger)' : 'var(--warning)' }}></div>
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px', textAlign: 'right' }}>
                    Max 5 strikes
                </div>
            </div>
        </div>
      </div>

      <div style={{ marginLeft: '280px', padding: '0' }}>
        <div className="exam-header" style={{ margin: '0', borderRadius: 0, padding: '20px 40px' }}>
            <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <h2 style={{ fontSize: '1.5rem', margin: 0 }}>{examData.exam.exam_name}</h2>
                {isAdaptive && <span style={{ background: 'linear-gradient(135deg, #8b5cf6, #3b82f6)', color: 'white', padding: '4px 10px', borderRadius: '99px', fontSize: '0.75rem', fontWeight: 600 }}>Adaptive Mode</span>}
            </div>
            <p style={{ opacity: 0.8, fontSize: '0.875rem', marginTop: '4px' }}>
                {isAdaptive ? `Question ${adaptiveQNum} of ${adaptiveTotal}` : `${answeredCount}/${questions.length} answered`}
            </p>
            </div>
            <div style={{ textAlign: 'right' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', opacity: 0.8, fontSize: '0.875rem' }}><FiClock /> Time Remaining</div>
                <div className={`exam-timer ${isWarning ? 'warning' : ''} ${isDanger ? 'danger' : ''}`}>
                {formattedTime}
                </div>
            </div>
        </div>

        <div className="exam-container" style={{ padding: '40px' }}>
            {!isAdaptive && (
                <div className="card" style={{ marginBottom: '24px' }}>
                <div className="question-indicators">
                    {questions.map((_, i) => (
                    <button key={i} className={`q-indicator ${answers[questions[i].id] ? 'answered' : ''} ${i === currentQ ? 'current' : ''}`}
                        onClick={() => setCurrentQ(i)}>
                        {i + 1}
                    </button>
                    ))}
                </div>
                </div>
            )}

            {currentQuestion ? (
                <div className="question-card animate-in" key={currentQuestion.id}>
                <div className="question-number">Question {isAdaptive ? adaptiveQNum : currentQ + 1}</div>
                <div className="question-text">{currentQuestion.question}</div>
                <div className="option-list">
                    {['A', 'B', 'C', 'D'].map(opt => {
                    const optKey = `option_${opt.toLowerCase()}`;
                    return (
                        <div key={opt} className={`option-item ${answers[currentQuestion.id] === opt ? 'selected' : ''}`}
                        onClick={() => selectAnswer(currentQuestion.id, opt)}>
                        <span className="option-letter">{opt}</span>
                        <span>{currentQuestion[optKey]}</span>
                        </div>
                    );
                    })}
                </div>
                </div>
            ) : (
                <div className="card text-center">
                    <h3>No more questions available.</h3>
                </div>
            )}

            <div className="question-nav" style={{ marginTop: '32px' }}>
                {!isAdaptive ? (
                    <>
                    <button className="btn btn-outline" onClick={() => setCurrentQ(prev => Math.max(0, prev - 1))} disabled={currentQ === 0}>
                        <FiChevronLeft /> Previous
                    </button>

                    <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                        {currentQ + 1} / {questions.length}
                    </span>

                    {currentQ < questions.length - 1 ? (
                        <button className="btn btn-primary" onClick={() => setCurrentQ(prev => prev + 1)}>
                        Next <FiChevronRight />
                        </button>
                    ) : (
                        <button className="btn btn-success" onClick={() => submitExam(false)} disabled={submitting}>
                        {submitting ? 'Submitting...' : 'Submit Exam'}
                        </button>
                    )}
                    </>
                ) : (
                    <div style={{ display: 'flex', justifyContent: 'flex-end', width: '100%' }}>
                        <button className="btn btn-primary" onClick={submitAdaptiveQuestion} disabled={submitting || !currentQuestion}>
                            {submitting ? 'Processing...' : (adaptiveQNum >= adaptiveTotal ? 'Finish Exam' : 'Submit & Next')}
                        </button>
                    </div>
                )}
            </div>
        </div>
      </div>

      {showWarningModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '400px', textAlign: 'center', padding: '32px' }}>
            <FiAlertTriangle size={48} color="var(--danger)" style={{ marginBottom: '16px' }} />
            <h2 style={{ color: 'var(--danger)', marginBottom: '12px' }}>Warning Detected</h2>
            <p style={{ marginBottom: '16px', lineHeight: 1.5 }}>
              {violationMessage}
            </p>
            <div style={{ background: 'var(--bg-secondary)', padding: '12px', borderRadius: 'var(--radius-md)', marginBottom: '24px' }}>
              <strong>Violation {tabSwitchCount + warnings.length} of 5</strong>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                Your exam will be automatically submitted on the 5th violation.
              </p>
            </div>
            <button className="btn btn-primary" style={{ width: '100%' }} onClick={() => setShowWarningModal(false)}>
              I Understand, Return to Exam
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TakeExam;
