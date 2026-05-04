import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import {
  FileText, Download, Upload, BookOpen, TrendingUp,
  Clock, Star, ArrowRight, Zap, Users
} from 'lucide-react';
import { notesAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { ToastContext } from '../App';
import NoteCard from '../components/NoteCard';
import NoteModal from '../components/NoteModal';
import { SkeletonStats, SkeletonGrid } from '../components/SkeletonCard';

// ─── Stat Card ─────────────────────────────────────────────────────
const StatCard = ({ icon: Icon, value, label, color, sub, delay = 0 }) => (
  <div
    className="glass-card-hover p-5 flex flex-col gap-3"
    style={{ animationDelay: `${delay}ms` }}
  >
    <div className={`w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br ${color}`}>
      <Icon className="w-5 h-5 text-white" />
    </div>
    <div>
      <p className="text-2xl font-bold text-white">{value}</p>
      <p className="text-sm text-white/60 font-medium">{label}</p>
      {sub && <p className="text-xs text-white/30 mt-0.5">{sub}</p>}
    </div>
  </div>
);

const Dashboard = () => {
  const { user } = useAuth();
  const toast = useContext(ToastContext);

  const [stats, setStats] = useState(null);
  const [recentNotes, setRecentNotes] = useState([]);
  const [topNotes, setTopNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedNote, setSelectedNote] = useState(null);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const response = await notesAPI.getDashboard();
        setStats(response.data.stats);
        setRecentNotes(response.data.recentNotes);
        setTopNotes(response.data.topNotes);
      } catch (error) {
        toast.error('Failed to load dashboard');
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  const getTimeGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8 animate-fade-in">

      {/* ─── Hero Section ───────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary-600/20 via-dark-800/50 to-accent-600/10 
                      border border-primary-500/20 p-8">
        {/* Background Elements */}
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-primary-500/10 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full bg-accent-500/10 blur-3xl" />

        <div className="relative z-10">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <p className="text-primary-400 text-sm font-medium mb-1 flex items-center gap-2">
                <Zap className="w-3.5 h-3.5" />
                {getTimeGreeting()}
              </p>
              <h1 className="text-3xl font-bold text-white mb-2">
                Welcome back, {user?.name?.split(' ')[0]}! 👋
              </h1>
              <p className="text-white/60 max-w-md">
                Ready to share knowledge? Your notes are helping {stats?.totalNotes || '...'} students learn better.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Link to="/upload" className="btn-primary flex items-center gap-2">
                <Upload className="w-4 h-4" />
                Upload Note
              </Link>
              <Link to="/notes" className="btn-secondary flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                Browse
              </Link>
            </div>
          </div>

          {/* Quick Stats Bar */}
          <div className="mt-6 flex flex-wrap gap-4">
            {[
              { label: 'My Uploads', value: stats?.myUploads || 0, icon: '📤' },
              { label: 'Downloads Received', value: stats?.myDownloadsReceived || 0, icon: '📥' },
              { label: 'Roll No.', value: user?.rollNumber, icon: '🎓' },
            ].map(({ label, value, icon }) => (
              <div key={label} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 border border-white/10">
                <span>{icon}</span>
                <div>
                  <span className="text-white font-semibold text-sm">{value}</span>
                  <span className="text-white/40 text-xs ml-1.5">{label}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ─── Stats Grid ─────────────────────────────────────────── */}
      {loading ? <SkeletonStats /> : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon={FileText}
            value={stats?.totalNotes?.toLocaleString() || 0}
            label="Total Notes"
            sub="On the platform"
            color="from-blue-500 to-blue-600"
            delay={0}
          />
          <StatCard
            icon={Upload}
            value={stats?.myUploads || 0}
            label="My Uploads"
            sub="Notes I've shared"
            color="from-primary-500 to-primary-600"
            delay={50}
          />
          <StatCard
            icon={Download}
            value={stats?.totalDownloads?.toLocaleString() || 0}
            label="Total Downloads"
            sub="Platform-wide"
            color="from-green-500 to-green-600"
            delay={100}
          />
          <StatCard
            icon={BookOpen}
            value={stats?.subjectsCount || 0}
            label="Subjects"
            sub="Covered on platform"
            color="from-accent-500 to-accent-600"
            delay={150}
          />
        </div>
      )}

      {/* ─── Recent Notes ────────────────────────────────────────── */}
      <div>
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary-400" />
              Recently Added
            </h2>
            <p className="text-white/40 text-sm mt-0.5">Latest notes from the community</p>
          </div>
          <Link to="/notes" className="flex items-center gap-1.5 text-sm text-primary-400 
                                       hover:text-primary-300 transition-colors group">
            View all
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {loading ? (
          <SkeletonGrid count={4} />
        ) : recentNotes.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {recentNotes.map(note => (
              <NoteCard
                key={note._id}
                note={note}
                onView={setSelectedNote}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 text-white/30">
            <FileText className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>No notes yet. Be the first to upload!</p>
          </div>
        )}
      </div>

      {/* ─── Top Downloaded ─────────────────────────────────────── */}
      {topNotes.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-accent-400" />
                Most Downloaded
              </h2>
              <p className="text-white/40 text-sm mt-0.5">Popular notes across all subjects</p>
            </div>
            <Link to="/notes?sort=most-downloaded" className="flex items-center gap-1.5 text-sm 
                                                              text-accent-400 hover:text-accent-300 
                                                              transition-colors group">
              See more
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {topNotes.map(note => (
              <NoteCard
                key={note._id}
                note={note}
                onView={setSelectedNote}
              />
            ))}
          </div>
        </div>
      )}

      {/* ─── Subjects Section ───────────────────────────────────── */}
      {stats?.subjects?.length > 0 && (
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-5">
            <BookOpen className="w-5 h-5 text-green-400" />
            Browse by Subject
          </h2>
          <div className="flex flex-wrap gap-2">
            {stats.subjects.map(subject => (
              <Link
                key={subject}
                to={`/notes?subject=${encodeURIComponent(subject)}`}
                className="px-4 py-2 rounded-xl glass-card-hover border border-white/10 
                           text-sm font-medium text-white/70 hover:text-white 
                           transition-all duration-200"
              >
                {subject}
              </Link>
            ))}
            <Link
              to="/notes"
              className="px-4 py-2 rounded-xl bg-primary-500/10 border border-primary-500/30 
                         text-sm font-medium text-primary-400 hover:text-primary-300 
                         transition-all duration-200"
            >
              View all subjects →
            </Link>
          </div>
        </div>
      )}

      {/* Note Modal */}
      {selectedNote && (
        <NoteModal
          note={selectedNote}
          onClose={() => setSelectedNote(null)}
        />
      )}
    </div>
  );
};

export default Dashboard;