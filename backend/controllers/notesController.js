const Note = require('../models/Note');
const User = require('../models/User');
const path = require('path');
const fs = require('fs');
const { getFileType } = require('../middleware/upload');

// ─── Get All Notes ─────────────────────────────────────────────────
const getAllNotes = async (req, res, next) => {
  try {
    const {
      search,
      subject,
      sort = 'newest',
      page = 1,
      limit = 12,
      tags
    } = req.query;

    const query = { isPublic: true };

    // ─── Text Search ───────────────────────────────────────────────
    if (search && search.trim()) {
      query.$or = [
        { title: { $regex: search.trim(), $options: 'i' } },
        { subject: { $regex: search.trim(), $options: 'i' } },
        { description: { $regex: search.trim(), $options: 'i' } },
        { tags: { $in: [new RegExp(search.trim(), 'i')] } }
      ];
    }

    // ─── Subject Filter ────────────────────────────────────────────
    if (subject && subject !== 'all') {
      query.subject = { $regex: subject.trim(), $options: 'i' };
    }

    // ─── Tags Filter ───────────────────────────────────────────────
    if (tags) {
      const tagArray = tags.split(',').map(t => t.trim().toLowerCase());
      query.tags = { $in: tagArray };
    }

    // ─── Sort Options ──────────────────────────────────────────────
    let sortQuery = {};
    switch (sort) {
      case 'newest': sortQuery = { createdAt: -1 }; break;
      case 'oldest': sortQuery = { createdAt: 1 }; break;
      case 'most-downloaded': sortQuery = { downloadsCount: -1 }; break;
      case 'alphabetical': sortQuery = { title: 1 }; break;
      default: sortQuery = { createdAt: -1 };
    }

    // ─── Pagination ────────────────────────────────────────────────
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    const [notes, total] = await Promise.all([
      Note.find(query)
        .populate('uploader', 'name rollNumber email')
        .sort(sortQuery)
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Note.countDocuments(query)
    ]);

    // Add computed fileUrl
    const notesWithUrl = notes.map(note => ({
      ...note,
      fileUrl: `${req.protocol}://${req.get('host')}/uploads/${note.fileName}`,
      fileSizeFormatted: formatFileSize(note.fileSize)
    }));

    res.json({
      notes: notesWithUrl,
      pagination: {
        currentPage: pageNum,
        totalPages: Math.ceil(total / limitNum),
        totalNotes: total,
        hasMore: pageNum * limitNum < total
      }
    });
  } catch (error) {
    next(error);
  }
};

// ─── Get Single Note ───────────────────────────────────────────────
const getNoteById = async (req, res, next) => {
  try {
    const note = await Note.findById(req.params.id)
      .populate('uploader', 'name rollNumber email');

    if (!note) {
      return res.status(404).json({ error: 'Note not found' });
    }

    res.json({
      note: {
        ...note.toObject(),
        fileUrl: `${req.protocol}://${req.get('host')}/uploads/${note.fileName}`,
        fileSizeFormatted: formatFileSize(note.fileSize)
      }
    });
  } catch (error) {
    next(error);
  }
};

// ─── Upload Note ───────────────────────────────────────────────────
const uploadNote = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Please upload a file' });
    }

    const { title, subject, description, tags } = req.body;

    if (!title || !subject) {
      // Clean up uploaded file
      fs.unlink(req.file.path, () => {});
      return res.status(400).json({
        error: 'Title and subject are required'
      });
    }

    // Parse tags
    let parsedTags = [];
    if (tags) {
      try {
        parsedTags = typeof tags === 'string'
          ? JSON.parse(tags)
          : tags;
        parsedTags = parsedTags
          .filter(t => t && t.trim())
          .map(t => t.trim().toLowerCase())
          .slice(0, 10); // Max 10 tags
      } catch {
        parsedTags = tags.split(',').map(t => t.trim().toLowerCase()).filter(Boolean);
      }
    }

    const fileType = getFileType(req.file.mimetype);

    // Create note
    const note = await Note.create({
      title: title.trim(),
      subject: subject.trim(),
      description: description?.trim() || '',
      tags: parsedTags,
      fileName: req.file.filename,
      originalName: req.file.originalname,
      fileUrl: `/uploads/${req.file.filename}`,
      fileType,
      fileSize: req.file.size,
      uploader: req.user._id
    });

    // Update user's upload count
    await User.findByIdAndUpdate(req.user._id, {
      $inc: { totalUploads: 1 }
    });

    // Populate uploader info
    await note.populate('uploader', 'name rollNumber email');

    res.status(201).json({
      message: 'Note uploaded successfully!',
      note: {
        ...note.toObject(),
        fileUrl: `${req.protocol}://${req.get('host')}/uploads/${note.fileName}`,
        fileSizeFormatted: formatFileSize(note.fileSize)
      }
    });
  } catch (error) {
    // Clean up file if DB save failed
    if (req.file) {
      fs.unlink(req.file.path, () => {});
    }
    next(error);
  }
};

