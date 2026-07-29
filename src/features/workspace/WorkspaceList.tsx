import { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  Trash2, 
  Inbox, 
  ChevronRight, 
  Plus, 
  FileText, 
  CalendarDays, 
  Loader2,
  ArrowRight
} from 'lucide-react';
import { useAutoAnimate } from '@formkit/auto-animate/react';
import { 
  getWorkspaceList, 
  deleteWorkspaceTranscript, 
  deleteAllWorkspaceTranscripts,
  uploadWorkspaceTranscript 
} from './workspaceApi';
import type { WorkspaceListItem } from './workspaceApi';
import { useConfirm } from '../../context/ConfirmContext';
import toast from 'react-hot-toast';

export default function WorkspaceList() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { confirm } = useConfirm();
  
  const [items, setItems] = useState<WorkspaceListItem[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  
  const [listRef] = useAutoAnimate({ duration: 300 });
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [isShortcutPressed, setIsShortcutPressed] = useState(false);

  // Keyboard shortcut for search focus (Cmd/Ctrl+F)
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

  const fetchItems = async () => {
    try {
      setLoading(true);
      const data = await getWorkspaceList();
      setItems(data);
    } catch (err) {
      toast.error('Failed to load workspace items');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchItems(); }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.match(/\.(vtt|docx|txt)$/i)) {
      toast.error('Unsupported file format. Please upload .vtt, .docx, or .txt');
      if (fileInputRef.current) fileInputRef.current.value = ''; 
      return;
    }

    setIsUploading(true);
    const toastId = toast.loading('Uploading transcript...');

    try {
      const result = await uploadWorkspaceTranscript(file);
      toast.success('Upload complete!', { id: toastId });
      navigate(`/workspace/processing/${result.id}`);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Upload failed', { id: toastId });
      if (fileInputRef.current) fileInputRef.current.value = ''; 
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const confirmed = await confirm({
      title: 'Delete Workspace Transcript',
      message: 'Are you sure you want to delete this workspace transcript? This action cannot be undone.',
    });
    if (!confirmed) return;
    try {
      await deleteWorkspaceTranscript(id);
      fetchItems();
      toast.success('Transcript deleted');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Delete failed');
    }
  };

  const handleDeleteAll = async () => {
    const confirmed = await confirm({
      title: 'Delete All Workspace Transcripts',
      message: 'Are you sure you want to permanently delete ALL workspace transcripts? This action cannot be undone.',
    });
    if (!confirmed) return;
    try {
      await deleteAllWorkspaceTranscripts();
      setItems([]);
      toast.success('Workspace cleared');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to clear workspace');
    }
  };

  const filtered = useMemo(() => {
    return items.filter(item =>
      (item.title || 'Untitled').toLowerCase().includes(search.toLowerCase())
    );
  }, [items, search]);

  const pad = (n: number) => String(n + 1).padStart(3, '0');

  return (
    <div className="max-w-5xl mx-auto space-y-6 sm:space-y-8 pb-16 px-4 sm:px-6 lg:px-8 animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-5 pt-6 sm:pt-8 border-b border-slate-200 dark:border-slate-800 pb-5 sm:pb-6">
        <div>
          <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 mb-1.5 sm:mb-2">
            <FileText className="w-3.5 h-3.5 sm:w-4 sm:h-4" strokeWidth={2.5} />
            <span className="text-[10px] sm:text-[11px] font-bold tracking-[0.14em] uppercase">
              Private
            </span>
          </div>
          <h1 className="text-2xl sm:text-[28px] leading-none font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            Workspace
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 max-w-md leading-relaxed">
            Manage your raw, unprocessed transcripts before running them through the intelligence engine.
          </p>
        </div>

        <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-4 mt-2 sm:mt-0">
          <div className="text-left sm:text-right hidden sm:block">
            <div className="font-mono text-lg font-semibold text-slate-900 dark:text-slate-100 tabular-nums">
              {String(items.length).padStart(2, '0')}
            </div>
            <div className="text-[10px] font-bold tracking-wider uppercase text-slate-400 dark:text-slate-500">
              Total
            </div>
          </div>
          
          <div className="flex gap-2 w-full sm:w-auto">
            {items.length > 0 && (
              <button
                onClick={handleDeleteAll}
                disabled={isUploading}
                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/50 transition-all duration-200 active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Trash2 size={16} /> Delete All
              </button>
            )}
            
            <input
              type="file"
              accept=".vtt,.docx,.txt"
              ref={fileInputRef}
              onChange={handleFileUpload}
              className="hidden"
            />
            
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold bg-slate-900 dark:bg-indigo-600 text-white hover:bg-indigo-600 dark:hover:bg-indigo-500 transition-all duration-200 active:scale-[0.97] disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isUploading ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
              {isUploading ? 'Uploading...' : 'Upload'}
            </button>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="relative w-full group mt-4 sm:mt-0">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-[16px] w-[16px] text-slate-400 dark:text-slate-500 group-focus-within:text-indigo-600 dark:group-focus-within:text-indigo-400 transition-colors" />
        <input
          ref={searchInputRef}
          type="text"
          placeholder="Find a transcript…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          disabled={isUploading}
          className="w-full pl-9 pr-12 sm:pr-16 py-2.5 bg-transparent border-b-2 border-slate-200 dark:border-slate-800 text-sm font-medium text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-indigo-600 dark:focus:border-indigo-500 transition-colors disabled:opacity-50"
        />
        <div className="absolute right-1 top-1/2 -translate-y-1/2 hidden sm:flex items-center gap-1 opacity-70 group-focus-within:opacity-100 transition-opacity">
          <kbd className={`px-1.5 py-0.5 border border-slate-200 dark:border-slate-700 rounded text-[10px] font-bold text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 transition-all duration-150 ${isShortcutPressed ? 'scale-90 bg-slate-200 dark:bg-slate-700' : ''}`}>
            ⌘
          </kbd>
          <kbd className={`px-1.5 py-0.5 border border-slate-200 dark:border-slate-700 rounded text-[10px] font-bold text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 transition-all duration-150 ${isShortcutPressed ? 'scale-90 bg-slate-200 dark:bg-slate-700' : ''}`}>
            F
          </kbd>
        </div>
      </div>

      {/* List Area */}
      <div className="min-h-[400px]">
        {loading ? (
          /* Skeleton Loader */
          <div className="divide-y divide-slate-100 dark:divide-slate-800/60 border-t border-slate-100 dark:border-slate-800/60">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="py-4 flex items-center gap-3 sm:gap-4 animate-pulse">
                <div className="hidden sm:block w-8 h-3 bg-slate-100 dark:bg-slate-800/60 rounded" />
                <div className="w-8 h-8 bg-slate-100 dark:bg-slate-800/60 rounded-lg shrink-0" />
                <div className="h-4 bg-slate-100 dark:bg-slate-800/60 rounded w-1/2 sm:w-1/3" />
                <div className="ml-auto h-3 bg-slate-100 dark:bg-slate-800/60 rounded w-12 sm:w-16" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          /* Empty State */
          <div className="flex flex-col items-center justify-center h-[340px] border-t border-b border-dashed border-slate-200 dark:border-slate-800 px-4">
            <div className="w-12 h-12 bg-slate-50 dark:bg-slate-800/50 rounded-full flex items-center justify-center mb-4">
              <Inbox className="w-5 h-5 text-slate-400 dark:text-slate-500" />
            </div>
            <p className="text-slate-900 dark:text-slate-100 font-semibold text-base">No transcripts found</p>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1 max-w-sm text-center">
              {search
                ? `Nothing matches “${search}”. Try a different search.`
                : 'Upload a raw transcript (.vtt, .docx, .txt) to start processing.'}
            </p>
            {!search && (
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="mt-5 text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 flex items-center gap-1 transition-colors disabled:opacity-50"
              >
                {isUploading ? <Loader2 size={16} className="animate-spin" /> : 'Upload File'} <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        ) : (
          /* Transcript List */
          <div className="border-t border-slate-100 dark:border-slate-800/60" ref={listRef}>
            {filtered.map((item, i) => (
              <div
                key={item.id}
                onClick={() => !isUploading && navigate(`/workspace/${item.id}`)}
                className={`group relative flex items-center gap-3 sm:gap-4 pl-3 pr-2 py-3.5 border-b border-slate-100 dark:border-slate-800/60 border-l-2 transition-all duration-300 ease-out ${
                  isUploading 
                    ? 'opacity-50 border-l-transparent pointer-events-none' 
                    : 'border-l-transparent hover:border-l-indigo-600 dark:hover:border-l-indigo-500 hover:bg-slate-50 dark:hover:bg-slate-800/40 cursor-pointer'
                }`}
              >
                {/* Desktop Index */}
                <span className="hidden sm:block font-mono text-xs text-slate-300 dark:text-slate-600 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors duration-300 w-8 shrink-0 tabular-nums">
                  {pad(i)}
                </span>

                <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 shrink-0 transition-all duration-300 group-hover:scale-105 group-hover:shadow-sm group-hover:shadow-indigo-100 dark:group-hover:shadow-none">
                  <FileText className="w-4 h-4" strokeWidth={2.25} />
                </div>

                <div className="flex-1 min-w-0 flex flex-col sm:flex-row sm:items-center justify-between sm:gap-4">
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors duration-300 truncate">
                    {item.title || 'Untitled Transcript'}
                  </h3>
                  
                  <div className="flex items-center gap-2 sm:gap-3 text-xs font-medium text-slate-400 dark:text-slate-500 mt-0.5 sm:mt-0">
                    <span className="flex items-center gap-1">
                      <CalendarDays size={12} className="opacity-70 hidden sm:block" />
                      {new Date(item.createdAt).toLocaleDateString()}
                    </span>
                    <span className="w-1 h-1 rounded-full bg-slate-200 dark:bg-slate-700 hidden sm:block" />
                    <span className={`inline-flex items-center uppercase tracking-widest text-[9px] sm:text-[10px] px-1.5 py-0.5 rounded-md ${
                      item.status?.toLowerCase() === 'processing' 
                        ? 'bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400' 
                        : 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400'
                    }`}>
                      {item.status || 'Ready'}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-0.5 sm:opacity-0 sm:translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 ease-out shrink-0">
                  <button
                    onClick={(e) => handleDelete(item.id, e)}
                    className="p-2 sm:p-1.5 text-slate-400 dark:text-slate-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/50 rounded-md transition-all duration-200 sm:hover:scale-110"
                    title="Delete"
                  >
                    <Trash2 size={16} className="sm:w-4 sm:h-4" />
                  </button>
                  <div className="flex items-center justify-center p-2 sm:p-1.5 text-slate-400 dark:text-slate-500 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-all duration-200 ml-1">
                    <ChevronRight size={16} className="sm:w-4 sm:h-4 transition-transform duration-300 group-hover:translate-x-0.5" />
                  </div>
                </div>

              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}