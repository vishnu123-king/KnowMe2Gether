import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'motion/react';
import { AnimatedTeddy } from '../components/AnimatedTeddy';
import { AnimatedPanda } from '../components/AnimatedPanda';
import {
  ShieldAlert,
  LogOut,
  RefreshCw,
  Trash2,
  ExternalLink,
  Users,
  CheckCircle2,
  Clock,
  Sparkles,
  Search,
  FileText
} from 'lucide-react';

interface AdminTestItem {
  id: string;
  title: string;
  ownerName: string;
  friendName: string;
  questionCount: number;
  status: 'waiting' | 'completed';
  createdAt: string;
  completedAt?: string | null;
  shareUrl: string;
}

interface AdminDashboardPageProps {
  adminToken: string;
  onLogout: () => void;
  onNavigate: (path: string) => void;
}

export const AdminDashboardPage: React.FC<AdminDashboardPageProps> = ({
  adminToken,
  onLogout,
  onNavigate,
}) => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<{
    totalTests: number;
    completedTests: number;
    waitingTests: number;
    tests: AdminTestItem[];
  } | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadStats = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/stats', {
        headers: {
          'Authorization': `Bearer ${adminToken}`,
        },
      });

      if (!res.ok) {
        if (res.status === 401) {
          onLogout();
          return;
        }
        throw new Error('Failed to load admin analytics.');
      }

      const data = await res.json();
      setStats(data);
      setErrorMsg('');
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to fetch analytics.');
    } finally {
      setLoading(false);
    }
  }, [adminToken, onLogout]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  const handleDeleteTest = async (testId: string) => {
    if (!confirm('Are you sure you want to delete this test as admin?')) return;
    try {
      setDeletingId(testId);
      const res = await fetch(`/api/admin/tests/${encodeURIComponent(testId)}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${adminToken}`,
        },
      });
      if (!res.ok) {
        throw new Error('Failed to delete test.');
      }
      await loadStats();
    } catch (err: any) {
      alert(err.message || 'Error deleting test.');
    } finally {
      setDeletingId(null);
    }
  };

  const filteredTests = stats?.tests?.filter((t) => {
    const term = searchTerm.toLowerCase();
    return (
      t.title.toLowerCase().includes(term) ||
      t.ownerName.toLowerCase().includes(term) ||
      t.friendName.toLowerCase().includes(term)
    );
  }) || [];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 sm:py-12 space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white rounded-3xl border-2 border-slate-200 p-6 shadow-md">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-slate-900 flex items-center justify-center text-white shadow-md">
            <ShieldAlert className="w-6 h-6 text-amber-400" />
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-xs font-bold mb-1">
              <span>Secure Master Console</span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Admin Analytics Dashboard
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={loadStats}
            disabled={loading}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh Stats</span>
          </button>

          <button
            type="button"
            onClick={onLogout}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold">
          {errorMsg}
        </div>
      )}

      {/* Analytics Summary Cards */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-3xl border-2 border-slate-200 p-6 shadow-xs flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Total Tests Created
              </span>
              <div className="text-3xl font-black text-slate-900">
                {stats.totalTests}
              </div>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <FileText className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white rounded-3xl border-2 border-slate-200 p-6 shadow-xs flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Completed Responses
              </span>
              <div className="text-3xl font-black text-emerald-700">
                {stats.completedTests}
              </div>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white rounded-3xl border-2 border-slate-200 p-6 shadow-xs flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Waiting for Friends
              </span>
              <div className="text-3xl font-black text-amber-600">
                {stats.waitingTests}
              </div>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-6 h-6" />
            </div>
          </div>
        </div>
      )}

      {/* Tests Table Section */}
      <div className="bg-white rounded-3xl border-2 border-slate-200 p-6 sm:p-8 shadow-md space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-black text-slate-900">
              Platform Tests & Responses Directory
            </h2>
            <p className="text-xs text-slate-500">
              Live monitor of all friendship quizzes created across the platform.
            </p>
          </div>

          {/* Search bar */}
          <div className="relative max-w-xs w-full">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </span>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by title, owner, or friend..."
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-800 focus:outline-none focus:border-slate-400"
            />
          </div>
        </div>

        {loading && !stats ? (
          <div className="py-16 text-center space-y-3">
            <div className="flex justify-center gap-3">
              <AnimatedTeddy pose="thinking" size={70} />
              <AnimatedPanda pose="thinking" size={70} />
            </div>
            <p className="text-xs font-bold text-slate-500 animate-pulse">
              Loading platform data...
            </p>
          </div>
        ) : filteredTests.length === 0 ? (
          <div className="py-16 text-center space-y-3 bg-slate-50 rounded-2xl border border-slate-100">
            <p className="text-sm font-bold text-slate-600">No tests found matching your search.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-[11px] font-extrabold text-slate-400 uppercase tracking-wider bg-slate-50">
                  <th className="py-3 px-4 rounded-l-xl">Title / Owner</th>
                  <th className="py-3 px-4">Friend</th>
                  <th className="py-3 px-4">Questions</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Created At</th>
                  <th className="py-3 px-4 rounded-r-xl text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
                {filteredTests.map((test) => (
                  <tr key={test.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-4 px-4">
                      <div className="font-bold text-slate-900">{test.title}</div>
                      <div className="text-[11px] text-slate-500">By: {test.ownerName}</div>
                    </td>
                    <td className="py-4 px-4 font-bold text-rose-600">
                      {test.friendName}
                    </td>
                    <td className="py-4 px-4">
                      {test.questionCount} Qs
                    </td>
                    <td className="py-4 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${
                          test.status === 'completed'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {test.status}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-slate-400 text-[11px]">
                      {new Date(test.createdAt).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="py-4 px-4 text-right space-x-2">
                      <a
                        href={test.shareUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 font-bold text-[11px]"
                        title="Open test link"
                      >
                        <ExternalLink className="w-3 h-3" />
                        <span>Link</span>
                      </a>

                      <button
                        type="button"
                        disabled={deletingId === test.id}
                        onClick={() => handleDeleteTest(test.id)}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-[11px] disabled:opacity-40 cursor-pointer"
                        title="Delete test"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Delete</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
