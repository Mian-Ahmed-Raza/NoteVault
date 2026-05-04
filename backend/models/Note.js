const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    minlength: [3, 'Title must be at least 3 characters'],
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  subject: {
    type: String,
    required: [true, 'Subject is required'],
    trim: true,
    maxlength: [50, 'Subject cannot exceed 50 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters'],
    default: ''
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true,
    maxlength: [20, 'Each tag cannot exceed 20 characters']
  }],
  fileName: {
    type: String,
    required: true
  },
  originalName: {
    type: String,
    required: true
  },
  fileUrl: {
    type: String,
    required: true
  },
  fileType: {
    type: String,
    required: true,
    enum: ['pdf', 'docx', 'doc', 'ppt', 'pptx', 'png', 'jpg', 'jpeg', 'gif', 'txt']
  },
  fileSize: {
    type: Number,
    required: true
  },
  uploader: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  downloadsCount: {
    type: Number,
    default: 0
  },
  isPublic: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// ─── Indexes for Search Performance ───────────────────────────────
noteSchema.index({ title: 'text', subject: 'text', tags: 'text', description: 'text' });
noteSchema.index({ subject: 1 });
noteSchema.index({ uploader: 1 });
noteSchema.index({ downloadsCount: -1 });
noteSchema.index({ createdAt: -1 });

// ─── Virtual: File Size Formatted ─────────────────────────────────
noteSchema.virtual('fileSizeFormatted').get(function () {
  const bytes = this.fileSize;
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / 1048576).toFixed(1) + ' MB';
});

module.exports = mongoose.model('Note', noteSchema);