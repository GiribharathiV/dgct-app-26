
const express = require('express');
const router = express.Router();
const pool = require('../utils/db');
const auth = require('../middleware/auth');

// Get all students
router.get('/', auth(['admin', 'teacher']), async (req, res) => {
  try {
    const [students] = await pool.query('SELECT * FROM students');
    res.json(students);
  } catch (error) {
    console.error('Error fetching students:', error);
    res.status(500).json({ error: 'Failed to fetch students' });
  }
});

// Create new student
router.post('/', auth(['admin', 'teacher']), async (req, res) => {
  try {
    const { name, email } = req.body;
    
    if (!name || !email) {
      return res.status(400).json({ error: 'Name and email are required' });
    }
    
    const [result] = await pool.query(
      'INSERT INTO students (name, email) VALUES (?, ?)',
      [name, email]
    );
    
    res.status(201).json({
      id: result.insertId,
      name,
      email
    });
  } catch (error) {
    console.error('Error creating student:', error);
    res.status(500).json({ error: 'Failed to create student' });
  }
});

// Delete student
router.delete('/:id', auth(['admin', 'teacher']), async (req, res) => {
  try {
    const { id } = req.params;
    
    const [result] = await pool.query(
      'DELETE FROM students WHERE id = ?',
      [id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Student not found' });
    }
    
    res.json({ message: 'Student deleted successfully' });
  } catch (error) {
    console.error('Error deleting student:', error);
    res.status(500).json({ error: 'Failed to delete student' });
  }
});

module.exports = router;