// ─── Download Note ─────────────────────────────────────────────────
const downloadNote = async (req, res, next) => {
  try {
    const note = await Note.findById(req.params.id);

    if (!note) {
      return res.status(404).json({ error: 'Note not found' });
    }

    const filePath = path.join(__dirname, '../uploads', note.fileName);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'File not found on server' });
    }

    // Increment download count
    await Note.findByIdAndUpdate(req.params.id, {
      $inc: { downloadsCount: 1 }
    });

    // Set download headers
    res.setHeader('Content-Disposition', `attachment; filename="${note.originalName}"`);
    res.setHeader('Content-Type', 'application/octet-stream');

    // Stream file to client
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);

    fileStream.on('error', () => {
      res.status(500).json({ error: 'Error downloading file' });
    });
  } catch (error) {
    next(error);
  }
};

// ─── Delete Note ───────────────────────────────────────────────────
const deleteNote = async (req, res, next) => {
  try {
    const note = await Note.findById(req.params.id);

    if (!note) {
      return res.status(404).json({ error: 'Note not found' });
    }

    // Check ownership
    if (note.uploader.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        error: 'Access denied. You can only delete your own notes.'
      });
    }

    // Delete file from disk
    const filePath = path.join(__dirname, '../uploads', note.fileName);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // Delete from DB
    await Note.findByIdAndDelete(req.params.id);

    // Update user upload count
    await User.findByIdAndUpdate(req.user._id, {
      $inc: { totalUploads: -1 }
    });

    res.json({ message: 'Note deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// ─── Get My Uploads ────────────────────────────────────────────────
const getMyUploads = async (req, res, next) => {
  try {
    const { page = 1, limit = 12, sort = 'newest' } = req.query;

    let sortQuery = {};
    switch (sort) {
      case 'newest': sortQuery = { createdAt: -1 }; break;
      case 'oldest': sortQuery = { createdAt: 1 }; break;
      case 'most-downloaded': sortQuery = { downloadsCount: -1 }; break;
      default: sortQuery = { createdAt: -1 };
    }

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    const [notes, total] = await Promise.all([
      Note.find({ uploader: req.user._id })
        .populate('uploader', 'name rollNumber email')
        .sort(sortQuery)
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Note.countDocuments({ uploader: req.user._id })
    ]);

    const notesWithUrl = notes.map(note => ({
      ...note,
      fileUrl: `${req.protocol}://${req.get('host')}/uploads/${note.fileName}`,
      fileSizeFormatted: formatFileSize(note.fileSize)
    }));

    res.json({
      notes: notesWithUrl,
      pagination: {
        currentPage: pageNum,
        totalPages: Math.ceil(total / limitNum),
        totalNotes: total
      }
    });
  } catch (error) {
    next(error);
  }
};

// ─── Get Dashboard Stats ───────────────────────────────────────────
const getDashboardStats = async (req, res, next) => {
  try {
    const [
      totalNotes,
      myUploads,
      totalDownloads,
      subjects,
      recentNotes,
      topNotes
    ] = await Promise.all([
      Note.countDocuments({ isPublic: true }),
      Note.countDocuments({ uploader: req.user._id }),
      Note.aggregate([
        { $group: { _id: null, total: { $sum: '$downloadsCount' } } }
      ]),
      Note.distinct('subject', { isPublic: true }),
      Note.find({ isPublic: true })
        .populate('uploader', 'name rollNumber')
        .sort({ createdAt: -1 })
        .limit(5)
        .lean(),
      Note.find({ isPublic: true })
        .populate('uploader', 'name rollNumber')
        .sort({ downloadsCount: -1 })
        .limit(5)
        .lean()
    ]);

    // My total downloads received
    const myDownloadsData = await Note.aggregate([
      { $match: { uploader: req.user._id } },
      { $group: { _id: null, total: { $sum: '$downloadsCount' } } }
    ]);

    res.json({
      stats: {
        totalNotes,
        myUploads,
        totalDownloads: totalDownloads[0]?.total || 0,
        myDownloadsReceived: myDownloadsData[0]?.total || 0,
        subjectsCount: subjects.length,
        subjects: subjects.slice(0, 10)
      },
      recentNotes: recentNotes.map(note => ({
        ...note,
        fileUrl: `${req.protocol}://${req.get('host')}/uploads/${note.fileName}`,
        fileSizeFormatted: formatFileSize(note.fileSize)
      })),
      topNotes: topNotes.map(note => ({
        ...note,
        fileUrl: `${req.protocol}://${req.get('host')}/uploads/${note.fileName}`,
        fileSizeFormatted: formatFileSize(note.fileSize)
      }))
    });
  } catch (error) {
    next(error);
  }
};

// ─── Get Subjects List ─────────────────────────────────────────────
const getSubjects = async (req, res, next) => {
  try {
    const subjects = await Note.distinct('subject', { isPublic: true });
    res.json({ subjects: subjects.sort() });
  } catch (error) {
    next(error);
  }
};

// ─── Helper: Format File Size ──────────────────────────────────────
const formatFileSize = (bytes) => {
  if (!bytes) return '0 B';
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / 1048576).toFixed(1) + ' MB';
};

module.exports = {
  getAllNotes,
  getNoteById,
  uploadNote,
  downloadNote,
  deleteNote,
  getMyUploads,
  getDashboardStats,
  getSubjects
};