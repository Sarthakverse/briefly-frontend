import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Search,
  ArrowLeft,
  Pencil,
  Trash2,
  Plus,
  Layers,
  ChevronRight,
  X,
  Check,
  Inbox,
  ArrowRight,
} from 'lucide-react';
import { getReleasesByAdapter, createRelease, updateRelease, deleteRelease } from './releaseApi';
import type { Release } from './releaseApi';
import { useAuth } from '../../context/AuthContext';
import { useConfirm } from '../../context/ConfirmContext';
import toast from 'react-hot-toast';

export default function ReleaseList() {
  const { adapterId } = useParams<{ adapterId: string }>();
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const { confirm } = useConfirm();
  const navigate = useNavigate();

  const [releases, setReleases] = useState<Release[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [createFormOpen, setCreateFormOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newSummary, setNewSummary] = useState('');
  const [nameError, setNameError] = useState('');
  const [shakeInput, setShakeInput] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editSummary, setEditSummary] = useState('');

  const fetchReleases = () => {
    if (!adapterId) return;
    setLoading(true);
    getReleasesByAdapter(adapterId)
      .then(setReleases)
      .catch(() => toast.error('Failed to load releases'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchReleases();
  }, [adapterId]);

  const handleCreate = async () => {
    if (!adapterId || !newName.trim()) return;

    if (nameError) {
      setShakeInput(true);
      setTimeout(() => setShakeInput(false), 500);
      return;
    }

    try {
      await createRelease(adapterId, newName.trim(), newSummary.trim() || undefined);
      setNewName('');
      setNewSummary('');
      setNameError('');
      setCreateFormOpen(false);
      fetchReleases();
      toast.success('Release created');
    } catch (err: any) {
      if (err.response?.status === 409) {
        setNameError(err.response?.data?.message || 'This release name already exists for this adapter.');
        setShakeInput(true);
        setTimeout(() => setShakeInput(false), 500);
      } else {
        toast.error(err.response?.data?.message || 'Failed to create release');
      }
    }
  };

  const handleUpdate = async (id: string) => {
    if (!editName.trim()) return;
    try {
      await updateRelease(id, { name: editName.trim(), summary: editSummary.trim() || undefined });
      setEditId(null);
      fetchReleases();
      toast.success('Release updated');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update release');
    }
  };

  const handleDelete = async (id: string) => {
    const confirmed = await confirm({
      title: 'Delete Release',
      message: 'This release and all its enhancements and meetings will be permanently deleted.',
      warning: 'Deleting this release will cascade to all enhancements and meetings underneath it.',
    });
    if (!confirmed) return;
    try {
      await deleteRelease(id);
      fetchReleases();
      toast.success('Release deleted');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to delete release');
    }
  };

  const filtered = releases.filter((r) =>
    r.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8 pb-16 px-4 sm:px-6 lg:px-8 animate-in fade-in duration-500">
      {/* Back button */}
      <button
        onClick={() => navigate('/adapters')}
        className="inline-flex items-center gap-1.5 sm:gap-2 text-slate-500 dark:text-gray-400 hover:text-sky-600 dark:hover:text-sky-400 font-semibold text-sm transition-colors mb-1 sm:mb-2"
      >
        <ArrowLeft size={16} className="sm:w-[18px] sm:h-[18px]" />
        Back to Adapters
      </button>

      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 sm:gap-5">
        <div>
          <h1 className="text-2xl sm:text-3xl md:text-[2.5rem] font-bold text-slate-800 dark:text-white tracking-tight mb-1.5 sm:mb-2">
            Releases
          </h1>
          <p className="text-slate-500 dark:text-gray-400 font-medium text-sm sm:text-base">
            Manage release versions and their enhancements.
          </p>
        </div>

        <button
          onClick={() => setCreateFormOpen(!createFormOpen)}
          disabled={!isAdmin}
          title={!isAdmin ? 'You are not authorized to perform this action.' : undefined}
          className={`w-full md:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${
            isAdmin
              ? 'bg-sky-600 text-white hover:bg-sky-700 hover:shadow-md active:scale-95'
              : 'bg-slate-100 dark:bg-gray-800 text-slate-400 dark:text-gray-500 border border-slate-200 dark:border-gray-700 cursor-not-allowed'
          }`}
        >
          {createFormOpen ? <X size={18} /> : <Plus size={18} />}
          {createFormOpen ? 'Close Panel' : 'Create Release'}
        </button>
      </div>

      {/* Animated Create Form */}
      {createFormOpen && isAdmin && (
        <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm p-4 sm:p-6 rounded-3xl border-2 border-dashed border-sky-200 dark:border-sky-800 shadow-sm mb-6 flex flex-col xl:flex-row items-stretch gap-4 animate-in slide-in-from-top-4 fade-in duration-300">
          <div className="hidden sm:flex w-10 h-10 rounded-2xl items-center justify-center bg-sky-100 dark:bg-sky-900/30 text-sky-600 dark:text-sky-400 shrink-0 shadow-inner">
            <Layers className="w-5 h-5" />
          </div>
          <div className="flex-1 flex flex-col sm:flex-row gap-3 sm:gap-4">
            <div className="flex-1 flex flex-col">
              <input
                type="text"
                value={newName}
                onChange={(e) => {
                  setNewName(e.target.value);
                  if (nameError) setNameError('');
                }}
                onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                placeholder="Release name (unique per adapter)"
                className={`flex-1 w-full bg-white/60 dark:bg-gray-800/60 backdrop-blur border rounded-xl px-4 py-2.5 sm:py-3 text-sm sm:text-base font-medium text-slate-800 dark:text-white placeholder:text-slate-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-4 focus:ring-sky-100 dark:focus:ring-sky-900/20 focus:border-sky-300 dark:focus:border-sky-600 transition-all ${
                  nameError ? 'border-red-500 ring-2 ring-red-300' : 'border-slate-200 dark:border-gray-700'
                } ${shakeInput ? 'animate-shake' : ''}`}
                autoFocus
              />
              <p className="mt-1 text-xs text-slate-400 dark:text-gray-500">
                Recommended format: <strong>26.07</strong>, <strong>26.10</strong>, <strong>27.01</strong>
              </p>
              {nameError && (
                <p className="mt-1 text-xs text-red-600 font-medium">{nameError}</p>
              )}
            </div>
            <input
              type="text"
              value={newSummary}
              onChange={(e) => setNewSummary(e.target.value)}
              placeholder="Summary (optional)"
              className="flex-1 w-full bg-white/60 dark:bg-gray-800/60 backdrop-blur border border-slate-200 dark:border-gray-700 rounded-xl px-4 py-2.5 sm:py-3 text-sm sm:text-base font-medium text-slate-800 dark:text-white placeholder:text-slate-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-4 focus:ring-sky-100 dark:focus:ring-sky-900/20 focus:border-sky-300 dark:focus:border-sky-600 transition-all"
            />
          </div>
          <div className="flex flex-row sm:items-center gap-2 w-full xl:w-auto mt-1 xl:mt-0">
            <button
              onClick={() => {
                setCreateFormOpen(false);
                setNewName('');
                setNewSummary('');
                setNameError('');
              }}
              className="flex-1 xl:flex-none px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl font-bold text-slate-500 dark:text-gray-400 bg-white dark:bg-gray-800 sm:bg-transparent border border-slate-200 dark:border-gray-700 sm:border-transparent hover:bg-slate-100 dark:hover:bg-gray-700 hover:text-slate-800 dark:hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleCreate}
              className="flex-1 xl:flex-none px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl font-bold bg-sky-500 text-white hover:bg-sky-600 shadow-sm hover:shadow-md transition-all active:scale-95"
            >
              Create
            </button>
          </div>
        </div>
      )}

      {/* Search Bar */}
      <div className="relative w-full">
        <div className="absolute inset-0 bg-gradient-to-r from-sky-100/50 dark:from-sky-900/30 to-transparent rounded-2xl blur opacity-0 group-focus-within:opacity-100 transition duration-500 pointer-events-none" />
        <div className="relative flex items-center">
          <Search className="absolute left-3.5 sm:left-4 top-1/2 -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-slate-400 dark:text-gray-500 group-focus-within:text-sky-500 dark:group-focus-within:text-sky-400 transition-colors" />
          <input
            type="text"
            placeholder="Search releases..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 sm:pl-12 pr-4 py-3 sm:py-3.5 bg-white/60 dark:bg-gray-900/60 backdrop-blur border border-slate-200 dark:border-gray-700 rounded-2xl text-sm sm:text-base font-medium text-slate-800 dark:text-white placeholder:text-slate-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-4 focus:ring-sky-100 dark:focus:ring-sky-900/20 focus:border-sky-300 dark:focus:border-sky-600 transition-all shadow-sm"
          />
        </div>
      </div>

      {/* Releases List */}
      <div className="min-h-[300px]">
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-2xl sm:rounded-3xl border border-slate-200/80 dark:border-gray-800 p-4 sm:p-5 animate-pulse flex items-center gap-3 sm:gap-4"
              >
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-slate-100 dark:bg-gray-700 rounded-xl sm:rounded-2xl shrink-0" />
                <div className="space-y-2 flex-1">
                  <div className="h-4 bg-slate-100 dark:bg-gray-700 rounded-md w-1/3" />
                  <div className="h-3 bg-slate-100 dark:bg-gray-700 rounded-md w-1/4" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[300px] bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-3xl border-2 border-dashed border-slate-200 dark:border-gray-800 shadow-sm px-4">
            <div className="w-14 h-14 sm:w-16 sm:h-16 bg-slate-100 dark:bg-gray-800 rounded-2xl shadow-sm border border-slate-200 dark:border-gray-700 flex items-center justify-center mb-4 sm:mb-5">
              <Inbox className="w-7 h-7 sm:w-8 sm:h-8 text-slate-300 dark:text-gray-600" />
            </div>
            <p className="text-slate-800 dark:text-white font-bold text-lg sm:text-xl text-center">No releases found</p>
            <p className="text-slate-500 dark:text-gray-400 text-sm sm:text-base mt-2 max-w-sm text-center font-medium">
              {search
                ? `We couldn’t find anything matching “${search}”.`
                : 'This adapter has no releases yet. Create one to start managing enhancements.'}
            </p>
            {!search && isAdmin && (
              <button
                onClick={() => setCreateFormOpen(true)}
                className="mt-6 font-bold text-sky-500 dark:text-sky-400 hover:text-sky-600 dark:hover:text-sky-300 flex items-center gap-1.5 transition-colors"
              >
                Create Release <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-3 sm:space-y-4">
            {filtered.map((release) => (
              <div
                key={release.id}
                className={`group relative bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-2xl sm:rounded-3xl border p-4 sm:p-5 shadow-sm transition-all duration-300 overflow-hidden ${
                  editId === release.id
                    ? 'ring-2 ring-sky-400 border-transparent'
                    : 'border-slate-200/80 dark:border-gray-800 hover:border-sky-200 dark:hover:border-sky-600 hover:shadow-lg hover:shadow-slate-100/50 dark:hover:shadow-gray-900/50 cursor-pointer'
                }`}
              >
                <div className="absolute left-0 top-0 bottom-0 w-1 sm:w-1.5 bg-sky-400 dark:bg-sky-500 scale-y-0 group-hover:scale-y-100 origin-center transition-transform duration-300 rounded-r-sm" />

                {editId === release.id ? (
                  <div className="flex flex-col lg:flex-row gap-3 animate-in fade-in zoom-in-95 duration-200">
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleUpdate(release.id)}
                      className="flex-1 w-full bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-xl px-3 py-2 text-sm font-bold text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-200 dark:focus:ring-sky-700 focus:border-sky-300 dark:focus:border-sky-600"
                      autoFocus
                    />
                    <input
                      type="text"
                      value={editSummary}
                      onChange={(e) => setEditSummary(e.target.value)}
                      placeholder="Summary"
                      className="flex-1 w-full bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-xl px-3 py-2 text-sm text-slate-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-sky-200 dark:focus:ring-sky-700 focus:border-sky-300 dark:focus:border-sky-600"
                    />
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setEditId(null)}
                        className="flex-1 lg:flex-none px-3 py-2 text-slate-500 dark:text-gray-400 hover:text-slate-800 dark:hover:text-white rounded-lg font-semibold text-sm bg-slate-50 dark:bg-gray-800 border border-slate-200 dark:border-gray-700 lg:border-transparent hover:bg-slate-100 dark:hover:bg-gray-700 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleUpdate(release.id)}
                        className="flex-1 lg:flex-none px-3 py-2 bg-sky-100 dark:bg-sky-900/20 text-sky-700 dark:text-sky-300 rounded-lg font-semibold text-sm hover:bg-sky-200 dark:hover:bg-sky-900/30 transition-colors"
                      >
                        Save
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    onClick={() => navigate(`/releases/${release.id}/enhancements`)}
                    className="flex flex-col sm:flex-row sm:items-start justify-between gap-4"
                  >
                    <div className="flex items-start sm:items-center gap-3 sm:gap-4 min-w-0 flex-1">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl flex items-center justify-center bg-gradient-to-br from-sky-100 to-sky-200 dark:from-sky-900/30 dark:to-sky-800/30 text-sky-700 dark:text-sky-400 shadow-inner ring-1 ring-white/50 dark:ring-white/10 shrink-0">
                        <Layers className="w-4 h-4 sm:w-5 sm:h-5" />
                      </div>
                      <div className="truncate">
                        <h3 className="font-bold text-slate-800 dark:text-white group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors text-base sm:text-lg truncate">
                          {release.name}
                        </h3>
                        {release.summary && (
                          <p className="text-xs sm:text-sm text-slate-500 dark:text-gray-400 mt-0.5 sm:mt-1 line-clamp-2 whitespace-normal sm:whitespace-nowrap sm:truncate">{release.summary}</p>
                        )}
                        {release._count && (
                          <span className="inline-block mt-1 sm:mt-2 text-[10px] sm:text-xs font-semibold text-slate-400 dark:text-gray-500">
                            {release._count.enhancements} enhancement{release._count.enhancements !== 1 ? 's' : ''}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-end sm:justify-start gap-3 sm:ml-4 shrink-0 w-full sm:w-auto">
                      {isAdmin && (
                        <div className="flex gap-1 sm:opacity-0 group-hover:opacity-100 transition-all duration-300 sm:translate-x-2 group-hover:translate-x-0">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditId(release.id);
                              setEditName(release.name);
                              setEditSummary(release.summary || '');
                            }}
                            className="p-2 text-slate-400 dark:text-gray-500 hover:text-sky-600 dark:hover:text-sky-400 hover:bg-sky-50 dark:hover:bg-sky-900/20 rounded-xl transition-colors"
                            title="Edit Release"
                          >
                            <Pencil size={15} />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(release.id);
                            }}
                            className="p-2 text-slate-400 dark:text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors"
                            title="Delete Release"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      )}
                      <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-slate-300 dark:text-gray-600 group-hover:text-sky-500 dark:group-hover:text-sky-400 transition-colors" />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}