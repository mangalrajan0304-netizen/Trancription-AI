import React, { useState, useEffect } from 'react';
import {
  Activity,
  AlertTriangle,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Calendar,
  CheckCircle2,
  Clock,
  Download,
  FileSpreadsheet,
  FileText,
  Grid,
  Layers,
  List,
  MessageSquare,
  Plus,
  Share2,
  Sparkles,
  Users,
} from 'lucide-react';
import { Meeting, ActionItem, TranscriptSegment, DuplicateSuggestion } from '../types.js';
import { ActionItemsWorkspace } from './ActionItemsWorkspace.js';
import { SmartTranscriptExplorer } from './SmartTranscriptExplorer.js';
import { ExecutiveSummaryTab } from './ExecutiveSummaryTab.js';
import { MeetingMediaLinksBar } from './MeetingMediaLinksBar.js';
import { ExportModal } from './ExportModal.js';
import { MergeModal } from './MergeModal.js';

interface MeetingWorkspaceProps {
  meeting: Meeting;
  allMeetings?: Meeting[];
  onSelectMeeting?: (meeting: Meeting) => void;
  onBack: () => void;
  onUpdateItem: (itemId: string, updates: Partial<ActionItem>) => Promise<void>;
  onAddItem: (item: Omit<ActionItem, 'id' | 'meeting_id'>) => Promise<void>;
  onDeleteItem: (itemId: string) => Promise<void>;
  onMergeItems: (primaryId: string, duplicateId: string, mergedDescription?: string) => Promise<void>;
  onUpdateMeetingLinks?: (updates: {
    meeting_link?: string;
    meeting_platform?: 'google_meet' | 'zoom' | 'teams' | 'webex' | 'custom';
    recording_url?: string;
    recording_passcode?: string;
    transcript_url?: string;
    transcript_file_name?: string;
  }) => Promise<void>;
  onShowToast: (msg: string, type?: 'success' | 'info') => void;
  isLight: boolean;
}

