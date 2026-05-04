import React, { useState, useEffect, useRef, useContext, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Search, X, SlidersHorizontal, Hash,
  BookOpen, TrendingUp, Clock, Sparkles
} from 'lucide-react';
import { notesAPI } from '../services/api';
import { ToastContext } from '../App';
import NoteCard from '../components/NoteCard';
import NoteModal from '../components/NoteModal';
import { SkeletonGrid } from '../components/SkeletonCard';

const POPULAR_SEARCHES = [
  'Data Structures', 'Algorithms', 'Machine Learning', 'Database',
  'Operating System', 'Computer Networks', 'Mathematics', 'Physics'
];

const SearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const toast = useContext(ToastContext);
  const inputRef = useRef(null);
  const debounceRef = useRef(null);

  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [pagination, setPagination] = useState(null);
  const [selectedNote, setSelectedNote] = useState(null);
  const [sort, setSort] = useState('newest');
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState('all');

  // ─── Load Subjects ─────────────────────────────────────────────
  useEffect(() => {
    notesAPI.getSubjects().then(res => setSubjects(res.data.subjects)).catch(() => {});
  }, []);

  // ─── Auto-focus ────────────────────────────────────────────────
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // ─── Initial Search from URL ───────────────────────────────────
  useEffect(() => {
    const initialQuery = searchParams.get('q');
    if (initialQuery) {
      setQuery(initialQuery);
      performSearch(initialQuery);
    }
  }, []);

  // ─── Search Function ───────────────────────────────────────────
  const performSearch = useCallback(async (searchQuery, pageNum = 1) => {
    if (!searchQuery.trim()) {
      setNotes([]);
      setSearched(false);
      return;
    }

    setLoading(true);
    setSearched(true);

    try {
      const params = {
        search: searchQuery.trim(),
        sort,
        page: pageNum,
        limit: 12,
        ...(selectedSubject !== 'all' && { subject: selectedSubject })
      };

      const res = await notesAPI.getAll(params);
      setNotes(res.data.notes);
      setPagination(res.data.pagination);

      // Update URL
      setSearchParams({ q: searchQuery.trim() }, { replace: true });
    } catch (error) {
      toast.error('Search failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [sort, selectedSubject]);

  // ─── Debounced Search ──────────────────────────────────────────
  const handleQueryChange = (e) => {
    const value = e.target.value;
    setQuery(value);

    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!value.trim()) {
      setNotes([]);
      setSearched(false);
      setSearchParams({}, { replace: true });
      return;
    }

    debounceRef.current = setTimeout(() => {
      performSearch(value);
    }, 400);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (debounceRef.current) clearTimeout(debounceRef.current);
    performSearch(query);
  };

  const clearSearch = () => {
    setQuery('');
    setNotes([]);
    setSearched(false);
    setSearchParams({}, { replace: true });
    inputRef.current?.focus();
  };

  // Re-search when sort or subject changes
  useEffect(() => {
    if (query.trim() && searched) {
      performSearch(query);
    }
  }, [sort, selectedSubject]);

  const handleNoteDelete = (noteId) => {
    setNotes(prev => prev.filter(n => n._id !== noteId));
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8 animate-fade-in">

      {/* ─── Header ─────────────────────────────────────────────── */}
      <div className="text-center space-y-3">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Sparkles className="w-5 h-5 text-accent-400" />
          <span className="text-accent-400 text-sm font-medium">Smart Search</span>
        </div>
        <h1 className="text-3xl font-bold text-white">
          Find Your <span className="gradient-text">Perfect Notes</span>
        </h1>
        <p className="text-white/50">
          Search across titles, subjects, descriptions, and tags
        </p>
      </div>

      {/* ─── Search Bar ─────────────────────────────────────────── */}
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative flex items-center">
          <Search className="absolute left-5 w-5 h-5 text-white/40 pointer-events-none z-10" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={handleQueryChange}
            placeholder="Search by title, subject, tags, or description..."
            className="w-full bg-white/5 border border-white/10 focus:border-primary-500/60 
                       rounded-2xl pl-14 pr-20 py-4 text-white placeholder-white/30 
                       focus:outline-none text-base transition-all duration-200
                       hover:border-white/20 focus:bg-white/8"
          />
          <div className="absolute right-3 flex items-center gap-2">
            {query && (
              <button
                type="button"
                onClick={clearSearch}
                className="p-2 rounded-xl text-white/40 hover:text-white/70 
                           hover:bg-white/10 transition-all duration-200"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-primary-600 to-accent-500 
                         text-white text-sm font-medium hover:from-primary-500 hover:to-accent-400 
                         transition-all duration-200 shadow-glow-sm hover:shadow-glow"
            >
              Search
            </button>
          </div>
        </div>
      </form>

      {/* ─── Popular Searches (before search) ───────────────────── */}
      {!searched && (
        <div className="space-y-6">
          <div>
            <h3 className="text-sm font-semibold text-white/50 uppercase tracking-wider mb-3 flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Popular Searches
            </h3>
            <div className="flex flex-wrap gap-2">
              {POPULAR_SEARCHES.map(term => (
                <button
                  key={term}
                  onClick={() => {
                    setQuery(term);
                    performSearch(term);
                  }}
                  className="px-4 py-2 rounded-xl glass-card-hover border border-white/10 
                             text-sm text-white/70 hover:text-white transition-all duration-200"
                >
                  {term}
                </button>
              ))}
            </div>
          </div>

          {subjects.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-white/50 uppercase tracking-wider mb-3 flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                Browse by Subject
              </h3>
              <div className="flex flex-wrap gap-2">
                {subjects.map(subject => (
                  <button
                    key={subject}
                    onClick={() => {
                      setSelectedSubject(subject);
                      setQuery(subject);
                      performSearch(subject);
                    }}
                    className="px-4 py-2 rounded-xl bg-primary-500/10 border border-primary-500/20 
                               text-sm text-primary-400 hover:bg-primary-500/15 
                               transition-all duration-200"
                  >
                    <BookOpen className="w-3.5 h-3.5 inline mr-1.5 opacity-70" />
                    {subject}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ─── Search Results ──────────────────────────────────────── */}
      {searched && (
        <div className="space-y-4">
          {/* Results Header */}
          {!loading && (
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <p className="text-white/80 text-sm">
                  {pagination?.totalNotes > 0 ? (
                    <>
                      Found <span className="font-bold text-white">{pagination.totalNotes}</span> results
                      {query && <> for "<span className="text-primary-400">{query}</span>"</>}
                    </>
                  ) : (
                    `No results for "${query}"`
                  )}
                </p>
              </div>

              {/* Filters */}
              {notes.length > 0 && (
                <div className="flex items-center gap-3">
                  {/* Subject filter */}
                  <select
                    value={selectedSubject}
                    onChange={(e) => setSelectedSubject(e.target.value)}
                    className="bg-white/5 border border-white/10 text-white text-sm rounded-lg 
                               px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary-500"
                  >
                    <option value="all" className="bg-dark-900">All Subjects</option>
                    {subjects.map(s => (
                      <option key={s} value={s} className="bg-dark-900">{s}</option>
                    ))}
                  </select>

                  <select
                    value={sort}
                    onChange={(e) => setSort(e.target.value)}
                    className="bg-white/5 border border-white/10 text-white text-sm rounded-lg 
                               px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary-500"
                  >
                    <option value="newest" className="bg-dark-900">Newest</option>
                    <option value="most-downloaded" className="bg-dark-900">Most Downloaded</option>
                    <option value="alphabetical" className="bg-dark-900">A-Z</option>
                  </select>
                </div>
              )}
            </div>
          )}

          {/* Loading */}
          {loading && <SkeletonGrid count={8} />}

          {/* Results Grid */}
          {!loading && notes.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {notes.map(note => (
                <NoteCard
                  key={note._id}
                  note={note}
                  onView={setSelectedNote}
                  onDelete={handleNoteDelete}
                />
              ))}
            </div>
          )}

          {/* No Results */}
          {!loading && notes.length === 0 && (
            <div className="text-center py-20">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/5 flex items-center justify-center">
                <Search className="w-8 h-8 text-white/20" />
              </div>
              <h3 className="text-white/60 font-semibold mb-2">No notes found</h3>
              <p className="text-white/30 text-sm mb-4">
                Try different keywords or check the spelling
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                {POPULAR_SEARCHES.slice(0, 4).map(term => (
                  <button
                    key={term}
                    onClick={() => {
                      setQuery(term);
                      performSearch(term);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 
                               text-xs text-white/60 hover:text-white hover:bg-white/10 
                               transition-all duration-200"
                  >
                    Try "{term}"
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modal */}
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

export default SearchPage;