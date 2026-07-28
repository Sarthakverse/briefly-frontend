import { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Pencil,
  Trash2,
  Plus,
  ChevronRight,
  X,
  Check,
  Inbox,
  ArrowRight,
  Plug,
} from 'lucide-react';
import { useAutoAnimate } from '@formkit/auto-animate/react';
import { getAdapters, createAdapter, updateAdapter, deleteAdapter } from './adapterApi';
import type { Adapter } from './adapterApi';
import { useAuth } from '../../context/AuthContext';
import { useConfirm } from '../../context/ConfirmContext';
import toast from 'react-hot-toast';

export default function AdapterList() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const { confirm } = useConfirm();

  const [adapters, setAdapters] = useState<Adapter[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const [createFormOpen, setCreateFormOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [nameError, setNameError] = useState('');
  const [shakeInput, setShakeInput] = useState(false);

  const [editId, setEditId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  const navigate = useNavigate();
  const [listRef] = useAutoAnimate();
  const [formRef] = useAutoAnimate();

  const searchInputRef = useRef<HTMLInputElement>(null);
  const [isShortcutPressed, setIsShortcutPressed] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'f') {
        e.preventDefault();
        searchInputRef.current?.focus();
        setIsShortcutPressed(true);
        setTimeout(() => setIsShortcutPressed(false), 150);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const fetchAdapters = () => {
    setLoading(true);
    getAdapters()
      .then(setAdapters)
      .catch(() => toast.error('Failed to load adapters'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchAdapters();
  }, []);

  const handleCreate = async () => {
    if (!newName.trim()) return;

    if (nameError) {
      setShakeInput(true);
      setTimeout(() => setShakeInput(false), 500);
      return;
    }

    try {
      await createAdapter(newName.trim());
      setNewName('');
      setNameError('');
      setCreateFormOpen(false);
      fetchAdapters();
      toast.success('Adapter created');
    } catch (err: any) {
      if (err.response?.status === 409) {
        setNameError(err.response?.data?.message || 'This name already exists.');
        setShakeInput(true);
        setTimeout(() => setShakeInput(false), 500);
      } else {
        toast.error(err.response?.data?.message || 'Failed to create adapter');
      }
    }
  };

  const handleUpdate = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!editName.trim()) return;
    try {
      await updateAdapter(id, editName.trim());
      setEditId(null);
      fetchAdapters();
      toast.success('Adapter updated');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update adapter');
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const confirmed = await confirm({
      title: 'Delete Adapter',
      message: 'Are you sure you want to delete this adapter? All releases, enhancements, and meetings will also be removed.',
      warning: 'Cascading deletion: this will remove the adapter, all releases, enhancements, and meetings.',
    });
    if (!confirmed) return;
    try {
      await deleteAdapter(id);
      fetchAdapters();
      toast.success('Adapter deleted');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to delete adapter');
    }
  };

  const filtered = useMemo(() => {
    return adapters.filter((a) =>
      a.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [adapters, search]);

  const pad = (n: number) => String(n + 1).padStart(3, '0');

  return (
    <div className="max-w-5xl mx-auto space-y-6 sm:space-y-8 pb-16 px-4 sm:px-6 lg:px-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-5 pt-6 sm:pt-8 border-b border-slate-200 pb-5 sm:pb-6">
        <div>
          <div className="flex items-center gap-2 text-teal-700 mb-1.5 sm:mb-2">
            <Plug className="w-3.5 h-3.5 sm:w-4 sm:h-4" strokeWidth={2.5} />
            <span className="text-[10px] sm:text-[11px] font-bold tracking-[0.14em] uppercase">
              Registry
            </span>
          </div>
          <h1 className="text-2xl sm:text-[28px] leading-none font-bold text-slate-900 tracking-tight">
            Adapters
          </h1>
          <p className="text-sm text-slate-500 mt-2 max-w-md leading-relaxed">
            Every adapter connected to this workspace, and the releases behind it.
          </p>
        </div>

        <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-4 mt-2 sm:mt-0">
          <div className="text-left sm:text-right hidden sm:block">
            <div className="font-mono text-lg font-semibold text-slate-900 tabular-nums">
              {String(adapters.length).padStart(2, '0')}
            </div>
            <div className="text-[10px] font-bold tracking-wider uppercase text-slate-400">
              Total
            </div>
          </div>
          <button
            onClick={() => setCreateFormOpen(!createFormOpen)}
            disabled={!isAdmin}
            title={!isAdmin ? 'You are not authorized to perform this action.' : undefined}
            className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 sm:py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
              isAdmin
                ? 'bg-slate-900 text-white hover:bg-teal-700 active:scale-[0.97]'
                : 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
            }`}
          >
            {createFormOpen ? <X size={16} /> : <Plus size={16} />}
            {createFormOpen ? 'Cancel' : 'New Adapter'}
          </button>
        </div>
      </div>

      {/* Animated Create Form */}
      <div ref={formRef}>
        {createFormOpen && isAdmin && (
          <div className="bg-teal-50/60 p-3.5 sm:p-4 rounded-xl border border-teal-200 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 animate-in slide-in-from-top-2 fade-in duration-200">
            <div className="hidden sm:block font-mono text-xs font-semibold text-teal-700 shrink-0 pl-1">
              {pad(adapters.length)}
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
                placeholder="Name this adapter…"
                className={`flex-1 w-full bg-white border rounded-lg px-3.5 py-2.5 sm:py-2 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all ${
                  nameError ? 'border-red-500 ring-2 ring-red-300' : 'border-slate-200'
                } ${shakeInput ? 'animate-shake' : ''}`}
                autoFocus
              />
              {nameError && (
                <p className="mt-1 text-xs text-red-600 font-medium">{nameError}</p>
              )}
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto mt-1 sm:mt-0">
              <button
                onClick={() => {
                  setCreateFormOpen(false);
                  setNewName('');
                  setNameError('');
                }}
                className="flex-1 sm:flex-none px-3.5 py-2.5 sm:py-2 rounded-lg text-sm font-semibold text-slate-500 bg-white sm:bg-transparent border border-slate-200 sm:border-transparent hover:bg-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                className="flex-1 sm:flex-none px-4 py-2.5 sm:py-2 rounded-lg text-sm font-semibold bg-teal-600 text-white hover:bg-teal-700 shadow-sm transition-all active:scale-[0.97]"
              >
                Add Adapter
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Search */}
      <div className="relative w-full group mt-4 sm:mt-0">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-[16px] w-[16px] text-slate-400 group-focus-within:text-teal-600 transition-colors" />
        <input
          ref={searchInputRef}
          type="text"
          placeholder="Find an adapter…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-12 sm:pr-16 py-2.5 bg-transparent border-b-2 border-slate-200 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-teal-600 transition-colors"
        />
        <div className="absolute right-1 top-1/2 -translate-y-1/2 hidden sm:flex items-center gap-1 opacity-70 group-focus-within:opacity-100 transition-opacity">
          <kbd className={`px-1.5 py-0.5 border border-slate-200 rounded text-[10px] font-bold text-slate-500 bg-slate-50 transition-all duration-150 ${isShortcutPressed ? 'scale-90 bg-slate-200' : ''}`}>
            ⌘
          </kbd>
          <kbd className={`px-1.5 py-0.5 border border-slate-200 rounded text-[10px] font-bold text-slate-500 bg-slate-50 transition-all duration-150 ${isShortcutPressed ? 'scale-90 bg-slate-200' : ''}`}>
            F
          </kbd>
        </div>
      </div>

      {/* List Area */}
      <div className="min-h-[400px]">
        {loading ? (
          /* Skeleton Loader */
          <div className="divide-y divide-slate-100 border-t border-slate-100">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="py-4 flex items-center gap-3 sm:gap-4 animate-pulse">
                <div className="hidden sm:block w-8 h-3 bg-slate-100 rounded" />
                <div className="w-8 h-8 bg-slate-100 rounded-lg shrink-0" />
                <div className="h-4 bg-slate-100 rounded w-1/2 sm:w-1/3" />
                <div className="ml-auto h-3 bg-slate-100 rounded w-12 sm:w-16" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          /* Empty State */
          <div className="flex flex-col items-center justify-center h-[340px] border-t border-b border-dashed border-slate-200 px-4">
            <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mb-4">
              <Inbox className="w-5 h-5 text-slate-400" />
            </div>
            <p className="text-slate-900 font-semibold text-base">No adapters found</p>
            <p className="text-slate-500 text-sm mt-1 max-w-sm text-center">
              {search
                ? `Nothing matches “${search}”. Try a different search.`
                : 'Nothing here yet. Add your first adapter to start tracking releases.'}
            </p>
            {!search && isAdmin && (
              <button
                onClick={() => setCreateFormOpen(true)}
                className="mt-5 text-sm font-semibold text-teal-700 hover:text-teal-800 flex items-center gap-1 transition-colors"
              >
                New Adapter <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        ) : (
          /* Adapter Manifest List */
          <div className="border-t border-slate-100" ref={listRef}>
            {filtered.map((adapter, i) => (
              <div
                key={adapter.id}
                onClick={() => editId !== adapter.id && navigate(`/adapters/${adapter.id}/releases`)}
                className={`group relative flex items-center gap-3 sm:gap-4 pl-3 pr-2 py-3.5 border-b border-slate-100 border-l-2 transition-all duration-300 ease-out ${
                  editId === adapter.id
                    ? 'border-l-teal-600 bg-teal-50/40'
                    : 'border-l-transparent hover:border-l-teal-600 hover:bg-slate-50 cursor-pointer'
                }`}
              >
                <span className="hidden sm:block font-mono text-xs text-slate-300 group-hover:text-teal-600 transition-colors duration-300 w-8 shrink-0 tabular-nums">
                  {pad(i)}
                </span>

                {editId === adapter.id ? (
                  /* Edit State */
                  <div className="flex-1 flex items-center gap-2 animate-in fade-in duration-150">
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                      onKeyDown={(e) => e.key === 'Enter' && handleUpdate(adapter.id, e as any)}
                      className="flex-1 bg-white border border-teal-300 rounded-lg px-3 py-1.5 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all w-full"
                      autoFocus
                    />
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditId(null);
                        }}
                        className="p-2 sm:p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 rounded-md transition-colors"
                        title="Cancel"
                      >
                        <X size={16} />
                      </button>
                      <button
                        onClick={(e) => handleUpdate(adapter.id, e)}
                        className="p-2 sm:p-1.5 bg-teal-600 text-white hover:bg-teal-700 rounded-md transition-colors"
                        title="Save"
                      >
                        <Check size={16} />
                      </button>
                    </div>
                  </div>
                ) : (
                  /* View State */
                  <>
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-teal-50 text-teal-600 shrink-0 transition-all duration-300 group-hover:scale-105 group-hover:shadow-sm group-hover:shadow-teal-100">
                      <Plug className="w-4 h-4" strokeWidth={2.25} />
                    </div>

                    <h3 className="text-sm font-semibold text-slate-900 group-hover:text-teal-700 transition-colors duration-300 truncate flex-1">
                      {adapter.name}
                    </h3>

                    {isAdmin && (
                      <div className="flex items-center gap-0.5 sm:opacity-0 sm:translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 ease-out">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditId(adapter.id);
                            setEditName(adapter.name);
                          }}
                          className="p-2 sm:p-1.5 text-slate-400 hover:text-teal-600 hover:bg-teal-50 rounded-md transition-all duration-200 sm:hover:scale-110"
                          title="Edit"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          onClick={(e) => handleDelete(adapter.id, e)}
                          className="p-2 sm:p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-all duration-200 sm:hover:scale-110"
                          title="Delete"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    )}

                    <div className="flex items-center gap-1 text-xs font-semibold text-slate-400 group-hover:text-teal-700 transition-all duration-300 shrink-0 ml-2">
                      <span className="hidden sm:inline">Releases</span>
                      <ChevronRight className="w-4 h-4 sm:w-3.5 sm:h-3.5 transition-transform duration-300 group-hover:translate-x-1" />
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}