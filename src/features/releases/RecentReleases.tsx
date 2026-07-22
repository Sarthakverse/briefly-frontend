import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Layers, 
  ChevronRight, 
  ArrowLeft, 
  Activity,
  CalendarDays,
  Inbox
} from 'lucide-react';
import { getRecentReleases } from '../home/homeApi';
import toast from 'react-hot-toast';

interface RecentRelease {
  id: string;
  name: string;
  adapterId: string;
  adapter: { name: string };
  createdAt: string;
}

export default function RecentReleases() {
  const navigate = useNavigate();
  const [releases, setReleases] = useState<RecentRelease[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getRecentReleases()
      .then(setReleases)
      .catch(() => toast.error('Failed to load releases'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-8 px-4 sm:px-6 lg:px-8 animate-in fade-in duration-500">
      
      {/* Back Navigation */}
      <button
        onClick={() => navigate('/adapters')}
        className="group inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-sky-600 transition-colors"
      >
        <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-1" />
        Back to Adapters
      </button>

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-sky-600 mb-2">
            <span className="p-1 bg-sky-100 rounded-md">
              <Activity className="w-4 h-4" strokeWidth={2.5} />
            </span>
            <span className="text-xs font-bold tracking-widest uppercase">
              System Activity
            </span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Recent Releases
          </h1>
          <p className="text-sm text-slate-500 max-w-md">
            The 5 most recent releases across all your configured adapters.
          </p>
        </div>
      </div>

      {/* Main Content Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
        
        {/* Card Toolbar/Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50/50">
          <span className="text-sm font-semibold text-slate-700">Latest Updates</span>
          {!loading && releases.length > 0 && (
            <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded-md">
              Top {releases.length}
            </span>
          )}
        </div>

        {/* List Area */}
        <div className="min-h-[300px] flex flex-col relative">
          {loading ? (
            /* Skeleton Loader */
            <div className="divide-y divide-slate-100">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="p-4 sm:p-5 flex items-center gap-4 animate-pulse">
                  <div className="w-10 h-10 bg-slate-100 rounded-xl shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-slate-100 rounded w-1/3" />
                    <div className="h-3 bg-slate-100 rounded w-1/4" />
                  </div>
                  <div className="w-6 h-6 bg-slate-100 rounded-lg shrink-0" />
                </div>
              ))}
            </div>
          ) : releases.length === 0 ? (
            /* Empty State */
            <div className="flex-1 flex flex-col items-center justify-center p-8 sm:p-12 text-center">
              <div className="w-16 h-16 bg-sky-50 border border-sky-100 rounded-2xl flex items-center justify-center mb-6 shadow-sm">
                <Inbox className="w-8 h-8 text-sky-500" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                No releases found
              </h3>
              <p className="text-slate-500 text-sm max-w-sm mb-6">
                There hasn't been any recent release activity across your adapters yet.
              </p>
              <button
                onClick={() => navigate('/adapters')}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold bg-white border border-slate-200 text-slate-700 hover:border-sky-300 hover:text-sky-600 transition-all shadow-sm active:scale-95"
              >
                View Adapters
              </button>
            </div>
          ) : (
            /* Releases List */
            <div className="divide-y divide-slate-100">
              {releases.map((release) => (
                <div
                  key={release.id}
                  onClick={() => navigate(`/releases/${release.id}/enhancements`)}
                  className="group relative flex items-center gap-4 p-4 sm:p-5 transition-all duration-200 ease-out bg-white hover:bg-slate-50 cursor-pointer"
                >
                  {/* Active Border Hint */}
                  <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-sky-500 opacity-0 group-hover:opacity-100 transition-opacity" />

                  {/* Icon */}
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all duration-300 bg-slate-100 text-slate-500 group-hover:bg-sky-50 group-hover:text-sky-600 group-hover:shadow-sm">
                    <Layers className="w-5 h-5" strokeWidth={2} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0 flex flex-col justify-center">
                    <h3 className="text-sm font-semibold text-slate-900 group-hover:text-sky-700 transition-colors duration-200 truncate mb-1">
                      {release.name}
                    </h3>
                    
                    <div className="flex items-center gap-3 text-[11px] font-medium text-slate-500">
                      <span className="text-slate-700 font-semibold truncate max-w-[120px] sm:max-w-xs">
                        {release.adapter.name}
                      </span>
                      
                      <span className="w-1 h-1 rounded-full bg-slate-300 shrink-0" />
                      
                      <span className="flex items-center gap-1.5 whitespace-nowrap">
                        <CalendarDays size={13} className="opacity-70" />
                        {new Date(release.createdAt).toLocaleDateString(undefined, { 
                          month: 'short', day: 'numeric', year: 'numeric' 
                        })}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center sm:opacity-0 sm:translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 ease-out shrink-0 bg-gradient-to-l from-slate-50 via-slate-50 to-transparent pl-4 pr-1">
                    <div className="p-2 text-slate-300 group-hover:text-sky-500 transition-colors">
                      <ChevronRight size={20} className="transition-transform duration-300 group-hover:translate-x-1" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}