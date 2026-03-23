import bcrypt from 'bcryptjs';
import { query } from '../config/database.js';

export const getDashboard = async (req, res) => {
  try {
    // Get total students
    const totalStudents = await query('SELECT COUNT(*) as count FROM users WHERE role = ?', ['applicant']);
    
    // Get total faculty
    const totalFaculty = await query('SELECT COUNT(*) as count FROM users WHERE role = ?', ['faculty']);
    
    // Get active exams
    const activeExams = await query(
      'SELECT COUNT(*) as count FROM exams WHERE start_time <= NOW() AND end_time >= NOW()',
      []
    );
    
    // Get upcoming exams
    const upcomingExams = await query(
      'SELECT COUNT(*) as count FROM exams WHERE start_time > NOW()',
      []
    );

    // Get analytics data
    const examStats = await query(
      `SELECT 
       COUNT(DISTINCT ea.id) as total_attempts,
       COUNT(DISTINCT CASE WHEN r.status = 'PASS' THEN r.id END) as passed,
       COUNT(DISTINCT CASE WHEN r.status = 'FAIL' THEN r.id END) as failed
       FROM exam_attempts ea
       LEFT JOIN results r ON ea.id = r.attempt_id`,
      []
    );

    res.json({
      totalStudents: totalStudents[0].count,
      totalFaculty: totalFaculty[0].count,
      activeExams: activeExams[0].count,
      upcomingExams: upcomingExams[0].count,
      analytics: examStats[0]
    });
  } catch (error) {
    console.error('Get admin dashboard error:', error);
    res.status(500).json({ error: 'Failed to get dashboard data' });
  }
};

export const getUsers = async (req, res) => {
  try {
    const { role } = req.query;

    let users;
    if (role === 'applicant') {
      users = await query(
        `SELECT u.*, ap.* 
         FROM users u
         LEFT JOIN applicant_profiles ap ON u.id = ap.user_id
         WHERE u.role = 'applicant'
         ORDER BY u.created_at DESC`,
        []
      );
    } else if (role === 'faculty') {
      users = await query(
        `SELECT u.*, fp.* 
         FROM users u
         LEFT JOIN faculty_profiles fp ON u.id = fp.user_id
         WHERE u.role = 'faculty'
         ORDER BY u.created_at DESC`,
        []
      );
    } else {
      users = await query('SELECT * FROM users ORDER BY created_at DESC', []);
    }

    res.json({ users });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Failed to get users' });
  }
};

export const toggleUserStatus = async (req, res) => {
  try {
    const { userId } = req.params;
    const { is_active } = req.body;

    await query('UPDATE users SET is_active = ? WHERE id = ?', [is_active ? 1 : 0, userId]);

    res.json({ message: 'User status updated' });
  } catch (error) {
    console.error('Toggle user status error:', error);
    res.status(500).json({ error: 'Failed to update user status' });
  }
};

