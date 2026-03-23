import { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import api from '../../services/api';

const AdminExams = () => {
  const [exams, setExams] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    exam_name: '',
    duration: '',
    start_time: '',
    end_time: '',
    subjects: []
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [examsRes, subjectsRes] = await Promise.all([
        api.get('/admin/exams'),
        api.get('/admin/subjects')
      ]);
      setExams(examsRes.data.exams);
      setSubjects(subjectsRes.data.subjects);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubjectChange = (subjectId, value) => {
    const numValue = parseInt(value) || 0;
    const updatedSubjects = [...formData.subjects];
    const index = updatedSubjects.findIndex(s => s.subject_id === parseInt(subjectId));
    
    if (index >= 0) {
      updatedSubjects[index].number_of_questions_to_pick = numValue;
    } else {
      updatedSubjects.push({ subject_id: parseInt(subjectId), number_of_questions_to_pick: numValue });
    }
    
    setFormData({ ...formData, subjects: updatedSubjects });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validSubjects = formData.subjects.filter(s => s.number_of_questions_to_pick > 0);
    
    if (validSubjects.length === 0) {
      alert('Please select at least one subject with questions');
      return;
    }

    try {
      await api.post('/admin/exams', { ...formData, subjects: validSubjects });
      setShowForm(false);
      setFormData({
        exam_name: '',
        duration: '',
        start_time: '',
        end_time: '',
        subjects: []
      });
      fetchData();
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to create exam');
    }
  };

  if (loading) {
    return <Layout role="administrator"><div>Loading...</div></Layout>;
  }

  return (
    <Layout role="administrator">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', color: '#1f2937' }}>Exam Management</h1>
        <button
          onClick={() => setShowForm(!showForm)}
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
          + Create Exam
        </button>
      </div>

      {showForm && (
        <div style={{
          backgroundColor: 'white',
          padding: '2rem',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          marginBottom: '2rem'
        }}>
          <h2 style={{ marginBottom: '1.5rem' }}>Create Exam</h2>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem' }}>Exam Name *</label>
                <input
                  type="text"
                  value={formData.exam_name}
                  onChange={(e) => setFormData({ ...formData, exam_name: e.target.value })}
                  required
                  style={{ width: '100%', padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '6px' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem' }}>Duration (minutes) *</label>
                <input
                  type="number"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                  required
                  min="1"
                  style={{ width: '100%', padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '6px' }}
                />
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem' }}>Start Time *</label>
                <input
                  type="datetime-local"
                  value={formData.start_time}
                  onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                  required
                  style={{ width: '100%', padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '6px' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem' }}>End Time *</label>
                <input
                  type="datetime-local"
                  value={formData.end_time}
                  onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                  required
                  style={{ width: '100%', padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '6px' }}
                />
              </div>
            </div>
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem' }}>Select Subjects and Number of Questions</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '300px', overflowY: 'auto', padding: '1rem', border: '1px solid #e5e7eb', borderRadius: '6px' }}>
                {subjects.map((subject) => {
                  const existing = formData.subjects.find(s => s.subject_id === subject.id);
                  return (
                    <div key={subject.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem' }}>
                      <span>{subject.subject_name}</span>
                      <input
                        type="number"
                        min="0"
                        value={existing?.number_of_questions_to_pick || 0}
                        onChange={(e) => handleSubjectChange(subject.id, e.target.value)}
                        style={{ width: '100px', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '4px' }}
                        placeholder="Questions"
                      />
                    </div>
                  );
                })}
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
                Create Exam
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setFormData({
                    exam_name: '',
                    duration: '',
                    start_time: '',
                    end_time: '',
                    subjects: []
                  });
                }}
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
              <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '2px solid #e5e7eb' }}>Exam Name</th>
              <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '2px solid #e5e7eb' }}>Start Time</th>
              <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '2px solid #e5e7eb' }}>End Time</th>
              <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '2px solid #e5e7eb' }}>Duration</th>
              <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '2px solid #e5e7eb' }}>Attempts</th>
            </tr>
          </thead>
          <tbody>
            {exams.length === 0 ? (
              <tr>
                <td colSpan="5" style={{ padding: '2rem', textAlign: 'center', color: '#6b7280' }}>
                  No exams found
                </td>
              </tr>
            ) : (
              exams.map((exam) => (
                <tr key={exam.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                  <td style={{ padding: '1rem' }}>{exam.exam_name}</td>
                  <td style={{ padding: '1rem' }}>{new Date(exam.start_time).toLocaleString()}</td>
                  <td style={{ padding: '1rem' }}>{new Date(exam.end_time).toLocaleString()}</td>
                  <td style={{ padding: '1rem' }}>{exam.duration} minutes</td>
                  <td style={{ padding: '1rem' }}>
                    {exam.completed_attempts || 0} / {exam.total_attempts || 0}
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

export default AdminExams;
