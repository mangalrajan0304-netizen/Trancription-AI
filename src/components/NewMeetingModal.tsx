import React, { useState } from 'react';
import { Clock, FileText, Sparkles, Upload, X } from 'lucide-react';

interface NewMeetingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: { transcript: string; title?: string; date?: string; duration?: number }) => Promise<void>;
  isLoading: boolean;
}

const SAMPLE_TRANSCRIPTS = [
  {
    name: 'Q3 Mobile Sprint Planning',
    title: 'Q3 Mobile Sprint Planning & Testing Sync',
    duration: 35,
    text: `[00:01:00] Sarah (Product Lead): Welcome team. Let's align on next week's mobile release. Liam, where are we with biometric face auth?
[00:02:15] Liam (Frontend): Biometrics is complete. I will push the PR to staging by tomorrow 5 PM so QA can verify.
[00:03:30] Elena (QA): Thank you Liam. Our checkout automated tests are currently failing on discount codes. We need someone to rewrite the discount validation tests before Friday.
[00:04:45] Dev (Backend): I can take ownership of the discount validation suite. I'll have the PR open by Thursday morning.
[00:06:00] Sarah (Product Lead): We also noticed slow image loading in the catalog on low-bandwidth networks. Let's investigate image caching soon.
[00:07:15] Dev (Backend): I will enable WebP image compression on CloudFront by Monday.`,
  },
  {
    name: 'Enterprise Client Architecture',
    title: 'Enterprise FinTech Security & Webhook Setup',
    duration: 45,
    text: `[00:01:10] Dave (Account Exec): Thanks for joining Priya and Marcus. Let's finalize the enterprise security checklist.
[00:02:20] Priya (Fintech Tech Lead): Our compliance auditor requires that all payload logs be stored in AWS eu-central-1 Frankfurt.
[00:03:40] Marcus (Solutions Architect): I will configure the tenant isolation Terraform module to target Frankfurt strictly by next Monday.
[00:05:00] Priya (Fintech Tech Lead): We also need mutual TLS certificate verification for your webhooks.
[00:06:15] Marcus (Solutions Architect): I will email our public CA certificates and GitHub webhook sample repo to Priya by Thursday close of business.
[00:07:30] Priya (Fintech Tech Lead): Great. I will send over our static firewall CIDR IP blocks by Friday noon.`,
  },
  {
    name: 'Database Post-Mortem',
    title: 'INC-9912: Database Replication Lag Mitigation',
    duration: 30,
    text: `[00:01:00] Alex (DevOps Lead): Starting incident INC-9912 review. Database replication lag spiked to 210s at 14:00 UTC.
[00:02:20] Nina (DBA): A bulk analytics query ran without an index on organization_audit_events table.
[00:03:40] Chloe (SRE): We need to rebuild the composite index concurrently in production tonight.
[00:04:30] Nina (DBA): I will generate the non-blocking CREATE INDEX CONCURRENTLY script by 5 PM today and execute during maintenance window.
[00:06:00] Chloe (SRE): I will tune the Datadog PagerDuty monitor to trigger if lag exceeds 30s for 2 minutes by tomorrow noon.
[00:07:15] Alex (DevOps Lead): We also need an audit of all Flyway migrations. Let's assign an engineer to audit migrations by Wednesday.`,
  },
];

export const NewMeetingModal: React.FC<NewMeetingModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isLoading,
}) => {
  const [transcript, setTranscript] = useState('');
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [duration, setDuration] = useState(30);

  if (!isOpen) return null;

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!transcript.trim()) return;
    await onSubmit({
      transcript: transcript.trim(),
      title: title.trim() || undefined,
      date,
      duration: Number(duration),
    });
    onClose();
  };

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
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
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
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
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl rounded-2xl border border-slate-800 bg-slate-900 p-6 sm:p-8 space-y-6 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-violet-400" />
              <span>Process Meeting Transcript</span>
            </h3>
            <p className="text-xs text-slate-400">
              Extract speaker diarization segments, action items, deadlines, and executive takeaways.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Preset quick samples */}
        <div className="space-y-2">
          <span className="text-xs font-semibold text-slate-400">Load Realistic Sample Transcript:</span>
          <div className="flex items-center gap-2 flex-wrap">
            {SAMPLE_TRANSCRIPTS.map((s) => (
              <button
                key={s.name}
                type="button"
                onClick={() => {
                  setTitle(s.title);
                  setTranscript(s.text);
                  setDuration(s.duration);
                }}
                className="px-2.5 py-1 rounded-md text-xs font-medium bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 transition-colors"
              >
                {s.name}
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleFormSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Meeting Title (Optional)
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Core Engine Performance Review"
                className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-violet-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-violet-500"
              />
            </div>
          </div>

          {/* Transcript Drop Area */}
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleFileDrop}
            className="rounded-xl border border-slate-800 bg-slate-950/80 p-4 space-y-3 relative"
          >
            <div className="flex items-center justify-between text-xs text-slate-400">
              <label className="font-medium text-slate-300">Raw Meeting Transcript *</label>
              <label
                htmlFor="modal-file-upload"
                className="inline-flex items-center gap-1 text-violet-400 hover:text-violet-300 cursor-pointer font-medium"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Upload .txt / .vtt / .srt</span>
                <input
                  id="modal-file-upload"
                  type="file"
                  accept=".txt,.vtt,.srt,.docx,.md"
                  className="hidden"
                  onChange={handleFileSelect}
                />
              </label>
            </div>

            <textarea
              rows={8}
              required
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              placeholder="Paste dialogue turns here:&#10;[00:02:15] Sarah: Liam, please push the staging PR before 5 PM tomorrow.&#10;[00:03:00] Liam: I will submit the PR by tomorrow noon."
              className="w-full bg-transparent text-xs text-slate-200 placeholder-slate-600 focus:outline-none resize-y min-h-[160px]"
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            <span className="text-xs text-slate-500">
              {transcript ? `${transcript.split(/\s+/).filter(Boolean).length} words` : '0 words'}
            </span>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-2 rounded-lg text-xs font-medium text-slate-400 hover:text-slate-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading || !transcript.trim()}
                className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-semibold text-xs shadow-md shadow-violet-600/30 transition-all disabled:opacity-50 cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Processing with AI...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Extract & Save Meeting</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
