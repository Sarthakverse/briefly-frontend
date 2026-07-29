import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Search,
  ArrowLeft,
  Trash2,
  CalendarDays,
  Inbox,
  ChevronRight,
} from 'lucide-react';
import api from '../../lib/axios';
import { deleteMeeting } from '../meetings/meetingApi';
import type { MeetingListItem } from '../meetings/meetingApi';
import { useAuth } from '../../context/AuthContext';
import { useConfirm } from '../../context/ConfirmContext';
import toast from 'react-hot-toast';

export default function TaskMeetingList() {
  const { taskId } = useParams<{ taskId: string }>();
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const navigate = useNavigate();
  const [meetings, setMeetings] = useState<MeetingListItem[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const { confirm } = useConfirm();

  const fetchMeetings = () => {
    if (!taskId) return;
    setLoading(true);
    api.get(`/tasks/${taskId}/meetings`)
      .then(res => setMeetings(res.data))
      .catch(() => toast.error('Failed to load meetings'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchMeetings();
  }, [taskId]);

  const handleDelete = async (id: string) => {
    const confirmed = await confirm({
      title: 'Delete Meeting',
      message: 'Are you sure you want to delete this meeting? This will permanently remove all its data.',
    });
    if (!confirmed) return;
    try {
      await deleteMeeting(id);
      fetchMeetings();
      toast.success('Meeting deleted');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to delete meeting');
    }
  };

  const filtered = meetings.filter((m) =>
    m.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8 pb-16 px-4 sm:px-6 lg:px-8 animate-in fade-in duration-500 font-sans text-slate-900 dark:text-slate-100">
      
      {/* Back Button */}
      <button
        onClick={() => navigate('/tasks')}
        className="inline-flex items-center gap-1.5 sm:gap-2 text-slate-500 dark:text-slate-400 hover:text-violet-600 dark:hover:text-violet-400 font-semibold text-sm transition-colors mb-1 sm:mb-2"
      >
        <ArrowLeft size={16} className="sm:w-[18px] sm:h-[18px]" />
        Back to Tasks
      </button>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 sm:gap-5 mb-1 sm:mb-2">
        <div>
          <h1 className="text-2xl sm:text-3xl md:text-[2.5rem] font-bold text-slate-800 dark:text-white tracking-tight mb-1.5 sm:mb-2">
            Meetings
          </h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium text-sm sm:text-base">
            Review and manage processed meeting transcripts for this task.
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative w-full group">
        <div className="absolute inset-0 bg-gradient-to-r from-violet-100/50 dark:from-violet-900/30 to-transparent rounded-2xl blur opacity-0 group-focus-within:opacity-100 transition duration-500 pointer-events-none" />
        <div className="relative flex items-center">
          <Search className="absolute left-3.5 sm:left-4 top-1/2 -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-slate-400 dark:text-slate-500 group-focus-within:text-violet-500 dark:group-focus-within:text-violet-400 transition-colors" />
          <input
            type="text"
            placeholder="Search meetings by title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 sm:pl-12 pr-4 py-3 sm:py-3.5 bg-white/60 dark:bg-slate-900/60 backdrop-blur border border-slate-200 dark:border-slate-800 rounded-2xl text-sm sm:text-base font-medium text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-4 focus:ring-violet-100 dark:focus:ring-violet-950/50 focus:border-violet-300 dark:focus:border-violet-500 transition-all shadow-sm"
          />
        </div>
      </div>

      {/* Content Area */}
      <div className="min-h-[300px]">
        {loading ? (
          /* Skeleton Loading */
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-2xl sm:rounded-3xl border border-slate-200/80 dark:border-slate-800/80 p-4 sm:p-5 animate-pulse flex items-center gap-3 sm:gap-4"
              >
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-slate-100 dark:bg-slate-800 rounded-xl sm:rounded-2xl shrink-0" />
                <div className="space-y-2 flex-1">
                  <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded-md w-1/2" />
                  <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded-md w-1/4" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          /* Empty State */
          <div className="flex flex-col items-center justify-center h-[300px] bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800 shadow-sm px-4">
            <div className="w-14 h-14 sm:w-16 sm:h-16 bg-slate-100 dark:bg-slate-800/80 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700/80 flex items-center justify-center mb-4 sm:mb-5">
              <Inbox className="w-7 h-7 sm:w-8 sm:h-8 text-slate-300 dark:text-slate-600" />
            </div>
            <p className="text-slate-800 dark:text-slate-200 font-bold text-lg sm:text-xl text-center">
              No meetings found
            </p>
            <p className="text-slate-500 dark:text-slate-400 text-sm sm:text-base mt-1.5 sm:mt-2 max-w-sm text-center font-medium">
              {search
                ? `We couldn’t find anything matching “${search}”.`
                : 'No meetings have been uploaded for this task yet.'}
            </p>
          </div>
        ) : (
          /* Meeting List */
          <div className="space-y-3 sm:space-y-4">
            {filtered.map((meeting) => (
              <div
                key={meeting.id}
                onClick={() => navigate(`/meetings/${meeting.id}`)}
                className="group relative bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-2xl sm:rounded-3xl border border-slate-200/80 dark:border-slate-800/80 p-4 sm:p-5 shadow-sm hover:border-violet-200 dark:hover:border-violet-800/80 hover:shadow-lg hover:shadow-slate-100/50 dark:hover:shadow-slate-950/50 hover:-translate-y-0.5 cursor-pointer transition-all duration-300 overflow-hidden"
              >
                {/* Left Active Bar */}
                <div className="absolute left-0 top-0 bottom-0 w-1 sm:w-1.5 bg-violet-400 dark:bg-violet-500 scale-y-0 group-hover:scale-y-100 origin-center transition-transform duration-300 rounded-r-sm" />

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-slate-800 dark:text-slate-100 group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors text-base sm:text-lg truncate">
                      {meeting.title}
                    </h3>
                    <div className="flex items-center gap-1.5 sm:gap-2 mt-1.5 sm:mt-2 text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">
                      <CalendarDays className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-400 dark:text-slate-500" />
                      {new Date(meeting.createdAt).toLocaleDateString()}
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 w-full sm:w-auto pt-2 sm:pt-0 mt-1 sm:mt-0 border-t border-slate-100 dark:border-slate-800/80 sm:border-0">
                    {/* Status Pill */}
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 text-[10px] sm:text-[11px] font-bold rounded-full border shadow-sm ${
                        meeting.status === 'completed'
                          ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/60'
                          : meeting.status === 'processing'
                          ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800/60'
                          : meeting.status === 'failed'
                          ? 'bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800/60'
                          : 'bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      <span
                        className={`relative flex h-1.5 w-1.5 sm:h-2 sm:w-2 ${
                          meeting.status === 'completed'
                            ? 'text-emerald-500'
                            : meeting.status === 'processing'
                            ? 'text-amber-500'
                            : meeting.status === 'failed'
                            ? 'text-red-500'
                            : 'text-slate-400 dark:text-slate-500'
                        }`}
                      >
                        {meeting.status === 'processing' && (
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-current opacity-75"></span>
                        )}
                        <span className="relative inline-flex rounded-full h-1.5 w-1.5 sm:h-2 sm:w-2 bg-current"></span>
                      </span>
                      {meeting.status}
                    </span>

                    <div className="flex items-center gap-1.5 sm:gap-3">
                      {isAdmin && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(meeting.id);
                          }}
                          className="p-1.5 sm:p-2 text-slate-400 dark:text-slate-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/50 rounded-xl transition-colors sm:opacity-0 group-hover:opacity-100 sm:translate-x-2 group-hover:translate-x-0"
                          title="Delete meeting"
                        >
                          <Trash2 size={15} className="sm:w-4 sm:h-4" />
                        </button>
                      )}
                      <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-slate-300 dark:text-slate-600 group-hover:text-violet-500 dark:group-hover:text-violet-400 transition-colors" />
                    </div>
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