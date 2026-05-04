import React, { useState, useEffect, useCallback, useRef, useContext } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  BookOpen, Filter, SlidersHorizontal, ChevronDown,
  RefreshCw, Search, X, ArrowUpDown
} from 'lucide-react';
import { notesAPI } from '../services/api';
import { ToastContext } from '../App';
import NoteCard from '../components/NoteCard';
import NoteModal from '../components/NoteModal';
import { SkeletonGrid } from '../components/SkeletonCard';

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
  { value: 'most-downloaded', label: 'Most Downloaded' },
  { value: 'alphabetical', label: 'A → Z' },
];

const AllNotes = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const toast = useContext(ToastContext);

  const [notes, setNotes] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [pagination, setPagination] = useState(null);
  const [selectedNote, setSelectedNote] = useState(null);
  const [showFilters, setShowFilters] = useState(false);

  // ─── Filters ───────────────────────────────────────────────────
  const [filters, setFilters] = useState({
    subject: searchParams.get('subject') || 'all',
    sort: searchParams.get('sort') || 'newest',
  });

  const loadingRef = useRef(false);
  const currentPage = useRef(1);

  // ─── Load Subjects ─────────────────────────────────────────────
  useEffect(() => {
    const loadSubjects = async () => {
      try {
        const res = await notesAPI.getSubjects();
        setSubjects(res.data.subjects);
      } catch {}
    };
    loadSubjects();
  }, []);

  // ─── Load Notes ────────────────────────────────────────────────
  const loadNotes = useCallback(async (page = 1, append = false) => {
    if (loadingRef.current) return;
    loadingRef.current = true;

    if (!append) setLoading(true);
    else setLoadingMore(true);

    try {
      const params = {
        page,
        limit: 12,
        sort: filters.sort,
        ...(filters.subject !== 'all' && { subject: filters.subject }),
      };

      const res = await notesAPI.getAll(params);

      if (append) {
        setNotes(prev => [...prev, ...res.data.notes]);
      } else {
        setNotes(res.data.notes);
      }
      setPagination(res.data.pagination);
      currentPage.current = page;
    } catch (error) {
      toast.error('Failed to load notes');
    } finally {
      setLoading(false);
      setLoadingMore(false);
      loadingRef.current = false;
    }
  }, [filters]);

  useEffect(() => {
    currentPage.current = 1;
    loadNotes(1, false);

    // Sync URL params
    const params = {};
    if (filters.subject !== 'all') params.subject = filters.subject;
    if (filters.sort !== 'newest') params.sort = filters.sort;
    setSearchParams(params, { replace: true });
  }, [filters]);

  const handleLoadMore = () => {
    if (pagination?.hasMore && !loadingMore) {
      loadNotes(currentPage.current + 1, true);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleNoteDelete = (noteId) => {
    setNotes(prev => prev.filter(n => n._id !== noteId));
  };

  const resetFilters = () => {
    setFilters({ subject: 'all', sort: 'newest' });
  };

  const hasActiveFilters = filters.subject !== 'all' || filters.sort !== 'newest';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6 animate-fade-in">

      {/* ─── Header ─────────────────────────────────────────────── */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-primary-400" />
            Browse Notes
          </h1>
          <p className="text-white/50 text-sm mt-1">
            {pagination ? `${pagination.totalNotes.toLocaleString()} notes available` : 'Loading...'}
          </p>
        </div>

        {/* Filter Toggle (mobile) */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-medium
                     transition-all duration-200 lg:hidden
                     ${showFilters
              ? 'bg-primary-500/15 border-primary-500/40 text-primary-300'
              : 'bg-white/5 border-white/10 text-white/70'}`}
        >
          <Filter className="w-4 h-4" />
          Filters
          {hasActiveFilters && (
            <span className="w-1.5 h-1.5 rounded-full bg-primary-400" />
          )}
        </button>
      </div>

      {/* ─── Filters Bar ────────────────────────────────────────── */}
      <div className={`${showFilters ? 'block' : 'hidden lg:block'}`}>
        <div className="glass-card border border-white/10 p-4">
          <div className="flex flex-wrap gap-3 items-center">

            {/* Subject Filter */}
            <div className="flex flex-wrap gap-2 flex-1">
              <button
                onClick={() => handleFilterChange('subject', 'all')}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200
                           ${filters.subject === 'all'
                    ? 'bg-primary-500/20 text-primary-300 border border-primary-500/40'
                    : 'bg-white/5 text-white/60 border border-white/10 hover:bg-white/10'}`}
              >
                All Subjects
              </button>
              {subjects.slice(0, 8).map(subject => (
                <button
                  key={subject}
                  onClick={() => handleFilterChange('subject', subject)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200
                             ${filters.subject === subject
                      ? 'bg-primary-500/20 text-primary-300 border border-primary-500/40'
                      : 'bg-white/5 text-white/60 border border-white/10 hover:bg-white/10'}`}
                >
                  {subject}
                </button>
              ))}
            </div>

            {/* Divider */}
            <div className="w-px h-6 bg-white/10 hidden lg:block" />

            {/* Sort */}
            <div className="flex items-center gap-2">
              <ArrowUpDown className="w-3.5 h-3.5 text-white/40" />
              <select
                value={filters.sort}
                onChange={(e) => handleFilterChange('sort', e.target.value)}
                className="bg-white/5 border border-white/10 text-white text-sm rounded-lg px-3 py-1.5
                           focus:outline-none focus:ring-1 focus:ring-primary-500 appearance-none cursor-pointer"
              >
                {SORT_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value} className="bg-dark-900">
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Reset */}
            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                className="flex items-center gap-1.5 text-xs text-white/50 hover:text-white/80 
                           transition-colors px-2 py-1.5 rounded-lg hover:bg-white/5"
              >
                <X className="w-3.5 h-3.5" />
                Reset
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ─── Notes Grid ─────────────────────────────────────────── */}
      {loading ? (
        <SkeletonGrid count={12} />
      ) : notes.length > 0 ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {notes.map(note => (
              <NoteCard
                key={note._id}
                note={note}
                onView={setSelectedNote}
                onDelete={handleNoteDelete}
              />
            ))}
          </div>

          {/* Load More */}
          {pagination?.hasMore && (
            <div className="flex justify-center pt-4">
              <button
                onClick={handleLoadMore}
                disabled={loadingMore}
                className="btn-secondary flex items-center gap-2"
              >
                {loadingMore ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Loading...
                  </>
                ) : (
                  <>
                    Load More
                    <ChevronDown className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          )}

          {/* Page Info */}
          <p className="text-center text-white/30 text-xs">
            Showing {notes.length} of {pagination?.totalNotes} notes
          </p>
        </>
      ) : (
        <div className="text-center py-24">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-white/5 flex items-center justify-center">
            <BookOpen className="w-10 h-10 text-white/20" />
          </div>
          <h3 className="text-white/60 font-semibold mb-2">No notes found</h3>
          <p className="text-white/30 text-sm">
            {hasActiveFilters
              ? 'Try adjusting your filters or search terms'
              : 'Be the first to upload a note!'
            }
          </p>
          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="mt-4 btn-secondary text-sm"
            >
              Clear Filters
            </button>
          )}
        </div>
      )}

      {/* Note Modal */}
      {selectedNote && (
        <NoteModal
          note={selectedNote}
          onClose={() => setSelectedNote(null)}
          onDelete={handleNoteDelete}
        />
      )}
    </div>
  );
};

export default AllNotes;