import React, { useContext } from 'react';
import {
  FileText, FileImage, File, Download, Trash2,
  Clock, User, Tag, Eye, BookOpen
} from 'lucide-react';
import { notesAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { ToastContext } from '../App';

// ─── File Type Icon Component ──────────────────────────────────────
const FileIcon = ({ type, size = 'md' }) => {
  const sizeClass = size === 'sm' ? 'w-6 h-6' : size === 'lg' ? 'w-10 h-10' : 'w-8 h-8';
  const containerSize = size === 'sm' ? 'w-10 h-10' : size === 'lg' ? 'w-16 h-16' : 'w-12 h-12';

  const config = {
    pdf: { icon: FileText, color: 'from-red-500/20 to-red-600/10', iconColor: 'text-red-400', border: 'border-red-500/20' },
    doc: { icon: FileText, color: 'from-blue-500/20 to-blue-600/10', iconColor: 'text-blue-400', border: 'border-blue-500/20' },
    docx: { icon: FileText, color: 'from-blue-500/20 to-blue-600/10', iconColor: 'text-blue-400', border: 'border-blue-500/20' },
    ppt: { icon: File, color: 'from-orange-500/20 to-orange-600/10', iconColor: 'text-orange-400', border: 'border-orange-500/20' },
    pptx: { icon: File, color: 'from-orange-500/20 to-orange-600/10', iconColor: 'text-orange-400', border: 'border-orange-500/20' },
    png: { icon: FileImage, color: 'from-green-500/20 to-green-600/10', iconColor: 'text-green-400', border: 'border-green-500/20' },
    jpg: { icon: FileImage, color: 'from-green-500/20 to-green-600/10', iconColor: 'text-green-400', border: 'border-green-500/20' },
    jpeg: { icon: FileImage, color: 'from-green-500/20 to-green-600/10', iconColor: 'text-green-400', border: 'border-green-500/20' },
    gif: { icon: FileImage, color: 'from-purple-500/20 to-purple-600/10', iconColor: 'text-purple-400', border: 'border-purple-500/20' },
    txt: { icon: FileText, color: 'from-gray-500/20 to-gray-600/10', iconColor: 'text-gray-400', border: 'border-gray-500/20' },
  };

  const fileConfig = config[type?.toLowerCase()] || config.txt;
  const Icon = fileConfig.icon;

  return (
    <div className={`
      ${containerSize} rounded-xl bg-gradient-to-br ${fileConfig.color} 
      border ${fileConfig.border} flex items-center justify-center flex-shrink-0
    `}>
      <Icon className={`${sizeClass} ${fileConfig.iconColor}`} />
    </div>
  );
};

// ─── File Type Badge ───────────────────────────────────────────────
const FileTypeBadge = ({ type }) => {
  const colors = {
    pdf: 'bg-red-500/15 text-red-400 border-red-500/25',
    doc: 'bg-blue-500/15 text-blue-400 border-blue-500/25',
    docx: 'bg-blue-500/15 text-blue-400 border-blue-500/25',
    ppt: 'bg-orange-500/15 text-orange-400 border-orange-500/25',
    pptx: 'bg-orange-500/15 text-orange-400 border-orange-500/25',
    png: 'bg-green-500/15 text-green-400 border-green-500/25',
    jpg: 'bg-green-500/15 text-green-400 border-green-500/25',
    jpeg: 'bg-green-500/15 text-green-400 border-green-500/25',
    txt: 'bg-gray-500/15 text-gray-400 border-gray-500/25',
  };

  return (
    <span className={`
      inline-flex items-center px-2 py-0.5 rounded-md text-xs font-bold uppercase
      border ${colors[type?.toLowerCase()] || colors.txt}
    `}>
      {type?.toUpperCase()}
    </span>
  );
};

// ─── Note Card Component ───────────────────────────────────────────
const NoteCard = ({ note, onDelete, onView, showDeleteButton = false }) => {
  const { user } = useAuth();
  const toast = useContext(ToastContext);
  const [downloading, setDownloading] = React.useState(false);
  const [downloadCount, setDownloadCount] = React.useState(note.downloadsCount || 0);

  const isOwner = user?._id === note.uploader?._id || user?._id === note.uploader;

  const handleDownload = async (e) => {
    e.stopPropagation();
    if (downloading) return;

    try {
      setDownloading(true);
      toast.loading('Preparing download...');

      const response = await notesAPI.download(note._id);

      // Create download link
      const blob = new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = note.originalName || `${note.title}.${note.fileType}`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      setDownloadCount(prev => prev + 1);
      toast.success('Download started!');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Download failed');
    } finally {
      setDownloading(false);
    }
  };

  const handleDelete = async (e) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this note? This action cannot be undone.')) {
      return;
    }

    try {
      await notesAPI.delete(note._id);
      toast.success('Note deleted successfully');
      onDelete?.(note._id);
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to delete note');
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div
      className="glass-card-hover cursor-pointer p-5 flex flex-col gap-4 h-full group"
      onClick={() => onView?.(note)}
    >
      {/* ─── Header ──────────────────────────────────────────────── */}
      <div className="flex items-start gap-3">
        <FileIcon type={note.fileType} />

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className="font-semibold text-white text-sm leading-snug line-clamp-2 
                           group-hover:text-primary-300 transition-colors duration-200">
              {note.title}
            </h3>
            <FileTypeBadge type={note.fileType} />
          </div>

          <div className="flex items-center gap-1.5 text-xs text-white/50">
            <BookOpen className="w-3 h-3 flex-shrink-0" />
            <span className="truncate">{note.subject}</span>
          </div>
        </div>
      </div>

      {/* ─── Description ─────────────────────────────────────────── */}
      {note.description && (
        <p className="text-xs text-white/50 line-clamp-2 leading-relaxed">
          {note.description}
        </p>
      )}

      {/* ─── Tags ────────────────────────────────────────────────── */}
      {note.tags && note.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {note.tags.slice(0, 3).map((tag, idx) => (
            <span key={idx} className="badge badge-accent text-xs">
              #{tag}
            </span>
          ))}
          {note.tags.length > 3 && (
            <span className="badge bg-white/5 text-white/40 border border-white/10 text-xs">
              +{note.tags.length - 3}
            </span>
          )}
        </div>
      )}

      {/* ─── Footer ──────────────────────────────────────────────── */}
      <div className="mt-auto pt-3 border-t border-white/5 flex items-center justify-between">
        {/* Uploader */}
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 
                          flex items-center justify-center text-white text-[9px] font-bold">
            {note.uploader?.name?.[0]?.toUpperCase() || 'U'}
          </div>
          <div>
            <p className="text-xs font-medium text-white/70 truncate max-w-[80px]">
              {note.uploader?.name?.split(' ')[0] || 'Unknown'}
            </p>
            <p className="text-[10px] text-white/30">{formatDate(note.createdAt)}</p>
          </div>
        </div>

        {/* Stats & Actions */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 text-xs text-white/40">
            <Download className="w-3 h-3" />
            <span>{downloadCount}</span>
          </div>

          <div className="flex items-center gap-1">
            {/* Delete Button (own notes) */}
            {(showDeleteButton && isOwner) && (
              <button
                onClick={handleDelete}
                className="p-1.5 rounded-lg bg-red-500/0 hover:bg-red-500/15 
                           text-red-500/50 hover:text-red-400 transition-all duration-200"
                title="Delete note"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}

            {/* Download Button */}
            <button
              onClick={handleDownload}
              disabled={downloading}
              className="p-1.5 rounded-lg bg-primary-500/0 hover:bg-primary-500/15 
                         text-primary-500/60 hover:text-primary-400 transition-all duration-200
                         disabled:opacity-50 disabled:cursor-not-allowed"
              title="Download"
            >
              {downloading ? (
                <div className="w-3.5 h-3.5 border-2 border-primary-400/30 border-t-primary-400 
                                rounded-full animate-spin" />
              ) : (
                <Download className="w-3.5 h-3.5" />
              )}
            </button>

            {/* View Button */}
            <button
              onClick={(e) => { e.stopPropagation(); onView?.(note); }}
              className="p-1.5 rounded-lg bg-white/0 hover:bg-white/10 
                         text-white/40 hover:text-white/80 transition-all duration-200"
              title="View details"
            >
              <Eye className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export { FileIcon, FileTypeBadge };
export default NoteCard;