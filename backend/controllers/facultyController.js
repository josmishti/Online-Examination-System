import { query } from '../config/database.js';

export const getDashboard = async (req, res) => {
  try {
    const facultyId = req.user.id;

    // Get total questions
    const totalQuestions = await query(
      'SELECT COUNT(*) as count FROM questions WHERE faculty_id = ?',
      [facultyId]
    );

    // Get active subjects
    const activeSubjects = await query(
      `SELECT DISTINCT s.id, s.subject_name 
       FROM subjects s
       INNER JOIN questions q ON s.id = q.subject_id
       WHERE q.faculty_id = ?`,
      [facultyId]
    );

    // Get questions added this month
    const questionsThisMonth = await query(
      `SELECT COUNT(*) as count FROM questions 
       WHERE faculty_id = ? AND MONTH(created_at) = MONTH(NOW()) AND YEAR(created_at) = YEAR(NOW())`,
      [facultyId]
    );

    // Get recently added questions
    const recentQuestions = await query(
      `SELECT q.*, s.subject_name 
       FROM questions q
       INNER JOIN subjects s ON q.subject_id = s.id
       WHERE q.faculty_id = ?
       ORDER BY q.created_at DESC
       LIMIT 5`,
      [facultyId]
    );

    res.json({
      totalQuestions: totalQuestions[0].count,
      activeSubjects: activeSubjects.length,
      questionsThisMonth: questionsThisMonth[0].count,
      recentQuestions
    });
  } catch (error) {
    console.error('Get faculty dashboard error:', error);
    res.status(500).json({ error: 'Failed to get dashboard data' });
  }
};

export const getSubjects = async (req, res) => {
  try {
    const subjects = await query('SELECT * FROM subjects ORDER BY subject_name', []);
    res.json({ subjects });
  } catch (error) {
    console.error('Get subjects error:', error);
    res.status(500).json({ error: 'Failed to get subjects' });
  }
};

export const createQuestion = async (req, res) => {
  try {
    const facultyId = req.user.id;
    const { subject_id, question_text, option_a, option_b, option_c, option_d, correct_option, difficulty, marks } = req.body;

    await query(
      `INSERT INTO questions 
       (subject_id, faculty_id, question_text, option_a, option_b, option_c, option_d, correct_option, difficulty, marks)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [subject_id, facultyId, question_text, option_a, option_b, option_c, option_d, correct_option, difficulty, marks]
    );

    res.status(201).json({ message: 'Question created successfully' });
  } catch (error) {
    console.error('Create question error:', error);
    res.status(500).json({ error: 'Failed to create question' });
  }
};

export const getQuestions = async (req, res) => {
  try {
    const facultyId = req.user.id;

    const questions = await query(
      `SELECT q.*, s.subject_name 
       FROM questions q
       INNER JOIN subjects s ON q.subject_id = s.id
       WHERE q.faculty_id = ?
       ORDER BY q.created_at DESC`,
      [facultyId]
    );

    res.json({ questions });
  } catch (error) {
    console.error('Get questions error:', error);
    res.status(500).json({ error: 'Failed to get questions' });
  }
};

export const updateQuestion = async (req, res) => {
  try {
    const { questionId } = req.params;
    const facultyId = req.user.id;
    const { subject_id, question_text, option_a, option_b, option_c, option_d, correct_option, difficulty, marks } = req.body;

    // Verify ownership
    const questions = await query('SELECT * FROM questions WHERE id = ? AND faculty_id = ?', [questionId, facultyId]);
    if (questions.length === 0) {
      return res.status(404).json({ error: 'Question not found or access denied' });
    }

    await query(
      `UPDATE questions SET
       subject_id = ?, question_text = ?, option_a = ?, option_b = ?, option_c = ?, option_d = ?,
       correct_option = ?, difficulty = ?, marks = ?
       WHERE id = ? AND faculty_id = ?`,
      [subject_id, question_text, option_a, option_b, option_c, option_d, correct_option, difficulty, marks, questionId, facultyId]
    );

    res.json({ message: 'Question updated successfully' });
  } catch (error) {
    console.error('Update question error:', error);
    res.status(500).json({ error: 'Failed to update question' });
  }
};

export const deleteQuestion = async (req, res) => {
  try {
    const { questionId } = req.params;
    const facultyId = req.user.id;

    // Verify ownership
    const questions = await query('SELECT * FROM questions WHERE id = ? AND faculty_id = ?', [questionId, facultyId]);
    if (questions.length === 0) {
      return res.status(404).json({ error: 'Question not found or access denied' });
    }

    await query('DELETE FROM questions WHERE id = ? AND faculty_id = ?', [questionId, facultyId]);

    res.json({ message: 'Question deleted successfully' });
  } catch (error) {
    console.error('Delete question error:', error);
    res.status(500).json({ error: 'Failed to delete question' });
  }
};

export const getProfile = async (req, res) => {
  try {
    const facultyId = req.user.id;

    const profiles = await query(
      `SELECT u.*, fp.* 
       FROM users u
       LEFT JOIN faculty_profiles fp ON u.id = fp.user_id
       WHERE u.id = ?`,
      [facultyId]
    );

    res.json({ profile: profiles[0] });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Failed to get profile' });
  }
};
