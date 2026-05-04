const express = require('express');
const router = express.Router();
const {
  getAllNotes,
  getNoteById,
  uploadNote,
  downloadNote,
  deleteNote,
  getMyUploads,
  getDashboardStats,
  getSubjects
} = require('../controllers/notesController');
const { protect, optionalAuth } = require('../middleware/auth');
const { upload } = require('../middleware/upload');

// ─── Public Routes ─────────────────────────────────────────────────
router.get('/', optionalAuth, getAllNotes);
router.get('/subjects', getSubjects);

// ─── Protected Routes ──────────────────────────────────────────────
router.get('/dashboard', protect, getDashboardStats);
router.get('/my-uploads', protect, getMyUploads);
router.get('/download/:id', protect, downloadNote);

// ─── Upload with Multer Error Handling ────────────────────────────
router.post('/upload', protect, (req, res, next) => {
  upload.single('file')(req, res, (err) => {
    if (err) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          error: 'File too large. Maximum size is 10MB.'
        });
      }
      return res.status(400).json({ error: err.message });
    }
    next();
  });
}, uploadNote);

router.get('/:id', optionalAuth, getNoteById);
router.delete('/:id', protect, deleteNote);

module.exports = router;