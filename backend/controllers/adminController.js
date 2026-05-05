const User = require('../models/User');
const Note = require('../models/Note');
const fs = require('fs');
const path = require('path');

// ─── Get Admin Dashboard Stats ─────────────────────────────────────
const getAdminStats = async (req, res, next) => {
  try {
    const [
      totalUsers,
      totalNotes,
      bannedUsers,
      totalDownloads,
      recentUsers,
      recentNotes,
      topUploaders,
      subjectStats,
      fileTypeStats,
      dailyUploads
    ] = await Promise.all([
      User.countDocuments({ isAdmin: false }),
      Note.countDocuments(),
      User.countDocuments({ isBanned: true }),
      Note.aggregate([
        { $group: { _id: null, total: { $sum: '$downloadsCount' } } }
      ]),
      User.find({ isAdmin: false })
        .sort({ createdAt: -1 })
        .limit(5)
        .select('-password'),
      Note.find()
        .populate('uploader', 'name email')
        .sort({ createdAt: -1 })
        .limit(5),
      Note.aggregate([
        { $group: { _id: '$uploader', count: { $sum: 1 }, downloads: { $sum: '$downloadsCount' } } },
        { $sort: { count: -1 } },
        { $limit: 5 },
        {
          $lookup: {
            from: 'users',
            localField: '_id',
            foreignField: '_id',
            as: 'user'
          }
        },
        { $unwind: '$user' },
        {
          $project: {
            name: '$user.name',
            email: '$user.email',
            count: 1,
            downloads: 1
          }
        }
      ]),
      Note.aggregate([
        { $group: { _id: '$subject', count: { $sum: 1 }, downloads: { $sum: '$downloadsCount' } } },
        { $sort: { count: -1 } },
        { $limit: 8 }
      ]),
      Note.aggregate([
        { $group: { _id: '$fileType', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),
      Note.aggregate([
        {
          $group: {
            _id: {
              $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
            },
            count: { $sum: 1 }
          }
        },
        { $sort: { _id: -1 } },
        { $limit: 7 }
      ])
    ]);

    res.json({
      stats: {
        totalUsers,
        totalNotes,
        bannedUsers,
        totalDownloads: totalDownloads[0]?.total || 0,
        activeUsers: totalUsers - bannedUsers
      },
      recentUsers: recentUsers.map(u => u.toPublicJSON()),
      recentNotes,
      topUploaders,
      subjectStats,
      fileTypeStats,
      dailyUploads: dailyUploads.reverse()
    });
  } catch (error) {
    next(error);
  }
};

// ─── Get All Users ─────────────────────────────────────────────────
const getAllUsers = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      filter = 'all'
    } = req.query;

    const query = { isAdmin: false };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { rollNumber: { $regex: search, $options: 'i' } }
      ];
    }

    if (filter === 'banned') query.isBanned = true;
    if (filter === 'active') query.isBanned = false;

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, parseInt(limit));
    const skip = (pageNum - 1) * limitNum;

    const [users, total] = await Promise.all([
      User.find(query)
        .select('-password')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      User.countDocuments(query)
    ]);

    // Get upload counts for each user
    const userIds = users.map(u => u._id);
    const uploadCounts = await Note.aggregate([
      { $match: { uploader: { $in: userIds } } },
      { $group: { _id: '$uploader', count: { $sum: 1 }, downloads: { $sum: '$downloadsCount' } } }
    ]);

    const uploadMap = {};
    uploadCounts.forEach(u => {
      uploadMap[u._id.toString()] = {
        count: u.count,
        downloads: u.downloads
      };
    });

    const usersWithStats = users.map(user => ({
      ...user.toPublicJSON(),
      uploadStats: uploadMap[user._id.toString()] || { count: 0, downloads: 0 }
    }));

    res.json({
      users: usersWithStats,
      pagination: {
        currentPage: pageNum,
        totalPages: Math.ceil(total / limitNum),
        totalUsers: total,
        hasMore: pageNum * limitNum < total
      }
    });
  } catch (error) {
    next(error);
  }
};

// ─── Ban / Unban User ──────────────────────────────────────────────
const toggleBanUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.isAdmin) {
      return res.status(403).json({ error: 'Cannot ban an admin user' });
    }

    user.isBanned = !user.isBanned;
    user.banReason = user.isBanned ? (reason || 'Violated platform rules') : '';
    await user.save();

    res.json({
      message: user.isBanned
        ? `User ${user.name} has been banned`
        : `User ${user.name} has been unbanned`,
      user: user.toPublicJSON()
    });
  } catch (error) {
    next(error);
  }
};

// ─── Delete User ───────────────────────────────────────────────────
const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.isAdmin) {
      return res.status(403).json({ error: 'Cannot delete an admin user' });
    }

    // Delete all notes by this user
    const userNotes = await Note.find({ uploader: id });
    for (const note of userNotes) {
      const filePath = path.join(__dirname, '../uploads', note.fileName);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }
    await Note.deleteMany({ uploader: id });

    await User.findByIdAndDelete(id);

    res.json({
      message: `User ${user.name} and all their notes have been deleted`
    });
  } catch (error) {
    next(error);
  }
};

// ─── Get All Notes (Admin) ─────────────────────────────────────────
const getAllNotes = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      subject,
      sort = 'newest'
    } = req.query;

    const query = {};

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { subject: { $regex: search, $options: 'i' } }
      ];
    }

    if (subject && subject !== 'all') {
      query.subject = { $regex: subject, $options: 'i' };
    }

    let sortQuery = {};
    switch (sort) {
      case 'newest': sortQuery = { createdAt: -1 }; break;
      case 'oldest': sortQuery = { createdAt: 1 }; break;
      case 'most-downloaded': sortQuery = { downloadsCount: -1 }; break;
      default: sortQuery = { createdAt: -1 };
    }

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, parseInt(limit));
    const skip = (pageNum - 1) * limitNum;

    const [notes, total] = await Promise.all([
      Note.find(query)
        .populate('uploader', 'name email rollNumber')
        .sort(sortQuery)
        .skip(skip)
        .limit(limitNum),
      Note.countDocuments(query)
    ]);

    res.json({
      notes,
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

// ─── Delete Note (Admin) ───────────────────────────────────────────
const deleteNote = async (req, res, next) => {
  try {
    const note = await Note.findById(req.params.id);

    if (!note) {
      return res.status(404).json({ error: 'Note not found' });
    }

    const filePath = path.join(__dirname, '../uploads', note.fileName);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await Note.findByIdAndDelete(req.params.id);

    await User.findByIdAndUpdate(note.uploader, {
      $inc: { totalUploads: -1 }
    });

    res.json({ message: 'Note deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// ─── Make Admin ────────────────────────────────────────────────────
const makeAdmin = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    user.isAdmin = true;
    await user.save();

    res.json({
      message: `${user.name} is now an admin`,
      user: user.toPublicJSON()
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAdminStats,
  getAllUsers,
  toggleBanUser,
  deleteUser,
  getAllNotes,
  deleteNote,
  makeAdmin
};