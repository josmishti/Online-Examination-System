import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';

const ApplicantDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
    const interval = setInterval(fetchDashboard, 5000); // Poll every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchDashboard = async () => {
    try {
      const response = await api.get('/applicant/dashboard');
      setData(response.data);
    } catch (error) {
      console.error('Error fetching dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !data) {
    return <Layout role="applicant"><div>Loading...</div></Layout>;
  }

  return (
    <Layout role="applicant">
      <h1 style={{ marginBottom: '2rem', fontSize: '2rem', color: '#1f2937' }}>
        Welcome, {user?.name}!
      </h1>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <h3 style={{ color: '#6b7280', marginBottom: '0.5rem' }}>Upcoming Exams</h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#3b82f6' }}>{data.upcomingExams.length}</p>
        </div>
        <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <h3 style={{ color: '#6b7280', marginBottom: '0.5rem' }}>Completed Exams</h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#10b981' }}>{data.completedExams.length}</p>
        </div>
        <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <h3 style={{ color: '#6b7280', marginBottom: '0.5rem' }}>Pending Results</h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#f59e0b' }}>{data.pendingResults.length}</p>
        </div>
        <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <h3 style={{ color: '#6b7280', marginBottom: '0.5rem' }}>Notifications</h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#8b5cf6' }}>{data.notifications.length}</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
        <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <h2 style={{ marginBottom: '1rem', color: '#1f2937' }}>Upcoming Exams</h2>
          {data.upcomingExams.length === 0 ? (
            <p style={{ color: '#6b7280' }}>No upcoming exams</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {data.upcomingExams.slice(0, 5).map((exam) => (
                <div key={exam.id} style={{ padding: '1rem', border: '1px solid #e5e7eb', borderRadius: '6px' }}>
                  <h3 style={{ marginBottom: '0.5rem' }}>{exam.exam_name}</h3>
                  <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>
                    Start: {new Date(exam.start_time).toLocaleString()}
                  </p>
                  {exam.attempted > 0 ? (
                    <span style={{ color: '#10b981', fontSize: '0.875rem' }}>Already Attempted</span>
                  ) : (
                    <button
                      onClick={() => navigate(`/applicant/exams/${exam.id}/instructions`)}
                      style={{
                        marginTop: '0.5rem',
                        padding: '0.5rem 1rem',
                        backgroundColor: '#3b82f6',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                      }}
                    >
                      View Details
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <h2 style={{ marginBottom: '1rem', color: '#1f2937' }}>Recent Activity</h2>
          {data.recentActivity.length === 0 ? (
            <p style={{ color: '#6b7280' }}>No recent activity</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {data.recentActivity.map((activity, idx) => (
                <div key={idx} style={{ padding: '1rem', border: '1px solid #e5e7eb', borderRadius: '6px' }}>
                  <h3 style={{ marginBottom: '0.5rem' }}>{activity.exam_name}</h3>
                  <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>
                    {activity.score !== null ? `Score: ${activity.score} (${activity.percentage}%)` : 'Pending'}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
        <h2 style={{ marginBottom: '1rem', color: '#1f2937' }}>Recent Notifications</h2>
        {data.notifications.length === 0 ? (
          <p style={{ color: '#6b7280' }}>No notifications</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {data.notifications.slice(0, 5).map((notif) => (
              <div key={notif.id} style={{ padding: '1rem', border: '1px solid #e5e7eb', borderRadius: '6px' }}>
                <h3 style={{ marginBottom: '0.5rem' }}>{notif.title}</h3>
                <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>{notif.message}</p>
                <p style={{ color: '#9ca3af', fontSize: '0.75rem', marginTop: '0.5rem' }}>
                  {new Date(notif.created_at).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default ApplicantDashboard;
