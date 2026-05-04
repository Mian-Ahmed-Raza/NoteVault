import React, { useState, useEffect, useContext, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Upload, FileText, Download, Trash2, Clock,
  TrendingUp, ArrowUpDown, Plus, RefreshCw
} from 'lucide-react';
import { notesAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { ToastContext } from '../App';
import NoteCard from '../components/NoteCard';
import NoteModal from '../components/NoteModal';
import { SkeletonGrid } from '../components/SkeletonCard';

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
  { value: 'most-downloaded', label: 'Most Downloaded' },
];

const MyUploads = () => {
  const { user } = useAuth();
  const toast = useContext(ToastContext);

  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState(null);
  const [sort, setSort] = useState('newest');
  const [selectedNote, setSelectedNote] = useState(null);
  const [totalDownloads, setTotalDownloads] = useState(0);

  const loadMyUploads = useCallback(async (page = 1, append = false) => {
    try {
      if (!append) setLoading(true);
      const res = await notesAPI.getMyUploads({ page, limit: 12, sort });

      if (append) {
        setNotes(prev => [...prev, ...res.data.notes]);
      } else {
        setNotes(res.data.notes);
        // Calculate total downloads
        const totalDl = res.data.notes.reduce((acc, n) => acc + (n.downloadsCount || 0), 0);
        setTotalDownloads(totalDl);
      }
      setPagination(res.data.pagination);
    } catch (error) {
      toast.error('Failed to load your uploads');
    } finally {
      setLoading(false);
    }
  }, [sort]);

  useEffect(() => {
    loadMyUploads(1, false);
  }, [sort]);

  const handleDelete = (noteId) => {
    setNotes(prev => {
      const deleted = prev.find(n => n._id === noteId);
      if (deleted) {
        setTotalDownloads(prev => prev - (deleted.downloadsCount || 0));
      }
      return prev.filter(n => n._id !== noteId);
    });
    setPagination(prev => prev ? { ...prev, totalNotes: prev.totalNotes - 1 } : null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6 animate-fade-in">

      {/* ─── Header ─────────────────────────────────────────────── */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <FileText className="w-6 h-6 text-primary-400" />
            My Uploads
          </h1>
          <p className="text-white/50 text-sm mt-1">
            Notes you've shared with the community
          </p>
        </div>
        <Link to="/upload" className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Upload New Note
        </Link>
      </div>

      {/* ─── My Stats ───────────────────────────────────────────── */}
      {!loading && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {[
            {
              icon: Upload,
              value: pagination?.totalNotes || notes.length,
              label: 'Notes Uploaded',
              color: 'from-primary-500 to-primary-600',
              bg: 'bg-primary-500/10',
              border: 'border-primary-500/20'
            },
            {
              icon: Download,
              value: totalDownloads,
              label: 'Total Downloads',
              color: 'from-green-500 to-green-600',
              bg: 'bg-green-500/10',
              border: 'border-green-500/20'
            },
            {
              icon: TrendingUp,
              value: notes.length > 0
                ? Math.round(totalDownloads / notes.length)
                : 0,
              label: 'Avg. Downloads',
              color: 'from-accent-500 to-accent-600',
              bg: 'bg-accent-500/10',
              border: 'border-accent-500/20'
            },
          ].map(({ icon: Icon, value, label, color, bg, border }) => (
            <div key={label} className={`glass-card ${bg} border ${border} p-5 flex items-center gap-4`}>
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center`}>
                <Icon className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-xl font-bold text-white">{value}</p>
                <p className="text-xs text-white/50">{label}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ─── Sort Controls ───────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-white/40">
          {loading ? 'Loading...' : `${pagination?.totalNotes || notes.length} notes`}
        </p>
        <div className="flex items-center gap-2">
          <ArrowUpDown className="w-3.5 h-3.5 text-white/30" />
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="bg-white/5 border border-white/10 text-white text-sm rounded-lg px-3 py-2 
                       focus:outline-none focus:ring-1 focus:ring-primary-500"
          >
            {SORT_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value} className="bg-dark-900">
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* ─── Notes Grid ─────────────────────────────────────────── */}
      {loading ? (
        <SkeletonGrid count={6} />
      ) : notes.length > 0 ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {notes.map(note => (
              <NoteCard
                key={note._id}
                note={note}
                onView={setSelectedNote}
                onDelete={handleDelete}
                showDeleteButton={true}
              />
            ))}
          </div>

          {pagination?.hasMore && (
            <div className="flex justify-center">
              <button
                onClick={() => loadMyUploads(pagination.currentPage + 1, true)}
                className="btn-secondary flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Load More
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-24">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-primary-500/10 border border-primary-500/20 
                          flex items-center justify-center">
            <Upload className="w-10 h-10 text-primary-400/50" />
          </div>
          <h3 className="text-white/60 font-semibold mb-2">No uploads yet</h3>
          <p className="text-white/30 text-sm mb-6">
            Share your notes with the NoteVault community!
          </p>
          <Link to="/upload" className="btn-primary inline-flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Upload Your First Note
          </Link>
        </div>
      )}

      {/* Modal */}
      {selectedNote && (
        <NoteModal
          note={selectedNote}
          onClose={() => setSelectedNote(null)}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
};

export default MyUploads;