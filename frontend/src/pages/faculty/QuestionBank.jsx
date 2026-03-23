import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import api from '../../services/api';

const QuestionBank = () => {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    try {
      const response = await api.get('/faculty/questions');
      setQuestions(response.data.questions);
    } catch (error) {
      console.error('Error fetching questions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this question?')) {
      return;
    }

    try {
      await api.delete(`/faculty/questions/${id}`);
      fetchQuestions();
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to delete question');
    }
  };

  const handleEdit = (question) => {
    setEditingId(question.id);
    setEditForm(question);
  };

  const handleSaveEdit = async () => {
    try {
      await api.put(`/faculty/questions/${editingId}`, editForm);
      setEditingId(null);
      setEditForm({});
      fetchQuestions();
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to update question');
    }
  };

  if (loading) {
    return <Layout role="faculty"><div>Loading...</div></Layout>;
  }

  return (
    <Layout role="faculty">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', color: '#1f2937' }}>Question Bank</h1>
        <button
          onClick={() => navigate('/faculty/questions/add')}
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
          + Add Question
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {questions.length === 0 ? (
          <div style={{
            backgroundColor: 'white',
            padding: '2rem',
            borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            textAlign: 'center',
            color: '#6b7280'
          }}>
            No questions found. Add your first question!
          </div>
        ) : (
          questions.map((question) => (
            <div
              key={question.id}
              style={{
                backgroundColor: 'white',
                padding: '1.5rem',
                borderRadius: '8px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }}
            >
              {editingId === question.id ? (
                <div>
                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem' }}>Question</label>
                    <textarea
                      value={editForm.question_text}
                      onChange={(e) => setEditForm({ ...editForm, question_text: e.target.value })}
                      rows="3"
                      style={{ width: '100%', padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '6px' }}
                    />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                    {['A', 'B', 'C', 'D'].map((opt) => (
                      <div key={opt}>
                        <label style={{ display: 'block', marginBottom: '0.5rem' }}>Option {opt}</label>
                        <input
                          type="text"
                          value={editForm[`option_${opt.toLowerCase()}`]}
                          onChange={(e) => setEditForm({ ...editForm, [`option_${opt.toLowerCase()}`]: e.target.value })}
                          style={{ width: '100%', padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '6px' }}
                        />
                      </div>
                    ))}
                  </div>
                  <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                    <div>
                      <label style={{ display: 'block', marginBottom: '0.5rem' }}>Correct Option</label>
                      <select
                        value={editForm.correct_option}
                        onChange={(e) => setEditForm({ ...editForm, correct_option: e.target.value })}
                        style={{ padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '6px' }}
                      >
                        <option value="A">A</option>
                        <option value="B">B</option>
                        <option value="C">C</option>
                        <option value="D">D</option>
                      </select>
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '0.5rem' }}>Difficulty</label>
                      <select
                        value={editForm.difficulty}
                        onChange={(e) => setEditForm({ ...editForm, difficulty: e.target.value })}
                        style={{ padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '6px' }}
                      >
                        <option value="easy">Easy</option>
                        <option value="medium">Medium</option>
                        <option value="hard">Hard</option>
                      </select>
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '0.5rem' }}>Marks</label>
                      <input
                        type="number"
                        value={editForm.marks}
                        onChange={(e) => setEditForm({ ...editForm, marks: parseInt(e.target.value) })}
                        style={{ padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '6px' }}
                      />
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '1rem' }}>
                    <button
                      onClick={handleSaveEdit}
                      style={{
                        padding: '0.5rem 1rem',
                        backgroundColor: '#10b981',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                      }}
                    >
                      Save
                    </button>
                    <button
                      onClick={() => {
                        setEditingId(null);
                        setEditForm({});
                      }}
                      style={{
                        padding: '0.5rem 1rem',
                        backgroundColor: '#6b7280',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                    <div style={{ flex: 1 }}>
                      <span style={{ color: '#6b7280', fontSize: '0.875rem' }}>{question.subject_name}</span>
                      <h3 style={{ marginTop: '0.5rem', marginBottom: '0.5rem' }}>{question.question_text}</h3>
                      <div style={{ marginLeft: '1rem', color: '#6b7280' }}>
                        <p>A: {question.option_a}</p>
                        <p>B: {question.option_b}</p>
                        <p>C: {question.option_c}</p>
                        <p>D: {question.option_d}</p>
                      </div>
                      <div style={{ marginTop: '0.5rem', display: 'flex', gap: '1rem', fontSize: '0.875rem', color: '#9ca3af' }}>
                        <span>Correct: {question.correct_option}</span>
                        <span>Difficulty: {question.difficulty}</span>
                        <span>Marks: {question.marks}</span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button
                        onClick={() => handleEdit(question)}
                        style={{
                          padding: '0.5rem 1rem',
                          backgroundColor: '#3b82f6',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer'
                        }}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(question.id)}
                        style={{
                          padding: '0.5rem 1rem',
                          backgroundColor: '#ef4444',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer'
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </Layout>
  );
};

export default QuestionBank;
