import { query } from '../config/database.js';

export const getDashboard = async (req, res) => {
  try {
    const applicantId = req.user.id;

    // Get upcoming exams
    const upcomingExams = await query(
      `SELECT e.*, 
       (SELECT COUNT(*) FROM exam_attempts WHERE exam_id = e.id AND applicant_id = ?) as attempted
       FROM exams e 
       WHERE e.end_time > NOW() 
       ORDER BY e.start_time ASC`,
      [applicantId]
    );

    // Get completed exams
    const completedExams = await query(
      `SELECT e.*, ea.start_time as attempt_start, ea.end_time as attempt_end,
       r.score, r.percentage, r.status
       FROM exams e
       INNER JOIN exam_attempts ea ON e.id = ea.exam_id
       LEFT JOIN results r ON ea.id = r.attempt_id
       WHERE ea.applicant_id = ? AND e.end_time < NOW()
       ORDER BY ea.end_time DESC`,
      [applicantId]
    );

    // Get pending results
    const pendingResults = await query(
      `SELECT e.*, ea.id as attempt_id, ea.start_time as attempt_start, ea.end_time as attempt_end
       FROM exams e
       INNER JOIN exam_attempts ea ON e.id = ea.exam_id
       LEFT JOIN results r ON ea.id = r.attempt_id
       WHERE ea.applicant_id = ? AND r.id IS NULL AND ea.end_time IS NOT NULL
       ORDER BY ea.end_time DESC`,
      [applicantId]
    );

    // Get notifications
    const notifications = await query(
      `SELECT * FROM notifications 
       WHERE target_role = 'applicant' OR target_role = 'all'
       ORDER BY created_at DESC 
       LIMIT 10`,
      []
    );

    // Get recent exam activity
    const recentActivity = await query(
      `SELECT e.exam_name, ea.start_time, ea.end_time, r.score, r.percentage
       FROM exam_attempts ea
       INNER JOIN exams e ON ea.exam_id = e.id
       LEFT JOIN results r ON ea.id = r.attempt_id
       WHERE ea.applicant_id = ?
       ORDER BY ea.start_time DESC
       LIMIT 5`,
      [applicantId]
    );

    res.json({
      upcomingExams,
      completedExams,
      pendingResults,
      notifications,
      recentActivity
    });
  } catch (error) {
    console.error('Get dashboard error:', error);
    res.status(500).json({ error: 'Failed to get dashboard data' });
  }
};

export const getExams = async (req, res) => {
  try {
    const applicantId = req.user.id;

    const exams = await query(
      `SELECT e.*, 
       (SELECT COUNT(*) FROM exam_attempts WHERE exam_id = e.id AND applicant_id = ?) as attempted,
       (SELECT id FROM exam_attempts WHERE exam_id = e.id AND applicant_id = ? LIMIT 1) as attempt_id
       FROM exams e
       ORDER BY e.start_time DESC`,
      [applicantId, applicantId]
    );

    res.json({ exams });
  } catch (error) {
    console.error('Get exams error:', error);
    res.status(500).json({ error: 'Failed to get exams' });
  }
};

export const startExam = async (req, res) => {
  try {
    const { examId } = req.params;
    const applicantId = req.user.id;

    // Check if exam exists and is available
    const exams = await query('SELECT * FROM exams WHERE id = ?', [examId]);
    if (exams.length === 0) {
      return res.status(404).json({ error: 'Exam not found' });
    }

    const exam = exams[0];
    const now = new Date();

    if (new Date(exam.start_time) > now) {
      return res.status(400).json({ error: 'Exam has not started yet' });
    }

    if (new Date(exam.end_time) < now) {
      return res.status(400).json({ error: 'Exam has ended' });
    }

    // Check if already attempted
    const existingAttempts = await query(
      'SELECT * FROM exam_attempts WHERE exam_id = ? AND applicant_id = ?',
      [examId, applicantId]
    );

    if (existingAttempts.length > 0) {
      return res.status(400).json({ error: 'Exam already attempted' });
    }

    // Create attempt
    const attemptResult = await query(
      'INSERT INTO exam_attempts (exam_id, applicant_id, start_time, tab_switch_count) VALUES (?, ?, NOW(), 0)',
      [examId, applicantId]
    );

    const attemptId = attemptResult.insertId;

    // Get exam subjects with question counts
    const examSubjects = await query(
      'SELECT subject_id, number_of_questions_to_pick FROM exam_subjects WHERE exam_id = ?',
      [examId]
    );

    // Get questions from each subject
// Get questions from each subject
// Get questions from each subject
let allQuestions = [];

for (const es of examSubjects) {

  const limit = Number(es.number_of_questions_to_pick);

  const subjectQuestions = await query(
    `SELECT * FROM questions
     WHERE subject_id = ?
     ORDER BY RAND()
     LIMIT ${limit}`,
    [es.subject_id]
  );

  allQuestions = allQuestions.concat(subjectQuestions);
}
    // Shuffle all questions
    allQuestions.sort(() => Math.random() - 0.5);

    // Store question IDs for this attempt (we'll use answers table to track which questions are part of this attempt)
    // First, create placeholder answers to mark which questions belong to this attempt
    for (const q of allQuestions) {
      await query(
        'INSERT INTO answers (attempt_id, question_id, selected_option) VALUES (?, ?, NULL) ON DUPLICATE KEY UPDATE selected_option = selected_option',
        [attemptId, q.id]
      );
    }

    // Calculate total marks
    const totalMarks = allQuestions.reduce((sum, q) => sum + q.marks, 0);
    await query('UPDATE exams SET total_marks = ? WHERE id = ?', [totalMarks, examId]);

    res.json({ attemptId, questions: allQuestions, exam: { ...exam, total_marks: totalMarks } });
  } catch (error) {
    console.error('Start exam error:', error);
    res.status(500).json({ error: 'Failed to start exam' });
  }
};

