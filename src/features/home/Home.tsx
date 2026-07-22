import { useNavigate } from 'react-router-dom';
import {
  UploadCloud,
  Search,
  Sparkles,
  Box,
  Layers,
  Zap,
  ChevronRight,
  ArrowRight,
  CalendarDays,
  Inbox,
  Play,
  Command,
  Activity
} from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';
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

// --- Sophisticated Animation Variants ---
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
  const { user } = useAuth();
  const [listRef] = useAutoAnimate({ duration: 300, easing: 'ease-in-out' });
  const [mobileListRef] = useAutoAnimate({ duration: 300 });

  const [search, setSearch] = useState('');
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
  }, []);

  const filtered = useMemo(() => {
    return meetings.filter(
      (m) =>
        m.title.toLowerCase().includes(search.toLowerCase()) ||
        m.adapter.toLowerCase().includes(search.toLowerCase()) ||
        m.release.toLowerCase().includes(search.toLowerCase())
    );
  }, [meetings, search]);

    const categories = [
    { title: 'Recent Adapters', icon: Box, data: recentAdapters, path: '/adapters', theme: 'indigo' },
    { title: 'Recent Releases', icon: Layers, data: recentReleases, path: '/releases/recent', theme: 'fuchsia' },
    { title: 'Recent Enhancements', icon: Zap, data: recentEnhancements, path: '/enhancements/recent', theme: 'amber' },
  ];

  // Theme map for bento box dynamic styling
  const themeStyles: Record<string, { bg: string; text: string; gradient: string; border: string }> = {
    indigo: { bg: 'bg-indigo-50/50', text: 'text-indigo-600', gradient: 'from-indigo-500 to-blue-600', border: 'group-hover:border-indigo-200' },
    fuchsia: { bg: 'bg-fuchsia-50/50', text: 'text-fuchsia-600', gradient: 'from-fuchsia-500 to-pink-600', border: 'group-hover:border-fuchsia-200' },
    amber: { bg: 'bg-amber-50/50', text: 'text-amber-600', gradient: 'from-amber-400 to-orange-500', border: 'group-hover:border-amber-200' },
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] selection:bg-indigo-200 selection:text-indigo-900 font-sans">
      <style>{`
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .glass-panel { background: rgba(255, 255, 255, 0.7); backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px); }
      `}</style>

      {/* =========================================
          MOBILE UI (App-like, Immersive & Edge-to-Edge)
          ========================================= */}
      <motion.div variants={staggerContainer} initial="hidden" animate="show" className="md:hidden relative pb-24">
        {/* Dark Immersive Header */}
        <div className="relative w-full bg-[#0B0F19] rounded-b-[2.5rem] overflow-hidden shadow-2xl shadow-indigo-900/10 pt-10 pb-24 px-6 z-10">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-950/80 via-[#0B0F19] to-fuchsia-950/30" />
          
          {/* Animated Ambient Orbs */}
          <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }} transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }} className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/30 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/3 mix-blend-screen will-change-transform" />
          <motion.div animate={{ scale: [1, 1.3, 1], opacity: [0.2, 0.4, 0.2] }} transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }} className="absolute bottom-0 left-0 w-56 h-56 bg-fuchsia-600/20 rounded-full blur-[70px] translate-y-1/4 -translate-x-1/4 mix-blend-screen will-change-transform" />
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 mix-blend-overlay"></div>

          <motion.div variants={fadeUpBlur} className="relative z-20 pt-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-[10px] font-bold tracking-widest uppercase text-indigo-200 mb-4 border border-white/5">
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
            onClick={() => navigate('/upload')}
            className="bg-white/80 backdrop-blur-xl rounded-[2rem] p-5 shadow-xl shadow-slate-200/50 border border-white flex items-center gap-4 active:scale-[0.98] transition-transform duration-300 cursor-pointer"
          >
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-fuchsia-600 text-white flex items-center justify-center shadow-lg shadow-indigo-200/50 shrink-0 relative overflow-hidden">
              <div className="absolute inset-0 bg-white/20 animate-pulse rounded-2xl" />
              <UploadCloud className="w-6 h-6 relative z-10" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-slate-800 text-base leading-tight">Process New Meeting</h3>
              <p className="text-xs text-slate-500 font-medium mt-1">.vtt, .docx, .txt supported</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 shrink-0">
              <ArrowRight className="w-5 h-5" />
            </div>
          </div>
        </motion.div>

        {/* Mobile Horizontal Registry */}
        <motion.div variants={fadeUpBlur} className="mt-8">
          <div className="px-6 mb-4 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Registries</h3>
            <span onClick={() => navigate('/adapters')} className="text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full active:bg-indigo-100">View All</span>
          </div>
          <div className="flex overflow-x-auto hide-scrollbar gap-4 px-6 pb-6 snap-x -mx-2">
            {categories.map((cat, idx) => {
              const Icon = cat.icon;
              const theme = themeStyles[cat.theme];
              return (
                <div key={idx} onClick={() => navigate(cat.path)} className="snap-start shrink-0 w-[140px] bg-white rounded-3xl p-5 shadow-lg shadow-slate-200/30 border border-slate-100/60 active:scale-95 transition-all">
                  <div className={`w-10 h-10 rounded-2xl bg-gradient-to-br ${theme.gradient} text-white flex items-center justify-center shadow-md mb-4`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <h4 className="font-bold text-slate-800 text-sm">{cat.title}</h4>
                  <p className="text-xs font-semibold text-slate-400 mt-0.5">{cat.data.length} items</p>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Mobile Recent List */}
        <motion.div variants={fadeUpBlur} className="px-5 mt-2">
          <div className="bg-white rounded-[2rem] p-5 shadow-lg shadow-slate-200/40 border border-slate-100/60">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4">Recent Transcripts</h3>
            
            <div className="relative mb-5 group">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search transcripts..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-[#F8FAFC] border-none rounded-2xl text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
              />
            </div>

            <div className="space-y-1" ref={mobileListRef}>
              {loading ? (
                [1, 2, 3].map((i) => <div key={i} className="h-16 bg-slate-50 rounded-2xl animate-pulse mb-2" />)
              ) : filtered.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Activity className="w-5 h-5 text-slate-300" />
                  </div>
                  <p className="text-sm font-semibold text-slate-500">No meetings found</p>
                </div>
              ) : (
                filtered.map((meeting) => (
                  <div key={meeting.id} onClick={() => navigate(`/meetings/${meeting.id}`)} className="flex items-center gap-3 p-3 rounded-2xl active:bg-slate-50 transition-colors">
                    <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center shrink-0 border border-indigo-100/50">
                      <Play className="w-4 h-4 text-indigo-500 ml-0.5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-slate-800 text-sm truncate">{meeting.title}</h4>
                      <p className="text-[11px] font-semibold text-slate-400 mt-0.5 truncate">
                        {meeting.adapter} <span className="mx-1 opacity-50">•</span> {meeting.release}
                      </p>
                    </div>
                    {meeting.status === 'processing' ? (
                      <span className="flex h-2 w-2 relative shrink-0 mr-1">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                      </span>
                    ) : (
                      <ChevronRight className="w-4 h-4 text-slate-300 shrink-0" />
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>


      {/* =========================================
          DESKTOP UI (Premium Bento Layout)
          ========================================= */}
      <motion.div variants={staggerContainer} initial="hidden" animate="show" className="hidden md:flex flex-col max-w-[1400px] mx-auto min-h-screen p-6 lg:p-8 gap-6 relative">
        
        {/* Subtle Ambient Background */}
        <div className="fixed inset-0 pointer-events-none -z-10 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-100/20 via-transparent to-transparent" />
        <div className="fixed inset-0 pointer-events-none -z-10 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-fuchsia-100/20 via-transparent to-transparent" />

        {/* 1. HERO SECTION */}
        <motion.div variants={scaleIn} className="relative w-full rounded-[2rem] bg-[#0B0F19] overflow-hidden shadow-2xl shadow-indigo-900/10 min-h-[320px] flex items-center group">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-950/60 via-[#0B0F19] to-[#0B0F19]" />
          
          {/* Advanced Animated Orbs */}
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
            
            {/* Abstract Decorative Element */}
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

        {/* 2. BENTO DASHBOARD */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Upload Dropzone (Span 2) */}
          <motion.div variants={fadeUpBlur} className="lg:col-span-2 group cursor-pointer" onClick={() => navigate('/upload')}>
            <div className="relative h-full overflow-hidden rounded-[2rem] bg-white border border-slate-200/60 p-10 flex flex-col justify-center transition-all duration-500 hover:shadow-2xl hover:shadow-indigo-900/5 hover:border-indigo-300/50">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-fuchsia-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              <div className="flex items-center gap-10 relative z-10">
                <div className="relative shrink-0">
                  <div className="absolute inset-0 bg-indigo-200 rounded-full blur-xl opacity-0 group-hover:opacity-60 transition-opacity duration-500" />
                  <div className="w-24 h-24 rounded-[2rem] bg-gradient-to-br from-indigo-50 to-slate-50 border border-slate-200 flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 ease-out relative z-10 shadow-sm group-hover:shadow-xl">
                    <UploadCloud className="w-10 h-10 text-indigo-600 group-hover:-translate-y-1 transition-transform duration-300" />
                  </div>
                </div>
                
                <div className="flex-1">
                  <h3 className="text-3xl font-extrabold text-slate-800 mb-2 group-hover:text-indigo-600 transition-colors">Process New Transcript</h3>
                  <p className="text-base text-slate-500 max-w-md mb-6 font-medium">Drag & drop your <span className="font-semibold text-slate-700">.vtt, .docx,</span> or <span className="font-semibold text-slate-700">.txt</span> file to instantly generate intelligence.</p>
                  
                  <div className="inline-flex items-center gap-2 px-6 py-2.5 bg-slate-900 text-white rounded-xl font-bold shadow-lg shadow-slate-900/20 group-hover:bg-indigo-600 transition-all duration-300">
                    Select File <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>

                {/* Decorative Audio Bars */}
                <div className="hidden xl:flex items-end gap-1.5 h-16 opacity-30 group-hover:opacity-100 transition-opacity duration-500">
                  {TRANSCRIPT_LINES.map((h, i) => (
                    <div key={i} className="w-1.5 bg-indigo-500 rounded-full transition-all duration-300 group-hover:animate-pulse" style={{ height: `${h}%`, transitionDelay: `${i * 40}ms` }} />
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Registry Stack (Span 1) */}
          <motion.div variants={fadeUpBlur} className="flex flex-col gap-4">
            {categories.map((block, idx) => {
              const Icon = block.icon;
              const theme = themeStyles[block.theme];
              return (
                <div key={idx} onClick={() => navigate(block.path)} className={`group flex-1 bg-white rounded-[1.5rem] border border-slate-200/60 p-5 flex items-center gap-5 cursor-pointer transition-all duration-300 hover:shadow-xl hover:shadow-${block.theme}-900/5 ${theme.border}`}>
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${theme.gradient} flex items-center justify-center shadow-lg shadow-${block.theme}-500/20 group-hover:scale-105 transition-transform duration-300`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-lg font-bold text-slate-800 group-hover:text-slate-900">{block.title}</h4>
                    <p className="text-sm font-semibold text-slate-400 mt-0.5">{block.data.length} Newly Added</p>
                  </div>
                  <div className={`w-10 h-10 rounded-full ${theme.bg} flex items-center justify-center ${theme.text} opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300`}>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              );
            })}
          </motion.div>
        </div>

        {/* 3. RECENT INTELLIGENCE LIST */}
        <motion.div variants={fadeUpBlur} className="bg-white rounded-[2rem] border border-slate-200/60 p-8 shadow-xl shadow-slate-200/30 flex-1 flex flex-col">
          <div className="flex items-end justify-between gap-6 mb-8">
            <div>
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest mb-1">Workspace</h3>
              <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Recent Transcripts</h2>
            </div>
            
            {/* Search Input */}
            <div className="relative w-80 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
              <input 
                type="text" 
                placeholder="Search processed transcripts..." 
                value={search} 
                onChange={(e) => setSearch(e.target.value)} 
                className="w-full pl-12 pr-14 py-3 bg-[#F8FAFC] border border-slate-200 rounded-2xl text-sm font-medium placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white focus:border-indigo-300 transition-all" 
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center">
                <kbd className="inline-flex items-center gap-1 px-2 py-1 bg-white border border-slate-200 rounded-lg text-[10px] font-bold text-slate-400 shadow-sm">
                  <Command className="w-3 h-3" /> K
                </kbd>
              </div>
            </div>
          </div>

          <div className="flex-1 relative">
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => <div key={i} className="h-20 bg-slate-50 rounded-2xl animate-pulse" />)}
              </div>
            ) : filtered.length === 0 ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#F8FAFC]/50 rounded-2xl border-2 border-dashed border-slate-200">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm border border-slate-100 mb-4">
                  <Search className="w-6 h-6 text-slate-300" />
                </div>
                <p className="text-slate-800 font-bold text-lg">No intelligence found</p>
                <p className="text-slate-500 font-medium text-sm mt-1">Try adjusting your search criteria</p>
              </div>
            ) : (
              <div className="grid gap-3" ref={listRef}>
                {filtered.map((meeting) => (
                  <div key={meeting.id} onClick={() => navigate(`/meetings/${meeting.id}`)} className="group relative flex items-center justify-between gap-6 p-4 pr-6 bg-white border border-slate-200 rounded-[1.5rem] hover:border-indigo-300 hover:shadow-xl hover:shadow-indigo-900/5 hover:-translate-y-[2px] cursor-pointer transition-all duration-300">
                    
                    <div className="flex items-center gap-5 flex-1 min-w-0">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 border transition-colors ${meeting.status === 'processing' ? 'bg-amber-50 border-amber-200 text-amber-500' : 'bg-slate-50 border-slate-200 text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-500 group-hover:border-indigo-200'}`}>
                        {meeting.status === 'processing' ? <Activity className="w-5 h-5 animate-pulse" /> : <Play className="w-5 h-5 ml-0.5" />}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="font-bold text-slate-800 text-base mb-1.5 group-hover:text-indigo-600 transition-colors truncate">{meeting.title}</h4>
                        <div className="flex items-center flex-wrap gap-2 text-[11px] font-bold text-slate-500 uppercase tracking-wide">
                          <span className="px-2.5 py-1 bg-[#F8FAFC] border border-slate-100 rounded-lg">{meeting.adapter}</span>
                          <ChevronRight className="w-3 h-3 text-slate-300" />
                          <span className="px-2.5 py-1 bg-[#F8FAFC] border border-slate-100 rounded-lg">{meeting.release}</span>
                          <ChevronRight className="w-3 h-3 text-slate-300" />
                          <span className="px-2.5 py-1 bg-[#F8FAFC] border border-slate-100 rounded-lg">{meeting.enhancement}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-8 shrink-0">
                      <div className="hidden xl:flex flex-col items-end gap-1.5">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 text-[11px] font-bold uppercase tracking-wider rounded-full border ${meeting.status === 'processing' ? 'bg-amber-50 text-amber-600 border-amber-200' : 'bg-emerald-50 text-emerald-600 border-emerald-200'}`}>
                          <span className="relative flex h-1.5 w-1.5">
                            {meeting.status === 'processing' && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>}
                            <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${meeting.status === 'processing' ? 'bg-amber-500' : 'bg-emerald-500'}`}></span>
                          </span>
                          {meeting.status}
                        </span>
                        <div className="flex items-center gap-1.5 text-xs text-slate-400 font-semibold">
                          <CalendarDays className="w-3 h-3" /> {meeting.date}
                        </div>
                      </div>
                      
                      <div className="w-10 h-10 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-400 group-hover:bg-indigo-600 group-hover:border-indigo-600 group-hover:text-white transition-all duration-300 shadow-sm">
                        <ArrowRight className="w-4 h-4" />
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