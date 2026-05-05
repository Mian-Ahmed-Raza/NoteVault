const express = require('express');
const router = express.Router();
const { adminProtect } = require('../middleware/adminAuth');
const {
  getAdminStats,
  getAllUsers,
  toggleBanUser,
  deleteUser,
  getAllNotes,
  deleteNote,
  makeAdmin
} = require('../controllers/adminController');

// All routes protected by adminProtect middleware
router.use(adminProtect);

router.get('/stats', getAdminStats);
router.get('/users', getAllUsers);
router.put('/users/:id/ban', toggleBanUser);
router.put('/users/:id/make-admin', makeAdmin);
router.delete('/users/:id', deleteUser);
router.get('/notes', getAllNotes);
router.delete('/notes/:id', deleteNote);

module.exports = router;