export const getExamQuestions = async (req, res) => {
  try {
    const { attemptId } = req.params;
    const applicantId = req.user.id;

    // Verify attempt belongs to user
    const attempts = await query(
      'SELECT * FROM exam_attempts WHERE id = ? AND applicant_id = ?',
      [attemptId, applicantId]
    );

    if (attempts.length === 0) {
      return res.status(404).json({ error: 'Attempt not found' });
    }

    const attempt = attempts[0];

    // Get exam
    const exams = await query('SELECT * FROM exams WHERE id = ?', [attempt.exam_id]);
    const exam = exams[0];

    // Get questions that were selected for this attempt (those with answers entries)
    const questions = await query(
      `SELECT q.*, a.selected_option 
       FROM answers a
       INNER JOIN questions q ON a.question_id = q.id
       WHERE a.attempt_id = ?
       ORDER BY q.id`,
      [attemptId]
    );

    // Get saved answers
    const answers = await query(
      'SELECT question_id, selected_option FROM answers WHERE attempt_id = ?',
      [attemptId]
    );

    const answerMap = {};
    answers.forEach(a => {
      answerMap[a.question_id] = a.selected_option;
    });

    res.json({ questions, exam, attempt, answers: answerMap });
  } catch (error) {
    console.error('Get exam questions error:', error);
    res.status(500).json({ error: 'Failed to get exam questions' });
  }
};

export const saveAnswer = async (req, res) => {
  try {
    const { attemptId } = req.params;
    const { questionId, selectedOption } = req.body;
    const applicantId = req.user.id;

    // Verify attempt
    const attempts = await query(
      'SELECT * FROM exam_attempts WHERE id = ? AND applicant_id = ?',
      [attemptId, applicantId]
    );

    if (attempts.length === 0) {
      return res.status(404).json({ error: 'Attempt not found' });
    }

    const attempt = attempts[0];

    // Check if exam time has ended
    const exams = await query('SELECT * FROM exams WHERE id = ?', [attempt.exam_id]);
    const exam = exams[0];

    if (new Date(exam.end_time) < new Date()) {
      return res.status(400).json({ error: 'Exam time has ended' });
    }

    // Save or update answer
    await query(
      `INSERT INTO answers (attempt_id, question_id, selected_option) 
       VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE selected_option = ?`,
      [attemptId, questionId, selectedOption, selectedOption]
    );

    res.json({ message: 'Answer saved' });
  } catch (error) {
    console.error('Save answer error:', error);
    res.status(500).json({ error: 'Failed to save answer' });
  }
};

