import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Layout = ({ children, role }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getNavLinks = () => {
    if (role === 'applicant') {
      return (
        <>
          <Link to="/applicant/dashboard">Dashboard</Link>
          <Link to="/applicant/exams">Exams</Link>
          <Link to="/applicant/results">Results</Link>
          <Link to="/applicant/notifications">Notifications</Link>
          <Link to="/applicant/profile">Profile</Link>
        </>
      );
    } else if (role === 'faculty') {
      return (
        <>
          <Link to="/faculty/dashboard">Dashboard</Link>
          <Link to="/faculty/questions">Question Bank</Link>
          <Link to="/faculty/profile">Profile</Link>
        </>
      );
    } else if (role === 'administrator') {
      return (
        <>
          <Link to="/admin/dashboard">Dashboard</Link>
          <Link to="/admin/users">Users</Link>
          <Link to="/admin/departments">Departments</Link>
          <Link to="/admin/subjects">Subjects</Link>
          <Link to="/admin/exams">Exams</Link>
          <Link to="/admin/results">Results</Link>
          <Link to="/admin/notifications">Notifications</Link>
          <Link to="/admin/activity-logs">Activity Logs</Link>
        </>
      );
    }
    return null;
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <header style={{
        backgroundColor: '#2563eb',
        color: 'white',
        padding: '1rem 2rem',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          maxWidth: '1400px',
          margin: '0 auto'
        }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
            Examination System
          </h1>
          <nav style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
            {getNavLinks()}
            <div style={{ marginLeft: '1rem', paddingLeft: '1rem', borderLeft: '1px solid rgba(255,255,255,0.3)' }}>
              <span style={{ marginRight: '1rem' }}>{user?.name}</span>
              <button
                onClick={handleLogout}
                style={{
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  border: 'none',
                  color: 'white',
                  padding: '0.5rem 1rem',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Logout
              </button>
            </div>
          </nav>
        </div>
      </header>
      <main style={{ flex: 1, padding: '2rem', maxWidth: '1400px', width: '100%', margin: '0 auto' }}>
        {children}
      </main>
    </div>
  );
};

export default Layout;
