import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const RoleSelection = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Redirect if already logged in
  if (user) {
    if (user.role === 'applicant') navigate('/applicant/dashboard');
    else if (user.role === 'faculty') navigate('/faculty/dashboard');
    else if (user.role === 'administrator') navigate('/admin/dashboard');
    return null;
  }

  const roles = [
    {
      title: 'Applicant',
      description: 'Take exams and view results',
      route: '/applicant/login',
      color: '#3b82f6'
    },
    {
      title: 'Faculty',
      description: 'Manage question bank',
      route: '/faculty/login',
      color: '#10b981'
    },
    {
      title: 'Administrator',
      description: 'Manage system and users',
      route: '/admin/login',
      color: '#f59e0b'
    }
  ];

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    }}>
      <div style={{ textAlign: 'center', color: 'white' }}>
        <h1 style={{ fontSize: '3rem', marginBottom: '1rem', fontWeight: 'bold' }}>
          Offline Online Examination System
        </h1>
        <p style={{ fontSize: '1.25rem', marginBottom: '3rem', opacity: 0.9 }}>
          Select your role to continue
        </p>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '2rem',
          maxWidth: '900px',
          margin: '0 auto'
        }}>
          {roles.map((role) => (
            <div
              key={role.title}
              onClick={() => navigate(role.route)}
              style={{
                backgroundColor: 'rgba(255,255,255,0.1)',
                backdropFilter: 'blur(10px)',
                padding: '2rem',
                borderRadius: '12px',
                cursor: 'pointer',
                transition: 'all 0.3s',
                border: '2px solid rgba(255,255,255,0.2)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-5px)';
                e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.2)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)';
              }}
            >
              <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>{role.title}</h2>
              <p style={{ opacity: 0.8, marginBottom: '1rem' }}>{role.description}</p>
              <button
                style={{
                  backgroundColor: 'white',
                  color: role.color,
                  border: 'none',
                  padding: '0.75rem 2rem',
                  borderRadius: '6px',
                  fontSize: '1rem',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  width: '100%'
                }}
              >
                Continue
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RoleSelection;
