import { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import api from '../../services/api';

const AdminResults = () => {
  const [results, setResults] = useState([]);
  const [exams, setExams] = useState([]);
  const [selectedExam, setSelectedExam] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchExams();
  }, []);

  useEffect(() => {
    fetchResults();
    const interval = setInterval(fetchResults, 5000);
    return () => clearInterval(interval);
  }, [selectedExam]);

  const fetchExams = async () => {
    try {
      const response = await api.get('/admin/exams');
      setExams(response.data.exams);
    } catch (error) {
      console.error('Error fetching exams:', error);
    }
  };

  const fetchResults = async () => {
    try {
      const response = await api.get(`/admin/results${selectedExam ? `?examId=${selectedExam}` : ''}`);
      setResults(response.data.results);
    } catch (error) {
      console.error('Error fetching results:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePublishResults = async () => {
    if (!window.confirm('Publish results for all completed exams?')) {
      return;
    }
    try {
      await api.post('/admin/results/publish');
      alert('Results published successfully!');
      fetchResults();
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to publish results');
    }
  };

  if (loading) {
    return <Layout role="administrator"><div>Loading...</div></Layout>;
  }

  return (
    <Layout role="administrator">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', color: '#1f2937' }}>Exam Results</h1>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <select
            value={selectedExam}
            onChange={(e) => setSelectedExam(e.target.value)}
            style={{
              padding: '0.75rem',
              border: '1px solid #d1d5db',
              borderRadius: '6px'
            }}
          >
            <option value="">All Exams</option>
            {exams.map((exam) => (
              <option key={exam.id} value={exam.id}>{exam.exam_name}</option>
            ))}
          </select>
          <button
            onClick={handlePublishResults}
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
            Publish Results
          </button>
        </div>
      </div>

      <div style={{ backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#f3f4f6' }}>
              <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '2px solid #e5e7eb' }}>Exam</th>
              <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '2px solid #e5e7eb' }}>Applicant</th>
              <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '2px solid #e5e7eb' }}>Start Time</th>
              <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '2px solid #e5e7eb' }}>End Time</th>
              <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '2px solid #e5e7eb' }}>Score</th>
              <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '2px solid #e5e7eb' }}>Percentage</th>
              <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '2px solid #e5e7eb' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {results.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ padding: '2rem', textAlign: 'center', color: '#6b7280' }}>
                  No results found
                </td>
              </tr>
            ) : (
              results.map((result) => (
                <tr key={result.attempt_id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                  <td style={{ padding: '1rem' }}>{result.exam_name}</td>
                  <td style={{ padding: '1rem' }}>
                    <div>
                      <div>{result.applicant_name}</div>
                      <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>{result.applicant_email}</div>
                    </div>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    {result.start_time ? new Date(result.start_time).toLocaleString() : 'N/A'}
                  </td>
                  <td style={{ padding: '1rem' }}>
                    {result.end_time ? new Date(result.end_time).toLocaleString() : 'N/A'}
                  </td>
                  <td style={{ padding: '1rem' }}>{result.score || 'N/A'}</td>
                  <td style={{ padding: '1rem' }}>{result.percentage ? `${result.percentage}%` : 'N/A'}</td>
                  <td style={{ padding: '1rem' }}>
                    {result.status === 'PASS' ? (
                      <span style={{ color: '#10b981', fontWeight: 'bold' }}>PASS</span>
                    ) : result.status === 'FAIL' ? (
                      <span style={{ color: '#ef4444', fontWeight: 'bold' }}>FAIL</span>
                    ) : (
                      <span style={{ color: '#6b7280' }}>Pending</span>
                    )}
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

export default AdminResults;
