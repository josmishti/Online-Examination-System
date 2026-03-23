import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  port: process.env.DB_PORT || 3306,
};

async function seedDatabase() {
  let connection;
  
  try {
    // Connect without database first
    connection = await mysql.createConnection(dbConfig);
    
    // Create database if it doesn't exist
    await connection.query(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME || 'examination_system'}`);
    await connection.query(`USE ${process.env.DB_NAME || 'examination_system'}`);

    console.log('Creating tables...');

    // Users table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        role ENUM('applicant', 'faculty', 'administrator') NOT NULL,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Applicant Profiles table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS applicant_profiles (
        user_id INT PRIMARY KEY,
        dob DATE,
        phone VARCHAR(20),
        address TEXT,
        city VARCHAR(100),
        state VARCHAR(100),
        zip VARCHAR(20),
        preferred_department VARCHAR(100),
        highest_qualification VARCHAR(100),
        institution VARCHAR(255),
        graduation_year INT,
        marks_10th DECIMAL(5,2),
        marks_12th DECIMAL(5,2) NOT NULL,
        emergency_contact VARCHAR(20),
        emergency_email VARCHAR(255),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // Faculty Profiles table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS faculty_profiles (
        user_id INT PRIMARY KEY,
        faculty_id VARCHAR(50) UNIQUE,
        department VARCHAR(100),
        designation VARCHAR(100),
        office_room VARCHAR(50),
        phone VARCHAR(20),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // Departments table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS departments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        department_name VARCHAR(255) NOT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Subjects table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS subjects (
        id INT AUTO_INCREMENT PRIMARY KEY,
        subject_name VARCHAR(255) NOT NULL,
        department_id INT,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL
      )
    `);

    // Questions table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS questions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        subject_id INT NOT NULL,
        faculty_id INT NOT NULL,
        question_text TEXT NOT NULL,
        option_a TEXT NOT NULL,
        option_b TEXT NOT NULL,
        option_c TEXT NOT NULL,
        option_d TEXT NOT NULL,
        correct_option ENUM('A', 'B', 'C', 'D') NOT NULL,
        difficulty ENUM('easy', 'medium', 'hard') DEFAULT 'medium',
        marks INT DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
        FOREIGN KEY (faculty_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // Exams table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS exams (
        id INT AUTO_INCREMENT PRIMARY KEY,
        exam_name VARCHAR(255) NOT NULL,
        duration INT NOT NULL,
        start_time DATETIME NOT NULL,
        end_time DATETIME NOT NULL,
        total_marks INT DEFAULT 0,
        created_by_admin INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (created_by_admin) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // Exam Subjects table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS exam_subjects (
        exam_id INT NOT NULL,
        subject_id INT NOT NULL,
        number_of_questions_to_pick INT NOT NULL,
        PRIMARY KEY (exam_id, subject_id),
        FOREIGN KEY (exam_id) REFERENCES exams(id) ON DELETE CASCADE,
        FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE
      )
    `);

    // Exam Attempts table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS exam_attempts (
        id INT AUTO_INCREMENT PRIMARY KEY,
        exam_id INT NOT NULL,
        applicant_id INT NOT NULL,
        start_time DATETIME NOT NULL,
        end_time DATETIME,
        tab_switch_count INT DEFAULT 0,
        FOREIGN KEY (exam_id) REFERENCES exams(id) ON DELETE CASCADE,
        FOREIGN KEY (applicant_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // Answers table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS answers (
        attempt_id INT NOT NULL,
        question_id INT NOT NULL,
        selected_option ENUM('A', 'B', 'C', 'D'),
        PRIMARY KEY (attempt_id, question_id),
        FOREIGN KEY (attempt_id) REFERENCES exam_attempts(id) ON DELETE CASCADE,
        FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE
      )
    `);

    // Results table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS results (
        id INT AUTO_INCREMENT PRIMARY KEY,
        attempt_id INT UNIQUE NOT NULL,
        score DECIMAL(10,2) NOT NULL,
        percentage DECIMAL(5,2) NOT NULL,
        status ENUM('PASS', 'FAIL') NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (attempt_id) REFERENCES exam_attempts(id) ON DELETE CASCADE
      )
    `);

    // Notifications table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS notifications (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        target_role ENUM('applicant', 'faculty', 'administrator', 'all') NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Activity Logs table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS activity_logs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT,
        action VARCHAR(100) NOT NULL,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        ip_address VARCHAR(45),
        status VARCHAR(50),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
      )
    `);

    console.log('Tables created successfully');

    // Create default admin user
    console.log('Creating default admin user...');
    const adminPassword = 'Admin@123';
    const passwordHash = await bcrypt.hash(adminPassword, 10);

    // Check if admin already exists
    const [existing] = await connection.query('SELECT id FROM users WHERE email = ?', ['admin@system.local']);
    
    if (existing.length === 0) {
      await connection.query(
        'INSERT INTO users (role, name, email, password_hash, is_active) VALUES (?, ?, ?, ?, ?)',
        ['administrator', 'System Administrator', 'admin@system.local', passwordHash, 1]
      );
      console.log('Default admin user created:');
      console.log('  Email: admin@system.local');
      console.log('  Password: Admin@123');
    } else {
      console.log('Admin user already exists');
    }

    console.log('Database seeded successfully!');
    
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

seedDatabase();
