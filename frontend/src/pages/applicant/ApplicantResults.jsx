import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import api from '../../services/api';

const ApplicantResults = () => {
  const navigate = useNavigate();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedResult, setSelectedResult] = useState(null);
  const [detailedResult, setDetailedResult] = useState(null);

  useEffect(() => {
    fetchResults();
    const interval = setInterval(fetchResults, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchResults = async () => {
    try {
      const response = await api.get('/applicant/results');
      setResults(response.data.results);
    } catch (error) {
      console.error('Error fetching results:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDetailedResult = async (attemptId) => {
    try {
      const response = await api.get(`/applicant/results/${attemptId}`);
      setDetailedResult(response.data);
      setSelectedResult(attemptId);
    } catch (error) {
      console.error('Error fetching detailed result:', error);
    }
  };

  if (loading) {
    return <Layout role="applicant"><div>Loading...</div></Layout>;
  }

  return (
    <Layout role="applicant">
      <h1 style={{ marginBottom: '2rem', fontSize: '2rem', color: '#1f2937' }}>Exam Results</h1>

      <div style={{ backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#f3f4f6' }}>
              <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '2px solid #e5e7eb' }}>Exam Name</th>
              <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '2px solid #e5e7eb' }}>Attempt Date</th>
              <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '2px solid #e5e7eb' }}>Score</th>
              <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '2px solid #e5e7eb' }}>Percentage</th>
              <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '2px solid #e5e7eb' }}>Status</th>
              <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '2px solid #e5e7eb' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {results.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ padding: '2rem', textAlign: 'center', color: '#6b7280' }}>
                  No results available
                </td>
              </tr>
            ) : (
              results.map((result) => (
                <tr key={result.attempt_id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                  <td style={{ padding: '1rem' }}>{result.exam_name}</td>
                  <td style={{ padding: '1rem' }}>
                    {result.attempt_end ? new Date(result.attempt_end).toLocaleString() : 'N/A'}
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
                  <td style={{ padding: '1rem' }}>
                    <button
                      onClick={() => fetchDetailedResult(result.attempt_id)}
                      style={{
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
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {selectedResult && detailedResult && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '2rem',
            borderRadius: '8px',
            maxWidth: '800px',
            width: '90%',
            maxHeight: '90vh',
            overflow: 'auto'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
              <h2>Detailed Result Analysis</h2>
              <button
                onClick={() => {
                  setSelectedResult(null);
                  setDetailedResult(null);
                }}
                style={{
                  backgroundColor: '#ef4444',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '0.5rem 1rem',
                  cursor: 'pointer'
                }}
              >
                Close
              </button>
            </div>

            <div style={{ marginBottom: '1.5rem', padding: '1rem', backgroundColor: '#f3f4f6', borderRadius: '6px' }}>
              <h3>{detailedResult.exam.exam_name}</h3>
              <p><strong>Score:</strong> {detailedResult.result.score} / {detailedResult.exam.total_marks}</p>
              <p><strong>Percentage:</strong> {detailedResult.result.percentage}%</p>
              <p><strong>Status:</strong> 
                <span style={{ color: detailedResult.result.status === 'PASS' ? '#10b981' : '#ef4444', marginLeft: '0.5rem' }}>
                  {detailedResult.result.status}
                </span>
              </p>
            </div>

            <div>
              <h3 style={{ marginBottom: '1rem' }}>Question-wise Analysis</h3>
              {detailedResult.detailedAnswers.map((answer, idx) => (
                <div key={idx} style={{
                  marginBottom: '1rem',
                  padding: '1rem',
                  border: '1px solid #e5e7eb',
                  borderRadius: '6px',
                  backgroundColor: answer.is_correct ? '#f0fdf4' : '#fef2f2'
                }}>
                  <p style={{ marginBottom: '0.5rem', fontWeight: 'bold' }}>
                    Q{idx + 1}: {answer.question_text}
                  </p>
                  <div style={{ marginLeft: '1rem' }}>
                    <p>A: {answer.option_a}</p>
                    <p>B: {answer.option_b}</p>
                    <p>C: {answer.option_c}</p>
                    <p>D: {answer.option_d}</p>
                  </div>
                  <div style={{ marginTop: '0.5rem' }}>
                    <p><strong>Correct Answer:</strong> {answer.correct_option}</p>
                    <p><strong>Your Answer:</strong> {answer.selected_option || 'Not Answered'}</p>
                    <p style={{ color: answer.is_correct ? '#10b981' : '#ef4444' }}>
                      {answer.is_correct ? '✓ Correct' : '✗ Incorrect'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default ApplicantResults;
