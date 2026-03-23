import { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import api from '../../services/api';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [role, setRole] = useState('applicant');
  const [loading, setLoading] = useState(true);
  const [showFacultyForm, setShowFacultyForm] = useState(false);
  const [facultyForm, setFacultyForm] = useState({
    email: '',
    password: '',
    name: '',
    faculty_id: '',
    department: '',
    designation: '',
    office_room: '',
    phone: ''
  });

  useEffect(() => {
    fetchUsers();
  }, [role]);

  const fetchUsers = async () => {
    try {
      const response = await api.get(`/admin/users?role=${role}`);
      setUsers(response.data.users);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (userId, currentStatus) => {
    try {
      await api.put(`/admin/users/${userId}/status`, { is_active: !currentStatus });
      fetchUsers();
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to update user status');
    }
  };

  const handleCreateFaculty = async (e) => {
    e.preventDefault();
    try {
      await api.post('/admin/users/faculty', facultyForm);
      alert('Faculty created successfully!');
      setShowFacultyForm(false);
      setFacultyForm({
        email: '',
        password: '',
        name: '',
        faculty_id: '',
        department: '',
        designation: '',
        office_room: '',
        phone: ''
      });
      fetchUsers();
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to create faculty');
    }
  };

  if (loading) {
    return <Layout role="administrator"><div>Loading...</div></Layout>;
  }

  return (
    <Layout role="administrator">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', color: '#1f2937' }}>User Management</h1>
        {role === 'faculty' && (
          <button
            onClick={() => setShowFacultyForm(!showFacultyForm)}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: '#10b981',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            + Create Faculty
          </button>
        )}
      </div>

      <div style={{ marginBottom: '1.5rem' }}>
        <button
          onClick={() => setRole('applicant')}
          style={{
            padding: '0.75rem 1.5rem',
            marginRight: '0.5rem',
            backgroundColor: role === 'applicant' ? '#3b82f6' : '#e5e7eb',
            color: role === 'applicant' ? 'white' : '#1f2937',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer'
          }}
        >
          Applicants
        </button>
        <button
          onClick={() => setRole('faculty')}
          style={{
            padding: '0.75rem 1.5rem',
            backgroundColor: role === 'faculty' ? '#3b82f6' : '#e5e7eb',
            color: role === 'faculty' ? 'white' : '#1f2937',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer'
          }}
        >
          Faculty
        </button>
      </div>

      {showFacultyForm && (
        <div style={{
          backgroundColor: 'white',
          padding: '2rem',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          marginBottom: '2rem'
        }}>
          <h2 style={{ marginBottom: '1.5rem' }}>Create Faculty Account</h2>
          <form onSubmit={handleCreateFaculty}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem' }}>Name *</label>
                <input
                  type="text"
                  value={facultyForm.name}
                  onChange={(e) => setFacultyForm({ ...facultyForm, name: e.target.value })}
                  required
                  style={{ width: '100%', padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '6px' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem' }}>Email *</label>
                <input
                  type="email"
                  value={facultyForm.email}
                  onChange={(e) => setFacultyForm({ ...facultyForm, email: e.target.value })}
                  required
                  style={{ width: '100%', padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '6px' }}
                />
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem' }}>Password *</label>
                <input
                  type="password"
                  value={facultyForm.password}
                  onChange={(e) => setFacultyForm({ ...facultyForm, password: e.target.value })}
                  required
                  style={{ width: '100%', padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '6px' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem' }}>Faculty ID *</label>
                <input
                  type="text"
                  value={facultyForm.faculty_id}
                  onChange={(e) => setFacultyForm({ ...facultyForm, faculty_id: e.target.value })}
                  required
                  style={{ width: '100%', padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '6px' }}
                />
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem' }}>Department</label>
                <input
                  type="text"
                  value={facultyForm.department}
                  onChange={(e) => setFacultyForm({ ...facultyForm, department: e.target.value })}
                  style={{ width: '100%', padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '6px' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem' }}>Designation</label>
                <input
                  type="text"
                  value={facultyForm.designation}
                  onChange={(e) => setFacultyForm({ ...facultyForm, designation: e.target.value })}
                  style={{ width: '100%', padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '6px' }}
                />
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem' }}>Office Room</label>
                <input
                  type="text"
                  value={facultyForm.office_room}
                  onChange={(e) => setFacultyForm({ ...facultyForm, office_room: e.target.value })}
                  style={{ width: '100%', padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '6px' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem' }}>Phone</label>
                <input
                  type="tel"
                  value={facultyForm.phone}
                  onChange={(e) => setFacultyForm({ ...facultyForm, phone: e.target.value })}
                  style={{ width: '100%', padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '6px' }}
                />
              </div>
            </div>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button
                type="submit"
                style={{
                  padding: '0.75rem 2rem',
                  backgroundColor: '#10b981',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer'
                }}
              >
                Create Faculty
              </button>
              <button
                type="button"
                onClick={() => setShowFacultyForm(false)}
                style={{
                  padding: '0.75rem 2rem',
                  backgroundColor: '#6b7280',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div style={{ backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#f3f4f6' }}>
              <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '2px solid #e5e7eb' }}>Name</th>
              <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '2px solid #e5e7eb' }}>Email</th>
              {role === 'applicant' && (
                <>
                  <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '2px solid #e5e7eb' }}>12th Marks</th>
                  <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '2px solid #e5e7eb' }}>Department</th>
                </>
              )}
              {role === 'faculty' && (
                <>
                  <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '2px solid #e5e7eb' }}>Faculty ID</th>
                  <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '2px solid #e5e7eb' }}>Department</th>
                </>
              )}
              <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '2px solid #e5e7eb' }}>Status</th>
              <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '2px solid #e5e7eb' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ padding: '2rem', textAlign: 'center', color: '#6b7280' }}>
                  No users found
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                  <td style={{ padding: '1rem' }}>{user.name}</td>
                  <td style={{ padding: '1rem' }}>{user.email}</td>
                  {role === 'applicant' && (
                    <>
                      <td style={{ padding: '1rem' }}>{user.marks_12th || 'N/A'}</td>
                      <td style={{ padding: '1rem' }}>{user.preferred_department || 'N/A'}</td>
                    </>
                  )}
                  {role === 'faculty' && (
                    <>
                      <td style={{ padding: '1rem' }}>{user.faculty_id || 'N/A'}</td>
                      <td style={{ padding: '1rem' }}>{user.department || 'N/A'}</td>
                    </>
                  )}
                  <td style={{ padding: '1rem' }}>
                    <span style={{ color: user.is_active ? '#10b981' : '#ef4444' }}>
                      {user.is_active ? 'Active' : 'Disabled'}
                    </span>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <button
                      onClick={() => handleToggleStatus(user.id, user.is_active)}
                      style={{
                        padding: '0.5rem 1rem',
                        backgroundColor: user.is_active ? '#ef4444' : '#10b981',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                      }}
                    >
                      {user.is_active ? 'Disable' : 'Enable'}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </Layout>
  );
};

export default AdminUsers;
