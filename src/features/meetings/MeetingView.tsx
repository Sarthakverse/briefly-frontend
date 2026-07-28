import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import mermaid from 'mermaid';
import { getMeetingById } from './meetingApi';
import type { MeetingDetail } from './meetingApi';
import { 
  Download, FileText, Target, Users, MessageSquare, 
  Settings, CheckCircle, AlertTriangle, ArrowRight,
  User, CheckSquare, Zap, Network, Layout, Briefcase, Activity,
  ZoomIn, ZoomOut, RotateCcw, Star
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { PieChart, Pie, Cell, Tooltip as RechartsTooltip, Legend, ResponsiveContainer } from 'recharts';
import { toggleFavorite } from './meetingApi';
import api from '../../lib/axios';
import toast from 'react-hot-toast';
import { exportReportToPDF, formatDetailedSummary } from '../../utils/exportPdf';
import { jsPDF } from 'jspdf';

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
    curve: 'basis'
  },
  securityLevel: 'strict' 
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

// ---------- Beautiful Recharts Donut Component ----------
const SpeakerPieChart = ({
  mermaidString,
  totalSpeakers,
  chartRef,
}: {
  mermaidString?: string;
  totalSpeakers: number;
  chartRef?: React.RefObject<HTMLDivElement | null>;
}) => {
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
      <div className="flex flex-col items-center justify-center h-full text-slate-400 italic space-y-3 min-h-[300px]">
        <p className="font-medium">No contribution data available</p>
      </div>
    );
  }

  return (
    <div ref={chartRef} className="relative w-full h-full min-h-[350px] sm:min-h-[400px]">
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-10 pr-[20%] lg:pr-[30%]">
        <span className="text-3xl sm:text-4xl font-extrabold text-slate-800 tracking-tight">{totalSpeakers}</span>
        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-1">Speakers</span>
      </div>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="40%"
            cy="50%"
            innerRadius={70}
            outerRadius={100}
            paddingAngle={4}
            dataKey="value"
            stroke="none"
            animationBegin={0}
            animationDuration={1200}
            animationEasing="ease-out"
            cornerRadius={6}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <RechartsTooltip
            contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
            itemStyle={{ fontWeight: 'bold', color: '#1e293b' }}
            formatter={(value: any) => [`${value}%`, 'Contribution']}
          />
          <Legend
            layout="vertical"
            verticalAlign="middle"
            align="right"
            iconType="circle"
            iconSize={10}
            wrapperStyle={{
              fontSize: '12px',
              fontWeight: 600,
              color: '#475569',
              paddingLeft: '10px',
              width: '40%',
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
    'Pending': 'bg-slate-50 text-slate-600 ring-slate-500/20',
    'completed': 'bg-emerald-50 text-emerald-700 ring-emerald-500/20',
    'processing': 'bg-amber-50 text-amber-700 ring-amber-500/20'
  };
  const appliedStyle = styles[status] || 'bg-slate-50 text-slate-600 ring-slate-500/20';
  const isMeetingStatus = ['completed', 'processing'].includes(status);

  return (
    <span className={`inline-flex items-center px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full text-[10px] sm:text-[11px] font-bold tracking-wide uppercase shadow-sm ring-1 ring-inset ${appliedStyle}`}>
      {isMeetingStatus && (
        <span className={`w-1.5 h-1.5 rounded-full mr-1.5 shadow-sm shrink-0 ${status === 'completed' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
      )}
      {status}
    </span>
  );
};

const SectionCard = ({ id, title, icon: Icon, children }: { id?: string; title: string; icon?: any; children: React.ReactNode }) => (
  <motion.div 
    id={id}
    initial={{ opacity: 0, y: 15 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-white rounded-2xl ring-1 ring-slate-200 shadow-sm overflow-hidden relative group transition-all duration-300"
  >
    <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/0 to-purple-50/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
    <div className="px-4 py-3 sm:px-5 sm:py-4 border-b border-slate-100 flex items-center gap-3 bg-slate-50/50">
      <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 shadow-sm ring-1 ring-indigo-100 shrink-0">
        {Icon && <Icon size={14} className="sm:w-4 sm:h-4" />}
      </div>
      <h3 className="text-sm sm:text-base font-bold text-slate-800 tracking-tight">{title}</h3>
    </div>
    <div className="p-4 sm:p-5 text-slate-600 text-sm leading-relaxed relative">
      {children}
    </div>
  </motion.div>
);

// ---------- Main View ----------
export default function MeetingView() {
  const { meetingId } = useParams<{ meetingId: string }>();
  const [meeting, setMeeting] = useState<MeetingDetail | null>(null);
  const [activeTab, setActiveTab] = useState<'exec' | 'tech' | 'speaker'>('exec');
  const [mobileView, setMobileView] = useState<'text' | 'diagram'>('text');
  
  const [diagramSvg, setDiagramSvg] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const mermaidContainerRef = useRef<HTMLDivElement>(null);
  const printableRef = useRef<HTMLDivElement>(null);
  const speakerChartRef = useRef<HTMLDivElement>(null);

  // Scroll & Scale setup
  const [scale, setScale] = useState(1); // 1 = 100%

  // Favorite state
  const [isFavorite, setIsFavorite] = useState(false);

  // Reset zoom when switching tabs
  useEffect(() => {
    setScale(1);
  }, [activeTab]);

  useEffect(() => {
    if (!meetingId) return;
    getMeetingById(meetingId)
      .then(setMeeting)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [meetingId]);

  // Check favorite status on mount
  useEffect(() => {
    if (!meetingId) return;
    api.get('/favorites/check', { params: { type: 'meeting', id: meetingId } })
      .then(res => setIsFavorite(res.data.isFavorite))
      .catch(() => {});
  }, [meetingId]);

  const handleToggleFavorite = async () => {
    if (!meetingId) return;
    const newState = !isFavorite;
    setIsFavorite(newState);
    try {
      await toggleFavorite(meetingId);
    } catch {
      setIsFavorite(!newState); // revert on error
      toast.error('Failed to update favorite');
    }
  };

  const renderMermaid = useCallback(async (code: string | undefined) => {
    if (activeTab === 'speaker') return;
    if (!code) {
      setDiagramSvg('<div class="flex flex-col items-center justify-center h-full text-slate-400 italic space-y-3 p-8"><div class="p-4 bg-slate-50 rounded-full ring-1 ring-slate-200"><svg class="w-8 h-8 text-slate-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path></svg></div><p class="font-medium">No diagram mapping available</p></div>');
      return;
    }
    try {
      const sanitized = sanitizeMermaid(code);
      const { svg } = await mermaid.render(`mermaid-${meetingId}-${activeTab}`, sanitized);
      setDiagramSvg(svg);
    } catch (err) {
      console.error('Mermaid render error:', err);
      setDiagramSvg('<div class="flex items-center justify-center h-full p-8"><p class="text-rose-500 font-medium bg-rose-50 px-6 py-4 rounded-2xl ring-1 ring-rose-200 shadow-sm">Failed to render diagram syntax.</p></div>');
    }
  }, [meetingId, activeTab]);

  useEffect(() => {
    if (activeTab === 'exec') renderMermaid(meeting?.execMermaid || undefined);
    else if (activeTab === 'tech') renderMermaid(meeting?.techMermaid || undefined);
  }, [activeTab, meeting, renderMermaid]);

  // Robustly scale the SVG layout dimensions so standard scrolling triggers naturally
  useEffect(() => {
    const container = mermaidContainerRef.current;
    if (!container) return;
    const svg = container.querySelector('svg');
    if (!svg) return;

    // Prevent Mermaid's inline constraints
    svg.style.maxWidth = 'none';
    svg.style.transition = 'width 0.2s ease-out, height 0.2s ease-out';

    // Store unscaled base dimensions once on render
    if (!svg.dataset.origWidth) {
      const viewBox = svg.getAttribute('viewBox');
      if (viewBox) {
        const [, , w, h] = viewBox.split(' ');
        svg.dataset.origWidth = w;
        svg.dataset.origHeight = h;
      } else {
        const rect = svg.getBoundingClientRect();
        svg.dataset.origWidth = rect.width.toString();
        svg.dataset.origHeight = rect.height.toString();
      }
    }

    const baseWidth = parseFloat(svg.dataset.origWidth || '0');
    const baseHeight = parseFloat(svg.dataset.origHeight || '0');

    if (!isNaN(baseWidth) && !isNaN(baseHeight)) {
      svg.style.width = `${baseWidth * scale}px`;
      svg.style.height = `${baseHeight * scale}px`;
    }
  }, [scale, diagramSvg, activeTab]);

  // Handle flow-chart node clicks -> Scroll content panel
  useEffect(() => {
    const container = mermaidContainerRef.current;
    if (!container) return;
    
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const node = target.closest('.node');
      if (!node) return;

      const text = node.textContent?.toLowerCase() || '';
      const rawId = node.getAttribute('id')?.toLowerCase() || '';

      const sectionMappings = [
        { id: 'meeting-objective', keywords: ['objective', 'goal', 'purpose', 'requirement', 'understand'] },
        { id: 'discussion-topics', keywords: ['discussion', 'topic', 'talk', 'setup', 'details', 'failover', 'wallet', 'current behavior', 'primary region'] },
        { id: 'key-decisions', keywords: ['decision', 'decided', 'conclusion'] },
        { id: 'action-items', keywords: ['action', 'task', 'todo', 'to-do', 'analyze', 'obtain', 'investigate'] },
        { id: 'blockers-and-risks', keywords: ['blocker', 'risk', 'issue', 'problem', 'failure'] }
      ];

      let targetId = null;
      for (const section of sectionMappings) {
        if (section.keywords.some(kw => text.includes(kw)) || rawId.includes(section.id.split('-')[0])) {
          targetId = section.id;
          break;
        }
      }

      if (targetId) {
        if (window.innerWidth < 1024) setMobileView('text');
        
        setTimeout(() => {
          const element = document.getElementById(targetId as string);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            element.classList.add('ring-4', 'ring-indigo-500', 'shadow-2xl', 'scale-[1.02]', 'z-10');
            setTimeout(() => element.classList.remove('ring-4', 'ring-indigo-500', 'shadow-2xl', 'scale-[1.02]', 'z-10'), 1500);
          }
        }, 150);
      }
    };

    container.addEventListener('click', handleClick);
    return () => container.removeEventListener('click', handleClick);
  }, [diagramSvg]);

  const detailedSummary = parseDetailedSummary(meeting?.techSummary ?? undefined);
  const speakerSummaries = parseSpeakerSummary(meeting?.speakerSummary ?? undefined);

  // ------- PDF Export Handler (text only + link) -------
  const handleExport = async () => {
    if (!meeting) return;

    const sections = [
      {
        title: 'Executive Summary',
        body: (doc: jsPDF, y: number) => {
          const text = meeting.execSummary || 'No executive summary available.';
          doc.setFontSize(10);
          const lines = doc.splitTextToSize(text, 180);
          doc.text(lines, 15, y);
          return y + lines.length * 5;
        },
      },
      {
        title: 'Technical Details',
        body: (doc: jsPDF, y: number) => {
          const ds = parseDetailedSummary(meeting.techSummary);
          if (!ds) {
            doc.text('No technical details available.', 15, y);
            return y + 5;
          }
          return formatDetailedSummary(ds, doc, y);
        },
      },
      {
        title: 'Speaker Summaries',
        body: (doc: jsPDF, y: number) => {
          const speakers = parseSpeakerSummary(meeting.speakerSummary);
          if (!speakers.length) {
            doc.text('No speaker data.', 15, y);
            return y + 5;
          }
          let cy = y;
          for (const sp of speakers) {
            doc.setFontSize(10);
            doc.setFont('helvetica', 'bold');
            doc.text(`${sp.name} (${sp.role})`, 15, cy);
            doc.setFont('helvetica', 'normal');
            const lines = doc.splitTextToSize(sp.mainContributions, 180);
            doc.text(lines, 15, cy + 5);
            cy += lines.length * 5 + 10;
          }
          return cy;
        },
      },
    ];

    await exportReportToPDF(
      meeting.title,
      `Adapter: ${meeting.adapter.name} | Release: ${meeting.release.name} | Enhancement: ${meeting.enhancement.name}`,
      sections,
      window.location.href
    );
  };

  // Renderers
  const renderTechnicalContent = () => {
    if (!detailedSummary) return <div className="text-center py-10 text-slate-500 font-medium">No technical details available</div>;
    return (
      <div className="space-y-4 sm:space-y-6 pb-6">
        {detailedSummary.objective && (
          <SectionCard id="meeting-objective" title="Meeting Objective" icon={Target}>
            <p className="text-slate-700 text-[14px] sm:text-[15px] leading-relaxed">{detailedSummary.objective}</p>
          </SectionCard>
        )}
        {detailedSummary.discussionTopics && detailedSummary.discussionTopics.length > 0 && (
          <SectionCard id="discussion-topics" title="Discussion Topics" icon={MessageSquare}>
            <div className="space-y-5">
              {detailedSummary.discussionTopics.map((topic, i) => (
                <div key={i} className="group relative pl-4 border-l-2 border-slate-100 hover:border-indigo-400 transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2 gap-2">
                    <h4 className="font-bold text-slate-800 text-[14px] sm:text-[15px]">{topic.topic}</h4>
                    <Badge status={topic.status} />
                  </div>
                  <p className="text-slate-600 leading-relaxed text-sm">{topic.discussion}</p>
                </div>
              ))}
            </div>
          </SectionCard>
        )}
        {detailedSummary.decisionsMade && detailedSummary.decisionsMade.length > 0 && (
          <SectionCard id="key-decisions" title="Key Decisions" icon={CheckCircle}>
            <ul className="space-y-3">
              {detailedSummary.decisionsMade.map((d, i) => (
                <li key={i} className="flex items-start gap-3 bg-slate-50/80 p-3 rounded-xl ring-1 ring-slate-100">
                  <div className="mt-0.5 shrink-0 w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 shadow-sm">
                    <CheckCircle size={12} />
                  </div>
                  <span className="text-slate-700 text-sm font-medium">{d}</span>
                </li>
              ))}
            </ul>
          </SectionCard>
        )}
        {detailedSummary.actionItems && detailedSummary.actionItems.length > 0 && (
          <SectionCard id="action-items" title="Action Items" icon={CheckSquare}>
            <div className="overflow-x-auto rounded-xl ring-1 ring-slate-200 custom-scrollbar">
              <table className="min-w-[500px] w-full text-sm text-left">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="px-4 py-3">Owner</th>
                    <th className="px-4 py-3">Task</th>
                    <th className="px-4 py-3">Deadline</th>
                    <th className="px-4 py-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {detailedSummary.actionItems.map((item, i) => (
                    <tr key={i} className="hover:bg-slate-50 transition-colors group">
                      <td className="px-4 py-3 font-semibold text-indigo-900 whitespace-nowrap flex items-center gap-2 text-xs sm:text-sm">
                        <div className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-[10px]">
                          {item.owner.charAt(0).toUpperCase()}
                        </div>
                        {item.owner}
                      </td>
                      <td className="px-4 py-3 text-slate-700 font-medium text-xs sm:text-sm">{item.task}</td>
                      <td className="px-4 py-3 text-slate-500 whitespace-nowrap text-xs">{item.deadline}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-right"><Badge status={item.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </SectionCard>
        )}
        {detailedSummary.blockersAndRisks && detailedSummary.blockersAndRisks.length > 0 && (
          <SectionCard id="blockers-and-risks" title="Blockers & Risks" icon={AlertTriangle}>
            <div className="grid gap-3">
              {detailedSummary.blockersAndRisks.map((b, i) => (
                <div key={i} className="p-3 sm:p-4 rounded-xl bg-gradient-to-br from-rose-50 to-orange-50/30 ring-1 ring-rose-100 flex flex-col sm:flex-row gap-3">
                  <div className="w-8 h-8 rounded-full bg-white shadow-sm ring-1 ring-rose-100 flex items-center justify-center shrink-0">
                    <AlertTriangle size={16} className="text-rose-500" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 mb-1 text-sm">{b.description}</p>
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-[11px] text-rose-700/80 font-medium mt-1">
                      <span className="bg-white/60 px-2 py-1 rounded-md">Raised by: <strong className="text-rose-900">{b.raisedBy}</strong></span>
                      <span className="bg-white/60 px-2 py-1 rounded-md">Owner: <strong className="text-rose-900">{b.owner}</strong></span>
                    </div>
                    <div className="mt-2 bg-white/60 p-2 sm:p-3 rounded-lg text-xs sm:text-sm text-slate-700 ring-1 ring-rose-500/10">
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
    <div className="grid gap-4 sm:gap-5 pb-6">
      {speakerSummaries.map((speaker, i) => {
        const hasActionItems = speaker.actionItemsOwned && speaker.actionItemsOwned.length > 0;
        return (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05 }}
            className="bg-white rounded-2xl ring-1 ring-slate-200 shadow-sm p-4 sm:p-6 relative overflow-hidden"
          >
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 mb-4 pb-4 border-b border-slate-100 relative">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-sm shrink-0">
                {speaker.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base sm:text-lg flex flex-wrap items-center gap-2">
                  {speaker.name}
                  {speaker.labelIsGeneric && (
                    <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-500 text-[10px] uppercase font-bold tracking-wider ring-1 ring-slate-200">Generic</span>
                  )}
                </h3>
                <p className="text-xs sm:text-sm font-semibold text-indigo-600 mt-0.5 flex items-center gap-1.5">
                  <Briefcase size={12} /> {speaker.role}
                </p>
              </div>
            </div>
            <div className={`grid gap-5 text-sm relative ${hasActionItems ? 'md:grid-cols-2' : 'grid-cols-1'}`}>
              <div className="space-y-4">
                <div>
                  <p className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center gap-1">
                    <Activity size={12} /> Main Contributions
                  </p>
                  <p className="text-slate-700 leading-relaxed font-medium text-xs sm:text-sm">{speaker.mainContributions}</p>
                </div>
                {speaker.opinionsPositions && (
                  <div>
                    <p className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Stance & Opinions</p>
                    <p className="text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl ring-1 ring-slate-100 text-xs sm:text-sm">{speaker.opinionsPositions}</p>
                  </div>
                )}
              </div>
              {hasActionItems && (
                <div className="space-y-4 md:border-l border-slate-100 md:pl-5">
                  <div>
                    <p className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">Action Items Owned</p>
                    <div className="flex flex-col gap-2">
                      {speaker.actionItemsOwned.map((item, idx) => (
                        <div key={idx} className="bg-indigo-50/50 text-indigo-900 font-medium px-3 py-2 rounded-lg text-xs sm:text-sm ring-1 ring-indigo-100/50 flex items-start gap-2">
                          <CheckSquare size={14} className="text-indigo-500 shrink-0 mt-0.5" />
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
    <div className="flex justify-center items-center min-h-screen bg-slate-50/50">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin shadow-lg" />
        <div className="text-indigo-900 font-bold tracking-tight text-lg animate-pulse">Analyzing Insights...</div>
      </div>
    </div>
  );
  
  if (!meeting) return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 p-4">
      <div className="w-16 h-16 bg-white shadow-md rounded-full flex items-center justify-center mb-4 text-slate-400 ring-1 ring-slate-200">
        <FileText size={24} />
      </div>
      <h2 className="text-xl font-bold text-slate-800 tracking-tight text-center">Meeting Not Found</h2>
      <p className="text-slate-500 mt-2 text-center text-sm">The meeting you are looking for does not exist.</p>
    </div>
  );

  const tabs = [
    { id: 'exec', label: 'Summary', icon: Zap },
    { id: 'tech', label: 'Details', icon: Settings },
    { id: 'speaker', label: 'Speakers', icon: User }
  ] as const;

  return (
    <div className="h-[100dvh] w-full flex flex-col bg-slate-50 overflow-hidden font-sans">
      
      {/* --- High Density Header --- */}
      <header className="no-print shrink-0 bg-white border-b border-slate-200 px-3 py-2 sm:px-6 sm:py-2.5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-3 z-20 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.02)]">
        
        {/* Left: Titles & Compact Info Chips */}
        <div className="flex flex-col gap-2 w-full sm:w-auto overflow-hidden">
          <div className="flex items-center gap-2.5">
            <h1 className="text-lg sm:text-xl font-extrabold text-slate-900 truncate" title={meeting.title}>
              {meeting.title}
            </h1>
            <Badge status={meeting.status} />
          </div>
          
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs">
            {/* Adapter / Release Network chip */}
            <span className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-slate-100 text-slate-700 font-medium whitespace-nowrap">
              <Network size={12} className="text-indigo-500" />
              <span className="truncate max-w-[80px] sm:max-w-none">{meeting.adapter?.name || 'Unknown'}</span>
              <span className="text-slate-300">/</span>
              <span className="truncate max-w-[80px] sm:max-w-none">{meeting.release?.name || 'No Release'}</span>
            </span>
            {/* High-level stats converted to chips to save space */}
            <span className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-blue-50 text-blue-700 font-medium whitespace-nowrap ring-1 ring-blue-500/20">
              <Users size={12} /> {speakerSummaries.length} <span className="hidden sm:inline">Speakers</span>
            </span>
            <span className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-emerald-50 text-emerald-700 font-medium whitespace-nowrap ring-1 ring-emerald-500/20">
              <CheckSquare size={12} /> {detailedSummary?.actionItems?.length || 0} <span className="hidden sm:inline">Actions</span>
            </span>
            <span className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-rose-50 text-rose-700 font-medium whitespace-nowrap ring-1 ring-rose-500/20">
              <AlertTriangle size={12} /> {detailedSummary?.blockersAndRisks?.length || 0} <span className="hidden sm:inline">Blockers</span>
            </span>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto w-full sm:w-auto mt-1 sm:mt-0">
          {/* Favorite toggle button */}
          <button
            onClick={handleToggleFavorite}
            className={`p-2 rounded-lg transition-colors ${
              isFavorite ? 'text-yellow-500 hover:text-yellow-600 hover:bg-yellow-50' : 'text-slate-400 hover:text-yellow-500 hover:bg-slate-100'
            }`}
            title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          >
            <Star size={18} fill={isFavorite ? 'currentColor' : 'none'} />
          </button>
          {/* Export PDF Button */}
          <button
            onClick={handleExport}
            className="flex-1 sm:flex-none flex justify-center items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 bg-white ring-1 ring-slate-200 text-slate-700 rounded-lg text-xs sm:text-sm font-bold hover:bg-slate-50 transition-colors shadow-sm"
          >
            <Download size={14} className="text-slate-400" /> <span>Export</span>
          </button>
          <button onClick={() => meeting.transcriptUrl && window.open(meeting.transcriptUrl, '_blank')} className="flex-1 sm:flex-none flex justify-center items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 bg-indigo-600 text-white rounded-lg text-xs sm:text-sm font-bold hover:bg-indigo-700 transition-colors shadow-sm shadow-indigo-200">
            <FileText size={14} /> <span>Transcript</span>
          </button>
        </div>
      </header>

      {/* --- Mobile Only: Segmented Control to switch views --- */}
      <div className="lg:hidden flex p-2 bg-slate-100 border-b border-slate-200 shrink-0 z-10">
        <button 
          onClick={() => setMobileView('text')} 
          className={`flex-1 py-1.5 text-xs font-bold rounded-md flex items-center justify-center gap-2 transition-colors ${mobileView === 'text' ? 'bg-white text-indigo-600 shadow-sm ring-1 ring-slate-200' : 'text-slate-500'}`}
        >
          <FileText size={14} /> Text Content
        </button>
        <button 
          onClick={() => setMobileView('diagram')} 
          className={`flex-1 py-1.5 text-xs font-bold rounded-md flex items-center justify-center gap-2 transition-colors ${mobileView === 'diagram' ? 'bg-white text-indigo-600 shadow-sm ring-1 ring-slate-200' : 'text-slate-500'}`}
        >
          <Layout size={14} /> Visual Diagram
        </button>
      </div>

        {/* --- Printable Area (split content) --- */}
        <div ref={printableRef} className="printable-area flex-1 flex flex-col lg:flex-row min-h-0 bg-slate-50 relative z-0">
        
        {/* LEFT PANE: Sticky Navigation + Scrollable Text Content */}
        <div className={`w-full lg:w-1/2 flex-1 min-h-0 flex-col border-r border-slate-200 bg-white ${mobileView === 'text' ? 'flex' : 'hidden lg:flex'}`}>
          
          {/* Sub-Tabs (Content Sections) */}
          <div className="shrink-0 p-2 sm:p-3 border-b border-slate-100 bg-slate-50/50 flex overflow-x-auto hide-scrollbar gap-1 sm:gap-2">
            {tabs.map(tab => {
              const isActive = activeTab === tab.id;
              return (
                <button 
                  key={tab.id} 
                  onClick={() => setActiveTab(tab.id as typeof activeTab)} 
                  className={`flex-1 flex items-center justify-center gap-1.5 sm:gap-2 px-3 py-2 text-[11px] sm:text-xs font-bold rounded-lg transition-colors whitespace-nowrap ${isActive ? 'bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200' : 'text-slate-600 hover:bg-slate-100'}`}
                >
                  <tab.icon size={14} className={isActive ? 'text-indigo-600' : 'text-slate-400'} /> 
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Text Content Scrolling Area */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 custom-scrollbar relative">
            <AnimatePresence mode="wait">
              <motion.div 
                key={activeTab} 
                initial={{ opacity: 0, y: 15 }} 
                animate={{ opacity: 1, y: 0 }} 
                exit={{ opacity: 0, y: -10 }} 
                transition={{ duration: 0.2 }}
              >
                {activeTab === 'exec' && (
                  <div className="bg-white rounded-2xl ring-1 ring-slate-200 shadow-sm p-4 sm:p-6 lg:p-8">
                    <div className="flex items-center gap-2 mb-4 pb-4 border-b border-slate-100">
                      <div className="w-6 h-6 rounded-lg bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-200 shrink-0">
                        <Zap size={12} />
                      </div>
                      <h2 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight">Executive Summary</h2>
                    </div>
                    <div className="prose prose-slate prose-sm sm:prose-base prose-indigo max-w-none text-slate-700 leading-relaxed prose-headings:text-slate-900 prose-headings:font-bold prose-strong:text-indigo-950">
                      <div dangerouslySetInnerHTML={{ __html: (meeting?.execSummary || 'No executive summary available.').replace(/\n/g, '<br/>') }} />
                    </div>
                  </div>
                )}
                {activeTab === 'tech' && renderTechnicalContent()}
                {activeTab === 'speaker' && renderSpeakerContent()}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* RIGHT PANE: Toolbar + Interactive Scrollable Diagram */}
        <div className={`w-full lg:w-1/2 flex-1 min-h-0 flex-col relative ${mobileView === 'diagram' ? 'flex' : 'hidden lg:flex'}`}>
          
          {/* Diagram Toolbar */}
          <div className="shrink-0 px-3 py-2 sm:px-4 sm:py-3 bg-white border-b border-slate-200 flex justify-between items-center z-10 shadow-sm">
            <div className="flex flex-col">
              <span className="text-sm font-bold text-slate-800">
                {activeTab === 'exec' ? 'High-Level Flow' : activeTab === 'tech' ? 'Architecture & Logic Flow' : 'Speaker Contribution Map'}
              </span>
              <span className="text-[10px] sm:text-xs text-slate-500 font-medium">
                {activeTab === 'speaker' ? 'Interactive Donut Chart' : 'Scroll to navigate, use controls to zoom'}
              </span>
            </div>
            
            {activeTab !== 'speaker' && (
              <div className="flex items-center gap-0.5 sm:gap-1 bg-slate-100/80 p-1 rounded-lg ring-1 ring-slate-200">
                <button onClick={() => setScale(s => Math.max(s - 0.2, 0.4))} className="p-1.5 hover:bg-white rounded-md text-slate-700 transition-colors shadow-sm" title="Zoom Out">
                  <ZoomOut size={14} />
                </button>
                <span className="text-[10px] sm:text-xs font-bold text-slate-700 min-w-[36px] text-center select-none">{Math.round(scale * 100)}%</span>
                <button onClick={() => setScale(s => Math.min(s + 0.2, 3.0))} className="p-1.5 hover:bg-white rounded-md text-slate-700 transition-colors shadow-sm" title="Zoom In">
                  <ZoomIn size={14} />
                </button>
                <div className="w-[1px] h-3.5 bg-slate-300 mx-1" />
                <button onClick={() => setScale(1)} className="p-1.5 hover:bg-white rounded-md text-slate-700 transition-colors shadow-sm" title="Reset Zoom">
                  <RotateCcw size={14} />
                </button>
              </div>
            )}
          </div>

          {/* Native Scrollable Diagram Area */}
          <div 
            className="flex-1 overflow-auto custom-scrollbar relative"
            style={{ 
              backgroundImage: activeTab !== 'speaker' ? 'radial-gradient(#cbd5e1 1px, transparent 1px)' : 'none',
              backgroundSize: '24px 24px',
              backgroundColor: '#f8fafc'
            }}
          >
            {activeTab === 'speaker' ? (
              <div className="w-full h-full p-4 sm:p-8 flex items-center justify-center">
                <SpeakerPieChart mermaidString={meeting?.speakerMermaid} totalSpeakers={speakerSummaries.length} chartRef={speakerChartRef}/>
              </div>
            ) : (
              <div className="p-4 sm:p-8 min-w-max min-h-max flex">
                <div
                  ref={mermaidContainerRef}
                  className="mx-auto bg-white/50 backdrop-blur-sm rounded-2xl p-4 shadow-sm ring-1 ring-slate-200/50"
                  dangerouslySetInnerHTML={{ __html: diagramSvg }}
                />
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Global CSS for scrollbars and Mermaid hover states */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
        
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        
        /* Interactive node hover states */
        .node rect, .node polygon { rx: 8px !important; ry: 8px !important; stroke-width: 1.5px !important; }
        .edgePath path { stroke: #94a3b8 !important; stroke-width: 1.5px !important; }
        .label { font-family: 'Inter', sans-serif !important; color: #334155 !important; }
        .node rect, .node circle, .node ellipse, .node polygon, .node path {
          transition: all 0.2s ease-out;
          cursor: pointer;
        }
        .node:hover rect, .node:hover circle, .node:hover ellipse, .node:hover polygon, .node:hover path {
          stroke: #4f46e5 !important;
          stroke-width: 2px !important;
          filter: drop-shadow(0 4px 6px rgba(79, 70, 229, 0.15));
        }
      `}</style>
    </div>
  );
}