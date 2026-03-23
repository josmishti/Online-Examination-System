import { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';

const FacultyProfile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await api.get('/faculty/profile');
      setProfile(response.data.profile);
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !profile) {
    return <Layout role="faculty"><div>Loading...</div></Layout>;
  }

  return (
    <Layout role="faculty">
      <h1 style={{ marginBottom: '2rem', fontSize: '2rem', color: '#1f2937' }}>My Profile</h1>

      <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', maxWidth: '800px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#6b7280', fontWeight: '500' }}>Name</label>
            <p style={{ fontSize: '1.125rem', color: '#1f2937' }}>{profile.name}</p>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#6b7280', fontWeight: '500' }}>Email</label>
            <p style={{ fontSize: '1.125rem', color: '#1f2937' }}>{profile.email}</p>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#6b7280', fontWeight: '500' }}>Faculty ID</label>
            <p style={{ fontSize: '1.125rem', color: '#1f2937' }}>{profile.faculty_id || 'N/A'}</p>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#6b7280', fontWeight: '500' }}>Department</label>
            <p style={{ fontSize: '1.125rem', color: '#1f2937' }}>{profile.department || 'N/A'}</p>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#6b7280', fontWeight: '500' }}>Designation</label>
            <p style={{ fontSize: '1.125rem', color: '#1f2937' }}>{profile.designation || 'N/A'}</p>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#6b7280', fontWeight: '500' }}>Office Room</label>
            <p style={{ fontSize: '1.125rem', color: '#1f2937' }}>{profile.office_room || 'N/A'}</p>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#6b7280', fontWeight: '500' }}>Phone</label>
            <p style={{ fontSize: '1.125rem', color: '#1f2937' }}>{profile.phone || 'N/A'}</p>
          </div>
        </div>
        <p style={{ marginTop: '1.5rem', color: '#6b7280', fontSize: '0.875rem' }}>
          Note: Profile information is managed by the administrator. Contact admin for updates.
        </p>
      </div>
    </Layout>
  );
};

export default FacultyProfile;
