
const express = require('express');
const router = express.Router();
const pool = require('../utils/db');
const auth = require('../middleware/auth');

// Get all assessments
router.get('/', auth(['admin', 'teacher', 'student']), async (req, res) => {
  try {
    const [assessments] = await pool.query('SELECT * FROM assessments');
    res.json(assessments);
  } catch (error) {
    console.error('Error fetching assessments:', error);
    res.status(500).json({ error: 'Failed to fetch assessments' });
  }
});

// Create new assessment
router.post('/', auth(['admin', 'teacher']), async (req, res) => {
  try {
    const { title, description, dueDate } = req.body;
    
    if (!title || !description || !dueDate) {
      return res.status(400).json({ 
        error: 'Title, description and due date are required' 
      });
    }
    
    const [result] = await pool.query(
      'INSERT INTO assessments (title, description, dueDate) VALUES (?, ?, ?)',
      [title, description, dueDate]
    );
    
    res.status(201).json({
      id: result.insertId,
      title,
      description,
      dueDate
    });
  } catch (error) {
    console.error('Error creating assessment:', error);
    res.status(500).json({ error: 'Failed to create assessment' });
  }
});

// Delete assessment
router.delete('/:id', auth(['admin', 'teacher']), async (req, res) => {
  try {
    const { id } = req.params;
    
    const [result] = await pool.query(
      'DELETE FROM assessments WHERE id = ?',
      [id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Assessment not found' });
    }
    
    res.json({ message: 'Assessment deleted successfully' });
  } catch (error) {
    console.error('Error deleting assessment:', error);
    res.status(500).json({ error: 'Failed to delete assessment' });
  }
});

module.exports = router;
