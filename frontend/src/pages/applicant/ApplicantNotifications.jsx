import { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import api from '../../services/api';

const ApplicantNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await api.get('/applicant/notifications');
      setNotifications(response.data.notifications);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Layout role="applicant"><div>Loading...</div></Layout>;
  }

  return (
    <Layout role="applicant">
      <h1 style={{ marginBottom: '2rem', fontSize: '2rem', color: '#1f2937' }}>Notifications</h1>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {notifications.length === 0 ? (
          <div style={{
            backgroundColor: 'white',
            padding: '2rem',
            borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            textAlign: 'center',
            color: '#6b7280'
          }}>
            No notifications available
          </div>
        ) : (
          notifications.map((notif) => (
            <div
              key={notif.id}
              style={{
                backgroundColor: 'white',
                padding: '1.5rem',
                borderRadius: '8px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }}
            >
              <h3 style={{ marginBottom: '0.5rem', color: '#1f2937' }}>{notif.title}</h3>
              <p style={{ color: '#6b7280', marginBottom: '0.5rem' }}>{notif.message}</p>
              <p style={{ color: '#9ca3af', fontSize: '0.875rem' }}>
                {new Date(notif.created_at).toLocaleString()}
              </p>
            </div>
          ))
        )}
      </div>
    </Layout>
  );
};

export default ApplicantNotifications;
