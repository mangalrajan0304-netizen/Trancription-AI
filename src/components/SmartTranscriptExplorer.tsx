import React, { useState, useEffect, useRef } from 'react';
import {
  CheckCircle,
  Clock,
  ExternalLink,
  MessageSquare,
  Plus,
  Quote,
  Search,
  Sparkles,
  User,
} from 'lucide-react';
import { Meeting, TranscriptSegment, ActionItem } from '../types.js';
import { ConfidenceHeatmapBadge } from './ConfidenceHeatmapBadge.js';

interface SmartTranscriptExplorerProps {
  meeting: Meeting;
  activeSegmentId?: string;
  onSelectActionItem: (actionId: string) => void;
  onCreateItemFromSegment: (segment: TranscriptSegment) => void;
}

// Generate deterministic avatar color based on speaker name
function getSpeakerColor(name: string): { bg: string; text: string; border: string } {
  const colors = [
    { bg: 'bg-violet-500/15', text: 'text-violet-400', border: 'border-violet-500/30' },
    { bg: 'bg-emerald-500/15', text: 'text-emerald-400', border: 'border-emerald-500/30' },
    { bg: 'bg-sky-500/15', text: 'text-sky-400', border: 'border-sky-500/30' },
    { bg: 'bg-purple-500/15', text: 'text-purple-400', border: 'border-purple-500/30' },
    { bg: 'bg-amber-500/15', text: 'text-amber-400', border: 'border-amber-500/30' },
    { bg: 'bg-rose-500/15', text: 'text-rose-400', border: 'border-rose-500/30' },
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

export const SmartTranscriptExplorer: React.FC<SmartTranscriptExplorerProps> = ({
  meeting,
  activeSegmentId,
  onSelectActionItem,
  onCreateItemFromSegment,
}) => {
  const [searchWord, setSearchWord] = useState('');
  const [selectedSpeaker, setSelectedSpeaker] = useState('All');
  const [focusedSegmentId, setFocusedSegmentId] = useState<string | undefined>(activeSegmentId);

  const segmentRefs = useRef<Record<string, HTMLDivElement | null>>({});

  useEffect(() => {
    if (activeSegmentId) {
      setFocusedSegmentId(activeSegmentId);
      const el = segmentRefs.current[activeSegmentId];
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [activeSegmentId]);

  const allSpeakers = ['All', ...meeting.participants];

  // Action item lookup
  const actionItemsMap = new Map<string, ActionItem>();
  meeting.action_items.forEach((item) => {
    actionItemsMap.set(item.id, item);
  });

  const filteredSegments = meeting.segments.filter((seg) => {
    if (selectedSpeaker !== 'All' && seg.speaker !== selectedSpeaker) return false;
    if (searchWord && !seg.text.toLowerCase().includes(searchWord.toLowerCase())) return false;
    return true;
  });

  // Calculate focused segment's linked action items
  const focusedSegment = meeting.segments.find((s) => s.id === focusedSegmentId);
  const linkedItems: ActionItem[] = [];
  if (focusedSegment && focusedSegment.action_item_ids) {
    focusedSegment.action_item_ids.forEach((id) => {
      const item = actionItemsMap.get(id);
      if (item) linkedItems.push(item);
    });
  }

  return (
    <div className="space-y-6">
      {/* Search and Speaker Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 rounded-xl bg-slate-900/60 border border-slate-800">
        <div className="flex items-center gap-3 w-full sm:w-auto flex-1">
          <div className="relative flex-1 sm:max-w-xs">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchWord}
              onChange={(e) => setSearchWord(e.target.value)}
              placeholder="Search in transcript dialogue..."
              className="w-full pl-9 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-violet-500"
            />
          </div>

          <select
            value={selectedSpeaker}
            onChange={(e) => setSelectedSpeaker(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-300 focus:outline-none focus:border-violet-500"
          >
            {allSpeakers.map((spk) => (
              <option key={spk} value={spk}>
                {spk === 'All' ? 'All Speakers' : spk}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <span>Click any sentence with an action badge to inspect source tasks</span>
        </div>
      </div>

      {/* Main 2-Column Split: Transcript Chat on Left, Linked Task Inspector on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Diarized Timeline (Left 8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          {filteredSegments.length === 0 ? (
            <div className="p-12 text-center rounded-xl border border-slate-800 bg-slate-900/30 text-xs text-slate-400">
              No transcript dialogue matches your search.
            </div>
          ) : (
            filteredSegments.map((seg, idx) => {
              const isFocused = focusedSegmentId === seg.id;
              const hasActions = seg.action_item_ids && seg.action_item_ids.length > 0;
              const speakerStyle = getSpeakerColor(seg.speaker);

              return (
                <div
                  key={seg.id}
                  ref={(el) => {
                    segmentRefs.current[seg.id] = el;
                  }}
                  onClick={() => setFocusedSegmentId(seg.id)}
                  className={`group relative rounded-xl border p-4 transition-all cursor-pointer ${
                    isFocused
                      ? 'bg-violet-950/20 border-violet-500/60 shadow-lg shadow-violet-500/10 ring-1 ring-violet-500/40'
                      : hasActions
                      ? 'bg-slate-900/70 border-slate-800 hover:border-slate-700'
                      : 'bg-slate-900/40 border-slate-800/80 hover:border-slate-700'
                  }`}
                >
                  {/* Speaker Header */}
                  <div className="flex items-center justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2.5">
                      {/* Avatar initial */}
                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs border ${speakerStyle.bg} ${speakerStyle.text} ${speakerStyle.border}`}
                      >
                        {seg.speaker.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-semibold text-xs text-slate-200">{seg.speaker}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="flex items-center gap-1 font-mono text-[11px] text-slate-400">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span>{seg.timestamp}</span>
                      </span>

                      {/* Action items badge if derived */}
                      {hasActions && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-violet-500/20 text-violet-300 border border-violet-500/40 animate-pulse-glow">
                          <Sparkles className="w-3 h-3 text-violet-400" />
                          <span>
                            {seg.action_item_ids!.length} Action{' '}
                            {seg.action_item_ids!.length === 1 ? 'Item' : 'Items'}
                          </span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Speech dialogue */}
                  <p className="text-xs sm:text-sm text-slate-200 leading-relaxed pl-9">
                    {seg.text}
                  </p>

                  {/* Hover action to create task */}
                  <div className="mt-2 pl-9 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onCreateItemFromSegment(seg);
                      }}
                      className="inline-flex items-center gap-1 text-[11px] text-slate-400 hover:text-violet-300 font-medium"
                    >
                      <Plus className="w-3 h-3 text-violet-400" />
                      <span>Extract manual task from this quote</span>
                    </button>
                    <span className="text-[10px] text-slate-500">Turn #{idx + 1}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Right Inspector: Linked Action Items & Sentence Context (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="sticky top-24 rounded-xl border border-slate-800 bg-slate-900/70 p-5 space-y-4 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-300 flex items-center gap-2">
                <Quote className="w-3.5 h-3.5 text-violet-400" />
                <span>Selected Dialogue Inspector</span>
              </h3>
              {focusedSegment && (
                <span className="text-[11px] font-mono text-slate-400">{focusedSegment.timestamp}</span>
              )}
            </div>

            {focusedSegment ? (
              <div className="space-y-4">
                {/* Speaker Quote box */}
                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1.5">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-semibold text-violet-300">{focusedSegment.speaker}</span>
                  </div>
                  <p className="text-xs text-slate-300 italic leading-relaxed">
                    &ldquo;{focusedSegment.text}&rdquo;
                  </p>
                </div>

                {/* Associated Action Items */}
                <div className="space-y-2.5">
                  <h4 className="text-xs font-bold text-slate-300 flex items-center justify-between">
                    <span>Derived Action Items</span>
                    <span className="text-[11px] font-semibold text-violet-400">
                      {linkedItems.length} found
                    </span>
                  </h4>

                  {linkedItems.length === 0 ? (
                    <div className="p-4 rounded-lg bg-slate-950/40 border border-slate-800/80 text-center space-y-2">
                      <p className="text-xs text-slate-400">
                        No action items were automatically extracted from this specific sentence.
                      </p>
                      <button
                        onClick={() => onCreateItemFromSegment(focusedSegment)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-violet-600/20 hover:bg-violet-600 text-violet-300 hover:text-white text-xs font-semibold transition-all"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Create Task from Quote</span>
                      </button>
                    </div>
                  ) : (
                    linkedItems.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => onSelectActionItem(item.id)}
                        className="p-3 rounded-lg bg-slate-950 border border-slate-800 hover:border-violet-500/50 transition-all cursor-pointer space-y-2 shadow-sm"
                      >
                        <div className="flex items-center justify-between gap-1">
                          <span
                            className={`px-1.5 py-0.2 rounded text-[10px] font-bold uppercase ${
                              item.priority === 'high'
                                ? 'bg-rose-500/10 text-rose-400'
                                : 'bg-slate-800 text-slate-400'
                            }`}
                          >
                            {item.priority}
                          </span>
                          <ConfidenceHeatmapBadge
                            score={item.confidence_score}
                            isAmbiguousDeadline={item.is_ambiguous_deadline}
                            isUnassignedOwner={item.is_unassigned_owner}
                            showDetails={false}
                          />
                        </div>

                        <p className="text-xs font-semibold text-slate-200 line-clamp-2">
                          {item.task_description}
                        </p>

                        <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-800/60">
                          <span className="truncate max-w-[100px]">Owner: {item.owner}</span>
                          <span>Due: {item.deadline}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            ) : (
              <div className="py-8 text-center text-xs text-slate-400">
                Click any dialogue turn on the left to examine its extracted action items and source context.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
