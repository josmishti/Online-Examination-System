import { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';

const FacultyDashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
    const interval = setInterval(fetchDashboard, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchDashboard = async () => {
    try {
      const response = await api.get('/faculty/dashboard');
      setData(response.data);
    } catch (error) {
      console.error('Error fetching dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !data) {
    return <Layout role="faculty"><div>Loading...</div></Layout>;
  }

  return (
    <Layout role="faculty">
      <h1 style={{ marginBottom: '2rem', fontSize: '2rem', color: '#1f2937' }}>
        Welcome, {user?.name}!
      </h1>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <h3 style={{ color: '#6b7280', marginBottom: '0.5rem' }}>Total Questions</h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#3b82f6' }}>{data.totalQuestions}</p>
        </div>
        <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <h3 style={{ color: '#6b7280', marginBottom: '0.5rem' }}>Active Subjects</h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#10b981' }}>{data.activeSubjects}</p>
        </div>
        <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <h3 style={{ color: '#6b7280', marginBottom: '0.5rem' }}>This Month</h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#f59e0b' }}>{data.questionsThisMonth}</p>
        </div>
      </div>

      <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
        <h2 style={{ marginBottom: '1rem', color: '#1f2937' }}>Recently Added Questions</h2>
        {data.recentQuestions.length === 0 ? (
          <p style={{ color: '#6b7280' }}>No questions added yet</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {data.recentQuestions.map((question) => (
              <div key={question.id} style={{ padding: '1rem', border: '1px solid #e5e7eb', borderRadius: '6px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ marginBottom: '0.5rem' }}>{question.subject_name}</h3>
                    <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>{question.question_text.substring(0, 100)}...</p>
                    <div style={{ marginTop: '0.5rem', display: 'flex', gap: '1rem', fontSize: '0.875rem', color: '#9ca3af' }}>
                      <span>Difficulty: {question.difficulty}</span>
                      <span>Marks: {question.marks}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default FacultyDashboard;
