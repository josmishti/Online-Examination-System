import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import api from '../../services/api';

const ExamInstructions = () => {
  const { examId } = useParams();
  const navigate = useNavigate();
  const [exam, setExam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);

  useEffect(() => {
    fetchExam();
  }, [examId]);

  const fetchExam = async () => {
    try {
      const response = await api.get(`/applicant/exams`);
      const exams = response.data.exams;
      const foundExam = exams.find(e => e.id === parseInt(examId));
      setExam(foundExam);
    } catch (error) {
      console.error('Error fetching exam:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartExam = async () => {
    if (!window.confirm('Are you ready to start the exam? Once started, the timer will begin.')) {
      return;
    }

    setStarting(true);
    try {
      const response = await api.post(`/applicant/exams/${examId}/start`);
      navigate(`/applicant/exams/${examId}/attempt/${response.data.attemptId}`);
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to start exam');
      setStarting(false);
    }
  };

  if (loading || !exam) {
    return <Layout role="applicant"><div>Loading...</div></Layout>;
  }

  const rules = [
    'Read all questions carefully before answering',
    'You cannot go back to previous questions once submitted',
    'Tab switching will be monitored and counted',
    'Do not refresh the page during the exam',
    'Submit your answers before the time expires',
    'Results will be published automatically after exam ends'
  ];

  return (
    <Layout role="applicant">
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <h1 style={{ marginBottom: '2rem', fontSize: '2rem', color: '#1f2937' }}>
          Exam Instructions
        </h1>

        <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', marginBottom: '2rem' }}>
          <h2 style={{ marginBottom: '1rem', color: '#1f2937' }}>{exam.exam_name}</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
            <div>
              <strong>Duration:</strong> {exam.duration} minutes
            </div>
            <div>
              <strong>Start Time:</strong> {new Date(exam.start_time).toLocaleString()}
            </div>
            <div>
              <strong>End Time:</strong> {new Date(exam.end_time).toLocaleString()}
            </div>
            <div>
              <strong>Total Marks:</strong> {exam.total_marks}
            </div>
          </div>
        </div>

        <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', marginBottom: '2rem' }}>
          <h2 style={{ marginBottom: '1rem', color: '#1f2937' }}>Rules and Guidelines</h2>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {rules.map((rule, idx) => (
              <li key={idx} style={{ padding: '0.75rem 0', borderBottom: idx < rules.length - 1 ? '1px solid #e5e7eb' : 'none' }}>
                <span style={{ marginRight: '0.5rem', color: '#3b82f6' }}>•</span>
                {rule}
              </li>
            ))}
          </ul>
        </div>

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <button
            onClick={() => navigate('/applicant/exams')}
            style={{
              padding: '0.75rem 2rem',
              backgroundColor: '#6b7280',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '1rem'
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleStartExam}
            disabled={starting}
            style={{
              padding: '0.75rem 2rem',
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: starting ? 'not-allowed' : 'pointer',
              fontSize: '1rem',
              opacity: starting ? 0.6 : 1
            }}
          >
            {starting ? 'Starting...' : 'Start Exam'}
          </button>
        </div>
      </div>
    </Layout>
  );
};

export default ExamInstructions;
