import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import mermaid from 'mermaid';
import { getWorkspaceById, updateWorkspaceTranscript, deleteWorkspaceTranscript, toggleFavorite } from './workspaceApi';
import type { WorkspaceDetail } from './workspaceApi';
import {
  Download, FileText, Target, Users, MessageSquare,
  Settings, CheckCircle, AlertTriangle, ArrowRight,
  User, CheckSquare, Zap, Network, Layout, Briefcase, Activity,
  ZoomIn, ZoomOut, RotateCcw, Trash2, Edit3, X, Save, Star
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import toast from 'react-hot-toast';
import api from '../../lib/axios';

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
  flowchart: { curve: 'basis' },
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

// ---------- Recharts Donut ----------
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
      <div className="flex flex-col items-center justify-center h-full text-slate-400 italic space-y-3 min-h-[300px]">
        <p className="font-medium">No contribution data available</p>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full min-h-[350px]">
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-10 pr-[20%] lg:pr-[30%]">
        <span className="text-3xl sm:text-4xl font-extrabold text-slate-800">{totalSpeakers}</span>
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
            animationDuration={1200}
            cornerRadius={6}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
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
            wrapperStyle={{ fontSize: '12px', fontWeight: 600, color: '#475569', paddingLeft: '10px', width: '40%' }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

// ---------- Badge component ----------
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
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase shadow-sm ring-1 ring-inset ${appliedStyle}`}>
      {isMeetingStatus && (
        <span className={`w-1.5 h-1.5 rounded-full mr-1.5 shadow-sm ${status === 'completed' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
      )}
      {status}
    </span>
  );
};

