import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import mermaid from 'mermaid';
import { getMeetingById } from './meetingApi';
import type { MeetingDetail } from './meetingApi';
import { 
  Download, FileText, Target, Users, MessageSquare, 
  Settings, CheckCircle, AlertTriangle, ArrowRight,
  User, CheckSquare, Zap, Network, Layout, Briefcase, Activity
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { PieChart, Pie, Cell, Tooltip as RechartsTooltip, Legend, ResponsiveContainer } from 'recharts';

mermaid.initialize({ 
  startOnLoad: false, 
  theme: 'base', 
  themeVariables: {
    fontFamily: 'Inter, sans-serif',
    primaryColor: '#eef2ff',
    primaryTextColor: '#1e293b',
    primaryBorderColor: '#c7d2fe',
    lineColor: '#94a3b8',
    secondaryColor: '#f8fafc',
    tertiaryColor: '#fff'
  }, 
  flowchart: {
    curve: 'basis' // Makes connecting lines smoother
  },
  securityLevel: 'loose' 
});

// ---------- Helper Types ----------
interface DetailedSummary {
  objective?: string;
  attendeesDetails?: string;
  discussionTopics?: { topic: string; discussion: string; status: string }[];
  technicalDetails?: string;
  decisionsMade?: string[];
  actionItems?: { owner: string; task: string; deadline: string; status: string; notes?: string }[];
  blockersAndRisks?: { description: string; raisedBy: string; owner: string; mitigation: string }[];
  openQuestions?: string[];
  nextSteps?: string;
  conclusion?: string;
}

interface SpeakerSummary {
  name: string;
  role: string;
  labelIsGeneric: boolean;
  mainContributions: string;
  opinionsPositions: string;
  decisionsInfluenced: string;
  actionItemsOwned: string[];
  notablePoints: string;
}

function parseDetailedSummary(json: string | undefined): DetailedSummary | null {
  if (!json) return null;
  try { return JSON.parse(json) as DetailedSummary; } catch { return null; }
}

function parseSpeakerSummary(json: string | undefined): SpeakerSummary[] {
  if (!json) return [];
  try { return JSON.parse(json) as SpeakerSummary[]; } catch { return []; }
}

function sanitizeMermaid(code: string): string {
  return code.replace(/\[(?!")([^\]]*?)\]/g, (match, label) => {
    if (/[&()<>{},;:#%]/.test(label)) {
      const escaped = label.replace(/"/g, '\\"');
      return `["${escaped}"]`;
    }
    return match;
  });
}

// ---------- Beautiful Recharts Donut Component (ENHANCED) ----------
const SpeakerPieChart = ({ mermaidString, totalSpeakers }: { mermaidString?: string, totalSpeakers: number }) => {
  const data = useMemo(() => {
    if (!mermaidString) return [];
    const regex = /"([^"]+)"\s*:\s*([\d.]+)/g;
    let match;
    const res = [];
    while ((match = regex.exec(mermaidString)) !== null) {
      res.push({ name: match[1], value: parseFloat(match[2]) });
    }
    return res;
  }, [mermaidString]);

  const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#14b8a6', '#f59e0b', '#10b981'];

  if (!data.length) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-slate-400 italic space-y-3">
        <p className="font-medium">No contribution data available</p>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full min-h-[400px]">
      {/* Center Text Overlay */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-10 pr-[30%]">
        <span className="text-4xl font-extrabold text-slate-800 tracking-tight">{totalSpeakers}</span>
        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-1">Speakers</span>
      </div>

      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="35%" // Shifted left to make room for the legend on the right
            cy="50%"
            innerRadius={90}
            outerRadius={130} // Scaled down so it isn't screaming in your face
            paddingAngle={4}
            dataKey="value"
            stroke="none"
            animationBegin={0}
            animationDuration={1200}
            animationEasing="ease-out"
            cornerRadius={6} // Gives the donut slices rounded edges!
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <RechartsTooltip 
            contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
            itemStyle={{ fontWeight: 'bold', color: '#1e293b' }}
            formatter={(value: number) => [`${value}%`, 'Contribution']}
          />
          <Legend 
            layout="vertical" 
            verticalAlign="middle" 
            align="right"
            iconType="circle" 
            iconSize={10}
            wrapperStyle={{ 
              fontSize: '13px', 
              fontWeight: 600, 
              color: '#475569',
              paddingLeft: '20px',
              width: '40%' // Constrain width so it forms a nice tight list
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

// ---------- UI Components ----------
const Badge = ({ status }: { status: string }) => {
  const styles: Record<string, string> = {
    'Decided': 'bg-emerald-50 text-emerald-600 ring-emerald-500/20',
    'Proposed': 'bg-amber-50 text-amber-600 ring-amber-500/20',
    'Rejected': 'bg-rose-50 text-rose-600 ring-rose-500/20',
    'Open': 'bg-sky-50 text-sky-600 ring-sky-500/20',
    'Done': 'bg-emerald-50 text-emerald-600 ring-emerald-500/20',
    'In Progress': 'bg-blue-50 text-blue-600 ring-blue-500/20',
    'Pending': 'bg-slate-50 text-slate-600 ring-slate-500/20'
  };
  
  const appliedStyle = styles[status] || 'bg-slate-50 text-slate-600 ring-slate-500/20';

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold tracking-wide uppercase ring-1 ring-inset ${appliedStyle}`}>
      {status}
    </span>
  );
};

const StatCard = ({ icon: Icon, value, label, colorClass }: { icon: any, value: number, label: string, colorClass: string }) => (
  <div className="bg-white rounded-2xl p-4 ring-1 ring-slate-200 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.05)] flex items-center gap-4 transition-transform hover:-translate-y-1 duration-300">
    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${colorClass}`}>
      <Icon size={18} />
    </div>
    <div>
      <div className="text-xl font-bold text-slate-800 leading-tight">{value}</div>
      <div className="text-xs font-medium text-slate-500">{label}</div>
    </div>
  </div>
);

const SectionCard = ({ id, title, icon: Icon, children }: { id?: string; title: string; icon?: any; children: React.ReactNode }) => (
  <motion.div 
    id={id} // <-- Added ID here
    initial={{ opacity: 0, y: 15 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-white rounded-3xl ring-1 ring-slate-200 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden relative group transition-all duration-300" // <-- Added transition-all duration-300
  >
    <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/0 to-purple-50/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
    <div className="px-6 py-5 border-b border-slate-100/80 flex items-center gap-3 relative bg-white/50 backdrop-blur-sm">
      <div className="w-8 h-8 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 shadow-sm ring-1 ring-indigo-100">
        {Icon && <Icon size={16} />}
      </div>
      <h3 className="text-base font-bold text-slate-800 tracking-tight">{title}</h3>
    </div>
    <div className="p-6 text-slate-600 text-sm leading-relaxed relative">
      {children}
    </div>
  </motion.div>
);

// ---------- Main View ----------
export default function MeetingView() {
  const { meetingId } = useParams<{ meetingId: string }>();
  const [meeting, setMeeting] = useState<MeetingDetail | null>(null);
  const [activeTab, setActiveTab] = useState<'exec' | 'tech' | 'speaker'>('exec');
  const [diagramSvg, setDiagramSvg] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const mermaidContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!meetingId) return;
    getMeetingById(meetingId)
      .then(setMeeting)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [meetingId]);

  const renderMermaid = useCallback(async (code: string | undefined) => {
    if (activeTab === 'speaker') return;

    if (!code) {
      setDiagramSvg('<div class="flex flex-col items-center justify-center h-full text-slate-400 italic space-y-3"><div class="p-4 bg-slate-50 rounded-full ring-1 ring-slate-200"><svg class="w-8 h-8 text-slate-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path></svg></div><p class="font-medium">No diagram mapping available</p></div>');
      return;
    }
    try {
      const sanitized = sanitizeMermaid(code);
      const { svg } = await mermaid.render(`mermaid-${meetingId}-${activeTab}`, sanitized);
      setDiagramSvg(svg);
    } catch (err) {
      console.error('Mermaid render error:', err);
      setDiagramSvg('<div class="flex items-center justify-center h-full"><p class="text-rose-500 font-medium bg-rose-50 px-6 py-4 rounded-2xl ring-1 ring-rose-200 shadow-sm">Failed to render diagram syntax.</p></div>');
    }
  }, [meetingId, activeTab]);

  useEffect(() => {
    if (activeTab === 'exec') renderMermaid(meeting?.execMermaid || undefined);
    else if (activeTab === 'tech') renderMermaid(meeting?.techMermaid || undefined);
  }, [activeTab, meeting, renderMermaid]);

  // ---> NEW SMART CLICK HANDLER ADDED HERE <---
  useEffect(() => {
    const container = mermaidContainerRef.current;
    if (!container) return;
    
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      
      const node = target.closest('.node');
      if (!node) return;

      const text = node.textContent?.toLowerCase() || '';
      const rawId = node.getAttribute('id')?.toLowerCase() || '';

      // Dictionary matching your exact section card IDs
      const sectionMappings = [
        { id: 'meeting-objective', keywords: ['objective', 'goal', 'purpose', 'requirement', 'understand'] },
        { id: 'discussion-topics', keywords: ['discussion', 'topic', 'talk', 'setup', 'details', 'failover', 'wallet', 'current behavior', 'primary region'] },
        { id: 'key-decisions', keywords: ['decision', 'decided', 'conclusion'] },
        { id: 'action-items', keywords: ['action', 'task', 'todo', 'to-do', 'analyze', 'obtain', 'investigate'] },
        { id: 'blockers-and-risks', keywords: ['blocker', 'risk', 'issue', 'problem', 'failure'] }
      ];

      let targetId = null;

      for (const section of sectionMappings) {
        // Find match based on text contents or if Mermaid ID partially matches our section IDs
        if (section.keywords.some(kw => text.includes(kw)) || rawId.includes(section.id.split('-')[0])) {
          targetId = section.id;
          break;
        }
      }

      if (targetId) {
        const element = document.getElementById(targetId);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          
          element.classList.add('ring-4', 'ring-indigo-500', 'shadow-2xl', 'scale-[1.02]', 'z-10');
          
          setTimeout(() => {
            element.classList.remove('ring-4', 'ring-indigo-500', 'shadow-2xl', 'scale-[1.02]', 'z-10');
          }, 1500);
        }
      }
    };

    container.addEventListener('click', handleClick);
    return () => container.removeEventListener('click', handleClick);
  }, [diagramSvg]);

  const detailedSummary = parseDetailedSummary(meeting?.techSummary ?? undefined);
  const speakerSummaries = parseSpeakerSummary(meeting?.speakerSummary ?? undefined);

  // ---------- Renderers ----------
  const renderTechnicalContent = () => {
    if (!detailedSummary) return <div className="text-center py-10 text-slate-500 font-medium">No technical details available</div>;
    return (
      <div className="space-y-6 pb-12">
        {detailedSummary.objective && (
          <SectionCard id="meeting-objective" title="Meeting Objective" icon={Target}>
            <p className="text-slate-700 text-[15px] leading-relaxed">{detailedSummary.objective}</p>
          </SectionCard>
        )}

        {detailedSummary.discussionTopics && detailedSummary.discussionTopics.length > 0 && (
          <SectionCard id="discussion-topics" title="Discussion Topics" icon={MessageSquare}>
            <div className="space-y-6">
              {detailedSummary.discussionTopics.map((topic, i) => (
                <div key={i} className="group relative pl-4 border-l-2 border-slate-100 hover:border-indigo-400 transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2 gap-2">
                    <h4 className="font-bold text-slate-800 text-[15px]">{topic.topic}</h4>
                    <Badge status={topic.status} />
                  </div>
                  <p className="text-slate-600 leading-relaxed">{topic.discussion}</p>
                </div>
              ))}
            </div>
          </SectionCard>
        )}

        {detailedSummary.decisionsMade && detailedSummary.decisionsMade.length > 0 && (
          <SectionCard id="key-decisions" title="Key Decisions" icon={CheckCircle}>
            <ul className="space-y-4">
              {detailedSummary.decisionsMade.map((d, i) => (
                <li key={i} className="flex items-start gap-3 bg-slate-50/50 p-3 rounded-xl ring-1 ring-slate-100">
                  <div className="mt-0.5 shrink-0 w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 shadow-sm">
                    <CheckCircle size={14} />
                  </div>
                  <span className="text-slate-700 font-medium">{d}</span>
                </li>
              ))}
            </ul>
          </SectionCard>
        )}

        {detailedSummary.actionItems && detailedSummary.actionItems.length > 0 && (
          <SectionCard id="action-items" title="Action Items" icon={CheckSquare}>
            <div className="overflow-x-auto rounded-2xl ring-1 ring-slate-200">
              <table className="min-w-full text-sm text-left">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="px-5 py-4">Owner</th>
                    <th className="px-5 py-4">Task</th>
                    <th className="px-5 py-4">Deadline</th>
                    <th className="px-5 py-4 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {detailedSummary.actionItems.map((item, i) => (
                    <tr key={i} className="hover:bg-slate-50 transition-colors group">
                      <td className="px-5 py-4 font-semibold text-indigo-900 whitespace-nowrap flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs">
                          {item.owner.charAt(0).toUpperCase()}
                        </div>
                        {item.owner}
                      </td>
                      <td className="px-5 py-4 text-slate-700 font-medium">{item.task}</td>
                      <td className="px-5 py-4 text-slate-500 whitespace-nowrap">{item.deadline}</td>
                      <td className="px-5 py-4 whitespace-nowrap text-right"><Badge status={item.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </SectionCard>
        )}

        {detailedSummary.blockersAndRisks && detailedSummary.blockersAndRisks.length > 0 && (
          <SectionCard id="blockers-and-risks" title="Blockers & Risks" icon={AlertTriangle}>
            <div className="grid gap-4">
              {detailedSummary.blockersAndRisks.map((b, i) => (
                <div key={i} className="p-5 rounded-2xl bg-gradient-to-br from-rose-50 to-orange-50/30 ring-1 ring-rose-100 flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-white shadow-sm ring-1 ring-rose-100 flex items-center justify-center shrink-0">
                    <AlertTriangle size={18} className="text-rose-500" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 mb-1 text-[15px]">{b.description}</p>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-rose-700/80 font-medium mt-2">
                      <span className="bg-white/60 px-2 py-1 rounded-md">Raised by: <strong className="text-rose-900">{b.raisedBy}</strong></span>
                      <span className="bg-white/60 px-2 py-1 rounded-md">Owner: <strong className="text-rose-900">{b.owner}</strong></span>
                    </div>
                    <div className="mt-3 bg-white/60 p-3 rounded-xl text-sm text-slate-700 ring-1 ring-rose-500/10">
                      <strong className="text-rose-900">Mitigation:</strong> {b.mitigation}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>
        )}
      </div>
    );
  };

  const renderSpeakerContent = () => (
    <div className="grid gap-6 pb-12">
      {speakerSummaries.map((speaker, i) => {
        const hasActionItems = speaker.actionItemsOwned && speaker.actionItemsOwned.length > 0;
        
        return (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05 }}
            className="bg-white rounded-3xl ring-1 ring-slate-200 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-6 md:p-8 relative overflow-hidden"
          >
            {/* Decorative background element */}
            <div className="absolute -right-10 -top-10 w-40 h-40 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-full blur-3xl opacity-60 pointer-events-none" />

            <div className="flex items-center gap-5 mb-6 pb-6 border-b border-slate-100 relative">
              <div className="relative">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white font-bold text-xl shadow-lg ring-4 ring-indigo-50">
                  {speaker.name.charAt(0).toUpperCase()}
                </div>
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-xl flex items-center gap-3">
                  {speaker.name}
                  {speaker.labelIsGeneric && (
                    <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-500 text-[10px] uppercase font-bold tracking-wider ring-1 ring-slate-200">
                      Generic
                    </span>
                  )}
                </h3>
                <p className="text-sm font-semibold text-indigo-600 mt-0.5 flex items-center gap-1.5">
                  <Briefcase size={14} /> {speaker.role}
                </p>
              </div>
            </div>
            
            {/* Conditional Layout: Single column if no action items, double column if there are */}
            <div className={`grid gap-6 text-sm relative ${hasActionItems ? 'md:grid-cols-2' : 'grid-cols-1'}`}>
              <div className="space-y-6">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                    <Activity size={14} /> Main Contributions
                  </p>
                  <p className="text-slate-700 leading-relaxed font-medium">{speaker.mainContributions}</p>
                </div>
                {speaker.opinionsPositions && (
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">Stance & Opinions</p>
                    <p className="text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-2xl ring-1 ring-slate-100">{speaker.opinionsPositions}</p>
                  </div>
                )}
              </div>
              
              {hasActionItems && (
                <div className="space-y-6 md:border-l border-slate-100 md:pl-6">
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-3">Action Items Owned</p>
                    <div className="flex flex-col gap-2">
                      {speaker.actionItemsOwned.map((item, idx) => (
                        <div key={idx} className="bg-indigo-50/50 text-indigo-900 font-medium px-4 py-3 rounded-xl text-sm ring-1 ring-indigo-100/50 flex items-start gap-3">
                          <CheckSquare size={16} className="text-indigo-500 shrink-0 mt-0.5" />
                          {item}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        );
      })}
    </div>
  );

  if (loading) return (
    <div className="flex justify-center items-center h-screen bg-slate-50/50">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin shadow-lg" />
        <div className="text-indigo-900 font-bold tracking-tight text-lg animate-pulse">Analyzing Insights...</div>
      </div>
    </div>
  );
  
  if (!meeting) return (
    <div className="flex flex-col items-center justify-center h-screen bg-slate-50">
      <div className="w-20 h-20 bg-white shadow-xl shadow-slate-200/50 rounded-full flex items-center justify-center mb-6 text-slate-400 ring-1 ring-slate-200">
        <FileText size={32} />
      </div>
      <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Meeting Not Found</h2>
      <p className="text-slate-500 mt-2">The meeting you are looking for does not exist or was deleted.</p>
    </div>
  );

  const tabs = [
    { id: 'exec', label: 'Executive Summary', icon: Zap },
    { id: 'tech', label: 'Technical Details', icon: Settings },
    { id: 'speaker', label: 'Speaker Analysis', icon: User }
  ] as const;

  return (
    <div className="h-screen flex flex-col bg-[#f8fafc] p-3 lg:p-6 gap-6 font-sans overflow-hidden">
      
      {/* ---------- HEADER ---------- */}
      <div className="shrink-0 bg-white rounded-3xl ring-1 ring-slate-200/60 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] p-5 lg:px-8 lg:py-6 flex flex-col md:flex-row md:items-center justify-between gap-5 relative overflow-hidden">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-gradient-to-b from-indigo-50 to-transparent rounded-full blur-3xl opacity-60 pointer-events-none" />

        <div className="relative z-10 w-full md:w-2/3">
          {/* Added 'truncate' to keep long titles neatly on one line, and a 'title' tooltip */}
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700 truncate" title={meeting.title}>
            {meeting.title}
          </h1>
          <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-slate-500">
            <div className="flex items-center gap-2 bg-slate-50 ring-1 ring-slate-200 px-3 py-1.5 rounded-xl font-medium shadow-sm">
              <Network size={14} className="text-indigo-500" />
              <span className="text-slate-700">{meeting.adapter?.name || 'Unknown Adapter'}</span>
              <span className="text-slate-300">/</span>
              <span className="text-slate-600">{meeting.release?.name || 'No Release'}</span>
            </div>
            <span className={`inline-flex items-center px-3 py-1.5 rounded-xl text-xs font-bold tracking-wide uppercase shadow-sm ring-1 ring-inset ${
              meeting.status === 'completed' ? 'bg-emerald-50 text-emerald-700 ring-emerald-500/20' :
              meeting.status === 'processing' ? 'bg-amber-50 text-amber-700 ring-amber-500/20' :
              'bg-slate-50 text-slate-600 ring-slate-500/20'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full mr-2 shadow-sm ${meeting.status === 'completed' ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
              {meeting.status}
            </span>
          </div>
        </div>
        <div className="flex gap-3 relative z-10 shrink-0">
          <button onClick={() => alert('PDF export coming soon')} className="flex items-center gap-2 text-sm font-bold bg-white ring-1 ring-slate-200 text-slate-700 px-5 py-2.5 rounded-2xl hover:bg-slate-50 hover:shadow-md transition-all shadow-sm">
            <Download size={16} className="text-slate-400" /> Export
          </button>
          <button onClick={() => meeting.transcriptUrl && window.open(meeting.transcriptUrl, '_blank')} className="flex items-center gap-2 text-sm font-bold bg-gradient-to-b from-indigo-500 to-indigo-600 text-white px-5 py-2.5 rounded-2xl hover:from-indigo-600 hover:to-indigo-700 transition-all shadow-md shadow-indigo-200 hover:shadow-lg hover:shadow-indigo-300 ring-1 ring-indigo-600">
            <FileText size={16} /> Transcript
          </button>
        </div>
      </div>

      {/* ---------- MAIN LAYOUT ---------- */}
      <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0 relative z-10">
        
        {/* Left Column: Data & Insights */}
        <div className="w-full lg:w-[45%] flex flex-col min-h-0 bg-transparent">
          
          {/* Dashboard Stat Row */}
          <div className="grid grid-cols-3 gap-3 mb-5 shrink-0">
            <StatCard 
              icon={Users} 
              label="Speakers" 
              value={speakerSummaries.length} 
              colorClass="bg-blue-50 text-blue-600" 
            />
            <StatCard 
              icon={CheckSquare} 
              label="Action Items" 
              value={detailedSummary?.actionItems?.length || 0} 
              colorClass="bg-emerald-50 text-emerald-600" 
            />
            <StatCard 
              icon={AlertTriangle} 
              label="Blockers" 
              value={detailedSummary?.blockersAndRisks?.length || 0} 
              colorClass="bg-rose-50 text-rose-600" 
            />
          </div>

          {/* Animated Tab Bar */}
          <div className="shrink-0 mb-6 bg-slate-200/60 p-1.5 rounded-2xl flex relative w-full shadow-inner ring-1 ring-slate-900/5">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as typeof activeTab)}
                  className={`relative flex-1 flex items-center justify-center gap-2 px-6 py-2.5 text-sm font-bold rounded-xl transition-all duration-300 z-10 ${
                    isActive ? 'text-white' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-300/30'
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeTabIndicator"
                      className="absolute inset-0 bg-indigo-600 rounded-xl shadow-md ring-1 ring-indigo-500"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                  <Icon size={16} className={`relative z-20 ${isActive ? 'text-indigo-100' : 'text-slate-400'}`} />
                  <span className="relative z-20 whitespace-nowrap">{tab.label}</span>
                </button>
              )
            })}
          </div>

          {/* Scrollable Content Container */}
          <div className="flex-1 overflow-y-auto pr-3 custom-scrollbar">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="h-full pb-6"
              >
                {activeTab === 'exec' && (
                  <div className="bg-white rounded-3xl ring-1 ring-slate-200 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-8 relative overflow-hidden">
                    <div className="absolute -top-24 -right-24 w-64 h-64 bg-gradient-to-br from-indigo-100 to-purple-50 rounded-full blur-3xl opacity-50 pointer-events-none" />
                    <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-gradient-to-tr from-sky-100 to-emerald-50 rounded-full blur-3xl opacity-50 pointer-events-none" />
                    
                    <div className="relative z-10">
                      <div className="flex items-center gap-3 mb-6 pb-6 border-b border-slate-100">
                        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-200">
                          <Zap size={20} />
                        </div>
                        <h2 className="text-xl font-extrabold text-slate-900">Executive Overview</h2>
                      </div>
                      
                      <div 
                        className="prose prose-slate prose-indigo max-w-none text-slate-700 leading-loose prose-p:mb-5 prose-headings:text-slate-900 prose-headings:font-bold prose-headings:tracking-tight prose-strong:text-indigo-950 prose-strong:font-bold"
                        dangerouslySetInnerHTML={{ __html: (meeting?.execSummary || 'No executive summary available.').replace(/\n/g, '<br/>') }} 
                      />
                    </div>
                  </div>
                )}
                {activeTab === 'tech' && renderTechnicalContent()}
                {activeTab === 'speaker' && renderSpeakerContent()}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Right Column: Visualization Canvas */}
        <div className="w-full lg:w-[55%] flex flex-col min-h-0 bg-white rounded-3xl ring-1 ring-slate-200/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden relative">
          
          {/* Premium Canvas Toolbar */}
          <div className="absolute top-0 left-0 right-0 z-10 bg-white/70 backdrop-blur-xl border-b border-slate-200/60 p-4 lg:px-6 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-md">
                {activeTab === 'exec' ? <Layout size={16} /> : activeTab === 'tech' ? <Network size={16} /> : <Users size={16} />}
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 leading-tight">
                  {activeTab === 'exec' ? 'High-Level Flow' : activeTab === 'tech' ? 'Architecture & Logic Flow' : 'Speaker Contribution Map'}
                </h3>
                <p className="text-[11px] font-medium text-slate-500">
                  {activeTab === 'speaker' ? 'Interactive Donut Chart' : 'Interactive Diagram Canvas'}
                </p>
              </div>
            </div>
            
            {activeTab !== 'speaker' && (
              <div className="hidden sm:flex text-[11px] font-bold uppercase tracking-wider text-slate-500 bg-slate-100/80 px-4 py-2 rounded-xl items-center gap-2 ring-1 ring-slate-200/50">
                <ArrowRight size={14} className="text-indigo-500" /> Click nodes to navigate
              </div>
            )}
          </div>

          {/* Canvas Area */}
          <div 
            className="flex-1 overflow-auto pt-20"
            style={{
              backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)',
              backgroundSize: '24px 24px',
              backgroundColor: '#f8fafc'
            }}
          >
            {activeTab === 'speaker' ? (
              <div className="w-full h-full p-8 pb-16">
                 <SpeakerPieChart mermaidString={meeting?.speakerMermaid} totalSpeakers={speakerSummaries.length} />
              </div>
            ) : (
              <div
                ref={mermaidContainerRef}
                className="min-w-full min-h-full flex items-center justify-center p-8 transition-transform duration-300 ease-in-out cursor-grab active:cursor-grabbing"
                dangerouslySetInnerHTML={{ __html: diagramSvg }}
              />
            )}
          </div>
        </div>
      </div>
      
      {/* Global styles: Smooth scrolling, rounding flowchart nodes, disabling zoom effect */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
        
        /* Rounding Mermaid Flowchart Nodes & Styling */
        .node rect, .node polygon { 
          rx: 12px !important; 
          ry: 12px !important; 
          stroke-width: 1.5px !important; 
        }
        .edgePath path { 
          stroke: #94a3b8 !important; 
          stroke-width: 1.5px !important; 
        }
        .label { 
          font-family: 'Inter', sans-serif !important; 
          color: #334155 !important; 
        }

        /* Interactive Nodes Highlights (Without the Zoom Lift) */
        .node rect, .node circle, .node ellipse, .node polygon, .node path {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          cursor: pointer;
        }
        .node:hover rect, .node:hover circle, .node:hover ellipse, .node:hover polygon, .node:hover path {
          stroke: #4f46e5 !important;
          stroke-width: 2.5px !important;
          filter: drop-shadow(0 10px 15px rgba(79, 70, 229, 0.2));
        }
      `}</style>
    </div>
  );
}