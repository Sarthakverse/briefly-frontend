import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Star, 
  Search, 
  ChevronRight, 
  FolderOpen, 
  Briefcase, 
  CalendarDays, 
  Activity,
  FileText,
  X
} from 'lucide-react'; 
import { useAutoAnimate } from '@formkit/auto-animate/react';
import { getFavorites } from './favoritesApi';
import { toggleFavorite } from '../workspace/workspaceApi'; 
import toast from 'react-hot-toast';

// Interfaces for stronger type safety
interface Adapter {
  name: string;
}

interface Release {
  name: string;
}

interface FavoriteMeeting {
  id: string;
  title: string;
  createdAt: string | Date;
  adapter?: Adapter;
  release?: Release;
}

interface FavoriteWorkspace {
  id: string;
  title?: string;
  createdAt: string | Date;
  status?: string;
}

export default function FavoritesPage() {
  const navigate = useNavigate();
  const [meetings, setMeetings] = useState<FavoriteMeeting[]>([]);
  const [workspace, setWorkspace] = useState<FavoriteWorkspace[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Smooth list animations
  const [meetingsListRef] = useAutoAnimate({ duration: 300 });
  const [workspaceListRef] = useAutoAnimate({ duration: 300 });
  const [pageRef] = useAutoAnimate({ duration: 300 });

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

  const fetchFavorites = async () => {
    try {
      setLoading(true);
      const data = await getFavorites();
      setMeetings(data.meetings || []);
      setWorkspace(data.workspace || []);
    } catch (err) {
      toast.error('Failed to load favorites');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchFavorites(); }, []);

  const handleUnfavorite = async (type: 'meeting' | 'workspace', id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await toggleFavorite(type, id);
      
      // Optimistic UI update for snappier feel
      if (type === 'meeting') {
        setMeetings(prev => prev.filter(m => m.id !== id));
      } else {
        setWorkspace(prev => prev.filter(w => w.id !== id));
      }
      
      toast.success('Removed from favorites');
    } catch (err) {
      toast.error('Failed to update favorite');
      fetchFavorites(); // Revert on failure
    }
  };

  const filterItems = <T extends { title?: string }>(items: T[]) =>
    items.filter(item =>
      (item.title || 'Untitled').toLowerCase().includes(search.toLowerCase())
    );

  const filteredMeetings = useMemo(() => filterItems(meetings), [meetings, search]);
  const filteredWorkspace = useMemo(() => filterItems(workspace), [workspace, search]);
  
  const totalFavorites = filteredMeetings.length + filteredWorkspace.length;
  const pad = (n: number) => String(n + 1).padStart(3, '0');

  const handleKeyDownNavigate = (e: React.KeyboardEvent, path: string) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      navigate(path);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 sm:space-y-8 pb-16 px-4 sm:px-6 lg:px-8 animate-in fade-in duration-500 font-sans text-slate-900 dark:text-slate-100">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-5 pt-6 sm:pt-8 border-b border-slate-200 dark:border-slate-800 pb-5 sm:pb-6">
        <div>
          <div className="flex items-center gap-2 text-amber-600 dark:text-amber-500 mb-1.5 sm:mb-2">
            <Star className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-amber-600 dark:fill-amber-500" />
            <span className="text-[10px] sm:text-[11px] font-bold tracking-[0.14em] uppercase">
              Quick Access
            </span>
          </div>
          <h1 className="text-2xl sm:text-[28px] leading-none font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Starred Transcripts
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 max-w-md leading-relaxed">
            Your most important registered meetings and raw workspace transcripts, pinned for immediate retrieval.
          </p>
        </div>

        <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-4 mt-2 sm:mt-0">
          <div className="text-left sm:text-right hidden sm:block">
            <div className="font-mono text-lg font-semibold tabular-nums text-slate-900 dark:text-slate-100">
              {String(totalFavorites).padStart(2, '0')}
            </div>
            <div className="text-[10px] font-bold tracking-wider uppercase text-slate-400 dark:text-slate-500">
              Total Starred
            </div>
          </div>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative w-full group mt-4 sm:mt-0">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-[16px] w-[16px] text-slate-400 dark:text-slate-500 group-focus-within:text-amber-500 transition-colors" />
        <input
          ref={searchInputRef}
          type="text"
          placeholder="Find a favorite…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-20 sm:pr-24 py-2.5 bg-transparent border-b-2 border-slate-200 dark:border-slate-800 text-sm font-medium text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-amber-500 dark:focus:border-amber-500 transition-colors"
        />
        
        <div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
          {search && (
            <button
              onClick={() => setSearch('')}
              className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full transition-colors"
              aria-label="Clear search"
            >
              <X size={14} />
            </button>
          )}
          
          <div className="hidden sm:flex items-center gap-1 opacity-70 group-focus-within:opacity-100 transition-opacity pointer-events-none">
            <kbd className={`px-1.5 py-0.5 border border-slate-200 dark:border-slate-700 rounded text-[10px] font-bold text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 transition-all duration-150 ${isShortcutPressed ? 'scale-90 bg-slate-200 dark:bg-slate-700' : ''}`}>
              ⌘
            </kbd>
            <kbd className={`px-1.5 py-0.5 border border-slate-200 dark:border-slate-700 rounded text-[10px] font-bold text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 transition-all duration-150 ${isShortcutPressed ? 'scale-90 bg-slate-200 dark:bg-slate-700' : ''}`}>
              F
            </kbd>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="min-h-[400px]" ref={pageRef}>
        {loading ? (
          /* Skeleton Loader */
          <div className="divide-y divide-slate-100 dark:divide-slate-800/60 border-t border-slate-100 dark:border-slate-800 mt-6">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="py-4 flex items-center gap-3 sm:gap-4 animate-pulse">
                <div className="hidden sm:block w-8 h-3 bg-slate-100 dark:bg-slate-800 rounded" />
                <div className="w-8 h-8 bg-slate-100 dark:bg-slate-800 rounded-lg shrink-0" />
                <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded w-1/2 sm:w-1/3" />
                <div className="ml-auto h-3 bg-slate-100 dark:bg-slate-800 rounded w-12 sm:w-16" />
              </div>
            ))}
          </div>
        ) : totalFavorites === 0 ? (
          /* Empty State */
          <div className="flex flex-col items-center justify-center h-[340px] border-t border-b border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 rounded-lg px-4 mt-6">
            <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
              <Star className="w-5 h-5 text-slate-400 dark:text-slate-500" />
            </div>
            <p className="text-slate-900 dark:text-slate-100 font-semibold text-base">No favorites found</p>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1 max-w-sm text-center">
              {search
                ? `Nothing matches “${search}”. Try a different search.`
                : 'You haven\'t starred any transcripts yet. Star items to access them quickly here.'}
            </p>
          </div>
        ) : (
          <div className="space-y-10 mt-6">
            
            {/* --- REGISTERED MEETINGS --- */}
            {filteredMeetings.length > 0 && (
              <div>
                <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200 mb-3 px-2">
                  <FolderOpen className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
                  <h2 className="text-sm font-bold tracking-wide">Repository Favorites</h2>
                  <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-[10px] font-bold ml-1">
                    {filteredMeetings.length}
                  </span>
                </div>
                
                <div className="border-t border-slate-100 dark:border-slate-800/80" ref={meetingsListRef}>
                  {filteredMeetings.map((meeting, i) => (
                    <div
                      key={meeting.id}
                      role="button"
                      tabIndex={0}
                      onClick={() => navigate(`/meetings/${meeting.id}`)}
                      onKeyDown={(e) => handleKeyDownNavigate(e, `/meetings/${meeting.id}`)}
                      className="group relative flex items-center gap-3 sm:gap-4 pl-3 pr-2 py-3.5 border-b border-slate-100 dark:border-slate-800/80 border-l-2 border-l-transparent hover:border-l-amber-500 dark:hover:border-l-amber-500 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-all duration-300 ease-out outline-none focus-visible:bg-slate-50 dark:focus-visible:bg-slate-800/50"
                    >
                      <span className="hidden sm:block font-mono text-xs text-slate-300 dark:text-slate-600 group-hover:text-amber-500 dark:group-hover:text-amber-400 transition-colors duration-300 w-8 shrink-0 tabular-nums">
                        {pad(i)}
                      </span>

                      <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 shrink-0 transition-all duration-300 group-hover:scale-105 group-hover:shadow-sm">
                        <Activity className="w-4 h-4" strokeWidth={2.25} />
                      </div>

                      <div className="flex-1 min-w-0 flex flex-col sm:flex-row sm:items-center justify-between sm:gap-4">
                        <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors duration-300 truncate">
                          {meeting.title}
                        </h3>
                        
                        <div className="flex items-center gap-2 sm:gap-3 text-xs font-medium text-slate-400 dark:text-slate-500 mt-0.5 sm:mt-0">
                          <span className="flex items-center gap-1">
                            <CalendarDays size={12} className="opacity-70 hidden sm:block" />
                            {new Date(meeting.createdAt).toLocaleDateString()}
                          </span>
                          
                          {meeting.adapter && (
                            <>
                              <span className="w-1 h-1 rounded-full bg-slate-200 dark:bg-slate-700 hidden sm:block" />
                              <div className="flex items-center gap-1.5 text-[9px] sm:text-[10px] uppercase tracking-wider">
                                <span className="px-1.5 py-0.5 bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60 text-slate-600 dark:text-slate-300 rounded-md truncate max-w-[80px] sm:max-w-none">
                                  {meeting.adapter.name}
                                </span>
                                {meeting.release && (
                                  <>
                                    <ChevronRight className="w-3 h-3 text-slate-300 dark:text-slate-600" />
                                    <span className="px-1.5 py-0.5 bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60 text-slate-600 dark:text-slate-300 rounded-md truncate max-w-[80px] sm:max-w-none">
                                      {meeting.release.name}
                                    </span>
                                  </>
                                )}
                              </div>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1 sm:opacity-0 sm:translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 ease-out shrink-0">
                        <button
                          onClick={(e) => handleUnfavorite('meeting', meeting.id, e)}
                          className="p-2 sm:p-1.5 text-amber-500 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40 rounded-md transition-all duration-200 sm:hover:scale-110"
                          title="Unfavorite"
                          aria-label="Unfavorite meeting"
                        >
                          <Star size={16} className="fill-current sm:w-4 sm:h-4" />
                        </button>
                        <div className="flex items-center justify-center p-2 sm:p-1.5 text-slate-400 dark:text-slate-500 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-all duration-200 hidden sm:flex">
                          <ChevronRight size={16} className="sm:w-4 sm:h-4 transition-transform duration-300 group-hover:translate-x-0.5" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* --- RAW WORKSPACE --- */}
            {filteredWorkspace.length > 0 && (
              <div>
                <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200 mb-3 px-2">
                  <Briefcase className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                  <h2 className="text-sm font-bold tracking-wide">Workspace Favorites</h2>
                  <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-[10px] font-bold ml-1">
                    {filteredWorkspace.length}
                  </span>
                </div>
                
                <div className="border-t border-slate-100 dark:border-slate-800/80" ref={workspaceListRef}>
                  {filteredWorkspace.map((ws, i) => (
                    <div
                      key={ws.id}
                      role="button"
                      tabIndex={0}
                      onClick={() => navigate(`/workspace/${ws.id}`)}
                      onKeyDown={(e) => handleKeyDownNavigate(e, `/workspace/${ws.id}`)}
                      className="group relative flex items-center gap-3 sm:gap-4 pl-3 pr-2 py-3.5 border-b border-slate-100 dark:border-slate-800/80 border-l-2 border-l-transparent hover:border-l-amber-500 dark:hover:border-l-amber-500 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-all duration-300 ease-out outline-none focus-visible:bg-slate-50 dark:focus-visible:bg-slate-800/50"
                    >
                      <span className="hidden sm:block font-mono text-xs text-slate-300 dark:text-slate-600 group-hover:text-amber-500 dark:group-hover:text-amber-400 transition-colors duration-300 w-8 shrink-0 tabular-nums">
                        {pad(i)}
                      </span>

                      <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-teal-50 dark:bg-teal-950/50 text-teal-600 dark:text-teal-400 shrink-0 transition-all duration-300 group-hover:scale-105 group-hover:shadow-sm">
                        <FileText className="w-4 h-4" strokeWidth={2.25} />
                      </div>

                      <div className="flex-1 min-w-0 flex flex-col sm:flex-row sm:items-center justify-between sm:gap-4">
                        <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors duration-300 truncate">
                          {ws.title || 'Untitled Transcript'}
                        </h3>
                        
                        <div className="flex items-center gap-2 sm:gap-3 text-xs font-medium text-slate-400 dark:text-slate-500 mt-0.5 sm:mt-0">
                          <span className="flex items-center gap-1">
                            <CalendarDays size={12} className="opacity-70 hidden sm:block" />
                            {new Date(ws.createdAt).toLocaleDateString()}
                          </span>
                          <span className="w-1 h-1 rounded-full bg-slate-200 dark:bg-slate-700 hidden sm:block" />
                          <span className={`inline-flex items-center uppercase tracking-widest text-[9px] sm:text-[10px] px-1.5 py-0.5 rounded-md font-semibold border ${
                            ws.status?.toLowerCase() === 'processing' 
                              ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border-amber-200/60 dark:border-amber-900/40' 
                              : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border-emerald-200/60 dark:border-emerald-900/40'
                          }`}>
                            {ws.status || 'Ready'}
                          </span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1 sm:opacity-0 sm:translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 ease-out shrink-0">
                        <button
                          onClick={(e) => handleUnfavorite('workspace', ws.id, e)}
                          className="p-2 sm:p-1.5 text-amber-500 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40 rounded-md transition-all duration-200 sm:hover:scale-110"
                          title="Unfavorite"
                          aria-label="Unfavorite workspace"
                        >
                          <Star size={16} className="fill-current sm:w-4 sm:h-4" />
                        </button>
                        <div className="flex items-center justify-center p-2 sm:p-1.5 text-slate-400 dark:text-slate-500 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-all duration-200 hidden sm:flex">
                          <ChevronRight size={16} className="sm:w-4 sm:h-4 transition-transform duration-300 group-hover:translate-x-0.5" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}