// ---------- Section Card ----------
const SectionCard = ({ id, title, icon: Icon, children }: { id?: string; title: string; icon?: any; children: React.ReactNode }) => (
  <motion.div
    id={id}
    initial={{ opacity: 0, y: 15 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-white rounded-2xl ring-1 ring-slate-200 shadow-sm overflow-hidden relative group transition-all duration-300"
  >
    <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/0 to-purple-50/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
    <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-3 bg-slate-50/50">
      <div className="w-7 h-7 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 shadow-sm ring-1 ring-indigo-100 shrink-0">
        {Icon && <Icon size={14} />}
      </div>
      <h3 className="text-sm font-bold text-slate-800 tracking-tight">{title}</h3>
    </div>
    <div className="p-4 text-slate-600 text-sm leading-relaxed relative">
      {children}
    </div>
  </motion.div>
);

// ---------- Main Component ----------
export default function WorkspaceView() {
  const { workspaceId } = useParams<{ workspaceId: string }>();
  const navigate = useNavigate();
  const [workspace, setWorkspace] = useState<WorkspaceDetail | null>(null);
  const [activeTab, setActiveTab] = useState<'exec' | 'tech' | 'speaker'>('exec');
  const [mobileView, setMobileView] = useState<'text' | 'diagram'>('text');
  const [diagramSvg, setDiagramSvg] = useState('');
  const [loading, setLoading] = useState(true);
  const mermaidContainerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState('');

  // Favorite state
  const [isFavorite, setIsFavorite] = useState(false);

  // Reset zoom on tab change
  useEffect(() => { setScale(1); }, [activeTab]);

  // Fetch workspace
  useEffect(() => {
    if (!workspaceId) return;
    getWorkspaceById(workspaceId)
      .then((data) => {
        setWorkspace(data);
        setTitleDraft(data.title || '');
      })
      .catch((err) => {
        console.error(err);
        toast.error('Failed to load workspace');
      })
      .finally(() => setLoading(false));
  }, [workspaceId]);

  // Check favorite status
  useEffect(() => {
    if (!workspaceId) return;
    api.get('/favorites/check', { params: { type: 'workspace', id: workspaceId } })
      .then(res => setIsFavorite(res.data.isFavorite))
      .catch(() => {});
  }, [workspaceId]);

  // Toggle favorite handler
  const handleToggleFavorite = async () => {
    if (!workspaceId) return;
    const newState = !isFavorite;
    setIsFavorite(newState);
    try {
      await toggleFavorite('workspace', workspaceId);
    } catch {
      setIsFavorite(!newState);
      toast.error('Failed to update favorite');
    }
  };

  // Update title
  const handleSaveTitle = async () => {
    if (!workspace) return;
    try {
      const updated = await updateWorkspaceTranscript(workspace.id, { title: titleDraft });
      setWorkspace(updated);
      setEditingTitle(false);
      toast.success('Title updated');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Update failed');
    }
  };

  // Delete workspace
  const handleDelete = async () => {
    if (!workspace) return;
    if (!window.confirm('Are you sure you want to delete this workspace transcript?')) return;
    try {
      await deleteWorkspaceTranscript(workspace.id);
      toast.success('Deleted');
      navigate('/workspace', { replace: true });
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Delete failed');
    }
  };

  // Mermaid rendering
  const renderMermaid = useCallback(async (code: string | undefined) => {
    if (activeTab === 'speaker') return;
    if (!code) {
      setDiagramSvg('<div class="flex flex-col items-center justify-center h-full text-slate-400 italic space-y-3 p-8"><p>No diagram available</p></div>');
      return;
    }
    try {
      const sanitized = sanitizeMermaid(code);
      const { svg } = await mermaid.render(`workspace-mermaid-${workspaceId}-${activeTab}`, sanitized);
      setDiagramSvg(svg);
    } catch (err) {
      console.error('Mermaid render error:', err);
      setDiagramSvg('<div class="flex items-center justify-center h-full p-8"><p class="text-rose-500 font-medium bg-rose-50 px-6 py-4 rounded-2xl ring-1 ring-rose-200 shadow-sm">Failed to render diagram</p></div>');
    }
  }, [workspaceId, activeTab]);

  useEffect(() => {
    if (activeTab === 'exec') renderMermaid(workspace?.execMermaid);
    else if (activeTab === 'tech') renderMermaid(workspace?.techMermaid);
  }, [activeTab, workspace, renderMermaid]);

  // Scale SVG
  useEffect(() => {
    const container = mermaidContainerRef.current;
    if (!container) return;
    const svg = container.querySelector('svg');
    if (!svg) return;
    svg.style.maxWidth = 'none';
    svg.style.transition = 'width 0.2s ease-out, height 0.2s ease-out';

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

  // Click on node -> scroll to section
  useEffect(() => {
    const container = mermaidContainerRef.current;
    if (!container) return;
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const node = target.closest('.node');
      if (!node) return;
      const text = node.textContent?.toLowerCase() || '';
      const sectionMappings = [
        { id: 'meeting-objective', keywords: ['objective', 'goal', 'purpose'] },
        { id: 'discussion-topics', keywords: ['discussion', 'topic', 'talk'] },
        { id: 'key-decisions', keywords: ['decision', 'decided'] },
        { id: 'action-items', keywords: ['action', 'task', 'todo'] },
        { id: 'blockers-and-risks', keywords: ['blocker', 'risk', 'issue'] }
      ];
      for (const section of sectionMappings) {
        if (section.keywords.some(kw => text.includes(kw))) {
          if (window.innerWidth < 1024) setMobileView('text');
          setTimeout(() => {
            const element = document.getElementById(section.id);
            if (element) {
              element.scrollIntoView({ behavior: 'smooth', block: 'center' });
              element.classList.add('ring-4', 'ring-indigo-500', 'scale-[1.02]');
              setTimeout(() => element.classList.remove('ring-4', 'ring-indigo-500', 'scale-[1.02]'), 1500);
            }
          }, 150);
          break;
        }
      }
    };
    container.addEventListener('click', handleClick);
    return () => container.removeEventListener('click', handleClick);
  }, [diagramSvg]);

  // Parse detailed/speaker summaries
  const detailedSummary = parseDetailedSummary(workspace?.techSummary);
  const speakerSummaries = parseSpeakerSummary(workspace?.speakerSummary);

  // Rendering helpers
  const renderTechnicalContent = () => {
    if (!detailedSummary) return <div className="text-center py-10 text-slate-500">No technical details available</div>;
    return (
      <div className="space-y-4">
        {detailedSummary.objective && (
          <SectionCard id="meeting-objective" title="Meeting Objective" icon={Target}>
            <p className="text-slate-700">{detailedSummary.objective}</p>
          </SectionCard>
        )}
        {detailedSummary.discussionTopics && detailedSummary.discussionTopics.length > 0 && (
          <SectionCard id="discussion-topics" title="Discussion Topics" icon={MessageSquare}>
            <div className="space-y-5">
              {detailedSummary.discussionTopics.map((topic, i) => (
                <div key={i} className="group relative pl-4 border-l-2 border-slate-100 hover:border-indigo-400 transition-colors">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-bold text-slate-800">{topic.topic}</h4>
                    <Badge status={topic.status} />
                  </div>
                  <p className="text-slate-600">{topic.discussion}</p>
                </div>
              ))}
            </div>
          </SectionCard>
        )}
        {detailedSummary.decisionsMade && detailedSummary.decisionsMade.length > 0 && (
          <SectionCard id="key-decisions" title="Key Decisions" icon={CheckCircle}>
            <ul className="space-y-3">
              {detailedSummary.decisionsMade.map((d, i) => (
                <li key={i} className="flex items-start gap-3 bg-slate-50 p-3 rounded-xl">
                  <CheckCircle size={14} className="text-emerald-500 mt-0.5" />
                  <span className="text-slate-700">{d}</span>
                </li>
              ))}
            </ul>
          </SectionCard>
        )}
        {detailedSummary.actionItems && detailedSummary.actionItems.length > 0 && (
          <SectionCard id="action-items" title="Action Items" icon={CheckSquare}>
            <div className="overflow-x-auto rounded-xl ring-1 ring-slate-200">
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
                    <tr key={i} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3 font-semibold text-indigo-900 flex items-center gap-2">
                        <div className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-[10px]">
                          {item.owner.charAt(0).toUpperCase()}
                        </div>
                        {item.owner}
                      </td>
                      <td className="px-4 py-3 text-slate-700">{item.task}</td>
                      <td className="px-4 py-3 text-slate-500 whitespace-nowrap">{item.deadline}</td>
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
                <div key={i} className="p-4 rounded-xl bg-gradient-to-br from-rose-50 to-orange-50/30 ring-1 ring-rose-100 flex gap-3">
                  <AlertTriangle size={16} className="text-rose-500 mt-1" />
                  <div>
                    <p className="font-bold text-slate-900 mb-1">{b.description}</p>
                    <div className="flex flex-wrap gap-2 text-[11px] text-rose-700/80 font-medium">
                      <span className="bg-white/60 px-2 py-1 rounded-md">Raised: <strong>{b.raisedBy}</strong></span>
                      <span className="bg-white/60 px-2 py-1 rounded-md">Owner: <strong>{b.owner}</strong></span>
                    </div>
                    <div className="mt-2 bg-white/60 p-3 rounded-lg text-xs text-slate-700 ring-1 ring-rose-500/10">
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
    <div className="grid gap-4">
      {speakerSummaries.map((speaker, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: i * 0.05 }}
          className="bg-white rounded-2xl ring-1 ring-slate-200 shadow-sm p-4 relative overflow-hidden"
        >
          <div className="flex items-center gap-3 mb-4 pb-4 border-b border-slate-100">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-sm shrink-0">
              {speaker.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 className="font-bold text-slate-900 flex items-center gap-2">
                {speaker.name}
                {speaker.labelIsGeneric && (
                  <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-500 text-[10px] uppercase font-bold">Generic</span>
                )}
              </h3>
              <p className="text-xs font-semibold text-indigo-600"><Briefcase size={12} className="inline mr-1" />{speaker.role}</p>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Main Contributions</p>
                <p className="text-slate-700 font-medium">{speaker.mainContributions}</p>
              </div>
              {speaker.opinionsPositions && (
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Stance & Opinions</p>
                  <p className="text-slate-600 bg-slate-50 p-3 rounded-xl">{speaker.opinionsPositions}</p>
                </div>
              )}
            </div>
            {speaker.actionItemsOwned && speaker.actionItemsOwned.length > 0 && (
              <div className="space-y-4 md:border-l border-slate-100 md:pl-5">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">Action Items Owned</p>
                  <div className="flex flex-col gap-2">
                    {speaker.actionItemsOwned.map((item, idx) => (
                      <div key={idx} className="bg-indigo-50/50 text-indigo-900 font-medium px-3 py-2 rounded-lg text-xs flex items-start gap-2">
                        <CheckSquare size={14} className="text-indigo-500 mt-0.5" />
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      ))}
    </div>
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
          <p className="text-indigo-900 font-bold tracking-tight">Loading workspace...</p>
        </div>
      </div>
    );
  }

  if (!workspace) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 p-4">
        <FileText size={40} className="text-slate-300 mb-4" />
        <h2 className="text-xl font-bold text-slate-800">Workspace Not Found</h2>
        <p className="text-slate-500 mt-2 text-center">This workspace transcript does not exist.</p>
      </div>
    );
  }

  const tabs = [
    { id: 'exec', label: 'Summary', icon: Zap },
    { id: 'tech', label: 'Details', icon: Settings },
    { id: 'speaker', label: 'Speakers', icon: User }
  ] as const;

  return (
    <div className="h-[100dvh] w-full flex flex-col bg-slate-50 overflow-hidden font-sans">
      {/* Header */}
      <header className="shrink-0 bg-white border-b border-slate-200 px-3 py-2 sm:px-6 sm:py-2.5 flex items-center justify-between z-20">
        <div className="flex items-center gap-3 min-w-0">
          {editingTitle ? (
            <div className="flex items-center gap-2">
              <input
                autoFocus
                value={titleDraft}
                onChange={(e) => setTitleDraft(e.target.value)}
                className="border border-indigo-300 rounded-lg px-3 py-1 text-sm font-bold"
              />
              <button onClick={handleSaveTitle} className="p-1.5 bg-indigo-600 text-white rounded-lg"><Save size={14} /></button>
              <button onClick={() => setEditingTitle(false)} className="p-1.5 bg-slate-200 rounded-lg"><X size={14} /></button>
            </div>
          ) : (
            <h1
              onClick={() => setEditingTitle(true)}
              className="text-lg sm:text-xl font-extrabold text-slate-900 truncate cursor-pointer hover:text-indigo-600 transition"
              title="Click to edit title"
            >
              {workspace.title || 'Untitled Workspace'}
              <Edit3 size={14} className="inline ml-2 text-slate-400" />
            </h1>
          )}
          <Badge status={workspace.status} />
        </div>
        <div className="flex items-center gap-2">
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
          <button
            onClick={handleDelete}
            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition"
            title="Delete"
          >
            <Trash2 size={16} />
          </button>
          <button className="px-3 py-1.5 bg-white ring-1 ring-slate-200 rounded-lg text-xs font-bold"><Download size={14} className="inline mr-1" /> Export</button>
        </div>
      </header>

      {/* Mobile view switcher */}
      <div className="lg:hidden flex p-2 bg-slate-100 border-b border-slate-200 shrink-0 z-10">
        <button
          onClick={() => setMobileView('text')}
          className={`flex-1 py-1.5 text-xs font-bold rounded-md flex items-center justify-center gap-2 ${mobileView === 'text' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500'}`}
        >
          <FileText size={14} /> Text
        </button>
        <button
          onClick={() => setMobileView('diagram')}
          className={`flex-1 py-1.5 text-xs font-bold rounded-md flex items-center justify-center gap-2 ${mobileView === 'diagram' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500'}`}
        >
          <Layout size={14} /> Diagram
        </button>
      </div>

      {/* Content area */}
      <div className="flex-1 flex flex-col lg:flex-row min-h-0">
        {/* Left: Text */}
        <div className={`w-full lg:w-1/2 flex-1 min-h-0 flex-col border-r border-slate-200 bg-white ${mobileView === 'text' ? 'flex' : 'hidden lg:flex'}`}>
          <div className="shrink-0 p-2 border-b border-slate-100 flex gap-2">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 ${activeTab === tab.id ? 'bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200' : 'text-slate-600 hover:bg-slate-100'}`}
              >
                <tab.icon size={14} /> {tab.label}
              </button>
            ))}
          </div>
          <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
            <AnimatePresence mode="wait">
              <motion.div key={activeTab} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                {activeTab === 'exec' && (
                  <div className="bg-white rounded-2xl ring-1 ring-slate-200 shadow-sm p-4">
                    <h2 className="text-lg font-extrabold mb-3 flex items-center gap-2"><Zap size={16} className="text-indigo-600" /> Executive Summary</h2>
                    <div dangerouslySetInnerHTML={{ __html: (workspace.execSummary || 'No executive summary available.').replace(/\n/g, '<br/>') }} className="prose text-slate-700" />
                  </div>
                )}
                {activeTab === 'tech' && renderTechnicalContent()}
                {activeTab === 'speaker' && renderSpeakerContent()}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Right: Diagram */}
        <div className={`w-full lg:w-1/2 flex-1 min-h-0 flex-col relative ${mobileView === 'diagram' ? 'flex' : 'hidden lg:flex'}`}>
          <div className="shrink-0 px-3 py-2 bg-white border-b border-slate-200 flex justify-between items-center z-10">
            <span className="text-sm font-bold text-slate-800">
              {activeTab === 'exec' ? 'High-Level Flow' : activeTab === 'tech' ? 'Architecture & Logic' : 'Speaker Contribution'}
            </span>
            {activeTab !== 'speaker' && (
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
                <button onClick={() => setScale(s => Math.max(s - 0.2, 0.4))} className="p-1.5 hover:bg-white rounded-md" title="Zoom Out"><ZoomOut size={14} /></button>
                <span className="text-xs font-bold min-w-[36px] text-center">{Math.round(scale * 100)}%</span>
                <button onClick={() => setScale(s => Math.min(s + 0.2, 3.0))} className="p-1.5 hover:bg-white rounded-md" title="Zoom In"><ZoomIn size={14} /></button>
                <div className="w-[1px] h-3.5 bg-slate-300 mx-1" />
                <button onClick={() => setScale(1)} className="p-1.5 hover:bg-white rounded-md" title="Reset"><RotateCcw size={14} /></button>
              </div>
            )}
          </div>
          <div className="flex-1 overflow-auto custom-scrollbar" style={{ backgroundImage: activeTab !== 'speaker' ? 'radial-gradient(#cbd5e1 1px, transparent 1px)' : 'none', backgroundSize: '24px 24px', backgroundColor: '#f8fafc' }}>
            {activeTab === 'speaker' ? (
              <div className="w-full h-full p-4 flex items-center justify-center">
                <SpeakerPieChart mermaidString={workspace.speakerMermaid} totalSpeakers={speakerSummaries.length} />
              </div>
            ) : (
              <div className="p-4 min-w-max min-h-max flex">
                <div ref={mermaidContainerRef} className="mx-auto bg-white/50 backdrop-blur-sm rounded-2xl p-4 shadow-sm" dangerouslySetInnerHTML={{ __html: diagramSvg }} />
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        .node rect, .node polygon { rx: 8px !important; ry: 8px !important; stroke-width: 1.5px !important; }
        .edgePath path { stroke: #94a3b8 !important; stroke-width: 1.5px !important; }
        .node:hover rect, .node:hover circle, .node:hover ellipse, .node:hover polygon, .node:hover path {
          stroke: #4f46e5 !important;
          stroke-width: 2px !important;
          filter: drop-shadow(0 4px 6px rgba(79, 70, 229, 0.15));
          cursor: pointer;
        }
      `}</style>
    </div>
  );
}