export const createFaculty = async (req, res) => {
  try {
    const { email, password, name, faculty_id, department, designation, office_room, phone } = req.body;

    // Check if user exists
    const existing = await query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    // Hash password
    const password_hash = await bcrypt.hash(password, 10);

    // Create user
    const userResult = await query(
      'INSERT INTO users (role, name, email, password_hash, is_active) VALUES (?, ?, ?, ?, ?)',
      ['faculty', name, email, password_hash, 1]
    );

    const userId = userResult.insertId;

    // Create faculty profile
    await query(
      `INSERT INTO faculty_profiles (user_id, faculty_id, department, designation, office_room, phone)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [userId, faculty_id, department, office_room, designation, phone]
    );

    res.status(201).json({ message: 'Faculty created successfully', userId });
  } catch (error) {
    console.error('Create faculty error:', error);
    res.status(500).json({ error: 'Failed to create faculty' });
  }
};

export const getDepartments = async (req, res) => {
  try {
    const departments = await query('SELECT * FROM departments ORDER BY department_name', []);
    res.json({ departments });
  } catch (error) {
    console.error('Get departments error:', error);
    res.status(500).json({ error: 'Failed to get departments' });
  }
};

export const createDepartment = async (req, res) => {
  try {
    const { department_name, description } = req.body;

    const result = await query(
      'INSERT INTO departments (department_name, description) VALUES (?, ?)',
      [department_name, description || null]
    );

    res.status(201).json({ message: 'Department created successfully', id: result.insertId });
  } catch (error) {
    console.error('Create department error:', error);
    res.status(500).json({ error: 'Failed to create department' });
  }
};

export const updateDepartment = async (req, res) => {
  try {
    const { departmentId } = req.params;
    const { department_name, description } = req.body;

    await query(
      'UPDATE departments SET department_name = ?, description = ? WHERE id = ?',
      [department_name, description || null, departmentId]
    );

    res.json({ message: 'Department updated successfully' });
  } catch (error) {
    console.error('Update department error:', error);
    res.status(500).json({ error: 'Failed to update department' });
  }
};

export const deleteDepartment = async (req, res) => {
  try {
    const { departmentId } = req.params;

    await query('DELETE FROM departments WHERE id = ?', [departmentId]);

    res.json({ message: 'Department deleted successfully' });
  } catch (error) {
    console.error('Delete department error:', error);
    res.status(500).json({ error: 'Failed to delete department' });
  }
};

export const getSubjects = async (req, res) => {
  try {
    const subjects = await query(
      `SELECT s.*, d.department_name 
       FROM subjects s
       LEFT JOIN departments d ON s.department_id = d.id
       ORDER BY s.subject_name`,
      []
    );
    res.json({ subjects });
  } catch (error) {
    console.error('Get subjects error:', error);
    res.status(500).json({ error: 'Failed to get subjects' });
  }
};

export const createSubject = async (req, res) => {
  try {
    const { subject_name, department_id, description } = req.body;

    const result = await query(
      'INSERT INTO subjects (subject_name, department_id, description) VALUES (?, ?, ?)',
      [subject_name, department_id || null, description || null]
    );

    res.status(201).json({ message: 'Subject created successfully', id: result.insertId });
  } catch (error) {
    console.error('Create subject error:', error);
    res.status(500).json({ error: 'Failed to create subject' });
  }
};

export const updateSubject = async (req, res) => {
  try {
    const { subjectId } = req.params;
    const { subject_name, department_id, description } = req.body;

    await query(
      'UPDATE subjects SET subject_name = ?, department_id = ?, description = ? WHERE id = ?',
      [subject_name, department_id || null, description || null, subjectId]
    );

    res.json({ message: 'Subject updated successfully' });
  } catch (error) {
    console.error('Update subject error:', error);
    res.status(500).json({ error: 'Failed to update subject' });
  }
};

export const deleteSubject = async (req, res) => {
  try {
    const { subjectId } = req.params;

    await query('DELETE FROM subjects WHERE id = ?', [subjectId]);

    res.json({ message: 'Subject deleted successfully' });
  } catch (error) {
    console.error('Delete subject error:', error);
    res.status(500).json({ error: 'Failed to delete subject' });
  }
};

export const getExams = async (req, res) => {
  try {
    const exams = await query(
      `SELECT e.*, 
       (SELECT COUNT(*) FROM exam_attempts WHERE exam_id = e.id) as total_attempts,
       (SELECT COUNT(*) FROM exam_attempts ea INNER JOIN results r ON ea.id = r.attempt_id WHERE ea.exam_id = e.id) as completed_attempts
       FROM exams e
       ORDER BY e.created_at DESC`,
      []
    );

    res.json({ exams });
  } catch (error) {
    console.error('Get exams error:', error);
    res.status(500).json({ error: 'Failed to get exams' });
  }
};

export const createExam = async (req, res) => {
  try {
    const { exam_name, duration, start_time, end_time, subjects } = req.body;

    // Calculate total marks (will be calculated from questions)
    const examResult = await query(
      `INSERT INTO exams (exam_name, duration, start_time, end_time, total_marks, created_by_admin)
       VALUES (?, ?, ?, ?, 0, ?)`,
      [exam_name, duration, start_time, end_time, req.user.id]
    );

    const examId = examResult.insertId;

    // Add exam subjects
    for (const subject of subjects) {
      await query(
        'INSERT INTO exam_subjects (exam_id, subject_id, number_of_questions_to_pick) VALUES (?, ?, ?)',
        [examId, subject.subject_id, subject.number_of_questions_to_pick]
      );
    }

    res.status(201).json({ message: 'Exam created successfully', examId });
  } catch (error) {
    console.error('Create exam error:', error);
    res.status(500).json({ error: 'Failed to create exam' });
  }
};

export const getResults = async (req, res) => {
  try {
    const { examId } = req.query;

    let results;
    if (examId) {
      results = await query(
        `SELECT e.exam_name, ea.*, u.name as applicant_name, u.email as applicant_email,
         r.score, r.percentage, r.status
         FROM exam_attempts ea
         INNER JOIN exams e ON ea.exam_id = e.id
         INNER JOIN users u ON ea.applicant_id = u.id
         LEFT JOIN results r ON ea.id = r.attempt_id
         WHERE e.id = ?
         ORDER BY ea.end_time DESC`,
        [examId]
      );
    } else {
      results = await query(
        `SELECT e.exam_name, ea.*, u.name as applicant_name, u.email as applicant_email,
         r.score, r.percentage, r.status
         FROM exam_attempts ea
         INNER JOIN exams e ON ea.exam_id = e.id
         INNER JOIN users u ON ea.applicant_id = u.id
         LEFT JOIN results r ON ea.id = r.attempt_id
         ORDER BY ea.end_time DESC`,
        []
      );
    }

    res.json({ results });
  } catch (error) {
    console.error('Get results error:', error);
    res.status(500).json({ error: 'Failed to get results' });
  }
};

export const publishResults = async (req, res) => {
  try {
    // Auto-calculate results for completed exams without results
    const attempts = await query(
      `SELECT ea.* FROM exam_attempts ea
       INNER JOIN exams e ON ea.exam_id = e.id
       LEFT JOIN results r ON ea.id = r.attempt_id
       WHERE r.id IS NULL AND ea.end_time IS NOT NULL AND e.end_time < NOW()`,
      []
    );

    for (const attempt of attempts) {
      // Get questions from answers table (those selected for this attempt)
      const answers = await query(
        `SELECT q.id, q.correct_option, q.marks, a.selected_option
         FROM answers a
         INNER JOIN questions q ON a.question_id = q.id
         WHERE a.attempt_id = ?`,
        [attempt.id]
      );

      let score = 0;
      let totalMarks = 0;

      answers.forEach(answer => {
        totalMarks += answer.marks;
        if (answer.selected_option === answer.correct_option) {
          score += answer.marks;
        }
      });

      const percentage = totalMarks > 0 ? (score / totalMarks) * 100 : 0;
      const status = percentage >= 35 ? 'PASS' : 'FAIL';

      await query(
        `INSERT INTO results (attempt_id, score, percentage, status)
         VALUES (?, ?, ?, ?)`,
        [attempt.id, score, percentage, status]
      );
    }

    res.json({ message: 'Results published successfully', processed: attempts.length });
  } catch (error) {
    console.error('Publish results error:', error);
    res.status(500).json({ error: 'Failed to publish results' });
  }
};

export const getActivityLogs = async (req, res) => {
  try {
    const { limit = 100 } = req.query;

    const logs = await query(
      `SELECT al.*, u.name as user_name, u.role
       FROM activity_logs al
       LEFT JOIN users u ON al.user_id = u.id
       ORDER BY al.timestamp DESC
       LIMIT ?`,
      [parseInt(limit)]
    );

    res.json({ logs });
  } catch (error) {
    console.error('Get activity logs error:', error);
    res.status(500).json({ error: 'Failed to get activity logs' });
  }
};

export const createNotification = async (req, res) => {
  try {
    const { title, message, target_role } = req.body;

    await query(
      'INSERT INTO notifications (title, message, target_role) VALUES (?, ?, ?)',
      [title, message, target_role]
    );

    res.status(201).json({ message: 'Notification created successfully' });
  } catch (error) {
    console.error('Create notification error:', error);
    res.status(500).json({ error: 'Failed to create notification' });
  }
};

export const getNotifications = async (req, res) => {
  try {
    const notifications = await query(
      'SELECT * FROM notifications ORDER BY created_at DESC',
      []
    );

    res.json({ notifications });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ error: 'Failed to get notifications' });
  }
};
