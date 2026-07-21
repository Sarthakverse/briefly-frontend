import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Cpu, Network, Sparkles, Activity, Brain } from 'lucide-react';
import { getMeetingById } from '../meetings/meetingApi';

const PROCESSING_PHASES = [
  { text: "Initializing intelligence engine...", icon: Cpu },
  { text: "Parsing transcript dialogue...", icon: FileText },
  { text: "Extracting structural logic & decisions...", icon: Network },
  { text: "Synthesizing architectural workspace...", icon: Sparkles },
  { text: "Finalizing intelligence report...", icon: Activity },
];

export default function ProcessingPage() {
  const { meetingId } = useParams<{ meetingId: string }>();
  const navigate = useNavigate();
  
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  // 1. Asymptotic Progress Bar Logic
  useEffect(() => {
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        const remaining = 95 - prev;
        const increment = Math.max(remaining * 0.05, 0.1);
        return prev + increment;
      });
    }, 500);
    return () => clearInterval(progressInterval);
  }, []);

  // 2. Intelligent Status Text Cycling
  useEffect(() => {
    const textInterval = setInterval(() => {
      setPhaseIndex((prev) => (prev < PROCESSING_PHASES.length - 1 ? prev + 1 : prev));
    }, 4500);
    return () => clearInterval(textInterval);
  }, []);

  // 3. API Polling for Completion
  useEffect(() => {
    if (!meetingId) return;
    const interval = setInterval(async () => {
      try {
        const meeting = await getMeetingById(meetingId);
        if (meeting.status === 'completed' || meeting.status === 'failed') {
          clearInterval(interval);
          setProgress(100);
          setTimeout(() => {
            navigate(`/meetings/${meetingId}`, { replace: true });
          }, 600);
        }
      } catch (err) {
        console.error('Polling error:', err);
      }
    }, 2500);
    return () => clearInterval(interval);
  }, [meetingId, navigate]);

  const CurrentIcon = PROCESSING_PHASES[phaseIndex].icon;

  return (
    <div className="relative min-h-screen bg-[#0B0F19] flex items-center justify-center p-6 overflow-hidden selection:bg-indigo-200 selection:text-indigo-900 font-sans">
      
      {/* --- Ambient Background matching Home.tsx Hero Section --- */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-950/80 via-[#0B0F19] to-fuchsia-950/30" />
        
        {/* Animated Ambient Orbs */}
        <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }} transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }} className="absolute top-1/4 right-1/4 w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[100px] mix-blend-screen will-change-transform" />
        <motion.div animate={{ scale: [1, 1.5, 1], opacity: [0.2, 0.4, 0.2] }} transition={{ duration: 18, repeat: Infinity, ease: "easeInOut", delay: 2 }} className="absolute bottom-1/4 left-1/4 w-[400px] h-[400px] bg-fuchsia-600/20 rounded-full blur-[100px] mix-blend-screen will-change-transform" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.04] mix-blend-overlay pointer-events-none"></div>
      </div>

      {/* --- Immersive SVG Branching/Vein Background --- */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <svg className="w-full h-full opacity-30" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="vein-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#818cf8" stopOpacity="0.1" />  {/* Indigo-400 */}
              <stop offset="50%" stopColor="#e879f9" stopOpacity="0.6" /> {/* Fuchsia-400 */}
              <stop offset="100%" stopColor="#818cf8" stopOpacity="0.1" /> 
            </linearGradient>
          </defs>
          
          {/* Animated Branching Paths */}
          {[
            "M-100,-100 C200,300 300,500 50%,50%",
            "M1200,-100 C900,200 700,500 50%,50%",
            "M-100,1200 C300,900 400,600 50%,50%",
            "M1200,1200 C800,800 600,600 50%,50%",
            "M50%,-100 C50%,300 50%,400 50%,50%",
          ].map((path, i) => (
            <motion.path
              key={i}
              d={path}
              stroke="url(#vein-grad)"
              strokeWidth="2"
              fill="none"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{
                duration: 4 + i,
                repeat: Infinity,
                repeatType: "reverse",
                ease: "easeInOut"
              }}
            />
          ))}
        </svg>
      </div>

      {/* --- Main Premium Glassmorphism Card --- */}
      <motion.div 
        initial={{ opacity: 0, y: 30, scale: 0.95, filter: 'blur(10px)' }}
        animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
        transition={{ type: "spring", duration: 1.2, bounce: 0 }}
        className="relative z-10 w-full max-w-lg bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] p-12 shadow-2xl shadow-indigo-900/30 flex flex-col items-center text-center"
      >
        {/* Intelligence Workspace Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 backdrop-blur-xl rounded-full text-[10px] font-bold tracking-widest uppercase text-indigo-200 mb-10 border border-white/10">
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
          Intelligence Engine
        </div>
        
        {/* Branching Core Visualizer */}
        <div className="relative w-64 h-64 flex items-center justify-center mb-10">
          {/* Pulsing Core Ambient Light */}
          <motion.div 
            animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }} 
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="absolute w-28 h-28 bg-gradient-to-r from-indigo-500 to-fuchsia-500 rounded-full blur-2xl" 
          />
          
          {/* Orbital Rings */}
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 15, repeat: Infinity, ease: "linear" }} className="absolute inset-0 border border-indigo-500/30 rounded-full border-t-indigo-400 border-r-transparent" />
          <motion.div animate={{ rotate: -360 }} transition={{ duration: 25, repeat: Infinity, ease: "linear" }} className="absolute inset-6 border border-fuchsia-500/20 rounded-full border-b-fuchsia-400 border-l-transparent" />
          <div className="absolute inset-12 border-[0.5px] border-purple-500/20 rounded-full animate-[spin_40s_linear_infinite]" />
          
          {/* Central AI Icon */}
          <motion.div 
            className="relative z-10 w-24 h-24 rounded-full bg-white/5 border border-white/10 flex items-center justify-center backdrop-blur-md shadow-2xl"
            animate={{ opacity: [0.8, 1, 0.8], scale: [0.98, 1.02, 0.98] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          >
            <Brain size={42} strokeWidth={1.5} className="text-indigo-300 drop-shadow-[0_0_15px_rgba(165,180,252,0.6)]" />
          </motion.div>

          {/* Horizontal "Vein" Pulse */}
          <motion.div
            className="absolute top-1/2 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-purple-400 to-transparent shadow-[0_0_15px_3px_rgba(192,132,252,0.5)]"
            animate={{ opacity: [0, 1, 0], scaleX: [0.5, 1.5, 0.5] }}
            transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
          />
        </div>

        {/* Dynamic Status Display */}
        <div className="h-20 flex flex-col items-center justify-center mb-8 w-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={phaseIndex}
              initial={{ opacity: 0, y: 15, filter: 'blur(5px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -15, filter: 'blur(5px)' }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="flex flex-col items-center"
            >
              <div className="flex items-center gap-2 mb-3">
                <CurrentIcon className="w-4 h-4 text-indigo-400" />
                <span className="text-[11px] font-bold tracking-[0.2em] uppercase text-indigo-300">Phase {phaseIndex + 1}</span>
              </div>
              <h2 className="text-2xl font-extrabold text-white tracking-tight px-4 leading-tight">
                {PROCESSING_PHASES[phaseIndex].text}
              </h2>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Progress Bar Container */}
        <div className="w-full space-y-3 bg-white/5 p-5 rounded-2xl border border-white/10 backdrop-blur-sm">
          <div className="flex justify-between text-sm font-semibold text-slate-300">
            <span>Synthesizing logic</span>
            <span className="tabular-nums bg-gradient-to-r from-indigo-300 via-purple-300 to-fuchsia-300 bg-clip-text text-transparent font-bold">
              {Math.round(progress)}%
            </span>
          </div>
          <div className="h-2 w-full bg-slate-900/50 rounded-full overflow-hidden shadow-inner border border-white/5">
            <motion.div 
              className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-fuchsia-500 rounded-full relative"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ ease: "easeOut", duration: 0.5 }}
            >
              {/* Highlight flare on the progress bar */}
              <motion.div 
                animate={{ x: ['-100%', '300%'] }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="absolute top-0 bottom-0 left-0 w-24 bg-gradient-to-r from-transparent via-white/50 to-transparent skew-x-12"
              />
            </motion.div>
          </div>
        </div>

        {/* Subtitle */}
        <p className="mt-8 text-[11px] text-slate-400/80 font-bold tracking-[0.15em] uppercase">
          Finalizing complexity. Do not close this engine.
        </p>

      </motion.div>
    </div>
  );
}