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
const { protect, verifiedOnly, optionalAuth } = require('../middleware/auth');
const { upload } = require('../middleware/upload');

// ─── Public Routes (No auth needed) ───────────────────────────────
router.get('/subjects', getSubjects);

// ─── Verified Routes (Login + Email Verified) ──────────────────────
router.get('/', protect, verifiedOnly, getAllNotes);
router.get('/dashboard', protect, verifiedOnly, getDashboardStats);
router.get('/my-uploads', protect, verifiedOnly, getMyUploads);
router.get('/download/:id', protect, verifiedOnly, downloadNote);

// ─── Upload with Multer ────────────────────────────────────────────
router.post('/upload', protect, verifiedOnly, (req, res, next) => {
  upload.single('file')(req, res, (err) => {
    if (err) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ error: 'File too large. Maximum size is 10MB.' });
      }
      return res.status(400).json({ error: err.message });
    }
    next();
  });
}, uploadNote);

router.get('/:id', optionalAuth, getNoteById);
router.delete('/:id', protect, verifiedOnly, deleteNote);

module.exports = router;