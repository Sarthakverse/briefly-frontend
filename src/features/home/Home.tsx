import { useNavigate, useLocation } from 'react-router-dom';
import {
  UploadCloud,
  Sparkles,
  Box,
  Layers,
  Zap,
  ChevronRight,
  ArrowRight,
  CalendarDays,
  Inbox,
  Play,
  Activity,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAutoAnimate } from '@formkit/auto-animate/react';
import { motion, type Variants } from 'framer-motion';
import {
  getRecentMeetings,
  getRecentAdapters,
  getRecentReleases,
  getRecentEnhancements,
  type RecentMeeting,
} from './homeApi';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import SearchBar from '../../components/common/SearchBar';

interface RecentAdapter {
  id: string;
  name: string;
  createdAt: string;
}
interface RecentRelease {
  id: string;
  name: string;
  adapterId: string;
  adapter: { name: string };
  createdAt: string;
}
interface RecentEnhancement {
  id: string;
  name: string;
  releaseId: string;
  release: { name: string; adapter: { id: string; name: string } };
  createdAt: string;
}

const TRANSCRIPT_LINES = [100, 85, 95, 65, 90, 40, 75, 50, 85];

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};

const fadeUpBlur: Variants = {
  hidden: { opacity: 0, y: 20, filter: 'blur(8px)' },
  show: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { type: 'spring', bounce: 0, duration: 0.8 },
  },
};

const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  show: {
    opacity: 1,
    scale: 1,
    transition: { type: 'spring', bounce: 0, duration: 0.8 },
  },
};

