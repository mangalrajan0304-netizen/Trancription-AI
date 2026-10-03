import React, { useState } from 'react';
import {
  ArrowDownUp,
  ArrowRight,
  ArrowUpDown,
  Calendar,
  Clock,
  Download,
  ExternalLink,
  FileCode,
  FileText,
  Filter,
  Layers,
  MessageSquare,
  Play,
  Plus,
  Search,
  Sparkles,
  Tag,
  Trash2,
  Tv,
  Users,
  Video,
} from 'lucide-react';
import { Meeting } from '../types.js';
import { ConfidenceHeatmapBadge } from './ConfidenceHeatmapBadge.js';

interface TranscriptsPageProps {
  meetings: Meeting[];
  onSelectMeeting: (meeting: Meeting) => void;
  onNewMeetingClick: () => void;
  onDeleteMeeting: (id: string, e: React.MouseEvent) => void;
  isLight: boolean;
  searchQuery: string;
  onSearchChange: (q: string) => void;
}

export const TranscriptsPage: React.FC<TranscriptsPageProps> = ({
  meetings,
  onSelectMeeting,
  onNewMeetingClick,
  onDeleteMeeting,
  isLight,
  searchQuery,
  onSearchChange,
}) => {
  // Date sort order: default to ASCENDING as explicitly requested!
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [selectedTag, setSelectedTag] = useState<string>('All');
  const [viewLayout, setViewLayout] = useState<'cards' | 'table'>('cards');

  const allTags = ['All', ...Array.from(new Set(meetings.flatMap((m) => m.tags || [])))];

  // Filter and sort
  const filtered = meetings.filter((m) => {
    const matchesTag = selectedTag === 'All' || (m.tags && m.tags.includes(selectedTag));
    const matchesSearch =
      !searchQuery ||
      m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.participants.some((p) => p.toLowerCase().includes(searchQuery.toLowerCase())) ||
      m.action_items.some((a) => a.task_description.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesTag && matchesSearch;
  });

  // Sort by date: asc = oldest to newest chronologically, desc = newest first
  const sortedMeetings = [...filtered].sort((a, b) => {
    const timeA = new Date(a.date || a.created_at).getTime();
    const timeB = new Date(b.date || b.created_at).getTime();
    return sortOrder === 'asc' ? timeA - timeB : timeB - timeA;
  });

  const handleDownloadTranscript = (e: React.MouseEvent, m: Meeting) => {
    e.stopPropagation();
    const blob = new Blob([m.raw_transcript], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = m.transcript_file_name || `${m.title.replace(/\s+/g, '_')}_transcript.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Page Header */}
      <div className={`rounded-2xl border p-6 sm:p-7 shadow-sm transition-all ${
        isLight
          ? 'bg-white border-violet-100 shadow-violet-100/30'
          : 'bg-slate-900/60 border-slate-800'
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-violet-100/80 text-violet-800 border border-violet-200">
              <Calendar className="w-3.5 h-3.5 text-violet-600" />
              <span>Chronological Transcript Repository</span>
            </div>
            <h1 className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${
              isLight ? 'text-slate-900' : 'text-white'
            }`}>
              All Meeting Transcripts & Media Links
            </h1>
            <p className={`text-xs sm:text-sm ${
              isLight ? 'text-slate-600' : 'text-slate-400'
            }`}>
              Diarized transcript turns arranged in date-wise order ({sortOrder === 'asc' ? 'Earliest to Latest (Ascending ↑)' : 'Latest to Earliest (Descending ↓)'}) with separate recording and document links.
            </p>
          </div>

          {/* Action: Process New Transcript */}
          <button
            onClick={onNewMeetingClick}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs sm:text-sm font-semibold shadow-md shadow-violet-600/25 transition-all self-start sm:self-auto cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Upload New Transcript</span>
          </button>
        </div>
      </div>

      {/* Control & Sorting Toolbar */}
      <div className={`p-4 rounded-xl border flex flex-col md:flex-row md:items-center justify-between gap-4 ${
        isLight
          ? 'bg-white border-violet-100 shadow-sm'
          : 'bg-slate-900/60 border-slate-800'
      }`}>
        {/* Search input */}
        <div className="flex items-center gap-3 flex-1">
          <div className="relative flex-1 max-w-sm">
            <Search className={`w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 ${
              isLight ? 'text-slate-400' : 'text-slate-500'
            }`} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search by topic, speaker, date, or quote..."
              className={`w-full pl-9 pr-3 py-1.5 rounded-lg text-xs transition-colors focus:outline-none focus:ring-1 focus:ring-violet-500 ${
                isLight
                  ? 'bg-slate-50 border border-slate-200 text-slate-800 placeholder-slate-400'
                  : 'bg-slate-950 border border-slate-800 text-slate-200 placeholder-slate-500'
              }`}
            />
          </div>

          {/* Tag Filter */}
          <select
            value={selectedTag}
            onChange={(e) => setSelectedTag(e.target.value)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium focus:outline-none focus:ring-1 focus:ring-violet-500 ${
              isLight
                ? 'bg-slate-50 border border-slate-200 text-slate-700'
                : 'bg-slate-950 border border-slate-800 text-slate-300'
            }`}
          >
            {allTags.map((t) => (
              <option key={t} value={t}>
                {t === 'All' ? 'All Tags' : `#${t}`}
              </option>
            ))}
          </select>
        </div>

        {/* Date Sorting Toggle & View toggle */}
        <div className="flex items-center gap-2.5">
          {/* Explicit Ascending / Descending Button */}
          <button
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            title="Toggle chronological date sorting"
            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors cursor-pointer ${
              isLight
                ? 'bg-violet-50 hover:bg-violet-100 text-violet-800 border-violet-200'
                : 'bg-slate-800 hover:bg-slate-700 text-violet-300 border-slate-700'
            }`}
          >
            <ArrowUpDown className="w-3.5 h-3.5 text-violet-600" />
            <span>Date: {sortOrder === 'asc' ? 'Oldest to Newest (Ascending ↑)' : 'Newest to Oldest (Descending ↓)'}</span>
          </button>

          {/* Layout Toggle */}
          <div className={`flex items-center p-1 rounded-lg border ${
            isLight ? 'bg-slate-100 border-slate-200' : 'bg-slate-950 border-slate-800'
          }`}>
            <button
              onClick={() => setViewLayout('cards')}
              className={`px-2.5 py-1 rounded text-xs font-semibold cursor-pointer ${
                viewLayout === 'cards'
                  ? 'bg-violet-600 text-white shadow-sm'
                  : isLight ? 'text-slate-600' : 'text-slate-400'
              }`}
            >
              Cards
            </button>
            <button
              onClick={() => setViewLayout('table')}
              className={`px-2.5 py-1 rounded text-xs font-semibold cursor-pointer ${
                viewLayout === 'table'
                  ? 'bg-violet-600 text-white shadow-sm'
                  : isLight ? 'text-slate-600' : 'text-slate-400'
              }`}
            >
              Table
            </button>
          </div>
        </div>
      </div>

      {/* Transcripts List */}
      {sortedMeetings.length === 0 ? (
        <div className={`p-12 text-center rounded-2xl border space-y-3 ${
          isLight ? 'bg-white border-violet-100 text-slate-600' : 'bg-slate-900/40 border-slate-800 text-slate-400'
        }`}>
          <FileText className="w-8 h-8 mx-auto text-violet-400" />
          <h3 className="font-bold text-sm text-slate-700 dark:text-slate-300">No transcripts found</h3>
          <p className="text-xs text-slate-500">Try clearing your search query or upload a new meeting transcript.</p>
        </div>
      ) : viewLayout === 'cards' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {sortedMeetings.map((meeting, index) => {
            const completedCount = meeting.action_items.filter((a) => a.status === 'completed').length;
            const openCount = meeting.action_items.length - completedCount;
            const avgConf = meeting.action_items.length > 0
              ? Math.round(
                  (meeting.action_items.reduce((acc, c) => acc + c.confidence_score, 0) / meeting.action_items.length) * 100
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
                  {/* Top: Chronological index & Date badge */}
                  <div className="flex items-center justify-between text-xs">
                    <span className="inline-flex items-center gap-1.5 font-bold px-2 py-0.5 rounded-md bg-violet-50 text-violet-700 border border-violet-200">
                      <Calendar className="w-3 h-3 text-violet-600" />
                      <span>{meeting.date}</span>
                    </span>

                    <div className="flex items-center gap-1.5">
                      <span className={`text-[11px] font-mono ${
                        isLight ? 'text-slate-500' : 'text-slate-400'
                      }`}>
                        #{index + 1}
                      </span>
                      <button
                        onClick={(e) => onDeleteMeeting(meeting.id, e)}
                        title="Delete transcript"
                        className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-rose-50 hover:text-rose-600 text-slate-400 transition-all"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className={`font-bold text-base leading-snug line-clamp-1 transition-colors ${
                    isLight ? 'text-slate-900 group-hover:text-violet-600' : 'text-white group-hover:text-violet-300'
                  }`}>
                    {meeting.title}
                  </h3>

                  {/* Summary */}
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
                          onClick={(e) => handleDownloadTranscript(e, meeting)}
                          className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded border border-purple-200 text-purple-700 hover:bg-purple-50 text-[10px] font-bold cursor-pointer"
                          title="Download raw timestamped transcript file"
                        >
                          <Download className="w-2.5 h-2.5" />
                          <span>.{meeting.transcript_format || 'txt'}</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Tags */}
                  {meeting.tags && (
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

                {/* Bottom Stats */}
                <div className={`mt-4 pt-3 border-t space-y-2.5 ${
                  isLight ? 'border-slate-100' : 'border-slate-800'
                }`}>
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className={`font-semibold ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>
                        {meeting.action_items.length} Tasks
                      </span>
                      <span className="text-[11px] text-amber-600 font-medium">({openCount} open)</span>
                    </div>

                    <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                      {avgConf}% Conf
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className={`flex items-center gap-1 text-[11px] truncate max-w-[170px] ${
                      isLight ? 'text-slate-500' : 'text-slate-400'
                    }`}>
                      <Users className="w-3 h-3 text-slate-400" />
                      <span>{meeting.participants.join(', ')}</span>
                    </span>

                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-violet-600 group-hover:translate-x-0.5 transition-transform">
                      <span>View Dialogue</span>
                      <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Table Layout */
        <div className={`rounded-xl border overflow-hidden ${
          isLight ? 'bg-white border-violet-100 shadow-sm' : 'bg-slate-900 border-slate-800'
        }`}>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className={`border-b font-semibold uppercase tracking-wider ${
                isLight ? 'bg-violet-50/70 text-violet-900 border-violet-100' : 'bg-slate-950 text-slate-400 border-slate-800'
              }`}>
                <tr>
                  <th className="py-3 px-4">Date (Date-Wise Ascending)</th>
                  <th className="py-3 px-4">Meeting Title</th>
                  <th className="py-3 px-4">Recording Link</th>
                  <th className="py-3 px-4">Transcript Source</th>
                  <th className="py-3 px-4">Duration</th>
                  <th className="py-3 px-4">Tasks</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isLight ? 'divide-slate-100 text-slate-700' : 'divide-slate-800 text-slate-300'}`}>
                {sortedMeetings.map((m) => (
                  <tr
                    key={m.id}
                    onClick={() => onSelectMeeting(m)}
                    className={`cursor-pointer transition-colors ${
                      isLight ? 'hover:bg-violet-50/40' : 'hover:bg-slate-800/40'
                    }`}
                  >
                    <td className="py-3 px-4 whitespace-nowrap font-bold text-violet-600">
                      {m.date}
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-900 max-w-xs truncate">
                      {m.title}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      {m.recording_url ? (
                        <a
                          href={m.recording_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-violet-100 text-violet-800 font-bold hover:bg-violet-200"
                        >
                          <Play className="w-2.5 h-2.5 fill-violet-700" />
                          <span>Watch</span>
                          <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      ) : (
                        <span className="text-slate-400 text-[11px]">Synced Audio</span>
                      )}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        {m.transcript_url && (
                          <a
                            href={m.transcript_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-purple-100 text-purple-800 font-semibold"
                          >
                            <FileText className="w-2.5 h-2.5" />
                            <span>Doc</span>
                          </a>
                        )}
                        <button
                          onClick={(e) => handleDownloadTranscript(e, m)}
                          className="px-1.5 py-0.5 rounded border border-purple-200 text-purple-700 hover:bg-purple-50 font-mono text-[10px]"
                        >
                          .{m.transcript_format || 'txt'}
                        </button>
                      </div>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      {m.duration_minutes}m
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded bg-violet-50 text-violet-700 font-bold text-[11px]">
                        {m.action_items.length} Items
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectMeeting(m);
                        }}
                        className="px-2.5 py-1 rounded bg-violet-600 hover:bg-violet-500 text-white font-semibold text-xs cursor-pointer shadow-xs"
                      >
                        Open Workspace
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
