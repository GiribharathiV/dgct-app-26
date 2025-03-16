
-- This file contains SQL commands to create your database schema
-- You can run this file to set up your database initially

CREATE DATABASE IF NOT EXISTS Teast;

USE Teast;

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('admin', 'teacher', 'student') NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Students table
CREATE TABLE IF NOT EXISTS students (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Assessments table
CREATE TABLE IF NOT EXISTS assessments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  dueDate DATETIME NOT NULL,
  created_by INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Insert sample data
-- Add some default users (password should be hashed in production)
INSERT INTO users (name, email, password, role) VALUES
('Admin User', 'admin@example.com', 'adminpass', 'admin'),
('Teacher One', 'teacher1@example.com', 'password1', 'teacher'),
('Teacher Two', 'teacher2@example.com', 'password2', 'teacher'),
('Student One', 'student1@example.com', 'student1', 'student');

-- Add some students
INSERT INTO students (name, email) VALUES
('John Doe', 'john@example.com'),
('Jane Smith', 'jane@example.com'),
('Bob Johnson', 'bob@example.com');

-- Add some assessments
INSERT INTO assessments (title, description, dueDate, created_by) VALUES
('Midterm Exam', 'Comprehensive exam covering chapters 1-5', '2023-10-15 14:00:00', 2),
('Final Project', 'Group project applying concepts from the entire semester', '2023-11-30 23:59:59', 2),
('Quiz 1', 'Short quiz on chapter 1 material', '2023-09-10 10:00:00', 3);
