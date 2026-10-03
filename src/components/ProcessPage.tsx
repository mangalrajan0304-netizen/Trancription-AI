import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  FileText,
  Sparkles,
  Upload,
  Zap,
} from 'lucide-react';

interface ProcessPageProps {
  onExtract: (payload: { transcript: string; title?: string; date?: string; duration?: number }) => Promise<void>;
  isLoading: boolean;
  isLight: boolean;
}

const TEMPLATES = [
  {
    name: 'Sprint Planning',
    title: 'Q3 Mobile Sprint Planning & Testing Sync',
    duration: 35,
    transcript: `[00:01:00] Sarah (Product Lead): Welcome team. Let's align on next week's mobile release. Liam, where are we with biometric face auth?
[00:02:15] Liam (Frontend): Biometrics is complete. I will push the PR to staging by tomorrow 5 PM so QA can verify.
[00:03:30] Elena (QA): Thank you Liam. Our checkout automated tests are currently failing on discount codes. We need someone to rewrite the discount validation tests before Friday.
[00:04:45] Dev (Backend): I can take ownership of the discount validation suite. I'll have the PR open by Thursday morning.
[00:06:00] Sarah (Product Lead): We also noticed slow image loading in the catalog on low-bandwidth networks. Let's investigate image caching soon.
[00:07:15] Dev (Backend): I will enable WebP image compression on CloudFront by Monday.`,
  },
  {
    name: 'Enterprise Security Review',
    title: 'Enterprise FinTech Security & Webhook Setup',
    duration: 45,
    transcript: `[00:01:10] Dave (Account Exec): Thanks for joining Priya and Marcus. Let's finalize the enterprise security checklist.
[00:02:20] Priya (Fintech Tech Lead): Our compliance auditor requires that all payload logs be stored in AWS eu-central-1 Frankfurt.
[00:03:40] Marcus (Solutions Architect): I will configure the tenant isolation Terraform module to target Frankfurt strictly by next Monday.
[00:05:00] Priya (Fintech Tech Lead): We also need mutual TLS certificate verification for your webhooks.
[00:06:15] Marcus (Solutions Architect): I will email our public CA certificates and GitHub webhook sample repo to Priya by Thursday close of business.
[00:07:30] Priya (Fintech Tech Lead): Great. I will send over our static firewall CIDR IP blocks by Friday noon.`,
  },
  {
    name: 'P1 Incident Post-Mortem',
    title: 'INC-9912: Database Replication Lag Mitigation',
    duration: 30,
    transcript: `[00:01:00] Alex (DevOps Lead): Starting incident INC-9912 review. Database replication lag spiked to 210s at 14:00 UTC.
[00:02:20] Nina (DBA): A bulk analytics query ran without an index on organization_audit_events table.
[00:03:40] Chloe (SRE): We need to rebuild the composite index concurrently in production tonight.
[00:04:30] Nina (DBA): I will generate the non-blocking CREATE INDEX CONCURRENTLY script by 5 PM today and execute during maintenance window.
[00:06:00] Chloe (SRE): I will tune the Datadog PagerDuty monitor to trigger if lag exceeds 30s for 2 minutes by tomorrow noon.
[00:07:15] Alex (DevOps Lead): We also need an audit of all Flyway migrations. Let's assign an engineer to audit migrations by Wednesday.`,
  },
];

