import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import api from '../../services/api';

const ExamInterface = () => {
  const { examId, attemptId } = useParams();
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [exam, setExam] = useState(null);
  const [attempt, setAttempt] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showWarning, setShowWarning] = useState(false);

  useEffect(() => {
    fetchExamData();
    const interval = setInterval(() => {
      handleTabSwitch();
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (exam && attempt) {
      const endTime = new Date(attempt.start_time).getTime() + (exam.duration * 60 * 1000);
      const updateTimer = () => {
        const now = Date.now();
        const remaining = Math.max(0, Math.floor((endTime - now) / 1000));
        setTimeRemaining(remaining);
        if (remaining === 0) {
          handleAutoSubmit();
        }
      };
      updateTimer();
      const timerInterval = setInterval(updateTimer, 1000);
      return () => clearInterval(timerInterval);
    }
  }, [exam, attempt]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        handleTabSwitch();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  const fetchExamData = async () => {
    try {
      const response = await api.get(`/applicant/attempts/${attemptId}/questions`);
      setQuestions(response.data.questions);
      setExam(response.data.exam);
      setAttempt(response.data.attempt);
      setAnswers(response.data.answers || {});
    } catch (error) {
      console.error('Error fetching exam data:', error);
      alert('Failed to load exam. Redirecting...');
      navigate('/applicant/exams');
    } finally {
      setLoading(false);
    }
  };

  const handleTabSwitch = async () => {
    if (document.hidden) {
      try {
        await api.post(`/applicant/attempts/${attemptId}/tab-switch`);
      } catch (error) {
        console.error('Error recording tab switch:', error);
      }
    }
  };

  const handleAnswerChange = async (questionId, option) => {
    const newAnswers = { ...answers, [questionId]: option };
    setAnswers(newAnswers);
    
    try {
      await api.post(`/applicant/attempts/${attemptId}/answers`, {
        questionId,
        selectedOption: option
      });
    } catch (error) {
      console.error('Error saving answer:', error);
    }
  };

  const handleSubmit = async () => {
    const unanswered = questions.filter(q => !answers[q.id]);
    if (unanswered.length > 0) {
      setShowWarning(true);
      return;
    }

    if (!window.confirm('Are you sure you want to submit? You cannot change answers after submission.')) {
      return;
    }

    setSubmitting(true);
    try {
      await api.post(`/applicant/attempts/${attemptId}/submit`);
      alert('Exam submitted successfully!');
      navigate('/applicant/results');
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to submit exam');
      setSubmitting(false);
    }
  };

  const handleAutoSubmit = async () => {
    try {
      await api.post(`/applicant/attempts/${attemptId}/submit`);
      alert('Time is up! Your exam has been automatically submitted.');
      navigate('/applicant/results');
    } catch (error) {
      console.error('Error auto-submitting:', error);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading || !exam || !questions.length) {
    return <Layout role="applicant"><div>Loading...</div></Layout>;
  }

  const question = questions[currentQuestion];
  const unansweredCount = questions.filter(q => !answers[q.id]).length;

  return (
    <Layout role="applicant">
      <div style={{ display: 'flex', gap: '2rem' }}>
        <div style={{ flex: 1 }}>
          <div style={{ 
            backgroundColor: timeRemaining < 300 ? '#fee2e2' : '#dbeafe', 
            padding: '1rem', 
            borderRadius: '8px', 
            marginBottom: '1rem',
            textAlign: 'center'
          }}>
            <h2 style={{ margin: 0, color: timeRemaining < 300 ? '#dc2626' : '#1e40af' }}>
              Time Remaining: {formatTime(timeRemaining)}
            </h2>
          </div>

          <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
            <div style={{ marginBottom: '1.5rem' }}>
              <span style={{ color: '#6b7280' }}>Question {currentQuestion + 1} of {questions.length}</span>
            </div>
            <h2 style={{ marginBottom: '1.5rem', color: '#1f2937' }}>{question.question_text}</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {['A', 'B', 'C', 'D'].map((option) => (
                <label
                  key={option}
                  style={{
                    padding: '1rem',
                    border: answers[question.id] === option ? '2px solid #3b82f6' : '1px solid #e5e7eb',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    backgroundColor: answers[question.id] === option ? '#eff6ff' : 'white'
                  }}
                >
                  <input
                    type="radio"
                    name={`question-${question.id}`}
                    value={option}
                    checked={answers[question.id] === option}
                    onChange={() => handleAnswerChange(question.id, option)}
                    style={{ marginRight: '0.5rem' }}
                  />
                  <strong>{option}:</strong> {question[`option_${option.toLowerCase()}`]}
                </label>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1.5rem' }}>
            <button
              onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
              disabled={currentQuestion === 0}
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: currentQuestion === 0 ? '#e5e7eb' : '#3b82f6',
                color: currentQuestion === 0 ? '#9ca3af' : 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: currentQuestion === 0 ? 'not-allowed' : 'pointer'
              }}
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentQuestion(Math.min(questions.length - 1, currentQuestion + 1))}
              disabled={currentQuestion === questions.length - 1}
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: currentQuestion === questions.length - 1 ? '#e5e7eb' : '#3b82f6',
                color: currentQuestion === questions.length - 1 ? '#9ca3af' : 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: currentQuestion === questions.length - 1 ? 'not-allowed' : 'pointer'
              }}
            >
              Next
            </button>
          </div>

          <div style={{ marginTop: '2rem', textAlign: 'center' }}>
            <button
              onClick={handleSubmit}
              disabled={submitting}
              style={{
                padding: '0.75rem 3rem',
                backgroundColor: '#10b981',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontSize: '1.1rem',
                fontWeight: 'bold',
                cursor: submitting ? 'not-allowed' : 'pointer',
                opacity: submitting ? 0.6 : 1
              }}
            >
              {submitting ? 'Submitting...' : 'Submit Exam'}
            </button>
          </div>
        </div>

        <div style={{ width: '300px' }}>
          <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
            <h3 style={{ marginBottom: '1rem', color: '#1f2937' }}>Question Palette</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '0.5rem' }}>
              {questions.map((q, idx) => (
                <button
                  key={q.id}
                  onClick={() => setCurrentQuestion(idx)}
                  style={{
                    padding: '0.75rem',
                    backgroundColor: currentQuestion === idx ? '#3b82f6' : answers[q.id] ? '#10b981' : '#e5e7eb',
                    color: currentQuestion === idx || answers[q.id] ? 'white' : '#1f2937',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontWeight: currentQuestion === idx ? 'bold' : 'normal'
                  }}
                >
                  {idx + 1}
                </button>
              ))}
            </div>
            <div style={{ marginTop: '1rem', padding: '1rem', backgroundColor: '#f3f4f6', borderRadius: '6px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <div style={{ width: '20px', height: '20px', backgroundColor: '#10b981', borderRadius: '4px' }}></div>
                <span style={{ fontSize: '0.875rem' }}>Answered</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ width: '20px', height: '20px', backgroundColor: '#e5e7eb', borderRadius: '4px' }}></div>
                <span style={{ fontSize: '0.875rem' }}>Not Answered</span>
              </div>
            </div>
            <div style={{ marginTop: '1rem', padding: '1rem', backgroundColor: '#fef3c7', borderRadius: '6px' }}>
              <strong>Unanswered: {unansweredCount}</strong>
            </div>
          </div>
        </div>
      </div>

      {showWarning && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '2rem',
            borderRadius: '8px',
            maxWidth: '500px',
            width: '90%'
          }}>
            <h3 style={{ marginBottom: '1rem' }}>Warning</h3>
            <p style={{ marginBottom: '1.5rem' }}>
              You have {unansweredCount} unanswered question(s). Are you sure you want to submit?
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowWarning(false)}
                style={{
                  padding: '0.75rem 1.5rem',
                  backgroundColor: '#6b7280',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  setShowWarning(false);
                  setSubmitting(true);
                  try {
                    await api.post(`/applicant/attempts/${attemptId}/submit`);
                    alert('Exam submitted successfully!');
                    navigate('/applicant/results');
                  } catch (error) {
                    alert(error.response?.data?.error || 'Failed to submit exam');
                    setSubmitting(false);
                  }
                }}
                style={{
                  padding: '0.75rem 1.5rem',
                  backgroundColor: '#10b981',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer'
                }}
              >
                Submit Anyway
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default ExamInterface;