export const submitExam = async (req, res) => {
  try {
    const { attemptId } = req.params;
    const applicantId = req.user.id;

    // Verify attempt
    const attempts = await query(
      'SELECT * FROM exam_attempts WHERE id = ? AND applicant_id = ?',
      [attemptId, applicantId]
    );

    if (attempts.length === 0) {
      return res.status(404).json({ error: 'Attempt not found' });
    }

    const attempt = attempts[0];

    // Update attempt end time
    await query(
      'UPDATE exam_attempts SET end_time = NOW() WHERE id = ?',
      [attemptId]
    );

    // Calculate result - get questions from answers table (those selected for this attempt)
    const answers = await query(
      `SELECT q.id, q.correct_option, q.marks, a.selected_option
       FROM answers a
       INNER JOIN questions q ON a.question_id = q.id
       WHERE a.attempt_id = ?`,
      [attemptId]
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

    // Save result
    await query(
      `INSERT INTO results (attempt_id, score, percentage, status)
       VALUES (?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE score = ?, percentage = ?, status = ?`,
      [attemptId, score, percentage, status, score, percentage, status]
    );

    res.json({ message: 'Exam submitted successfully', score, percentage, status });
  } catch (error) {
    console.error('Submit exam error:', error);
    res.status(500).json({ error: 'Failed to submit exam' });
  }
};

export const incrementTabSwitch = async (req, res) => {
  try {
    const { attemptId } = req.params;
    const applicantId = req.user.id;

    await query(
      'UPDATE exam_attempts SET tab_switch_count = tab_switch_count + 1 WHERE id = ? AND applicant_id = ?',
      [attemptId, applicantId]
    );

    res.json({ message: 'Tab switch recorded' });
  } catch (error) {
    console.error('Tab switch error:', error);
    res.status(500).json({ error: 'Failed to record tab switch' });
  }
};

export const getResults = async (req, res) => {
  try {
    const applicantId = req.user.id;

    const results = await query(
      `SELECT e.*, ea.id as attempt_id, ea.start_time as attempt_start, 
       ea.end_time as attempt_end, ea.tab_switch_count,
       r.score, r.percentage, r.status
       FROM exams e
       INNER JOIN exam_attempts ea ON e.id = ea.exam_id
       LEFT JOIN results r ON ea.id = r.attempt_id
       WHERE ea.applicant_id = ? AND r.id IS NOT NULL
       ORDER BY ea.end_time DESC`,
      [applicantId]
    );

    res.json({ results });
  } catch (error) {
    console.error('Get results error:', error);
    res.status(500).json({ error: 'Failed to get results' });
  }
};

export const getResultDetails = async (req, res) => {
  try {
    const { attemptId } = req.params;
    const applicantId = req.user.id;

    // Verify attempt
    const attempts = await query(
      'SELECT * FROM exam_attempts WHERE id = ? AND applicant_id = ?',
      [attemptId, applicantId]
    );

    if (attempts.length === 0) {
      return res.status(404).json({ error: 'Result not found' });
    }

    const attempt = attempts[0];

    // Get result
    const results = await query('SELECT * FROM results WHERE attempt_id = ?', [attemptId]);
    const result = results[0];

    // Get detailed answers - from answers table (questions selected for this attempt)
    const detailedAnswers = await query(
      `SELECT q.*, a.selected_option,
       CASE WHEN a.selected_option = q.correct_option THEN 1 ELSE 0 END as is_correct
       FROM answers a
       INNER JOIN questions q ON a.question_id = q.id
       WHERE a.attempt_id = ?
       ORDER BY q.id`,
      [attemptId]
    );

    // Get exam
    const exams = await query('SELECT * FROM exams WHERE id = ?', [attempt.exam_id]);
    const exam = exams[0];

    res.json({ result, detailedAnswers, exam, attempt });
  } catch (error) {
    console.error('Get result details error:', error);
    res.status(500).json({ error: 'Failed to get result details' });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const applicantId = req.user.id;
    const profileData = req.body;

    await query(
      `UPDATE applicant_profiles SET
       dob = ?, phone = ?, address = ?, city = ?, state = ?, zip = ?,
       preferred_department = ?, highest_qualification = ?, institution = ?,
       graduation_year = ?, marks_10th = ?, emergency_contact = ?, emergency_email = ?
       WHERE user_id = ?`,
      [
        profileData.dob || null,
        profileData.phone || null,
        profileData.address || null,
        profileData.city || null,
        profileData.state || null,
        profileData.zip || null,
        profileData.preferred_department || null,
        profileData.highest_qualification || null,
        profileData.institution || null,
        profileData.graduation_year || null,
        profileData.marks_10th || null,
        profileData.emergency_contact || null,
        profileData.emergency_email || null,
        applicantId
      ]
    );

    res.json({ message: 'Profile updated successfully' });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
};

export const getNotifications = async (req, res) => {
  try {
    const notifications = await query(
      `SELECT * FROM notifications 
       WHERE target_role = 'applicant' OR target_role = 'all'
       ORDER BY created_at DESC`,
      []
    );

    res.json({ notifications });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ error: 'Failed to get notifications' });
  }
};
