import React, { useContext, useState } from 'react';
import {
  X, Download, Calendar, User, BookOpen, Tag,
  HardDrive, Hash, FileText, ExternalLink
} from 'lucide-react';
import { notesAPI } from '../services/api';
import { ToastContext } from '../App';
import { FileIcon, FileTypeBadge } from './NoteCard';

const NoteModal = ({ note, onClose, onDelete }) => {
  const toast = useContext(ToastContext);
  const [downloading, setDownloading] = useState(false);
  const [downloadCount, setDownloadCount] = useState(note?.downloadsCount || 0);

  if (!note) return null;

  const handleDownload = async () => {
    if (downloading) return;
    try {
      setDownloading(true);
      const response = await notesAPI.download(note._id);

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

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

      {/* Modal */}
      <div
        className="relative w-full max-w-lg glass-card border border-white/10 overflow-hidden
                   animate-slide-up max-h-[90vh] overflow-y-auto custom-scroll"
        onClick={e => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-lg bg-white/10 hover:bg-white/15 
                     text-white/70 hover:text-white transition-all duration-200"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="p-6 pb-4 border-b border-white/5">
          <div className="flex items-start gap-4">
            <FileIcon type={note.fileType} size="lg" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <FileTypeBadge type={note.fileType} />
              </div>
              <h2 className="text-xl font-bold text-white leading-tight mb-1">
                {note.title}
              </h2>
              <div className="flex items-center gap-1.5 text-sm text-primary-400">
                <BookOpen className="w-4 h-4" />
                <span>{note.subject}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* Description */}
          {note.description && (
            <div>
              <h3 className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-2">
                Description
              </h3>
              <p className="text-sm text-white/70 leading-relaxed bg-white/3 rounded-lg p-3 border border-white/5">
                {note.description}
              </p>
            </div>
          )}

          {/* Tags */}
          {note.tags?.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-2">
                Tags
              </h3>
              <div className="flex flex-wrap gap-2">
                {note.tags.map((tag, idx) => (
                  <span key={idx} className="badge badge-accent">
                    <Hash className="w-2.5 h-2.5 mr-1" />
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* File Info Grid */}
          <div className="grid grid-cols-2 gap-3">
            {[
              {
                icon: User,
                label: 'Uploaded by',
                value: note.uploader?.name || 'Unknown',
                sub: note.uploader?.rollNumber
              },
              {
                icon: Calendar,
                label: 'Uploaded on',
                value: formatDate(note.createdAt)
              },
              {
                icon: HardDrive,
                label: 'File size',
                value: note.fileSizeFormatted || 'Unknown'
              },
              {
                icon: Download,
                label: 'Downloads',
                value: downloadCount.toString()
              }
            ].map(({ icon: Icon, label, value, sub }) => (
              <div key={label} className="bg-white/3 border border-white/5 rounded-xl p-3">
                <div className="flex items-center gap-2 mb-1">
                  <Icon className="w-3.5 h-3.5 text-white/30" />
                  <span className="text-[10px] text-white/30 uppercase tracking-wider font-medium">
                    {label}
                  </span>
                </div>
                <p className="text-sm font-semibold text-white/90 truncate">{value}</p>
                {sub && <p className="text-xs text-white/40">{sub}</p>}
              </div>
            ))}
          </div>

          {/* File Name */}
          <div className="bg-white/3 border border-white/5 rounded-xl p-3">
            <div className="flex items-center gap-2 mb-1">
              <FileText className="w-3.5 h-3.5 text-white/30" />
              <span className="text-[10px] text-white/30 uppercase tracking-wider font-medium">
                Original filename
              </span>
            </div>
            <p className="text-sm text-white/70 font-mono break-all">{note.originalName}</p>
          </div>
        </div>

        {/* Actions */}
        <div className="px-6 pb-6 flex gap-3">
          <button
            onClick={handleDownload}
            disabled={downloading}
            className="btn-primary flex-1 flex items-center justify-center gap-2"
          >
            {downloading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Downloading...
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                Download File
              </>
            )}
          </button>
          <button
            onClick={onClose}
            className="btn-secondary px-5"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default NoteModal;