export default function Home() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const uploadPath = user?.role === 'admin' ? '/upload' : '/workspace';
  const [listRef] = useAutoAnimate({ duration: 300, easing: 'ease-in-out' });
  const [mobileListRef] = useAutoAnimate({ duration: 300 });

  const [meetings, setMeetings] = useState<RecentMeeting[]>([]);
  const [loading, setLoading] = useState(true);

  const [recentAdapters, setRecentAdapters] = useState<RecentAdapter[]>([]);
  const [recentReleases, setRecentReleases] = useState<RecentRelease[]>([]);
  const [recentEnhancements, setRecentEnhancements] = useState<RecentEnhancement[]>([]);

  useEffect(() => {
    Promise.all([
      getRecentMeetings().then(setMeetings).catch(() => toast.error('Failed to load meetings')),
      getRecentAdapters().then(setRecentAdapters).catch(() => toast.error('Failed to load adapters')),
      getRecentReleases().then(setRecentReleases).catch(() => toast.error('Failed to load releases')),
      getRecentEnhancements().then(setRecentEnhancements).catch(() => toast.error('Failed to load enhancements')),
    ]).finally(() => setLoading(false));
  }, [location.pathname]);

  const categories = [
    { title: 'Recent Adapters', icon: Box, data: recentAdapters, path: '/adapters', theme: 'indigo' },
    { title: 'Recent Releases', icon: Layers, data: recentReleases, path: '/releases/recent', theme: 'fuchsia' },
    { title: 'Recent Enhancements', icon: Zap, data: recentEnhancements, path: '/enhancements/recent', theme: 'amber' },
  ];

  const themeStyles: Record<string, { bg: string; text: string; gradient: string; border: string }> = {
    indigo: {
      bg: 'bg-indigo-50/60 dark:bg-indigo-950/40',
      text: 'text-indigo-600 dark:text-indigo-400',
      gradient: 'from-indigo-500 to-blue-600',
      border: 'group-hover:border-indigo-200 dark:group-hover:border-indigo-500/40',
    },
    fuchsia: {
      bg: 'bg-fuchsia-50/60 dark:bg-fuchsia-950/40',
      text: 'text-fuchsia-600 dark:text-fuchsia-400',
      gradient: 'from-fuchsia-500 to-pink-600',
      border: 'group-hover:border-fuchsia-200 dark:group-hover:border-fuchsia-500/40',
    },
    amber: {
      bg: 'bg-amber-50/60 dark:bg-amber-950/40',
      text: 'text-amber-600 dark:text-amber-400',
      gradient: 'from-amber-400 to-orange-500',
      border: 'group-hover:border-amber-200 dark:group-hover:border-amber-500/40',
    },
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0B0F17] text-slate-800 dark:text-slate-100 selection:bg-indigo-200 dark:selection:bg-indigo-800 selection:text-indigo-900 dark:selection:text-indigo-200 font-sans">
      <style>{`
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .glass-panel { background: rgba(255, 255, 255, 0.7); backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px); }
        .dark .glass-panel { background: rgba(18, 24, 36, 0.75); }

        /* Smooth Theme Transitions */
        *, *::before, *::after {
          transition-property: background-color, border-color, color, fill, stroke, box-shadow;
          transition-duration: 600ms;
          transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
        }

        /* Prevent universal transition delays from causing lag on interactive states, animations, and Framer Motion */
        :hover, 
        :active, 
        [class*="animate-"], 
        [style*="transform"], 
        [style*="opacity"] {
          transition-delay: 0ms !important;
        }
      `}</style>

      {/* ==================== MOBILE UI ==================== */}
      <motion.div variants={staggerContainer} initial="hidden" animate="show" className="md:hidden relative pb-24">
        {/* Dark Immersive Header */}
        <div className="relative w-full bg-[#050810] rounded-b-[2.5rem] overflow-hidden shadow-2xl shadow-indigo-950/30 pt-10 pb-24 px-6 z-10 border-b border-indigo-900/20">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-950/90 via-[#050810] to-fuchsia-950/40" />
          <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }} transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }} className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/30 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/3 mix-blend-screen will-change-transform" />
          <motion.div animate={{ scale: [1, 1.3, 1], opacity: [0.2, 0.4, 0.2] }} transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }} className="absolute bottom-0 left-0 w-56 h-56 bg-fuchsia-600/20 rounded-full blur-[70px] translate-y-1/4 -translate-x-1/4 mix-blend-screen will-change-transform" />
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 mix-blend-overlay"></div>

          <motion.div variants={fadeUpBlur} className="relative z-20 pt-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-[10px] font-bold tracking-widest uppercase text-indigo-200 mb-4 border border-white/10">
              <Sparkles className="w-3 h-3 text-indigo-400" />
              Intelligence Hub
            </div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight leading-[1.1]">
              Hello, <span className="bg-gradient-to-r from-indigo-300 via-purple-300 to-fuchsia-300 bg-clip-text text-transparent">{user?.name?.split(' ')[0] || 'there'}</span>
            </h1>
            <p className="mt-3 text-sm text-slate-400 font-medium max-w-[280px] leading-relaxed">
              Drop a transcript and watch your meetings transform into actionable logic.
            </p>
          </motion.div>
        </div>

        {/* Floating Upload Action */}
        <motion.div variants={fadeUpBlur} className="px-5 -mt-14 relative z-20">
          <div
            onClick={() => navigate(uploadPath)}
            className="bg-white/90 dark:bg-[#121824]/90 backdrop-blur-xl rounded-[2rem] p-5 shadow-xl shadow-slate-200/50 dark:shadow-black/50 border border-white dark:border-slate-800/80 flex items-center gap-4 active:scale-[0.98] active:delay-0 transition-transform duration-300 cursor-pointer"
          >
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-fuchsia-600 text-white flex items-center justify-center shadow-lg shadow-indigo-500/20 shrink-0 relative overflow-hidden">
              <div className="absolute inset-0 bg-white/20 animate-pulse rounded-2xl" />
              <UploadCloud className="w-6 h-6 relative z-10" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-slate-800 dark:text-slate-100 text-base leading-tight">Process New Meeting</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">.vtt, .docx, .txt supported</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-slate-50 dark:bg-[#1A2333] flex items-center justify-center text-slate-400 dark:text-slate-400 shrink-0">
              <ArrowRight className="w-5 h-5" />
            </div>
          </div>
        </motion.div>

        {/* Universal Search Bar (Mobile) */}
        <motion.div variants={fadeUpBlur} className="px-5 mt-6 relative z-20">
          <div className="relative w-full">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-fuchsia-500 rounded-[1.5rem] blur opacity-20 dark:opacity-30"></div>
            <div className="relative bg-white/90 dark:bg-[#121824]/90 backdrop-blur-xl border border-white dark:border-slate-800 shadow-lg shadow-slate-200/40 dark:shadow-black/40 p-1.5 rounded-[1.5rem]">
              <SearchBar />
            </div>
          </div>
        </motion.div>

        {/* Mobile Horizontal Registry */}
        <motion.div variants={fadeUpBlur} className="mt-8">
          <div className="px-6 mb-4 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">Registries</h3>
            <span onClick={() => navigate('/adapters')} className="text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 border border-transparent dark:border-indigo-800/40 px-3 py-1 rounded-full active:bg-indigo-100 dark:active:bg-indigo-900/50 transition-colors active:delay-0">View All</span>
          </div>
          <div className="flex overflow-x-auto hide-scrollbar gap-4 px-6 pb-6 snap-x -mx-2">
            {categories.map((cat, idx) => {
              const Icon = cat.icon;
              const theme = themeStyles[cat.theme];
              return (
                <div key={idx} onClick={() => navigate(cat.path)} className={`snap-start shrink-0 w-[140px] bg-white dark:bg-[#121824] rounded-3xl p-5 shadow-lg shadow-slate-200/30 dark:shadow-black/40 border border-slate-200/70 dark:border-slate-800/80 active:scale-95 active:delay-0 transition-transform`}>
                  <div className={`w-10 h-10 rounded-2xl bg-gradient-to-br ${theme.gradient} text-white flex items-center justify-center shadow-md mb-4`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <h4 className="font-bold text-slate-800 dark:text-slate-100 text-sm">{cat.title}</h4>
                  <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 mt-0.5">{cat.data.length} items</p>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Mobile Recent List */}
        <motion.div variants={fadeUpBlur} className="px-5 mt-2">
          <div className="bg-white dark:bg-[#121824] rounded-[2rem] p-5 shadow-lg shadow-slate-200/40 dark:shadow-black/40 border border-slate-200/70 dark:border-slate-800/80">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-4">Recent Transcripts</h3>
            <div className="space-y-1" ref={mobileListRef}>
              {loading ? (
                [1, 2, 3].map((i) => <div key={i} className="h-16 bg-slate-50 dark:bg-[#1A2333] rounded-2xl animate-pulse mb-2" />)
              ) : meetings.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-12 h-12 bg-slate-50 dark:bg-[#1A2333] rounded-full flex items-center justify-center mx-auto mb-3">
                    <Activity className="w-5 h-5 text-slate-300 dark:text-slate-600" />
                  </div>
                  <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">No meetings yet</p>
                </div>
              ) : (
                meetings.map((meeting) => (
                  <div key={meeting.id} onClick={() => navigate(`/meetings/${meeting.id}`)} className="flex items-center gap-3 p-3 rounded-2xl active:bg-slate-50 dark:active:bg-[#1A2333] active:delay-0 transition-colors">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 border ${meeting.status === 'processing' ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800/50 text-amber-500 dark:text-amber-400' : 'bg-slate-50 dark:bg-[#1A2333] border-slate-200 dark:border-slate-700/80 text-slate-400 dark:text-slate-400'}`}>
                      {meeting.status === 'processing' ? <Activity className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-slate-800 dark:text-slate-100 text-sm truncate">{meeting.title}</h4>
                      <p className="text-[11px] font-semibold text-slate-400 dark:text-slate-400 mt-0.5 truncate">
                        {meeting.adapter} <span className="mx-1 opacity-50">•</span> {meeting.release}
                      </p>
                    </div>
                    {meeting.status === 'processing' ? (
                      <span className="flex h-2 w-2 relative shrink-0 mr-1">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                      </span>
                    ) : (
                      <ChevronRight className="w-4 h-4 text-slate-300 dark:text-slate-600 shrink-0" />
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* ==================== DESKTOP UI ==================== */}
      <motion.div variants={staggerContainer} initial="hidden" animate="show" className="hidden md:flex flex-col max-w-[1400px] mx-auto min-h-screen p-6 lg:p-8 gap-6 relative">
        {/* Subtle Ambient Radial Glows */}
        <div className="fixed inset-0 pointer-events-none -z-10 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-100/20 dark:from-indigo-900/15 via-transparent to-transparent" />
        <div className="fixed inset-0 pointer-events-none -z-10 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-fuchsia-100/20 dark:from-fuchsia-900/15 via-transparent to-transparent" />

        {/* Hero Section */}
        <motion.div variants={scaleIn} className="relative w-full rounded-[2.5rem] bg-[#050810] overflow-hidden shadow-2xl shadow-indigo-950/20 min-h-[320px] flex items-center group border border-indigo-950/40">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-950/80 via-[#050810] to-[#050810]" />
          <motion.div animate={{ scale: [1, 1.2, 1], x: [0, 50, 0], y: [0, 30, 0], opacity: [0.3, 0.5, 0.3] }} transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }} className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/4 pointer-events-none mix-blend-screen will-change-transform" />
          <motion.div animate={{ scale: [1, 1.5, 1], x: [0, -40, 0], y: [0, -30, 0], opacity: [0.2, 0.4, 0.2] }} transition={{ duration: 18, repeat: Infinity, ease: "easeInOut", delay: 2 }} className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-fuchsia-600/20 rounded-full blur-[100px] translate-y-1/3 -translate-x-1/4 pointer-events-none mix-blend-screen will-change-transform" />
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-overlay pointer-events-none"></div>

          <div className="relative z-10 w-full px-10 lg:px-16 flex items-center justify-between gap-10">
            <div className="max-w-3xl">
              <motion.div whileHover={{ scale: 1.05 }} className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/5 backdrop-blur-xl rounded-full text-xs font-bold tracking-widest uppercase text-indigo-300 mb-6 border border-white/10 cursor-default">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                Thrive With Change
              </motion.div>
              <h1 className="text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.15]">
                Welcome back,<br />
                <span className="bg-gradient-to-r from-indigo-300 via-purple-300 to-fuchsia-300 bg-clip-text text-transparent">
                  {user?.name || 'Sarthak'}
                </span>
              </h1>
              <p className="mt-5 text-lg text-slate-300/80 leading-relaxed max-w-xl font-medium">
                Transform complex Teams discussions into structured architectural logic, release plans, and clear technical documentation in seconds.
              </p>
            </div>
            <div className="hidden lg:flex relative w-64 h-64 items-center justify-center">
              <div className="absolute inset-0 border-[0.5px] border-indigo-500/20 rounded-full animate-[spin_20s_linear_infinite]" />
              <div className="absolute inset-6 border-[0.5px] border-fuchsia-500/20 rounded-full animate-[spin_30s_linear_infinite_reverse]" />
              <div className="absolute inset-12 border-[0.5px] border-purple-500/20 rounded-full animate-[spin_40s_linear_infinite]" />
              <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/10 to-fuchsia-500/10 rounded-full blur-2xl animate-pulse" />
              <div className="relative w-20 h-20 glass-panel rounded-full border border-white/10 flex items-center justify-center shadow-2xl">
                <Activity className="w-8 h-8 text-indigo-300" />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Universal Search Bar (Desktop) */}
        <motion.div variants={fadeUpBlur} className="relative z-30 flex justify-center -mt-10 mb-8 w-full max-w-3xl mx-auto px-4">
          <div className="w-full relative group">
            <div className="absolute -inset-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-fuchsia-500 rounded-[2rem] blur-lg opacity-25 group-hover:opacity-60 transition duration-500 group-hover:delay-0 pointer-events-none"></div>
            <div className="relative bg-white/90 dark:bg-[#121824]/90 backdrop-blur-2xl border border-white dark:border-slate-800 shadow-2xl shadow-indigo-900/10 dark:shadow-black/60 rounded-[1.5rem] p-2 transition-all duration-300 group-hover:bg-white dark:group-hover:bg-[#161F30] flex items-center">
              <div className="w-full px-2">
                <SearchBar />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Bento Dashboard */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Upload Dropzone */}
          <motion.div variants={fadeUpBlur} className="lg:col-span-2 group cursor-pointer" onClick={() => navigate(uploadPath)}>
            <div className="relative h-full overflow-hidden rounded-[2rem] bg-white dark:bg-[#121824] border border-slate-200/80 dark:border-slate-800/80 p-10 flex flex-col justify-center transition-all duration-500 hover:delay-0 hover:shadow-2xl hover:shadow-indigo-900/5 dark:hover:shadow-indigo-500/10 hover:border-indigo-300/50 dark:hover:border-indigo-500/40">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-fuchsia-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500 group-hover:delay-0" />
              <div className="flex items-center gap-10 relative z-10">
                <div className="relative shrink-0">
                  <div className="absolute inset-0 bg-indigo-200 dark:bg-indigo-600/30 rounded-full blur-xl opacity-0 group-hover:opacity-60 transition-opacity duration-500 group-hover:delay-0" />
                  <div className="w-24 h-24 rounded-[2rem] bg-gradient-to-br from-indigo-50 dark:from-indigo-950/60 to-slate-50 dark:to-[#1A2333] border border-slate-200 dark:border-slate-700/80 flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 ease-out group-hover:delay-0 relative z-10 shadow-sm group-hover:shadow-xl">
                    <UploadCloud className="w-10 h-10 text-indigo-600 dark:text-indigo-400 group-hover:-translate-y-1 transition-transform duration-300 group-hover:delay-0" />
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-3xl font-extrabold text-slate-800 dark:text-slate-100 mb-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors group-hover:delay-0">Process New Transcript</h3>
                  <p className="text-base text-slate-500 dark:text-slate-400 max-w-md mb-6 font-medium">Drag & drop your <span className="font-semibold text-slate-700 dark:text-slate-200">.vtt, .docx,</span> or <span className="font-semibold text-slate-700 dark:text-slate-200">.txt</span> file to instantly generate intelligence.</p>
                  <div className="inline-flex items-center gap-2 px-6 py-2.5 bg-slate-900 dark:bg-slate-100 dark:text-slate-900 text-white rounded-xl font-bold shadow-lg shadow-slate-900/20 dark:shadow-black/40 group-hover:bg-indigo-600 dark:group-hover:bg-indigo-500 dark:group-hover:text-white transition-all duration-300 group-hover:delay-0">
                    Select File <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform group-hover:delay-0" />
                  </div>
                </div>
                <div className="hidden xl:flex items-end gap-1.5 h-16 opacity-30 group-hover:opacity-100 transition-opacity duration-500 group-hover:delay-0">
                  {TRANSCRIPT_LINES.map((h, i) => (
                    <div key={i} className="w-1.5 bg-indigo-500 dark:bg-indigo-400 rounded-full transition-all duration-300 group-hover:animate-pulse" style={{ height: `${h}%`, transitionDelay: `${i * 40}ms` }} />
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Registry Stack */}
          <motion.div variants={fadeUpBlur} className="flex flex-col gap-4">
            {categories.map((block, idx) => {
              const Icon = block.icon;
              const theme = themeStyles[block.theme];
              return (
                <div key={idx} onClick={() => navigate(block.path)} className={`group flex-1 bg-white dark:bg-[#121824] rounded-[1.5rem] border border-slate-200/80 dark:border-slate-800/80 p-5 flex items-center gap-5 cursor-pointer transition-all duration-300 hover:delay-0 hover:shadow-xl hover:shadow-${block.theme}-900/5 dark:hover:shadow-black/50 ${theme.border}`}>
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${theme.gradient} flex items-center justify-center shadow-lg shadow-${block.theme}-500/20 group-hover:scale-105 transition-transform duration-300 group-hover:delay-0`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-lg font-bold text-slate-800 dark:text-slate-100 group-hover:text-slate-900 dark:group-hover:text-white transition-colors group-hover:delay-0">{block.title}</h4>
                    <p className="text-sm font-semibold text-slate-400 dark:text-slate-500 mt-0.5">{block.data.length} Newly Added</p>
                  </div>
                  <div className={`w-10 h-10 rounded-full ${theme.bg} flex items-center justify-center ${theme.text} opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 group-hover:delay-0`}>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              );
            })}
          </motion.div>
        </div>

        {/* Recent Transcripts List */}
        <motion.div variants={fadeUpBlur} className="bg-white dark:bg-[#121824] rounded-[2rem] border border-slate-200/80 dark:border-slate-800/80 p-8 shadow-xl shadow-slate-200/30 dark:shadow-black/40 flex-1 flex flex-col">
          <div className="flex items-end justify-between gap-6 mb-8">
            <div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-widest mb-1">Workspace</h3>
              <h2 className="text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">Recent Transcripts</h2>
            </div>
          </div>

          <div className="flex-1 relative">
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => <div key={i} className="h-20 bg-slate-50 dark:bg-[#1A2333] rounded-2xl animate-pulse" />)}
              </div>
            ) : meetings.length === 0 ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#F8FAFC]/50 dark:bg-[#1A2333]/30 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800">
                <div className="w-16 h-16 bg-white dark:bg-[#121824] rounded-full flex items-center justify-center shadow-sm border border-slate-100 dark:border-slate-800 mb-4">
                  <Inbox className="w-6 h-6 text-slate-300 dark:text-slate-600" />
                </div>
                <p className="text-slate-800 dark:text-slate-200 font-bold text-lg">No intelligence found</p>
                <p className="text-slate-500 dark:text-slate-400 font-medium text-sm mt-1">Upload a transcript to get started</p>
              </div>
            ) : (
              <div className="grid gap-3" ref={listRef}>
                {meetings.map((meeting) => (
                  <div key={meeting.id} onClick={() => navigate(`/meetings/${meeting.id}`)} className="group relative flex items-center justify-between gap-6 p-4 pr-6 bg-white dark:bg-[#161F30]/70 border border-slate-200/80 dark:border-slate-800/80 rounded-[1.5rem] hover:border-indigo-300 dark:hover:border-indigo-500/50 hover:shadow-xl hover:shadow-indigo-900/5 dark:hover:shadow-black/50 hover:-translate-y-[2px] cursor-pointer transition-all duration-300 hover:delay-0">
                    <div className="flex items-center gap-5 flex-1 min-w-0">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 border transition-colors group-hover:delay-0 ${meeting.status === 'processing' ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800/60 text-amber-500 dark:text-amber-400' : 'bg-slate-50 dark:bg-[#1A2333] border-slate-200 dark:border-slate-700/80 text-slate-400 dark:text-slate-400 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-950/60 group-hover:text-indigo-500 dark:group-hover:text-indigo-400 group-hover:border-indigo-200 dark:group-hover:border-indigo-700/60'}`}>
                        {meeting.status === 'processing' ? <Activity className="w-5 h-5 animate-pulse" /> : <Play className="w-5 h-5 ml-0.5" />}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="font-bold text-slate-800 dark:text-slate-100 text-base mb-1.5 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors group-hover:delay-0 truncate">{meeting.title}</h4>
                        <div className="flex items-center flex-wrap gap-2 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                          <span className="px-2.5 py-1 bg-[#F8FAFC] dark:bg-[#1A2333] border border-slate-100 dark:border-slate-800 rounded-lg">{meeting.adapter}</span>
                          <ChevronRight className="w-3 h-3 text-slate-300 dark:text-slate-600" />
                          <span className="px-2.5 py-1 bg-[#F8FAFC] dark:bg-[#1A2333] border border-slate-100 dark:border-slate-800 rounded-lg">{meeting.release}</span>
                          <ChevronRight className="w-3 h-3 text-slate-300 dark:text-slate-600" />
                          <span className="px-2.5 py-1 bg-[#F8FAFC] dark:bg-[#1A2333] border border-slate-100 dark:border-slate-800 rounded-lg">{meeting.enhancement}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-8 shrink-0">
                      <div className="hidden xl:flex flex-col items-end gap-1.5">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 text-[11px] font-bold uppercase tracking-wider rounded-full border ${meeting.status === 'processing' ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800/60' : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/60'}`}>
                          <span className="relative flex h-1.5 w-1.5">
                            {meeting.status === 'processing' && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>}
                            <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${meeting.status === 'processing' ? 'bg-amber-500' : 'bg-emerald-500'}`}></span>
                          </span>
                          {meeting.status}
                        </span>
                        <div className="flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-400 font-semibold">
                          <CalendarDays className="w-3 h-3" /> {meeting.date}
                        </div>
                      </div>
                      <div className="w-10 h-10 rounded-full bg-slate-50 dark:bg-[#1A2333] border border-slate-200 dark:border-slate-700/80 flex items-center justify-center text-slate-400 dark:text-slate-400 group-hover:bg-indigo-600 group-hover:border-indigo-600 group-hover:text-white transition-all group-hover:delay-0 shadow-sm group-hover:shadow-lg group-hover:shadow-indigo-500/30">
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform group-hover:delay-0" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}