const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

// ─── Ensure uploads directory exists ──────────────────────────────
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// ─── Storage Configuration ─────────────────────────────────────────
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueId = uuidv4();
    const ext = path.extname(file.originalname).toLowerCase();
    const sanitizedName = file.originalname
      .replace(/[^a-zA-Z0-9.-]/g, '_')
      .slice(0, 30);
    cb(null, `${uniqueId}_${sanitizedName}${ext.includes('.') ? '' : ext}`);
  }
});

// ─── Allowed File Types ────────────────────────────────────────────
const ALLOWED_TYPES = {
  'application/pdf': 'pdf',
  'application/msword': 'doc',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
  'application/vnd.ms-powerpoint': 'ppt',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'pptx',
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/gif': 'gif',
  'text/plain': 'txt'
};

// ─── File Filter ───────────────────────────────────────────────────
const fileFilter = (req, file, cb) => {
  if (ALLOWED_TYPES[file.mimetype]) {
    cb(null, true);
  } else {
    cb(new Error(
      'Invalid file type. Allowed: PDF, DOC, DOCX, PPT, PPTX, PNG, JPG, GIF, TXT'
    ), false);
  }
};

// ─── Multer Configuration ──────────────────────────────────────────
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024, // 10MB
    files: 1
  }
});

// ─── Get File Type from MIME ───────────────────────────────────────
const getFileType = (mimetype) => {
  return ALLOWED_TYPES[mimetype] || 'unknown';
};

module.exports = { upload, getFileType, ALLOWED_TYPES };