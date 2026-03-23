import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { query } from '../config/database.js';

dotenv.config();

export const registerApplicant = async (req, res) => {
  try {
    const { email, password, name, marks_12th, ...profileData } = req.body;

    // Check if marks_12th is >= 35%
    if (marks_12th < 35) {
      return res.status(400).json({ error: 'Registration blocked: 12th marks must be at least 35%' });
    }

    // Check if user already exists
    const existingUser = await query('SELECT id FROM users WHERE email = ?', [email]);
    if (existingUser.length > 0) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Hash password
    const password_hash = await bcrypt.hash(password, 10);

    // Create user
    const [userResult] = await query(
      'INSERT INTO users (role, name, email, password_hash, is_active) VALUES (?, ?, ?, ?, ?)',
      ['applicant', name, email, password_hash, 1]
    );

    const userId = userResult.insertId;

    // Create applicant profile
    await query(
      `INSERT INTO applicant_profiles 
       (user_id, dob, phone, address, city, state, zip, preferred_department, 
        highest_qualification, institution, graduation_year, marks_10th, marks_12th, 
        emergency_contact, emergency_email) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
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
        marks_12th,
        profileData.emergency_contact || null,
        profileData.emergency_email || null
      ]
    );

    // Log activity
    await query(
      'INSERT INTO activity_logs (user_id, action, status) VALUES (?, ?, ?)',
      [userId, 'REGISTER', 'SUCCESS']
    );

    res.status(201).json({ message: 'Registration successful' });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const users = await query('SELECT * FROM users WHERE email = ?', [email]);
    if (users.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = users[0];

    // Check if user is active
    if (!user.is_active) {
      return res.status(403).json({ error: 'Account is disabled' });
    }

    // Verify password
    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT
    const token = jwt.sign(
      { id: user.id, role: user.role, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Log activity
    await query(
      'INSERT INTO activity_logs (user_id, action, status, ip_address) VALUES (?, ?, ?, ?)',
      [user.id, 'LOGIN', 'SUCCESS', req.ip]
    );

    // Get user profile based on role
    let profile = {};
    if (user.role === 'applicant') {
      const profiles = await query('SELECT * FROM applicant_profiles WHERE user_id = ?', [user.id]);
      profile = profiles[0] || {};
    } else if (user.role === 'faculty') {
      const profiles = await query('SELECT * FROM faculty_profiles WHERE user_id = ?', [user.id]);
      profile = profiles[0] || {};
    }

    res.json({
      token,
      user: {
        id: user.id,
        role: user.role,
        name: user.name,
        email: user.email,
        profile
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
};

export const getCurrentUser = async (req, res) => {
  try {
    const users = await query('SELECT id, role, name, email, is_active, created_at FROM users WHERE id = ?', [req.user.id]);
    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = users[0];
    let profile = {};

    if (user.role === 'applicant') {
      const profiles = await query('SELECT * FROM applicant_profiles WHERE user_id = ?', [user.id]);
      profile = profiles[0] || {};
    } else if (user.role === 'faculty') {
      const profiles = await query('SELECT * FROM faculty_profiles WHERE user_id = ?', [user.id]);
      profile = profiles[0] || {};
    }

    res.json({ user: { ...user, profile } });
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({ error: 'Failed to get user' });
  }
};
