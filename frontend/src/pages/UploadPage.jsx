import React, { useState, useRef, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Upload, FileText, X, Plus, Tag, BookOpen,
  AlertCircle, CheckCircle, ArrowLeft, Info
} from 'lucide-react';
import { notesAPI } from '../services/api';
import { ToastContext } from '../App';
import UploadProgress from '../components/UploadProgress';

const ALLOWED_TYPES = {
  'application/pdf': { ext: 'pdf', label: 'PDF Document' },
  'application/msword': { ext: 'doc', label: 'Word Document' },
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': { ext: 'docx', label: 'Word Document' },
  'application/vnd.ms-powerpoint': { ext: 'ppt', label: 'PowerPoint' },
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': { ext: 'pptx', label: 'PowerPoint' },
  'image/png': { ext: 'png', label: 'PNG Image' },
  'image/jpeg': { ext: 'jpg', label: 'JPEG Image' },
  'image/gif': { ext: 'gif', label: 'GIF Image' },
  'text/plain': { ext: 'txt', label: 'Text File' },
};

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

const UploadPage = () => {
  const navigate = useNavigate();
  const toast = useContext(ToastContext);
  const fileInputRef = useRef(null);

  const [form, setForm] = useState({
    title: '', subject: '', description: '', tags: []
  });
  const [tagInput, setTagInput] = useState('');
  const [file, setFile] = useState(null);
  const [fileError, setFileError] = useState('');
  const [formErrors, setFormErrors] = useState({});
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState('idle'); // idle, uploading, success, error
  const [isDragging, setIsDragging] = useState(false);

  // ─── File Handling ─────────────────────────────────────────────
  const handleFile = (selectedFile) => {
    setFileError('');

    if (!selectedFile) return;

    if (!ALLOWED_TYPES[selectedFile.type]) {
      setFileError('Invalid file type. Allowed: PDF, DOC, DOCX, PPT, PPTX, PNG, JPG, GIF, TXT');
      return;
    }

    if (selectedFile.size > MAX_FILE_SIZE) {
      setFileError('File size exceeds 10MB limit');
      return;
    }

    setFile(selectedFile);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    handleFile(droppedFile);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  // ─── Tag Handling ──────────────────────────────────────────────
  const addTag = () => {
    const tag = tagInput.trim().toLowerCase().replace(/[^a-z0-9-]/g, '');
    if (tag && !form.tags.includes(tag) && form.tags.length < 10) {
      setForm(prev => ({ ...prev, tags: [...prev.tags, tag] }));
      setTagInput('');
    }
  };

  const removeTag = (tag) => {
    setForm(prev => ({ ...prev, tags: prev.tags.filter(t => t !== tag) }));
  };

  const handleTagKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag();
    }
    if (e.key === 'Backspace' && !tagInput && form.tags.length > 0) {
      removeTag(form.tags[form.tags.length - 1]);
    }
  };

  // ─── Form Validation ───────────────────────────────────────────
  const validate = () => {
    const errors = {};
    if (!form.title.trim()) errors.title = 'Title is required';
    if (form.title.trim().length < 3) errors.title = 'Title must be at least 3 characters';
    if (!form.subject.trim()) errors.subject = 'Subject is required';
    if (!file) errors.file = 'Please select a file to upload';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // ─── Submit ────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate() || uploading) return;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', form.title.trim());
    formData.append('subject', form.subject.trim());
    formData.append('description', form.description.trim());
    formData.append('tags', JSON.stringify(form.tags));

    setUploading(true);
    setUploadStatus('uploading');
    setUploadProgress(0);

    try {
      await notesAPI.upload(formData, (progressEvent) => {
        const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        setUploadProgress(percent);
      });

      setUploadStatus('success');
      setUploadProgress(100);
      toast.success('Note uploaded successfully! 🎉');

      setTimeout(() => {
        navigate('/my-uploads');
      }, 1500);
    } catch (error) {
      setUploadStatus('error');
      const message = error.response?.data?.error || 'Upload failed. Please try again.';
      toast.error(message);
    } finally {
      setUploading(false);
    }
  };

  const formatSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1048576).toFixed(1)} MB`;
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 animate-fade-in">

      {/* ─── Header ─────────────────────────────────────────────── */}
      <div className="mb-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-white/50 hover:text-white/80 text-sm 
                     mb-4 transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back
        </button>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Upload className="w-6 h-6 text-primary-400" />
          Upload Note
        </h1>
        <p className="text-white/50 text-sm mt-1">
          Share your knowledge with the NoteVault community
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* ─── File Upload Zone ────────────────────────────────── */}
        <div className="glass-card border border-white/10 p-6">
          <label className="block text-sm font-semibold text-white/80 mb-3">
            File Upload <span className="text-red-400">*</span>
          </label>

          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => !file && fileInputRef.current?.click()}
            className={`
              relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300
              ${file ? 'border-green-500/40 bg-green-500/5 cursor-default' : 'cursor-pointer'}
              ${isDragging
                ? 'border-primary-400/60 bg-primary-500/10 scale-[1.01]'
                : !file ? 'border-white/15 hover:border-primary-500/40 hover:bg-primary-500/5' : ''
              }
              ${fileError ? 'border-red-500/40 bg-red-500/5' : ''}
            `}
          >
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              accept=".pdf,.doc,.docx,.ppt,.pptx,.png,.jpg,.jpeg,.gif,.txt"
              onChange={(e) => handleFile(e.target.files[0])}
            />

            {file ? (
              <div className="space-y-3">
                <div className="w-14 h-14 mx-auto rounded-xl bg-green-500/20 border border-green-500/30 
                                flex items-center justify-center">
                  <CheckCircle className="w-7 h-7 text-green-400" />
                </div>
                <div>
                  <p className="font-semibold text-white">{file.name}</p>
                  <p className="text-sm text-white/50 mt-1">
                    {formatSize(file.size)} · {ALLOWED_TYPES[file.type]?.label}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); setFile(null); fileInputRef.current.value = ''; }}
                  className="flex items-center gap-1.5 mx-auto text-xs text-red-400 
                             hover:text-red-300 transition-colors px-3 py-1.5 rounded-lg 
                             bg-red-500/10 hover:bg-red-500/15"
                >
                  <X className="w-3.5 h-3.5" />
                  Remove file
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="w-14 h-14 mx-auto rounded-xl bg-primary-500/10 border border-primary-500/20 
                                flex items-center justify-center">
                  <Upload className={`w-7 h-7 text-primary-400 ${isDragging ? 'animate-bounce-soft' : ''}`} />
                </div>
                <div>
                  <p className="font-semibold text-white">
                    {isDragging ? 'Drop your file here' : 'Drag & drop or click to upload'}
                  </p>
                  <p className="text-sm text-white/40 mt-1">
                    PDF, DOC, DOCX, PPT, PPTX, PNG, JPG, GIF, TXT — Max 10MB
                  </p>
                </div>
              </div>
            )}
          </div>

          {fileError && (
            <p className="flex items-center gap-1.5 text-xs text-red-400 mt-2">
              <AlertCircle className="w-3.5 h-3.5" />
              {fileError}
            </p>
          )}
          {formErrors.file && !file && (
            <p className="flex items-center gap-1.5 text-xs text-red-400 mt-2">
              <AlertCircle className="w-3.5 h-3.5" />
              {formErrors.file}
            </p>
          )}
        </div>

        {/* ─── Note Details ────────────────────────────────────── */}
        <div className="glass-card border border-white/10 p-6 space-y-5">
          <h3 className="font-semibold text-white">Note Details</h3>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-white/70 mb-2">
              Title <span className="text-red-400">*</span>
            </label>
            <div className={`relative rounded-xl overflow-hidden border transition-all duration-200
                           ${formErrors.title ? 'border-red-500/50' : 'border-white/10 focus-within:border-primary-500/60'}`}>
              <div className="absolute left-4 top-1/2 -translate-y-1/2">
                <FileText className="w-4 h-4 text-white/30" />
              </div>
              <input
                type="text"
                placeholder="e.g., Data Structures – Binary Trees Notes"
                value={form.title}
                onChange={(e) => {
                  setForm(prev => ({ ...prev, title: e.target.value }));
                  if (formErrors.title) setFormErrors(prev => ({ ...prev, title: '' }));
                }}
                className="w-full bg-white/5 pl-11 pr-4 py-3 text-white placeholder-white/30 
                           focus:outline-none text-sm"
                maxLength={100}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-white/30">
                {form.title.length}/100
              </span>
            </div>
            {formErrors.title && (
              <p className="text-xs text-red-400 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />{formErrors.title}
              </p>
            )}
          </div>

          {/* Subject */}
          <div>
            <label className="block text-sm font-medium text-white/70 mb-2">
              Subject <span className="text-red-400">*</span>
            </label>
            <div className={`relative rounded-xl overflow-hidden border transition-all duration-200
                           ${formErrors.subject ? 'border-red-500/50' : 'border-white/10 focus-within:border-primary-500/60'}`}>
              <div className="absolute left-4 top-1/2 -translate-y-1/2">
                <BookOpen className="w-4 h-4 text-white/30" />
              </div>
              <input
                type="text"
                placeholder="e.g., Computer Science, Mathematics, Physics"
                value={form.subject}
                onChange={(e) => {
                  setForm(prev => ({ ...prev, subject: e.target.value }));
                  if (formErrors.subject) setFormErrors(prev => ({ ...prev, subject: '' }));
                }}
                className="w-full bg-white/5 pl-11 pr-4 py-3 text-white placeholder-white/30 
                           focus:outline-none text-sm"
                maxLength={50}
              />
            </div>
            {formErrors.subject && (
              <p className="text-xs text-red-400 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />{formErrors.subject}
              </p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-white/70 mb-2">
              Description
              <span className="text-white/30 font-normal ml-2">(optional)</span>
            </label>
            <textarea
              placeholder="Brief description of the note content, topics covered, etc."
              value={form.description}
              onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
              maxLength={500}
              className="w-full bg-white/5 border border-white/10 focus:border-primary-500/60 
                         rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none 
                         text-sm resize-none transition-colors duration-200"
            />
            <p className="text-xs text-white/30 text-right mt-1">{form.description.length}/500</p>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-white/70 mb-2">
              Tags
              <span className="text-white/30 font-normal ml-2">(up to 10)</span>
            </label>

            {/* Tags Display */}
            {form.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-2">
                {form.tags.map(tag => (
                  <span key={tag} className="badge badge-accent flex items-center gap-1">
                    #{tag}
                    <button type="button" onClick={() => removeTag(tag)}
                      className="hover:text-red-300 transition-colors ml-0.5">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}

            {/* Tag Input */}
            {form.tags.length < 10 && (
              <div className="flex gap-2">
                <div className="relative flex-1 rounded-xl overflow-hidden border border-white/10 
                               focus-within:border-primary-500/60 transition-all duration-200">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2">
                    <Tag className="w-4 h-4 text-white/30" />
                  </div>
                  <input
                    type="text"
                    placeholder="Add tags (press Enter or comma)"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={handleTagKeyDown}
                    className="w-full bg-white/5 pl-11 pr-4 py-3 text-white placeholder-white/30 
                               focus:outline-none text-sm"
                  />
                </div>
                <button
                  type="button"
                  onClick={addTag}
                  disabled={!tagInput.trim()}
                  className="px-4 py-3 rounded-xl bg-primary-500/15 border border-primary-500/30 
                             text-primary-400 hover:bg-primary-500/25 disabled:opacity-40 
                             disabled:cursor-not-allowed transition-all duration-200"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            )}

            <p className="text-xs text-white/30 mt-1.5 flex items-center gap-1">
              <Info className="w-3 h-3" />
              Press Enter or comma to add a tag. Only letters, numbers, and hyphens.
            </p>
          </div>
        </div>

        {/* ─── Upload Progress ─────────────────────────────────── */}
        <UploadProgress
          progress={uploadProgress}
          status={uploadStatus}
          fileName={file?.name}
        />

        {/* ─── Submit Button ───────────────────────────────────── */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="btn-secondary flex-1"
            disabled={uploading}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={uploading || uploadStatus === 'success'}
            className="btn-primary flex-2 flex items-center justify-center gap-2 px-8"
            style={{ flex: 2 }}
          >
            {uploading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Uploading... {Math.round(uploadProgress)}%
              </>
            ) : uploadStatus === 'success' ? (
              <>
                <CheckCircle className="w-4 h-4" />
                Uploaded! Redirecting...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                Upload Note
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default UploadPage;