export const MeetingWorkspace: React.FC<MeetingWorkspaceProps> = ({
  meeting,
  allMeetings = [],
  onSelectMeeting,
  onBack,
  onUpdateItem,
  onAddItem,
  onDeleteItem,
  onMergeItems,
  onUpdateMeetingLinks,
  onShowToast,
  isLight,
}) => {
  const [activeTab, setActiveTab] = useState<'tasks' | 'transcript' | 'summary'>('tasks');
  const [activeSegmentId, setActiveSegmentId] = useState<string | undefined>();
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isMergeOpen, setIsMergeOpen] = useState(false);
  const [duplicates, setDuplicates] = useState<DuplicateSuggestion[]>([]);

  // Find index for Next / Previous pagination in chronological date sequence
  const currentMeetingIndex = allMeetings.findIndex((m) => m.id === meeting.id);
  const prevMeeting = currentMeetingIndex > 0 ? allMeetings[currentMeetingIndex - 1] : null;
  const nextMeeting = currentMeetingIndex >= 0 && currentMeetingIndex < allMeetings.length - 1 ? allMeetings[currentMeetingIndex + 1] : null;

  // Fetch duplicates for this meeting
  useEffect(() => {
    fetch(`/api/meetings/${meeting.id}/duplicates`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setDuplicates(data);
      })
      .catch((err) => console.error('Error fetching duplicates:', err));
  }, [meeting.id, meeting.action_items.length]);

  const handleSelectSegmentFromTask = (segmentId?: string) => {
    if (segmentId) {
      setActiveSegmentId(segmentId);
      setActiveTab('transcript');
      onShowToast('Navigated to quote in transcript timeline', 'info');
    }
  };

  const handleCreateTaskFromSegment = (segment: TranscriptSegment) => {
    onAddItem({
      task_description: `Follow up: "${segment.text.slice(0, 60)}..."`,
      owner: segment.speaker || 'Unassigned',
      deadline: 'TBD',
      priority: 'medium',
      status: 'pending',
      confidence_score: 0.95,
      confidence_level: 'high',
      source_segment_id: segment.id,
      source_quote: segment.text,
      tags: ['Manual'],
    });
    onShowToast('Action item created from dialogue turn', 'success');
  };

  const pendingCount = meeting.action_items.filter((i) => i.status === 'pending').length;
  const inProgressCount = meeting.action_items.filter((i) => i.status === 'in_progress').length;
  const completedCount = meeting.action_items.filter((i) => i.status === 'completed').length;
  const avgConfidence =
    meeting.action_items.length > 0
      ? Math.round(
          (meeting.action_items.reduce((acc, c) => acc + c.confidence_score, 0) /
            meeting.action_items.length) *
            100
        )
      : 88;

  return (
    <div className="space-y-6 pb-20">
      {/* Top Navigation Bar: Back, Next/Prev Pagination, Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className={`inline-flex items-center gap-2 text-xs font-bold transition-colors group cursor-pointer ${
              isLight ? 'text-slate-600 hover:text-violet-600' : 'text-slate-400 hover:text-white'
            }`}
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span>Back to Transcripts</span>
          </button>

          {/* Next / Previous Meeting Navigation Buttons */}
          {allMeetings.length > 1 && onSelectMeeting && (
            <div className={`hidden md:flex items-center gap-1 pl-3 border-l ${
              isLight ? 'border-slate-200' : 'border-slate-800'
            }`}>
              <button
                disabled={!prevMeeting}
                onClick={() => prevMeeting && onSelectMeeting(prevMeeting)}
                title={prevMeeting ? `Previous: ${prevMeeting.title}` : 'No previous meeting'}
                className={`p-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1 transition-all ${
                  prevMeeting
                    ? isLight
                      ? 'bg-white hover:bg-violet-50 text-slate-700 hover:text-violet-700 border-slate-200 cursor-pointer'
                      : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-800 cursor-pointer'
                    : 'opacity-40 cursor-not-allowed border-transparent text-slate-400'
                }`}
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Prev</span>
              </button>

              <span className={`text-[11px] font-mono px-1.5 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                {currentMeetingIndex + 1} of {allMeetings.length}
              </span>

              <button
                disabled={!nextMeeting}
                onClick={() => nextMeeting && onSelectMeeting(nextMeeting)}
                title={nextMeeting ? `Next: ${nextMeeting.title}` : 'No next meeting'}
                className={`p-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1 transition-all ${
                  nextMeeting
                    ? isLight
                      ? 'bg-white hover:bg-violet-50 text-slate-700 hover:text-violet-700 border-slate-200 cursor-pointer'
                      : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-800 cursor-pointer'
                    : 'opacity-40 cursor-not-allowed border-transparent text-slate-400'
                }`}
              >
                <span>Next</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* Action Buttons: Export & Merge */}
        <div className="flex items-center gap-2.5">
          {duplicates.length > 0 && (
            <button
              onClick={() => setIsMergeOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-xs font-bold transition-all cursor-pointer"
            >
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
              <span>Merge Duplicates ({duplicates.length})</span>
            </button>
          )}

          <button
            onClick={() => setIsExportOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold shadow-md shadow-violet-600/30 transition-all cursor-pointer"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Magic Export</span>
          </button>
        </div>
      </div>

      {/* Meeting Header Card */}
      <div className={`rounded-2xl border p-6 sm:p-7 space-y-4 shadow-sm transition-all ${
        isLight
          ? 'bg-white border-slate-200 shadow-slate-100'
          : 'bg-gradient-to-b from-slate-900/90 to-slate-950 border-slate-800'
      }`}>
        <div className="space-y-2">
          {/* Metadata badges */}
          <div className="flex items-center gap-3 flex-wrap text-xs">
            <span className="flex items-center gap-1.5 font-bold text-violet-700 bg-violet-50 border border-violet-200 px-2.5 py-0.5 rounded-md">
              <Calendar className="w-3.5 h-3.5 text-violet-600" />
              <span>{meeting.date}</span>
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5 font-medium text-slate-500">
              <Clock className="w-3.5 h-3.5 text-violet-500" />
              <span>{meeting.duration_minutes} Minutes</span>
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5 font-medium text-slate-500">
              <Users className="w-3.5 h-3.5 text-emerald-500" />
              <span>{meeting.participants.length} Participants</span>
            </span>
            <span>•</span>
            <span className="text-emerald-700 font-bold bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
              {avgConfidence}% AI Confidence
            </span>
          </div>

          {/* Title */}
          <h1 className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${
            isLight ? 'text-slate-900' : 'text-white'
          }`}>
            {meeting.title}
          </h1>

          {/* Summary */}
          <p className={`text-xs sm:text-sm max-w-4xl leading-relaxed ${
            isLight ? 'text-slate-600' : 'text-slate-300'
          }`}>
            {meeting.summary}
          </p>

          {/* Tags */}
          {meeting.tags && meeting.tags.length > 0 && (
            <div className="flex items-center gap-2 pt-1 flex-wrap">
              {meeting.tags.map((tag) => (
                <span
                  key={tag}
                  className={`px-2.5 py-0.5 rounded text-[11px] font-medium border ${
                    isLight
                      ? 'bg-slate-100 text-slate-700 border-slate-200'
                      : 'bg-slate-800 text-slate-300 border-slate-700/60'
                  }`}
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Quick Task Stats Pills */}
        <div className={`flex items-center gap-3 pt-3 border-t text-xs ${
          isLight ? 'border-slate-100 text-slate-700' : 'border-slate-800 text-slate-200'
        }`}>
          <div className="flex items-center gap-1.5 font-bold">
            <span>{meeting.action_items.length} Action Items:</span>
          </div>
          <span className={`px-2 py-0.5 rounded font-semibold ${
            isLight ? 'bg-slate-100 text-slate-700' : 'bg-slate-800 text-slate-300'
          }`}>
            {pendingCount} To Do
          </span>
          <span className="px-2 py-0.5 rounded bg-violet-50 text-violet-700 font-semibold border border-violet-200">
            {inProgressCount} In Progress
          </span>
          <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200">
            {completedCount} Completed
          </span>
        </div>
      </div>

      {/* ================= MEETING RECORDING & SEPARATE TRANSCRIPT LINKS SECTION ================= */}
      {/* Prominently features the separated Recording & Transcripts links as requested */}
      <MeetingMediaLinksBar
        meeting={meeting}
        isLight={isLight}
        onUpdateMeetingLinks={onUpdateMeetingLinks || (async () => {})}
        onShowToast={onShowToast}
      />

      {/* 3 Workspace Tabs Switcher */}
      <div className={`flex items-center gap-2 border-b pb-px ${
        isLight ? 'border-slate-200' : 'border-slate-800'
      }`}>
        <button
          onClick={() => setActiveTab('tasks')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer ${
            activeTab === 'tasks'
              ? 'border-violet-600 text-violet-700 bg-white shadow-xs'
              : isLight
              ? 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100'
              : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/30'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Action Items Workspace</span>
          <span className={`ml-1 px-1.5 py-0.2 rounded-full text-[11px] font-bold ${
            isLight ? 'bg-violet-100 text-violet-800' : 'bg-slate-800 text-slate-300'
          }`}>
            {meeting.action_items.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('transcript')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer ${
            activeTab === 'transcript'
              ? 'border-violet-600 text-violet-700 bg-white shadow-xs'
              : isLight
              ? 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100'
              : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/30'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>Smart Transcript Explorer</span>
          <span className={`ml-1 px-1.5 py-0.2 rounded-full text-[11px] font-bold ${
            isLight ? 'bg-violet-100 text-violet-800' : 'bg-slate-800 text-slate-300'
          }`}>
            {meeting.segments.length} turns
          </span>
        </button>

        <button
          onClick={() => setActiveTab('summary')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer ${
            activeTab === 'summary'
              ? 'border-violet-600 text-violet-700 bg-white shadow-xs'
              : isLight
              ? 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100'
              : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/30'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>AI Executive Summary</span>
        </button>
      </div>

      {/* Active Tab Views */}
      <div>
        {activeTab === 'tasks' && (
          <ActionItemsWorkspace
            meeting={meeting}
            onUpdateItem={onUpdateItem}
            onAddItem={onAddItem}
            onDeleteItem={onDeleteItem}
            onSelectSegment={handleSelectSegmentFromTask}
            duplicates={duplicates}
            onOpenMergeModal={() => setIsMergeOpen(true)}
          />
        )}

        {activeTab === 'transcript' && (
          <SmartTranscriptExplorer
            meeting={meeting}
            activeSegmentId={activeSegmentId}
            onSelectActionItem={() => setActiveTab('tasks')}
            onCreateItemFromSegment={handleCreateTaskFromSegment}
          />
        )}

        {activeTab === 'summary' && <ExecutiveSummaryTab meeting={meeting} />}
      </div>

      {/* Export & Webhook Modal */}
      <ExportModal
        meeting={meeting}
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        onShowToast={onShowToast}
      />

      {/* Duplicates Merge Modal */}
      <MergeModal
        meeting={meeting}
        duplicates={duplicates}
        isOpen={isMergeOpen}
        onClose={() => setIsMergeOpen(false)}
        onMerge={onMergeItems}
        onShowToast={onShowToast}
      />
    </div>
  );
};
