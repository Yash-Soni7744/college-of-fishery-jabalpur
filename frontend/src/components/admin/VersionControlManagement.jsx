import React, { useState, useEffect } from 'react';
import { 
  History, 
  Database, 
  RotateCcw, 
  Download, 
  ShieldCheck, 
  AlertTriangle, 
  Search, 
  Filter, 
  Clock, 
  CheckCircle2, 
  ChevronDown, 
  ChevronUp, 
  RefreshCw,
  GitCommit,
  User,
  Globe,
  FileCode,
  Archive
} from 'lucide-react';
import toast from 'react-hot-toast';
import { versionsAPI } from '../../services/api';

const VersionControlManagement = () => {
  const [activeTab, setActiveTab] = useState('history'); // 'history' | 'snapshots' | 'help'
  const [versions, setVersions] = useState([]);
  const [snapshots, setSnapshots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [snapshotsLoading, setSnapshotsLoading] = useState(false);

  // Filters & Pagination
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAction, setSelectedAction] = useState('');
  const [selectedModel, setSelectedModel] = useState('');
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });

  // Expanded diffs tracker: Set of version IDs
  const [expandedDiffs, setExpandedDiffs] = useState({});

  // Modals
  const [restoreModal, setRestoreModal] = useState({ open: false, version: null });
  const [fullRestoreModal, setFullRestoreModal] = useState({ open: false, snapshot: null, confirmText: '' });
  const [createSnapshotModal, setCreateSnapshotModal] = useState({ open: false, label: '', isBaseline: false });
  const [actionLoading, setActionLoading] = useState(false);

  // Fetch versions
  const fetchVersions = async (page = 1) => {
    try {
      setLoading(true);
      const res = await versionsAPI.getAll({
        page,
        limit: 25,
        search: searchTerm,
        action: selectedAction,
        modelName: selectedModel
      });

      if (res.data.success) {
        setVersions(res.data.data.versions || []);
        setPagination(res.data.data.pagination || { page: 1, pages: 1, total: 0 });
      }
    } catch (error) {
      console.error('Fetch versions error:', error);
      toast.error('Failed to load version history');
    } finally {
      setLoading(false);
    }
  };

  // Fetch snapshots
  const fetchSnapshots = async () => {
    try {
      setSnapshotsLoading(true);
      const res = await versionsAPI.getSnapshots();
      if (res.data.success) {
        setSnapshots(res.data.data.snapshots || []);
      }
    } catch (error) {
      console.error('Fetch snapshots error:', error);
      toast.error('Failed to load database snapshots');
    } finally {
      setSnapshotsLoading(false);
    }
  };

  useEffect(() => {
    fetchVersions(1);
  }, [searchTerm, selectedAction, selectedModel]);

  useEffect(() => {
    if (activeTab === 'snapshots') {
      fetchSnapshots();
    }
  }, [activeTab]);

  // Toggle diff expansion
  const toggleDiff = (id) => {
    setExpandedDiffs(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Handle single item restore
  const handleRestoreVersion = async () => {
    if (!restoreModal.version) return;
    try {
      setActionLoading(true);
      const res = await versionsAPI.restore(restoreModal.version._id);
      if (res.data.success) {
        toast.success(`Successfully restored "${restoreModal.version.identifier}"!`);
        setRestoreModal({ open: false, version: null });
        fetchVersions(pagination.page);
      }
    } catch (error) {
      console.error('Restore version error:', error);
      toast.error(error.response?.data?.message || 'Failed to restore this version');
    } finally {
      setActionLoading(false);
    }
  };

  // Handle create snapshot
  const handleCreateSnapshot = async (e) => {
    e.preventDefault();
    try {
      setActionLoading(true);
      const res = await versionsAPI.createSnapshot({
        label: createSnapshotModal.label || 'Manual Snapshot',
        isBaseline: createSnapshotModal.isBaseline
      });
      if (res.data.success) {
        toast.success('Live database snapshot created successfully!');
        setCreateSnapshotModal({ open: false, label: '', isBaseline: false });
        fetchSnapshots();
      }
    } catch (error) {
      console.error('Create snapshot error:', error);
      toast.error('Failed to create snapshot');
    } finally {
      setActionLoading(false);
    }
  };

  // Handle full database restore
  const handleFullRestore = async () => {
    if (fullRestoreModal.confirmText !== 'RESTORE') {
      toast.error('Please type "RESTORE" to confirm');
      return;
    }

    try {
      setActionLoading(true);
      const res = await versionsAPI.restoreSnapshot({
        snapshotId: fullRestoreModal.snapshot.snapshotId || fullRestoreModal.snapshot._id,
        confirmText: 'RESTORE'
      });

      if (res.data.success) {
        toast.success('Full database restored successfully!');
        setFullRestoreModal({ open: false, snapshot: null, confirmText: '' });
        fetchVersions(1);
        fetchSnapshots();
      }
    } catch (error) {
      console.error('Full restore error:', error);
      toast.error(error.response?.data?.message || 'Failed to restore database');
    } finally {
      setActionLoading(false);
    }
  };

  const getActionBadge = (action) => {
    switch (action) {
      case 'CREATE':
        return <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-green-100 text-green-800 border border-green-300">CREATED</span>;
      case 'UPDATE':
        return <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 border border-blue-300">MODIFIED</span>;
      case 'DELETE':
        return <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-red-100 text-red-800 border border-red-300">DELETED</span>;
      case 'RESTORE':
        return <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-purple-100 text-purple-800 border border-purple-300">RESTORED</span>;
      default:
        return <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">{action}</span>;
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-lg border border-blue-100">
              <History className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Version Control & Disaster Recovery</h1>
              <p className="text-sm text-gray-500">
                Git-style automated audit trail for website content with timestamped snapshots and 1-click rollback.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setCreateSnapshotModal({ open: true, label: '', isBaseline: false })}
            className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium shadow-sm transition"
          >
            <Database className="w-4 h-4" />
            <span>📸 Take Live Backup Now</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 flex space-x-8">
        <button
          onClick={() => setActiveTab('history')}
          className={`pb-3 font-medium text-sm flex items-center space-x-2 border-b-2 transition ${
            activeTab === 'history'
              ? 'border-blue-600 text-blue-600 font-semibold'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <GitCommit className="w-4 h-4" />
          <span>Change History (Commits)</span>
          <span className="ml-2 bg-gray-100 text-gray-700 py-0.5 px-2 rounded-full text-xs">
            {pagination.total}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('snapshots')}
          className={`pb-3 font-medium text-sm flex items-center space-x-2 border-b-2 transition ${
            activeTab === 'snapshots'
              ? 'border-blue-600 text-blue-600 font-semibold'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <Archive className="w-4 h-4" />
          <span>Database Snapshots</span>
          <span className="ml-2 bg-gray-100 text-gray-700 py-0.5 px-2 rounded-full text-xs">
            {snapshots.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('help')}
          className={`pb-3 font-medium text-sm flex items-center space-x-2 border-b-2 transition ${
            activeTab === 'help'
              ? 'border-blue-600 text-blue-600 font-semibold'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Protection & Disaster Recovery</span>
        </button>
      </div>

      {/* TAB 1: CHANGE HISTORY */}
      {activeTab === 'history' && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="bg-white p-4 rounded-xl border border-gray-200 flex flex-wrap items-center gap-3">
            <div className="flex-1 min-w-[240px] relative">
              <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by title, commit SHA, author, or keyword..."
                className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <select
              value={selectedAction}
              onChange={(e) => setSelectedAction(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Actions</option>
              <option value="CREATE">Created</option>
              <option value="UPDATE">Modified</option>
              <option value="DELETE">Deleted</option>
              <option value="RESTORE">Restored</option>
            </select>

            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Sections</option>
              <option value="Content">Content (Pages/About)</option>
              <option value="NewsEvent">News & Events</option>
              <option value="AcademicsPage">Academics</option>
              <option value="Extension">Extension</option>
              <option value="StudentCorner">Student Corner</option>
              <option value="Faculty">Faculty</option>
              <option value="Program">Programs</option>
              <option value="Research">Research</option>
              <option value="Infrastructure">Infrastructure</option>
              <option value="Incubation">Incubation</option>
              <option value="Collaboration">Collaboration</option>
              <option value="Alumni">Alumni</option>
              <option value="Partner">Partners</option>
              <option value="Contact">Contact</option>
            </select>

            <button
              onClick={() => fetchVersions(pagination.page)}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg border border-gray-200 transition"
              title="Refresh commit history"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          {/* Version Cards */}
          {loading ? (
            <div className="bg-white p-12 rounded-xl border border-gray-200 text-center text-gray-500">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-600" />
              <p>Loading version history...</p>
            </div>
          ) : versions.length === 0 ? (
            <div className="bg-white p-12 rounded-xl border border-gray-200 text-center text-gray-500">
              <GitCommit className="w-10 h-10 mx-auto mb-2 text-gray-400" />
              <p className="text-base font-semibold text-gray-700">No version commits found</p>
              <p className="text-sm mt-1">Changes made to website content will automatically appear here with timestamps and diffs.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {versions.map((ver) => {
                const isExpanded = !!expandedDiffs[ver._id];
                const dateObj = new Date(ver.timestamp);
                const hasDiff = ver.diff && ver.diff.length > 0;

                return (
                  <div
                    key={ver._id}
                    className="bg-white rounded-xl border border-gray-200 shadow-sm hover:border-gray-300 transition overflow-hidden"
                  >
                    <div className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                      {/* Left info */}
                      <div className="space-y-1.5 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono text-xs px-2 py-0.5 bg-gray-100 text-gray-700 rounded border border-gray-300 font-semibold">
                            {ver.commitId}
                          </span>
                          {getActionBadge(ver.action)}
                          <span className="text-xs px-2 py-0.5 bg-slate-100 text-slate-700 rounded font-medium">
                            {ver.modelName}
                          </span>
                          <span className="text-xs text-gray-400">•</span>
                          <span className="text-xs text-gray-500 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {dateObj.toLocaleDateString()} {dateObj.toLocaleTimeString()}
                          </span>
                        </div>

                        <div className="font-semibold text-gray-900 text-base">
                          {ver.identifier || 'Untitled Item'}
                        </div>

                        <div className="text-xs text-gray-600 flex flex-wrap items-center gap-3">
                          <span className="flex items-center gap-1 text-gray-500">
                            <User className="w-3 h-3" />
                            {ver.author?.username || 'Admin'}
                          </span>
                          {ver.ip && (
                            <span className="flex items-center gap-1 text-gray-400">
                              <Globe className="w-3 h-3" />
                              {ver.ip}
                            </span>
                          )}
                          <span className="text-gray-500 italic">
                            "{ver.summary}"
                          </span>
                        </div>
                      </div>

                      {/* Right buttons */}
                      <div className="flex items-center gap-2 shrink-0">
                        {hasDiff && (
                          <button
                            onClick={() => toggleDiff(ver._id)}
                            className="flex items-center gap-1 text-xs font-medium text-gray-600 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 px-3 py-1.5 rounded-lg border border-gray-200 transition"
                          >
                            <span>{ver.diff.length} changes</span>
                            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                          </button>
                        )}

                        <button
                          onClick={() => setRestoreModal({ open: true, version: ver })}
                          className="flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg border border-blue-200 transition"
                          title="Revert document back to this version"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Revert</span>
                        </button>
                      </div>
                    </div>

                    {/* Diff viewer expandable area */}
                    {isExpanded && hasDiff && (
                      <div className="bg-gray-50 border-t border-gray-100 p-4 space-y-3">
                        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                          Field-by-Field Changes (Diff):
                        </div>
                        <div className="space-y-2">
                          {ver.diff.map((item, idx) => (
                            <div key={idx} className="bg-white p-3 rounded-lg border border-gray-200 text-xs font-mono">
                              <span className="font-bold text-gray-800 text-xs">{item.field}:</span>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-1">
                                <div className="p-2 bg-red-50 border border-red-100 text-red-700 rounded overflow-x-auto max-h-40">
                                  <span className="font-bold block text-[10px] text-red-400 mb-0.5">BEFORE:</span>
                                  <pre className="whitespace-pre-wrap font-sans text-xs">
                                    {typeof item.oldValue === 'object' 
                                      ? JSON.stringify(item.oldValue, null, 2) 
                                      : String(item.oldValue ?? '(empty)')}
                                  </pre>
                                </div>
                                <div className="p-2 bg-green-50 border border-green-100 text-green-700 rounded overflow-x-auto max-h-40">
                                  <span className="font-bold block text-[10px] text-green-400 mb-0.5">AFTER:</span>
                                  <pre className="whitespace-pre-wrap font-sans text-xs">
                                    {typeof item.newValue === 'object' 
                                      ? JSON.stringify(item.newValue, null, 2) 
                                      : String(item.newValue ?? '(empty)')}
                                  </pre>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="flex items-center justify-between bg-white px-4 py-3 border border-gray-200 rounded-xl text-sm">
              <div className="text-gray-500 text-xs">
                Page {pagination.page} of {pagination.pages} ({pagination.total} total commits)
              </div>
              <div className="flex gap-2">
                <button
                  disabled={pagination.page <= 1}
                  onClick={() => fetchVersions(pagination.page - 1)}
                  className="px-3 py-1 border border-gray-200 rounded text-xs disabled:opacity-40 hover:bg-gray-50 font-medium"
                >
                  Previous
                </button>
                <button
                  disabled={pagination.page >= pagination.pages}
                  onClick={() => fetchVersions(pagination.page + 1)}
                  className="px-3 py-1 border border-gray-200 rounded text-xs disabled:opacity-40 hover:bg-gray-50 font-medium"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: DATABASE SNAPSHOTS */}
      {activeTab === 'snapshots' && (
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-800 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
            <div>
              <p className="font-semibold">Full Website Database Snapshots</p>
              <p className="text-xs text-blue-700 mt-0.5">
                Every snapshot contains an exact duplicate of all 18 database collections (~108 documents). 
                You can download the snapshot JSON to your computer or restore the entire website with 1 click.
              </p>
            </div>
          </div>

          {snapshotsLoading ? (
            <div className="bg-white p-12 rounded-xl border border-gray-200 text-center text-gray-500">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-600" />
              <p>Loading snapshots...</p>
            </div>
          ) : snapshots.length === 0 ? (
            <div className="bg-white p-12 rounded-xl border border-gray-200 text-center text-gray-500">
              <Archive className="w-10 h-10 mx-auto mb-2 text-gray-400" />
              <p className="text-base font-semibold text-gray-700">No snapshots available</p>
              <button
                onClick={() => setCreateSnapshotModal({ open: true, label: '', isBaseline: false })}
                className="mt-3 inline-flex items-center gap-1.5 bg-blue-600 text-white px-4 py-2 rounded-lg text-xs font-medium"
              >
                <Database className="w-4 h-4" />
                <span>Create First Snapshot</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {snapshots.map((snap) => {
                const dateObj = new Date(snap.timestamp);
                const isGolden = snap.isGolden || snap.type === 'MANUAL_BASELINE';

                return (
                  <div
                    key={snap._id || snap.snapshotId}
                    className={`bg-white rounded-xl border p-5 shadow-sm space-y-4 ${
                      isGolden ? 'border-amber-300 ring-1 ring-amber-200' : 'border-gray-200'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          {isGolden && (
                            <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-amber-100 text-amber-800 border border-amber-300 uppercase">
                              ⭐ Golden Baseline
                            </span>
                          )}
                          <span className="text-xs text-gray-400 font-mono">
                            {snap.snapshotId}
                          </span>
                        </div>
                        <h3 className="font-bold text-gray-900 text-base mt-1">
                          {snap.label || 'Database Snapshot'}
                        </h3>
                        <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                          <Clock className="w-3 h-3" />
                          {dateObj.toLocaleDateString()} at {dateObj.toLocaleTimeString()}
                        </p>
                      </div>

                      <div className="text-right">
                        <span className="text-lg font-bold text-blue-600 block">
                          {snap.totalDocuments || 0}
                        </span>
                        <span className="text-[10px] text-gray-400 uppercase">Total Docs</span>
                      </div>
                    </div>

                    {snap.collectionSummary && (
                      <div className="bg-gray-50 p-2.5 rounded-lg border border-gray-100 text-xs text-gray-600">
                        <span className="font-semibold text-gray-700 block mb-1">Collections Included:</span>
                        <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
                          {Object.entries(snap.collectionSummary).map(([col, count]) => (
                            <span key={col} className="bg-white px-2 py-0.5 rounded border border-gray-200 text-[10px]">
                              {col}: <strong>{count}</strong>
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
                      {snap.filePath && (
                        <a
                          href={versionsAPI.getDownloadUrl(snap.filePath)}
                          download
                          className="flex items-center gap-1 text-xs font-semibold text-gray-700 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded-lg transition"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Download JSON</span>
                        </a>
                      )}

                      <button
                        onClick={() => setFullRestoreModal({ open: true, snapshot: snap, confirmText: '' })}
                        className="flex items-center gap-1 text-xs font-semibold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 px-3 py-2 rounded-lg border border-red-200 transition"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Restore Site to This Snapshot</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: DISASTER RECOVERY & HELP */}
      {activeTab === 'help' && (
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-50 text-green-600 rounded-xl border border-green-200">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Anti-Defacement & Disaster Recovery Protocol</h2>
              <p className="text-sm text-gray-500">What to do if unauthorized or vulgar content appears on the website.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-3">
              <h3 className="font-bold text-gray-900 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-bold">1</span>
                <span>Individual Page Defacement</span>
              </h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                If only a single page or announcement was altered, go to the <strong>Change History</strong> tab. Locate the modification commit (you will see the admin username and IP address), and click <strong>Revert</strong>. The page will immediately return to its clean version.
              </p>
            </div>

            <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-3">
              <h3 className="font-bold text-gray-900 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-red-600 text-white text-xs flex items-center justify-center font-bold">2</span>
                <span>Complete Website Defacement</span>
              </h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                If the entire website was vandalized or multiple pages defaced, switch to the <strong>Database Snapshots</strong> tab. Choose the <strong>⭐ Golden Baseline</strong> clean snapshot, and click <strong>Restore Site to This Snapshot</strong>. The entire database will be overwritten with clean data in seconds.
              </p>
            </div>

            <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-3">
              <h3 className="font-bold text-gray-900 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-purple-600 text-white text-xs flex items-center justify-center font-bold">3</span>
                <span>Offline Terminal Recovery (CLI)</span>
              </h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Even if the admin panel is completely inaccessible, you can restore from any computer with Node.js by running:
              </p>
              <div className="p-2 bg-slate-900 text-green-400 rounded text-xs font-mono">
                npm run restore-db
              </div>
            </div>

            <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-3">
              <h3 className="font-bold text-gray-900 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-amber-600 text-white text-xs flex items-center justify-center font-bold">4</span>
                <span>Security Hardening Steps</span>
              </h3>
              <ul className="text-xs text-gray-600 space-y-1 list-disc list-inside">
                <li>Rate limiting protects <code>/api/auth/login</code> against brute-force password cracking.</li>
                <li>Never share admin credentials via unencrypted channels.</li>
                <li>Change your password regularly under <strong>User Management</strong>.</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 1: REVERT INDIVIDUAL DOCUMENT */}
      {restoreModal.open && restoreModal.version && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 space-y-4 shadow-xl">
            <div className="flex items-center gap-3 text-blue-600">
              <RotateCcw className="w-6 h-6" />
              <h3 className="text-lg font-bold text-gray-900">Revert Document Version</h3>
            </div>

            <p className="text-sm text-gray-600">
              Are you sure you want to revert <strong>"{restoreModal.version.identifier}"</strong> back to version {restoreModal.version.versionNumber} (Commit <code>{restoreModal.version.commitId}</code>)?
            </p>

            <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg text-xs text-blue-800">
              This will overwrite the current live document with the snapshot saved on {new Date(restoreModal.version.timestamp).toLocaleString()} and record a new RESTORE commit in the audit trail.
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                disabled={actionLoading}
                onClick={() => setRestoreModal({ open: false, version: null })}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                disabled={actionLoading}
                onClick={handleRestoreVersion}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold flex items-center gap-1.5"
              >
                {actionLoading && <RefreshCw className="w-4 h-4 animate-spin" />}
                <span>Confirm Revert</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: FULL DATABASE RESTORE */}
      {fullRestoreModal.open && fullRestoreModal.snapshot && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 space-y-4 shadow-xl">
            <div className="flex items-center gap-3 text-red-600">
              <AlertTriangle className="w-6 h-6" />
              <h3 className="text-lg font-bold text-gray-900">Emergency Full Database Restore</h3>
            </div>

            <p className="text-sm text-gray-600">
              You are about to restore the <strong>entire live website database</strong> to the snapshot taken on:
            </p>

            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-800 space-y-1">
              <div className="font-bold">⚠️ Warning: Irreversible Action</div>
              <div>Snapshot Label: {fullRestoreModal.snapshot.label}</div>
              <div>Timestamp: {new Date(fullRestoreModal.snapshot.timestamp).toLocaleString()}</div>
              <div>Total Documents: {fullRestoreModal.snapshot.totalDocuments}</div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-700 block">
                Type <span className="font-mono text-red-600 font-bold">RESTORE</span> in capital letters to confirm:
              </label>
              <input
                type="text"
                value={fullRestoreModal.confirmText}
                onChange={(e) => setFullRestoreModal(prev => ({ ...prev, confirmText: e.target.value }))}
                placeholder="RESTORE"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 font-mono"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                disabled={actionLoading}
                onClick={() => setFullRestoreModal({ open: false, snapshot: null, confirmText: '' })}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                disabled={actionLoading || fullRestoreModal.confirmText !== 'RESTORE'}
                onClick={handleFullRestore}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-semibold flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {actionLoading && <RefreshCw className="w-4 h-4 animate-spin" />}
                <span>Restore Entire Website</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: CREATE SNAPSHOT */}
      {createSnapshotModal.open && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <form onSubmit={handleCreateSnapshot} className="bg-white rounded-xl max-w-md w-full p-6 space-y-4 shadow-xl">
            <div className="flex items-center gap-3 text-blue-600">
              <Database className="w-6 h-6" />
              <h3 className="text-lg font-bold text-gray-900">Create Live Database Snapshot</h3>
            </div>

            <p className="text-sm text-gray-600">
              Export all current live collections and document states from MongoDB Atlas to a secure backup snapshot.
            </p>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-700">Snapshot Label / Description</label>
              <input
                type="text"
                required
                value={createSnapshotModal.label}
                onChange={(e) => setCreateSnapshotModal(prev => ({ ...prev, label: e.target.value }))}
                placeholder="e.g. Pre-event update backup"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="isBaselineCheck"
                checked={createSnapshotModal.isBaseline}
                onChange={(e) => setCreateSnapshotModal(prev => ({ ...prev, isBaseline: e.target.checked }))}
                className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
              />
              <label htmlFor="isBaselineCheck" className="text-xs text-gray-700 select-none">
                Mark as Golden Clean Baseline Backup
              </label>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                disabled={actionLoading}
                onClick={() => setCreateSnapshotModal({ open: false, label: '', isBaseline: false })}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={actionLoading}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold flex items-center gap-1.5"
              >
                {actionLoading && <RefreshCw className="w-4 h-4 animate-spin" />}
                <span>Create Snapshot</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default VersionControlManagement;
