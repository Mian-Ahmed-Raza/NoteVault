import React, { useState, useEffect, useContext } from 'react';
import {
  Users, FileText, Download, TrendingUp,
  Shield, AlertTriangle, BookOpen, Clock,
  UserX, BarChart2
} from 'lucide-react';
import api from '../../services/api';
import { ToastContext } from '../../App';
import AdminLayout from './AdminLayout';

const StatCard = ({ icon: Icon, value, label, color, bgColor, borderColor }) => (
  <div className="p-5 rounded-2xl flex items-center gap-4"
    style={{ background: bgColor, border: `1px solid ${borderColor}` }}>
    <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
      style={{ background: color + '30' }}>
      <Icon className="w-6 h-6" style={{ color }} />
    </div>
    <div>
      <p className="text-2xl font-bold text-white">{value?.toLocaleString()}</p>
      <p className="text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>{label}</p>
    </div>
  </div>
);

const AdminDashboard = () => {
  const toast = useContext(ToastContext);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const res = await api.get('/admin/stats');
        setData(res.data);
      } catch (error) {
        toast.error('Failed to load admin stats');
      } finally {
        setLoading(false);
      }
    };
    loadStats();
  }, []);

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric'
    });
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="w-10 h-10 rounded-full border-4 border-red-500/20 border-t-red-500 animate-spin" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">

        {/* ─── Header ───────────────────────────────────────────── */}
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <BarChart2 className="w-6 h-6 text-red-400" />
            Admin Dashboard
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.4)' }} className="text-sm mt-1">
            Platform overview and management
          </p>
        </div>

        {/* ─── Stats Grid ───────────────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon={Users}
            value={data?.stats.totalUsers}
            label="Total Users"
            color="#6366f1"
            bgColor="rgba(99,102,241,0.08)"
            borderColor="rgba(99,102,241,0.15)"
          />
          <StatCard
            icon={FileText}
            value={data?.stats.totalNotes}
            label="Total Notes"
            color="#8b5cf6"
            bgColor="rgba(139,92,246,0.08)"
            borderColor="rgba(139,92,246,0.15)"
          />
          <StatCard
            icon={Download}
            value={data?.stats.totalDownloads}
            label="Total Downloads"
            color="#10b981"
            bgColor="rgba(16,185,129,0.08)"
            borderColor="rgba(16,185,129,0.15)"
          />
          <StatCard
            icon={UserX}
            value={data?.stats.bannedUsers}
            label="Banned Users"
            color="#ef4444"
            bgColor="rgba(239,68,68,0.08)"
            borderColor="rgba(239,68,68,0.15)"
          />
        </div>

        {/* ─── Two Column Layout ────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Recent Users */}
          <div className="rounded-2xl p-5"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
            <h2 className="font-semibold text-white flex items-center gap-2 mb-4">
              <Users className="w-4 h-4 text-primary-400" />
              Recent Users
            </h2>
            <div className="space-y-3">
              {data?.recentUsers.map(user => (
                <div key={user._id} className="flex items-center justify-between p-3 rounded-xl"
                  style={{ background: 'rgba(255,255,255,0.03)' }}>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-white"
                      style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
                      {user.name?.[0]?.toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">{user.name}</p>
                      <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>{user.email}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
                      {formatDate(user.joinedAt)}
                    </p>
                    {user.isBanned && (
                      <span className="text-xs text-red-400">Banned</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Notes */}
          <div className="rounded-2xl p-5"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
            <h2 className="font-semibold text-white flex items-center gap-2 mb-4">
              <FileText className="w-4 h-4 text-accent-400" />
              Recent Notes
            </h2>
            <div className="space-y-3">
              {data?.recentNotes.map(note => (
                <div key={note._id} className="flex items-center justify-between p-3 rounded-xl"
                  style={{ background: 'rgba(255,255,255,0.03)' }}>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{note.title}</p>
                    <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
                      {note.subject} · by {note.uploader?.name}
                    </p>
                  </div>
                  <div className="text-right ml-3 flex-shrink-0">
                    <p className="text-xs text-green-400 flex items-center gap-1">
                      <Download className="w-3 h-3" />
                      {note.downloadsCount}
                    </p>
                    <p className="text-xs uppercase font-bold mt-0.5"
                      style={{ color: 'rgba(255,255,255,0.3)' }}>
                      {note.fileType}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Uploaders */}
          <div className="rounded-2xl p-5"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
            <h2 className="font-semibold text-white flex items-center gap-2 mb-4">
              <TrendingUp className="w-4 h-4 text-green-400" />
              Top Uploaders
            </h2>
            <div className="space-y-3">
              {data?.topUploaders.map((uploader, idx) => (
                <div key={uploader._id} className="flex items-center gap-3 p-3 rounded-xl"
                  style={{ background: 'rgba(255,255,255,0.03)' }}>
                  <span className="text-lg font-bold w-6 text-center"
                    style={{ color: idx === 0 ? '#fbbf24' : idx === 1 ? '#9ca3af' : idx === 2 ? '#b45309' : 'rgba(255,255,255,0.3)' }}>
                    {idx + 1}
                  </span>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-white">{uploader.name}</p>
                    <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>{uploader.email}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-white">{uploader.count} notes</p>
                    <p className="text-xs text-green-400">{uploader.downloads} downloads</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Subject Stats */}
          <div className="rounded-2xl p-5"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
            <h2 className="font-semibold text-white flex items-center gap-2 mb-4">
              <BookOpen className="w-4 h-4 text-blue-400" />
              Top Subjects
            </h2>
            <div className="space-y-3">
              {data?.subjectStats.map((subject, idx) => (
                <div key={subject._id} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-white/80">{subject._id}</span>
                    <span className="text-xs text-white/50">{subject.count} notes</span>
                  </div>
                  <div className="h-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.05)' }}>
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${(subject.count / data.subjectStats[0].count) * 100}%`,
                        background: 'linear-gradient(90deg, #6366f1, #8b5cf6)'
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* File Type Stats */}
        <div className="rounded-2xl p-5"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
          <h2 className="font-semibold text-white flex items-center gap-2 mb-4">
            <FileText className="w-4 h-4 text-orange-400" />
            File Types Distribution
          </h2>
          <div className="flex flex-wrap gap-3">
            {data?.fileTypeStats.map(ft => {
              const colors = {
                pdf: '#ef4444', docx: '#3b82f6', doc: '#3b82f6',
                pptx: '#f97316', ppt: '#f97316', png: '#10b981',
                jpg: '#10b981', jpeg: '#10b981', txt: '#6b7280'
              };
              const color = colors[ft._id] || '#6b7280';
              return (
                <div key={ft._id} className="flex items-center gap-2 px-4 py-2 rounded-xl"
                  style={{ background: color + '15', border: `1px solid ${color}30` }}>
                  <span className="text-sm font-bold uppercase" style={{ color }}>
                    {ft._id}
                  </span>
                  <span className="text-white/60 text-sm">{ft.count} files</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;