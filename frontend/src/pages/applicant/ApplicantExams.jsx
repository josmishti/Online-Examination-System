import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import api from '../../services/api';

const ApplicantExams = () => {
  const navigate = useNavigate();
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchExams();
    const interval = setInterval(fetchExams, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchExams = async () => {
    try {
      const response = await api.get('/applicant/exams');
      setExams(response.data.exams);
    } catch (error) {
      console.error('Error fetching exams:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Layout role="applicant"><div>Loading...</div></Layout>;
  }

  return (
    <Layout role="applicant">
      <h1 style={{ marginBottom: '2rem', fontSize: '2rem', color: '#1f2937' }}>Available Exams</h1>

      <div style={{ backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#f3f4f6' }}>
              <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '2px solid #e5e7eb' }}>Exam Name</th>
              <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '2px solid #e5e7eb' }}>Start Time</th>
              <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '2px solid #e5e7eb' }}>End Time</th>
              <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '2px solid #e5e7eb' }}>Duration</th>
              <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '2px solid #e5e7eb' }}>Status</th>
              <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '2px solid #e5e7eb' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {exams.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ padding: '2rem', textAlign: 'center', color: '#6b7280' }}>
                  No exams available
                </td>
              </tr>
            ) : (
              exams.map((exam) => {
                const now = new Date();
                const startTime = new Date(exam.start_time);
                const endTime = new Date(exam.end_time);
                const isUpcoming = startTime > now;
                const isActive = startTime <= now && endTime >= now;
                const isEnded = endTime < now;
                const isAttempted = exam.attempted > 0;

                return (
                  <tr key={exam.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                    <td style={{ padding: '1rem' }}>{exam.exam_name}</td>
                    <td style={{ padding: '1rem' }}>{new Date(exam.start_time).toLocaleString()}</td>
                    <td style={{ padding: '1rem' }}>{new Date(exam.end_time).toLocaleString()}</td>
                    <td style={{ padding: '1rem' }}>{exam.duration} minutes</td>
                    <td style={{ padding: '1rem' }}>
                      {isAttempted ? (
                        <span style={{ color: '#10b981' }}>Attempted</span>
                      ) : isActive ? (
                        <span style={{ color: '#3b82f6' }}>Active</span>
                      ) : isUpcoming ? (
                        <span style={{ color: '#f59e0b' }}>Upcoming</span>
                      ) : (
                        <span style={{ color: '#ef4444' }}>Ended</span>
                      )}
                    </td>
                    <td style={{ padding: '1rem' }}>
                      {isAttempted ? (
                        <button
                          onClick={() => navigate(`/applicant/results`)}
                          style={{
                            padding: '0.5rem 1rem',
                            backgroundColor: '#10b981',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer'
                          }}
                        >
                          View Result
                        </button>
                      ) : isActive ? (
                        <button
                          onClick={() => navigate(`/applicant/exams/${exam.id}/instructions`)}
                          style={{
                            padding: '0.5rem 1rem',
                            backgroundColor: '#3b82f6',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer'
                          }}
                        >
                          Start Exam
                        </button>
                      ) : isUpcoming ? (
                        <span style={{ color: '#6b7280' }}>Not Started</span>
                      ) : (
                        <span style={{ color: '#6b7280' }}>Expired</span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </Layout>
  );
};

export default ApplicantExams;
