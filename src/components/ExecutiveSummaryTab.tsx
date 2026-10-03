import React from 'react';
import {
  Activity,
  BarChart3,
  CheckCircle2,
  Compass,
  FileCheck,
  HeartHandshake,
  MessageSquare,
  PieChart,
  Sparkles,
  TrendingUp,
  Users,
} from 'lucide-react';
import { Meeting } from '../types.js';

interface ExecutiveSummaryTabProps {
  meeting: Meeting;
}

export const ExecutiveSummaryTab: React.FC<ExecutiveSummaryTabProps> = ({ meeting }) => {
  const summary = meeting.executive_summary;

  if (!summary) {
    return (
      <div className="p-12 text-center rounded-xl border border-slate-800 bg-slate-900/40 text-slate-400">
        No executive summary generated for this session yet.
      </div>
    );
  }

  const sentiment = summary.sentiment || {
    overall: 'Collaborative & Focused',
    score: 84,
    tone: 'constructive dialogue',
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Top Banner: Sentiment & Actionable Ratio */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Sentiment Analysis Card */}
        <div className="md:col-span-2 rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-900/90 to-slate-950 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-violet-500/10 text-violet-300 border border-violet-500/20">
              <Sparkles className="w-3.5 h-3.5 text-violet-400" />
              <span>AI Sentiment & Tone Assessment</span>
            </span>
            <span className="text-xs font-mono text-slate-400">{sentiment.score}/100 Index</span>
          </div>

          <div className="space-y-1">
            <h3 className="text-xl font-bold text-white">{sentiment.overall}</h3>
            <p className="text-xs text-slate-300 leading-relaxed">{sentiment.tone}</p>
          </div>

          {/* Sentiment Meter Bar */}
          <div className="space-y-1.5 pt-2">
            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span>Cautious / Critical</span>
              <span>Balanced</span>
              <span className="text-emerald-400 font-semibold">Decisive & Collaborative</span>
            </div>
            <div className="w-full h-2.5 rounded-full bg-slate-800 overflow-hidden relative">
              <div
                className="h-full rounded-full bg-gradient-to-r from-amber-400 via-sky-400 to-emerald-400 transition-all duration-700"
                style={{ width: `${Math.min(Math.max(sentiment.score, 10), 100)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Actionable Ratio Metric Card */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Actionable Density</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>

          <div className="my-4">
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-extrabold text-white">{summary.actionable_ratio}%</span>
              <span className="text-xs text-emerald-400 font-medium">high yield</span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Percentage of total transcript dialogue turns directly linked to concrete commitments.
            </p>
          </div>

          <div className="flex items-center gap-2 text-[11px] text-slate-500 pt-2 border-t border-slate-800">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>{meeting.action_items.length} tasks extracted</span>
          </div>
        </div>
      </div>

      {/* 2-Column: Key Takeaways & Key Decisions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Executive Takeaways */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 space-y-4">
          <div className="flex items-center gap-2 text-white font-bold text-base pb-3 border-b border-slate-800">
            <FileCheck className="w-5 h-5 text-violet-400" />
            <span>Executive Meeting Summary</span>
          </div>

          <ul className="space-y-3">
            {summary.bullets.map((bullet, idx) => (
              <li key={idx} className="flex items-start gap-3 text-xs sm:text-sm text-slate-200">
                <span className="w-1.5 h-1.5 rounded-full bg-violet-400 mt-2 shrink-0" />
                <span className="leading-relaxed">{bullet}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Key Decisions Made */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 space-y-4">
          <div className="flex items-center gap-2 text-white font-bold text-base pb-3 border-b border-slate-800">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <span>Key Decisions Finalized</span>
          </div>

          <div className="space-y-3">
            {summary.key_decisions.length === 0 ? (
              <p className="text-xs text-slate-400 italic">No formal decision blocks isolated.</p>
            ) : (
              summary.key_decisions.map((decision, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80 flex items-start gap-3"
                >
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 shrink-0">
                    DEC-{idx + 1}
                  </span>
                  <p className="text-xs sm:text-sm text-slate-200 leading-snug">{decision}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Speaker Participation & Task Distribution Breakdown */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-violet-400" />
              <span>Speaker Participation & Task Distribution</span>
            </h3>
            <p className="text-xs text-slate-400">
              Correlating vocal airtime with task assignment distribution across participants.
            </p>
          </div>
          <span className="text-xs text-slate-400">{summary.speaker_stats.length} Active Speakers</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {summary.speaker_stats.map((spk) => (
            <div
              key={spk.speaker}
              className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-slate-200 truncate">{spk.speaker}</span>
                <span className="text-xs font-semibold text-violet-400">{spk.talk_percentage}% airtime</span>
              </div>

              {/* Talk bar */}
              <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-violet-500 rounded-full"
                  style={{ width: `${Math.min(spk.talk_percentage, 100)}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                <span>{spk.word_count} spoken words</span>
                <span className="font-semibold text-emerald-400">{spk.action_item_count} tasks assigned</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Topics Discussed */}
      {summary.topics && summary.topics.length > 0 && (
        <div className="rounded-xl border border-slate-800 bg-slate-900/30 p-4 flex items-center gap-3 flex-wrap">
          <span className="text-xs font-semibold text-slate-400">Core Subject Tags:</span>
          {summary.topics.map((t) => (
            <span
              key={t}
              className="px-2.5 py-1 rounded-md text-xs font-medium bg-slate-800 text-slate-300 border border-slate-700/60"
            >
              #{t}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};
