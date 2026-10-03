import React, { useState } from 'react';
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  ArrowUpDown,
  Calendar,
  CheckCircle2,
  Clock,
  Download,
  ExternalLink,
  FileCode,
  FileText,
  Filter,
  Layers,
  Link,
  MessageSquare,
  Play,
  Plus,
  Search,
  Sparkles,
  Tag,
  Trash2,
  Tv,
  Upload,
  User,
  Users,
  Video,
} from 'lucide-react';
import { Meeting, DashboardStats, UserProfile } from '../types.js';
import { ConfidenceHeatmapBadge } from './ConfidenceHeatmapBadge.js';
import { Mail, Mic, Zap, Shield, Check } from 'lucide-react';

interface DashboardProps {
  meetings: Meeting[];
  stats: DashboardStats;
  onSelectMeeting: (meeting: Meeting) => void;
  onNewMeetingClick: () => void;
  onDeleteMeeting: (id: string, e: React.MouseEvent) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onQuickExtract: (transcript: string, title?: string) => Promise<void>;
  isLoading: boolean;
  isLight: boolean;
  onNavigate: (view: 'transcripts' | 'tasks' | 'process' | 'analytics' | 'login') => void;
  currentUser?: UserProfile | null;
  onOpenToolkit?: (tab?: 'recorder' | 'mytasks' | 'emaildraft' | 'quicktask') => void;
}

const SAMPLE_TEMPLATES = [
  {
    name: 'Sprint Planning',
    title: 'Q3 Mobile Sprint Planning & Testing Sync',
    duration: 35,
    preview: 'Liam pushes biometric keys, Elena flags 62% checkout coverage...',
    transcript: `[00:01:00] Sarah (Product Lead): Welcome team. Let's align on next week's mobile release. Liam, where are we with biometric face auth?
[00:02:15] Liam (Frontend): Biometrics is complete. I will push the PR to staging by tomorrow 5 PM so QA can verify.
[00:03:30] Elena (QA): Thank you Liam. Our checkout automated tests are currently failing on discount codes. We need someone to rewrite the discount validation tests before Friday.
[00:04:45] Dev (Backend): I can take ownership of the discount validation suite. I'll have the PR open by Thursday morning.
[00:06:00] Sarah (Product Lead): We also noticed slow image loading in the catalog on low-bandwidth networks. Let's investigate image caching soon.
[00:07:15] Dev (Backend): I will enable WebP image compression on CloudFront by Monday.`,
  },
  {
    name: 'Customer Onboarding',
    title: 'Enterprise FinTech Security & Webhook Setup',
    duration: 45,
    preview: 'Data residency in Frankfurt, mTLS certificates, IP whitelisting...',
    transcript: `[00:01:10] Dave (Account Exec): Thanks for joining Priya and Marcus. Let's finalize the enterprise security checklist.
[00:02:20] Priya (Fintech Tech Lead): Our compliance auditor requires that all payload logs be stored in AWS eu-central-1 Frankfurt.
[00:03:40] Marcus (Solutions Architect): I will configure the tenant isolation Terraform module to target Frankfurt strictly by next Monday.
[00:05:00] Priya (Fintech Tech Lead): We also need mutual TLS certificate verification for your webhooks.
[00:06:15] Marcus (Solutions Architect): I will email our public CA certificates and GitHub webhook sample repo to Priya by Thursday close of business.
[00:07:30] Priya (Fintech Tech Lead): Great. I will send over our static firewall CIDR IP blocks by Friday noon.`,
  },
  {
    name: 'Incident Post-Mortem',
    title: 'INC-9912: Database Replication Lag Mitigation',
    duration: 30,
    preview: 'Full table scan on audit events, concurrent index, Datadog alert...',
    transcript: `[00:01:00] Alex (DevOps Lead): Starting incident INC-9912 review. Database replication lag spiked to 210s at 14:00 UTC.
[00:02:20] Nina (DBA): A bulk analytics query ran without an index on organization_audit_events table.
[00:03:40] Chloe (SRE): We need to rebuild the composite index concurrently in production tonight.
[00:04:30] Nina (DBA): I will generate the non-blocking CREATE INDEX CONCURRENTLY script by 5 PM today and execute during maintenance window.
[00:06:00] Chloe (SRE): I will tune the Datadog PagerDuty monitor to trigger if lag exceeds 30s for 2 minutes by tomorrow noon.
[00:07:15] Alex (DevOps Lead): We also need an audit of all Flyway migrations. Let's assign an engineer to audit migrations by Wednesday.`,
  },
];