export const ProcessPage: React.FC<ProcessPageProps> = ({ onExtract, isLoading, isLight }) => {
  const [transcript, setTranscript] = useState('');
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [duration, setDuration] = useState(30);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!transcript.trim()) return;
    await onExtract({
      transcript: transcript.trim(),
      title: title.trim() || undefined,
      date,
      duration: Number(duration),
    });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (text) {
        setTranscript(text);
        if (!title) {
          setTitle(file.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' '));
        }
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      {/* Page Header */}
      <div className={`rounded-2xl border p-6 sm:p-7 shadow-sm transition-all ${
        isLight
          ? 'bg-white border-violet-100 shadow-violet-100/30'
          : 'bg-slate-900/60 border-slate-800'
      }`}>
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-violet-100/80 text-violet-800 border border-violet-200">
            <Sparkles className="w-3.5 h-3.5 text-violet-600" />
            <span>AI Diarization & Extraction Engine</span>
          </div>
          <h1 className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${
            isLight ? 'text-slate-900' : 'text-white'
          }`}>
            Process & Extract Meeting Transcript
          </h1>
          <p className={`text-xs sm:text-sm ${
            isLight ? 'text-slate-600' : 'text-slate-400'
          }`}>
            Paste your transcript or upload .vtt / .srt / .txt files. The AI will isolate speaker dialogue, calibrate task confidence, and flag risks.
          </p>
        </div>
      </div>

      {/* Preset sample buttons */}
      <div className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
        isLight ? 'bg-white border-violet-100 shadow-sm' : 'bg-slate-900/60 border-slate-800'
      }`}>
        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
          Quick Demo Presets:
        </span>
        <div className="flex items-center gap-2 flex-wrap">
          {TEMPLATES.map((tmpl) => (
            <button
              key={tmpl.name}
              type="button"
              onClick={() => {
                setTitle(tmpl.title);
                setTranscript(tmpl.transcript);
                setDuration(tmpl.duration);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                isLight
                  ? 'bg-violet-50/70 hover:bg-violet-100 border-violet-200 text-violet-700'
                  : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-violet-300'
              }`}
            >
              {tmpl.name}
            </button>
          ))}
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className={`p-6 sm:p-7 rounded-2xl border space-y-5 ${
        isLight ? 'bg-white border-violet-100 shadow-sm' : 'bg-slate-900/60 border-slate-800'
      }`}>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Meeting Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Q3 Mobile Release Readiness Sync"
              className={`w-full px-3.5 py-2 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-violet-500 ${
                isLight
                  ? 'bg-slate-50 border border-slate-300 text-slate-900 placeholder-slate-400'
                  : 'bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-600'
              }`}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Meeting Date
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className={`w-full px-3.5 py-2 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-violet-500 ${
                isLight
                  ? 'bg-slate-50 border border-slate-300 text-slate-900'
                  : 'bg-slate-950 border border-slate-800 text-slate-100'
              }`}
            />
          </div>
        </div>

        {/* Textarea dropzone */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <label className="font-bold text-slate-700 dark:text-slate-300">
              Raw Meeting Transcript *
            </label>
            <label className="inline-flex items-center gap-1.5 text-violet-600 hover:text-violet-700 font-semibold cursor-pointer">
              <Upload className="w-3.5 h-3.5" />
              <span>Choose File (.txt, .vtt, .srt)</span>
              <input
                type="file"
                accept=".txt,.vtt,.srt,.docx,.md"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>

          <textarea
            rows={10}
            required
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
            placeholder="Paste meeting dialogue here:&#10;[00:01:00] Sarah: Liam, please push the staging PR before 5 PM tomorrow.&#10;[00:02:15] Liam: I will submit the PR by tomorrow noon so Elena can verify."
            className={`w-full p-4 rounded-xl text-xs font-mono leading-relaxed resize-y min-h-[200px] focus:outline-none focus:ring-1 focus:ring-violet-500 ${
              isLight
                ? 'bg-slate-50 border border-slate-300 text-slate-900 placeholder-slate-400'
                : 'bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-600'
            }`}
          />
        </div>

        <div className="flex items-center justify-between pt-2">
          <span className="text-xs text-slate-500">
            {transcript ? `${transcript.split(/\s+/).filter(Boolean).length} words detected` : 'Empty transcript'}
          </span>

          <button
            type="submit"
            disabled={isLoading || !transcript.trim()}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs sm:text-sm font-semibold shadow-md shadow-violet-600/30 transition-all disabled:opacity-50 cursor-pointer"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Extracting Action Items...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Extract & Diarize Transcript</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
