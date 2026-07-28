import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Search,
  ArrowLeft,
  Pencil,
  Trash2,
  Plus,
  Zap,
  ChevronRight,
  X,
  Check,
  Inbox,
  ArrowRight,
} from 'lucide-react';
import {
  getEnhancementsByRelease,
  createEnhancement,
  updateEnhancement,
  deleteEnhancement,
} from './enhancementApi';
import type { Enhancement } from './enhancementApi';
import { useAuth } from '../../context/AuthContext';
import { useConfirm } from '../../context/ConfirmContext';
import toast from 'react-hot-toast';

export default function EnhancementList() {
  const { releaseId } = useParams<{ releaseId: string }>();
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const { confirm } = useConfirm();
  const navigate = useNavigate();
  const [enhancements, setEnhancements] = useState<Enhancement[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [createFormOpen, setCreateFormOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [nameError, setNameError] = useState('');
  const [shakeInput, setShakeInput] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  const fetchEnhancements = () => {
    if (!releaseId) return;
    setLoading(true);
    getEnhancementsByRelease(releaseId)
      .then(setEnhancements)
      .catch(() => toast.error('Failed to load enhancements'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchEnhancements();
  }, [releaseId]);

  const handleCreate = async () => {
    if (!releaseId || !newName.trim()) return;

    if (nameError) {
      setShakeInput(true);
      setTimeout(() => setShakeInput(false), 500);
      return;
    }

    try {
      await createEnhancement(releaseId, newName.trim());
      setNewName('');
      setNameError('');
      setCreateFormOpen(false);
      fetchEnhancements();
      toast.success('Enhancement created');
    } catch (err: any) {
      if (err.response?.status === 409) {
        setNameError(err.response?.data?.message || 'This enhancement name already exists in this release.');
        setShakeInput(true);
        setTimeout(() => setShakeInput(false), 500);
      } else {
        toast.error(err.response?.data?.message || 'Failed to create enhancement');
      }
    }
  };

  const handleUpdate = async (id: string) => {
    if (!editName.trim()) return;
    try {
      await updateEnhancement(id, editName.trim());
      setEditId(null);
      fetchEnhancements();
      toast.success('Enhancement updated');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update enhancement');
    }
  };

  const handleDelete = async (id: string) => {
    const confirmed = await confirm({
      title: 'Delete Enhancement',
      message: 'This enhancement and all meetings associated with it will be permanently deleted.',
      warning: 'Cascading deletion: all meetings under this enhancement will also be removed.',
    });
    if (!confirmed) return;
    try {
      await deleteEnhancement(id);
      fetchEnhancements();
      toast.success('Enhancement deleted');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to delete enhancement');
    }
  };

  const filtered = enhancements.filter((e) =>
    e.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8 pb-16 px-4 sm:px-6 lg:px-8 animate-in fade-in duration-500">
      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-1.5 sm:gap-2 text-slate-500 hover:text-amber-600 font-semibold text-sm transition-colors mb-1 sm:mb-2"
      >
        <ArrowLeft size={16} className="sm:w-[18px] sm:h-[18px]" />
        Back
      </button>

      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 sm:gap-5">
        <div>
          <h1 className="text-2xl sm:text-3xl md:text-[2.5rem] font-bold text-slate-800 tracking-tight mb-1.5 sm:mb-2">
            Enhancements
          </h1>
          <p className="text-slate-500 font-medium text-sm sm:text-base">
            Manage specific enhancement items linked to this release.
          </p>
        </div>

        <button
          onClick={() => setCreateFormOpen(!createFormOpen)}
          disabled={!isAdmin}
          title={!isAdmin ? 'You are not authorized to perform this action.' : undefined}
          className={`w-full md:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${
            isAdmin
              ? 'bg-amber-600 text-white hover:bg-amber-700 hover:shadow-md active:scale-95'
              : 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
          }`}
        >
          {createFormOpen ? <X size={18} /> : <Plus size={18} />}
          {createFormOpen ? 'Close Panel' : 'Create Enhancement'}
        </button>
      </div>

      {/* Animated Create Form */}
      {createFormOpen && isAdmin && (
        <div className="bg-white/80 backdrop-blur-sm p-4 sm:p-6 rounded-3xl border-2 border-dashed border-amber-200 shadow-sm mb-6 flex flex-col sm:flex-row items-stretch gap-4 animate-in slide-in-from-top-4 fade-in duration-300">
          <div className="hidden sm:flex w-10 h-10 rounded-2xl items-center justify-center bg-amber-100 text-amber-700 shrink-0 shadow-inner">
            <Zap className="w-5 h-5" />
          </div>
          <div className="flex-1 flex flex-col">
            <input
              type="text"
              value={newName}
              onChange={(e) => {
                setNewName(e.target.value);
                if (nameError) setNameError('');
              }}
              onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
              placeholder="Enhancement name (unique per release)"
              className={`flex-1 w-full bg-white/60 backdrop-blur border rounded-xl px-4 py-2.5 sm:py-3 text-sm sm:text-base font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-amber-100 focus:border-amber-300 transition-all ${
                nameError ? 'border-red-500 ring-2 ring-red-300' : 'border-slate-200'
              } ${shakeInput ? 'animate-shake' : ''}`}
              autoFocus
            />
            <p className="mt-1 text-xs text-slate-400">
              Use clear, meaningful names (e.g., “Multi-host Wallet DR Support”).
            </p>
            {nameError && (
              <p className="mt-1 text-xs text-red-600 font-medium">{nameError}</p>
            )}
          </div>
          <div className="flex flex-row sm:items-center gap-2 w-full sm:w-auto mt-1 sm:mt-0">
            <button
              onClick={() => {
                setCreateFormOpen(false);
                setNewName('');
                setNameError('');
              }}
              className="flex-1 sm:flex-none px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl font-bold text-slate-500 bg-white sm:bg-transparent border border-slate-200 sm:border-transparent hover:bg-slate-100 hover:text-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleCreate}
              className="flex-1 sm:flex-none px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl font-bold bg-amber-500 text-white hover:bg-amber-600 shadow-sm hover:shadow-md transition-all active:scale-95"
            >
              Create
            </button>
          </div>
        </div>
      )}

      {/* Search Bar with Glass Effect */}
      <div className="relative w-full">
        <div className="absolute inset-0 bg-gradient-to-r from-amber-100/50 to-transparent rounded-2xl blur opacity-0 group-focus-within:opacity-100 transition duration-500 pointer-events-none" />
        <div className="relative flex items-center">
          <Search className="absolute left-3.5 sm:left-4 top-1/2 -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-slate-400 group-focus-within:text-amber-500 transition-colors" />
          <input
            type="text"
            placeholder="Search enhancements..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 sm:pl-12 pr-4 py-3 sm:py-3.5 bg-white/60 backdrop-blur border border-slate-200 rounded-2xl text-sm sm:text-base font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-amber-100 focus:border-amber-300 transition-all shadow-sm"
          />
        </div>
      </div>

      {/* Enhancements List */}
      <div className="min-h-[300px]">
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-white/80 backdrop-blur-sm rounded-2xl sm:rounded-3xl border border-slate-200/80 p-4 sm:p-5 animate-pulse flex items-center gap-3 sm:gap-4"
              >
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-slate-100 rounded-xl sm:rounded-2xl shrink-0" />
                <div className="h-4 bg-slate-100 rounded-md w-1/3" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[300px] bg-white/80 backdrop-blur-sm rounded-3xl border-2 border-dashed border-slate-200 shadow-sm px-4">
            <div className="w-14 h-14 sm:w-16 sm:h-16 bg-slate-100 rounded-2xl shadow-sm border border-slate-200 flex items-center justify-center mb-4 sm:mb-5">
              <Inbox className="w-7 h-7 sm:w-8 h-8 text-slate-300" />
            </div>
            <p className="text-slate-800 font-bold text-lg sm:text-xl text-center">No enhancements found</p>
            <p className="text-slate-500 text-sm sm:text-base mt-2 max-w-sm text-center font-medium">
              {search
                ? `We couldn’t find anything matching “${search}”.`
                : 'This release has no enhancements yet. Create one to start adding meetings.'}
            </p>
            {!search && isAdmin && (
              <button
                onClick={() => setCreateFormOpen(true)}
                className="mt-6 font-bold text-amber-500 hover:text-amber-600 flex items-center gap-1.5 transition-colors"
              >
                Create Enhancement <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-3 sm:space-y-4">
            {filtered.map((enhancement) => (
              <div
                key={enhancement.id}
                className={`group relative bg-white/80 backdrop-blur-sm rounded-2xl sm:rounded-3xl border p-4 sm:p-5 shadow-sm transition-all duration-300 overflow-hidden ${
                  editId === enhancement.id
                    ? 'ring-2 ring-amber-400 border-transparent'
                    : 'border-slate-200/80 hover:border-amber-200 hover:shadow-lg hover:shadow-slate-100/50 cursor-pointer'
                }`}
              >
                {/* Left accent line */}
                <div className="absolute left-0 top-0 bottom-0 w-1 sm:w-1.5 bg-amber-400 scale-y-0 group-hover:scale-y-100 origin-center transition-transform duration-300 rounded-r-sm" />

                {editId === enhancement.id ? (
                  /* Edit State */
                  <div className="flex flex-col sm:flex-row gap-3 animate-in fade-in zoom-in-95 duration-200">
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleUpdate(enhancement.id)}
                      className="flex-1 w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-200 focus:border-amber-300"
                      autoFocus
                    />
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setEditId(null)}
                        className="flex-1 sm:flex-none px-3 py-2 text-slate-500 hover:text-slate-800 rounded-lg font-semibold text-sm bg-slate-50 border border-slate-200 sm:border-transparent sm:bg-transparent hover:bg-slate-100 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleUpdate(enhancement.id)}
                        className="flex-1 sm:flex-none px-3 py-2 bg-amber-100 text-amber-700 rounded-lg font-semibold text-sm hover:bg-amber-200 transition-colors"
                      >
                        Save
                      </button>
                    </div>
                  </div>
                ) : (
                  /* View State */
                  <div
                    onClick={() => navigate(`/enhancements/${enhancement.id}/meetings`)}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl flex items-center justify-center bg-gradient-to-br from-amber-100 to-amber-200 text-amber-700 shadow-inner ring-1 ring-white/50 shrink-0">
                        <Zap className="w-4 h-4 sm:w-5 sm:h-5" />
                      </div>
                      <h3 className="font-bold text-slate-800 group-hover:text-amber-600 transition-colors text-base sm:text-lg truncate">
                        {enhancement.name}
                      </h3>
                    </div>

                    <div className="flex items-center justify-end sm:justify-start gap-3 sm:ml-4 shrink-0 w-full sm:w-auto">
                      {isAdmin && (
                        <div className="flex gap-1 sm:opacity-0 group-hover:opacity-100 transition-all duration-300 sm:translate-x-2 group-hover:translate-x-0">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditId(enhancement.id);
                              setEditName(enhancement.name);
                            }}
                            className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-xl transition-colors"
                            title="Edit Enhancement"
                          >
                            <Pencil size={15} />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(enhancement.id);
                            }}
                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                            title="Delete Enhancement"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      )}
                      <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-slate-300 group-hover:text-amber-500 transition-colors" />
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