export const Dashboard: React.FC<DashboardProps> = ({
  meetings,
  stats,
  onSelectMeeting,
  onNewMeetingClick,
  onDeleteMeeting,
  searchQuery,
  onSearchChange,
  onQuickExtract,
  isLoading,
  isLight,
  onNavigate,
  currentUser,
  onOpenToolkit,
}) => {
  const [quickTitle, setQuickTitle] = useState('');
  const [quickTranscript, setQuickTranscript] = useState('');
  const [selectedTag, setSelectedTag] = useState<string>('All');
  const [isDragOver, setIsDragOver] = useState(false);
  // Default to ASCENDING as requested
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Extract all unique tags
  const allTags = ['All', ...Array.from(new Set(meetings.flatMap((m) => m.tags || [])))];

  const filteredMeetings = meetings.filter((m) => {
    const matchesTag = selectedTag === 'All' || (m.tags && m.tags.includes(selectedTag));
    const matchesSearch =
      !searchQuery ||
      m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.participants.some((p) => p.toLowerCase().includes(searchQuery.toLowerCase())) ||
      m.action_items.some((a) => a.task_description.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesTag && matchesSearch;
  });

  // Sort by date ascending (oldest to newest) by default!
  const sortedMeetings = [...filteredMeetings].sort((a, b) => {
    const timeA = new Date(a.date || a.created_at).getTime();
    const timeB = new Date(b.date || b.created_at).getTime();
    return sortOrder === 'asc' ? timeA - timeB : timeB - timeA;
  });

  const handleQuickSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickTranscript.trim()) return;
    await onQuickExtract(quickTranscript, quickTitle.trim() || undefined);
    setQuickTranscript('');
    setQuickTitle('');
  };

  const handleFileUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      if (text) {
        setQuickTranscript(text);
        if (!quickTitle) {
          const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ');
          setQuickTitle(cleanName);
        }
      }
    };
    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const downloadTranscriptFile = (e: React.MouseEvent, meeting: Meeting) => {
    e.stopPropagation();
    const blob = new Blob([meeting.raw_transcript], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = meeting.transcript_file_name || `${meeting.title.replace(/\s+/g, '_')}_transcript.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Hero Welcome Banner */}
      <div className={`relative overflow-hidden rounded-2xl border p-6 sm:p-8 shadow-sm transition-all ${
        isLight
          ? 'bg-gradient-to-r from-violet-50/80 via-white to-purple-50/50 border-violet-100 shadow-violet-100/30'
          : 'bg-gradient-to-b from-slate-900/90 via-slate-900/40 to-slate-950 border-slate-800'
      }`}>
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-100/80 border border-violet-200 text-xs font-bold text-violet-800">
            <Sparkles className="w-3.5 h-3.5 text-violet-600" />
            <span>AI Meeting Intelligence & Task Extractor</span>
          </div>
          <h1 className={`text-2xl sm:text-4xl font-extrabold tracking-tight ${
            isLight ? 'text-slate-900' : 'text-white'
          }`}>
            Intelligent Meeting Action Items &{' '}
            <span className="bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 bg-clip-text text-transparent">
              Speaker Diarization
            </span>
            .
          </h1>
          <p className={`text-xs sm:text-sm leading-relaxed ${
            isLight ? 'text-slate-600' : 'text-slate-300'
          }`}>
            Extract owners and deadlines from dialogue, inspect synced audio/video recordings and separate transcript sources, and export tasks directly to calendars.
          </p>

          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={() => onNavigate('transcripts')}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-semibold text-xs shadow-md shadow-violet-600/25 transition-all cursor-pointer"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Browse Date-Wise Transcripts ({meetings.length})</span>
            </button>
            <button
              onClick={() => onNavigate('tasks')}
              className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl font-semibold text-xs border transition-all cursor-pointer ${
                isLight
                  ? 'bg-white hover:bg-violet-50/60 text-slate-800 border-violet-200 shadow-xs'
                  : 'bg-slate-900 hover:bg-slate-800 text-slate-200 border-slate-700'
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-violet-600" />
              <span>Open Task Matrix ({stats.total_action_items})</span>
            </button>
          </div>
        </div>

        {/* 4 Summary Stats Grid */}
        <div className={`grid grid-cols-2 lg:grid-cols-4 gap-4 mt-8 pt-6 border-t ${
          isLight ? 'border-violet-100' : 'border-slate-800/80'
        }`}>
          {/* Total Meetings */}
          <div
            onClick={() => onNavigate('transcripts')}
            className={`p-4 rounded-xl border flex flex-col justify-between cursor-pointer transition-all hover:scale-[1.01] ${
              isLight
                ? 'bg-white border-violet-100 hover:border-violet-300 shadow-xs'
                : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-bold uppercase tracking-wider">Total Transcripts</span>
              <FileText className="w-4 h-4 text-violet-600" />
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className={`text-2xl sm:text-3xl font-extrabold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                {stats.total_meetings}
              </span>
              <span className="text-xs text-slate-500">sessions</span>
            </div>
          </div>

          {/* Action Items */}
          <div
            onClick={() => onNavigate('tasks')}
            className={`p-4 rounded-xl border flex flex-col justify-between cursor-pointer transition-all hover:scale-[1.01] ${
              isLight
                ? 'bg-white border-violet-100 hover:border-emerald-300 shadow-xs'
                : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-bold uppercase tracking-wider">Action Items</span>
              <Layers className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className={`text-2xl sm:text-3xl font-extrabold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                {stats.total_action_items}
              </span>
              <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-medium">
                <span className="text-amber-600 font-bold">{stats.pending_tasks + stats.in_progress_tasks} active</span>
                <span>/</span>
                <span className="text-emerald-600 font-bold">{stats.completed_tasks} done</span>
              </div>
            </div>
          </div>

          {/* Average Confidence */}
          <div
            onClick={() => onNavigate('analytics')}
            className={`p-4 rounded-xl border flex flex-col justify-between cursor-pointer transition-all hover:scale-[1.01] ${
              isLight
                ? 'bg-white border-violet-100 hover:border-purple-300 shadow-xs'
                : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-bold uppercase tracking-wider">AI Precision</span>
              <Activity className="w-4 h-4 text-violet-600" />
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className={`text-2xl sm:text-3xl font-extrabold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                {stats.avg_confidence}%
              </span>
              <span className="text-xs text-emerald-600 font-bold">High Precision</span>
            </div>
          </div>

          {/* Attention Items */}
          <div
            onClick={() => onNavigate('tasks')}
            className={`p-4 rounded-xl border flex flex-col justify-between cursor-pointer transition-all hover:scale-[1.01] ${
              isLight
                ? 'bg-white border-violet-100 hover:border-amber-300 shadow-xs'
                : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-bold uppercase tracking-wider">Risk Flags</span>
              <AlertTriangle className="w-4 h-4 text-amber-500" />
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className={`text-2xl sm:text-3xl font-extrabold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                {stats.unassigned_tasks_count + stats.ambiguous_deadlines_count}
              </span>
              <span className="text-xs text-amber-600 font-medium">unassigned / vague</span>
            </div>
          </div>
        </div>

        {/* User Productivity Tools Bar (Useful Things for User) */}
        <div className={`mt-6 pt-5 border-t flex flex-col md:flex-row items-center justify-between gap-4 ${
          isLight ? 'border-violet-100' : 'border-slate-800'
        }`}>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-violet-600 to-purple-600 text-white font-extrabold flex items-center justify-center text-xs shadow-xs">
              {currentUser ? currentUser.name.charAt(0) : 'U'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  {currentUser ? `Welcome back, ${currentUser.name}` : 'Welcome Guest'}
                </span>
                <span className="text-[10px] font-semibold px-2 py-0.2 rounded-full bg-violet-100 text-violet-700 border border-violet-200">
                  {currentUser ? currentUser.role : 'Guest Mode'}
                </span>
              </div>
              <span className="text-[11px] text-slate-500">
                {currentUser?.email || 'Sign in to access your personal action items and calendar'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => onOpenToolkit && onOpenToolkit('mytasks')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-violet-100/70 hover:bg-violet-200/80 text-violet-800 text-xs font-bold transition-all cursor-pointer"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-violet-600" />
              <span>My Action Items</span>
            </button>

            <button
              onClick={() => onOpenToolkit && onOpenToolkit('recorder')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-violet-100/70 hover:bg-violet-200/80 text-violet-800 text-xs font-bold transition-all cursor-pointer"
            >
              <Mic className="w-3.5 h-3.5 text-violet-600" />
              <span>Voice Dictaphone</span>
            </button>

            <button
              onClick={() => onOpenToolkit && onOpenToolkit('emaildraft')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-violet-100/70 hover:bg-violet-200/80 text-violet-800 text-xs font-bold transition-all cursor-pointer"
            >
              <Mail className="w-3.5 h-3.5 text-violet-600" />
              <span>Follow-Up Drafter</span>
            </button>

            {!currentUser && (
              <button
                onClick={() => onNavigate('login')}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold shadow-xs cursor-pointer"
              >
                <User className="w-3.5 h-3.5" />
                <span>Login</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Quick Upload Card */}
      <div className={`rounded-2xl border p-6 sm:p-7 shadow-sm transition-all ${
        isLight
          ? 'bg-white border-violet-100 shadow-violet-100/20'
          : 'bg-slate-900/60 border-slate-800'
      }`}>
        <div className="flex items-center justify-between pb-4 border-b border-violet-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-violet-600 text-white shadow-sm shadow-violet-600/30">
              <Upload className="w-4 h-4" />
            </div>
            <div>
              <h2 className={`font-bold text-base ${isLight ? 'text-slate-900' : 'text-white'}`}>
                Quick Transcript Extractor
              </h2>
              <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                Drop timestamped notes or paste raw meeting dialogue to extract diarized speaker turns and action items.
              </p>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-2">
            <span className="text-xs font-medium text-slate-400">Load Template:</span>
            {SAMPLE_TEMPLATES.map((sample) => (
              <button
                key={sample.name}
                type="button"
                onClick={() => {
                  setQuickTitle(sample.title);
                  setQuickTranscript(sample.transcript);
                }}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                  isLight
                    ? 'bg-violet-50/70 hover:bg-violet-100 text-violet-700 border-violet-200'
                    : 'bg-slate-800 hover:bg-slate-700 text-violet-300 border-slate-700'
                }`}
              >
                {sample.name}
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleQuickSubmit} className="mt-4 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Meeting Title (Optional)
              </label>
              <input
                type="text"
                value={quickTitle}
                onChange={(e) => setQuickTitle(e.target.value)}
                placeholder="e.g. Q4 Executive Budget Review"
                className={`w-full px-3 py-2 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-violet-500 ${
                  isLight
                    ? 'bg-slate-50 border border-slate-200 text-slate-800 placeholder-slate-400'
                    : 'bg-slate-950 border border-slate-800 text-slate-200 placeholder-slate-600'
                }`}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Supported Formats
              </label>
              <div className="flex items-center gap-1.5 pt-1 text-xs">
                <span className={`px-2 py-0.5 rounded text-[11px] font-mono border ${
                  isLight ? 'bg-violet-50 border-violet-100 text-violet-700' : 'bg-slate-800 border-slate-700 text-slate-400'
                }`}>
                  .vtt / .srt
                </span>
                <span className={`px-2 py-0.5 rounded text-[11px] font-mono border ${
                  isLight ? 'bg-violet-50 border-violet-100 text-violet-700' : 'bg-slate-800 border-slate-700 text-slate-400'
                }`}>
                  [00:15] Name:
                </span>
                <span className={`px-2 py-0.5 rounded text-[11px] font-mono border ${
                  isLight ? 'bg-violet-50 border-violet-100 text-violet-700' : 'bg-slate-800 border-slate-700 text-slate-400'
                }`}>
                  Chat Text
                </span>
              </div>
            </div>
          </div>

          {/* Dropzone & Textarea */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragOver(true);
            }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={handleDrop}
            className={`relative rounded-xl border-2 border-dashed transition-all ${
              isDragOver
                ? 'border-violet-500 bg-violet-50/50'
                : isLight
                ? 'border-violet-200 hover:border-violet-400 bg-slate-50/50'
                : 'border-slate-800 hover:border-slate-700 bg-slate-950/60'
            }`}
          >
            <textarea
              rows={4}
              value={quickTranscript}
              onChange={(e) => setQuickTranscript(e.target.value)}
              placeholder="Paste raw transcript here, or drag & drop a .txt, .vtt, or .srt file...&#10;Example: [00:02:15] Liam: I will push the PR to staging by tomorrow 5 PM so Elena can run smoke tests."
              className={`w-full p-4 bg-transparent text-xs font-mono resize-y min-h-[110px] focus:outline-none ${
                isLight ? 'text-slate-800 placeholder-slate-400' : 'text-slate-200 placeholder-slate-600'
              }`}
            />
            <div className="absolute right-3 bottom-3 flex items-center gap-2">
              <label
                htmlFor="quick-file-upload-dash"
                className={`cursor-pointer inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold border transition-colors ${
                  isLight
                    ? 'bg-white hover:bg-violet-50 text-slate-700 border-slate-300 shadow-xs'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                }`}
              >
                <Upload className="w-3.5 h-3.5 text-violet-600" />
                <span>Choose File</span>
                <input
                  id="quick-file-upload-dash"
                  type="file"
                  accept=".txt,.vtt,.srt,.docx,.md"
                  className="hidden"
                  onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
                />
              </label>
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <span className="text-xs text-slate-500">
              {quickTranscript ? `${quickTranscript.split(/\s+/).filter(Boolean).length} words detected` : 'Empty transcript'}
            </span>
            <button
              type="submit"
              disabled={isLoading || !quickTranscript.trim()}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-xs sm:text-sm bg-violet-600 hover:bg-violet-500 text-white shadow-md shadow-violet-600/30 transition-all disabled:opacity-50 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Extracting Action Items...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Extract Action Items & Diarize</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Date-Wise Ascending Meetings Section */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className={`text-xl font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                Meeting Transcripts
              </h2>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[11px] font-bold bg-violet-50 text-violet-700 border border-violet-200">
                <ArrowUpDown className="w-3 h-3 text-violet-600" />
                <span>Date-Wise {sortOrder === 'asc' ? 'Ascending ↑' : 'Descending ↓'}</span>
              </span>
            </div>
            <p className={`text-xs ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
              Chronological transcript turns, audio/video recordings, and separate source links.
            </p>
          </div>

          {/* Sort toggle & All Transcripts link */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors cursor-pointer ${
                isLight
                  ? 'bg-white hover:bg-violet-50 text-slate-700 border-violet-200'
                  : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-800'
              }`}
            >
              Order: {sortOrder === 'asc' ? 'Ascending (Oldest First ↑)' : 'Descending (Newest First ↓)'}
            </button>
            <button
              onClick={() => onNavigate('transcripts')}
              className="text-xs text-violet-600 hover:text-violet-700 font-bold inline-flex items-center gap-1 cursor-pointer"
            >
              <span>View All ({meetings.length})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Meetings Grid with SEPARATE RECORDINGS & TRANSCRIPT LINKS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {sortedMeetings.map((meeting) => {
            const completedCount = meeting.action_items.filter((a) => a.status === 'completed').length;
            const openCount = meeting.action_items.length - completedCount;
            const avgConf =
              meeting.action_items.length > 0
                ? Math.round(
                    (meeting.action_items.reduce((acc, c) => acc + c.confidence_score, 0) /
                      meeting.action_items.length) *
                      100
                  )
                : 88;

            return (
              <div
                key={meeting.id}
                onClick={() => onSelectMeeting(meeting)}
                className={`group relative rounded-xl border p-5 flex flex-col justify-between cursor-pointer transition-all duration-200 hover:shadow-lg ${
                  isLight
                    ? 'bg-white border-violet-100 hover:border-violet-400 hover:shadow-violet-100/50'
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    {/* Date pill */}
                    <span className="flex items-center gap-1 font-bold text-violet-700 bg-violet-50 border border-violet-200 px-2 py-0.5 rounded-md">
                      <Calendar className="w-3.5 h-3.5 text-violet-600" />
                      <span>{meeting.date}</span>
                    </span>

                    <button
                      onClick={(e) => onDeleteMeeting(meeting.id, e)}
                      title="Delete meeting"
                      className="opacity-0 group-hover:opacity-100 p-1.5 rounded-md hover:bg-rose-50 hover:text-rose-600 text-slate-400 transition-all"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <h3 className={`font-bold text-base line-clamp-1 transition-colors ${
                    isLight ? 'text-slate-900 group-hover:text-violet-600' : 'text-white group-hover:text-violet-300'
                  }`}>
                    {meeting.title}
                  </h3>

                  <p className={`text-xs line-clamp-2 leading-relaxed ${
                    isLight ? 'text-slate-600' : 'text-slate-400'
                  }`}>
                    {meeting.summary}
                  </p>

                  {/* ================= SEPARATED RECORDING & TRANSCRIPT LINKS BADGES ================= */}
                  <div className={`p-2.5 rounded-lg border space-y-2 text-xs ${
                    isLight ? 'bg-violet-50/50 border-violet-100' : 'bg-slate-950/60 border-slate-800'
                  }`}>
                    {/* Row 1: Meeting Recording Link */}
                    <div className="flex items-center justify-between gap-1">
                      <span className="flex items-center gap-1 text-[11px] font-bold text-violet-700 dark:text-violet-300">
                        <Tv className="w-3 h-3 text-violet-600" />
                        <span>Recording:</span>
                      </span>

                      {meeting.recording_url ? (
                        <a
                          href={meeting.recording_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-violet-600 hover:bg-violet-500 text-white text-[10px] font-bold shadow-xs cursor-pointer"
                          title="Open external cloud recording"
                        >
                          <Play className="w-2.5 h-2.5 fill-white" />
                          <span>Watch ({meeting.recording_duration || `${meeting.duration_minutes}m`})</span>
                          <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      ) : meeting.meeting_link ? (
                        <a
                          href={meeting.meeting_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-200 hover:bg-slate-300 text-slate-800 text-[10px] font-semibold"
                        >
                          <Video className="w-2.5 h-2.5 text-violet-600" />
                          <span>Live Room</span>
                        </a>
                      ) : (
                        <span className="text-[10px] text-slate-400">Audio Turn Synced</span>
                      )}
                    </div>

                    {/* Row 2: Separate Transcript Source Link */}
                    <div className="flex items-center justify-between gap-1 pt-1 border-t border-violet-100 dark:border-slate-800">
                      <span className="flex items-center gap-1 text-[11px] font-bold text-purple-700 dark:text-purple-300">
                        <FileText className="w-3 h-3 text-purple-600" />
                        <span>Transcript:</span>
                      </span>

                      <div className="flex items-center gap-1">
                        {meeting.transcript_url && (
                          <a
                            href={meeting.transcript_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-purple-100 hover:bg-purple-200 text-purple-800 text-[10px] font-bold"
                            title="Open Google Doc / Notion document"
                          >
                            <span>Doc</span>
                            <ExternalLink className="w-2.5 h-2.5" />
                          </a>
                        )}

                        <button
                          onClick={(e) => downloadTranscriptFile(e, meeting)}
                          className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded border border-purple-200 text-purple-700 hover:bg-purple-50 text-[10px] font-bold cursor-pointer"
                          title="Download raw timestamped transcript file"
                        >
                          <Download className="w-2.5 h-2.5" />
                          <span>.{meeting.transcript_format || 'txt'}</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {meeting.tags && meeting.tags.length > 0 && (
                    <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                      {meeting.tags.slice(0, 3).map((t) => (
                        <span
                          key={t}
                          className={`px-2 py-0.5 rounded text-[10px] font-medium border ${
                            isLight
                              ? 'bg-slate-100 text-slate-600 border-slate-200'
                              : 'bg-slate-800 text-slate-300 border-slate-700'
                          }`}
                        >
                          #{t}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className={`mt-4 pt-3 border-t space-y-2.5 ${
                  isLight ? 'border-slate-100' : 'border-slate-800'
                }`}>
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className={`font-bold ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>
                        {meeting.action_items.length} Tasks
                      </span>
                      <span className="text-[11px] text-amber-600 font-semibold">({openCount} open)</span>
                    </div>

                    <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                      {avgConf}% Conf
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className={`flex items-center gap-1 text-[11px] truncate max-w-[170px] ${
                      isLight ? 'text-slate-500' : 'text-slate-400'
                    }`}>
                      <Users className="w-3.5 h-3.5 text-slate-400" />
                      <span>{meeting.participants.join(', ')}</span>
                    </span>

                    <span className="inline-flex items-center gap-1 text-xs font-bold text-violet-600 group-hover:translate-x-0.5 transition-transform">
                      <span>Open Workspace</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
