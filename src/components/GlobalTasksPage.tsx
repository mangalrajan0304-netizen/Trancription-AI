import React, { useState } from 'react';
import {
  AlertCircle,
  ArrowRight,
  Calendar,
  CheckCircle2,
  Clock,
  ExternalLink,
  Filter,
  Grid,
  Layers,
  List,
  Search,
  User,
} from 'lucide-react';
import { ActionItem, Meeting, Priority, TaskStatus } from '../types.js';
import { ConfidenceHeatmapBadge } from './ConfidenceHeatmapBadge.js';

interface GlobalTasksPageProps {
  meetings: Meeting[];
  onUpdateItem: (meetingId: string, itemId: string, updates: Partial<ActionItem>) => Promise<void>;
  onSelectMeeting: (meeting: Meeting) => void;
  isLight: boolean;
}

export const GlobalTasksPage: React.FC<GlobalTasksPageProps> = ({
  meetings,
  onUpdateItem,
  onSelectMeeting,
  isLight,
}) => {
  const [viewMode, setViewMode] = useState<'kanban' | 'table'>('kanban');
  const [search, setSearch] = useState('');
  const [selectedMeetingId, setSelectedMeetingId] = useState('All');
  const [selectedOwner, setSelectedOwner] = useState('All');
  const [selectedPriority, setSelectedPriority] = useState('All');
  const [onlyRisk, setOnlyRisk] = useState(false);

  // Flatten all action items with meeting reference
  const allTasks = meetings.flatMap((m) =>
    m.action_items.map((item) => ({
      ...item,
      meeting_title: m.title,
      meeting_date: m.date,
      meeting_obj: m,
    }))
  );

  const allOwners = ['All', 'Unassigned', ...Array.from(new Set(allTasks.map((t) => t.owner).filter((o) => o !== 'Unassigned')))];

  const filteredTasks = allTasks.filter((t) => {
    if (search) {
      const q = search.toLowerCase();
      const match =
        t.task_description.toLowerCase().includes(q) ||
        t.owner.toLowerCase().includes(q) ||
        t.meeting_title.toLowerCase().includes(q);
      if (!match) return false;
    }
    if (selectedMeetingId !== 'All' && t.meeting_id !== selectedMeetingId) return false;
    if (selectedOwner !== 'All' && t.owner.toLowerCase() !== selectedOwner.toLowerCase()) return false;
    if (selectedPriority !== 'All' && t.priority !== selectedPriority) return false;
    if (onlyRisk && !t.is_unassigned_owner && !t.is_ambiguous_deadline && !t.risk_reason) return false;
    return true;
  });

  const pending = filteredTasks.filter((t) => t.status === 'pending');
  const inProgress = filteredTasks.filter((t) => t.status === 'in_progress');
  const completed = filteredTasks.filter((t) => t.status === 'completed');

  return (
    <div className="space-y-6 pb-20">
      {/* Page Header */}
      <div className={`rounded-2xl border p-6 sm:p-7 shadow-sm transition-all ${
        isLight
          ? 'bg-white border-slate-200 shadow-slate-100'
          : 'bg-slate-900/60 border-slate-800'
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-700 border border-emerald-500/20">
              <Layers className="w-3.5 h-3.5 text-emerald-600" />
              <span>Unified Cross-Meeting Task Board</span>
            </div>
            <h1 className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${
              isLight ? 'text-slate-900' : 'text-white'
            }`}>
              All Action Items & Deliverables
            </h1>
            <p className={`text-xs sm:text-sm ${
              isLight ? 'text-slate-600' : 'text-slate-400'
            }`}>
              Managing {allTasks.length} total commitments across {meetings.length} meeting transcripts.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl border flex items-center gap-3 text-xs ${
              isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800'
            }`}>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-bold">Total</span>
                <span className={`font-extrabold text-base ${isLight ? 'text-slate-900' : 'text-white'}`}>{allTasks.length}</span>
              </div>
              <div className="h-6 w-px bg-slate-300 dark:bg-slate-800" />
              <div>
                <span className="text-amber-500 block text-[10px] uppercase font-bold">Active</span>
                <span className="font-extrabold text-base text-amber-600">{pending.length + inProgress.length}</span>
              </div>
              <div className="h-6 w-px bg-slate-300 dark:bg-slate-800" />
              <div>
                <span className="text-emerald-500 block text-[10px] uppercase font-bold">Done</span>
                <span className="font-extrabold text-base text-emerald-600">{completed.length}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Control Bar */}
      <div className={`p-4 rounded-xl border flex flex-col lg:flex-row lg:items-center justify-between gap-4 ${
        isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-900/60 border-slate-800'
      }`}>
        <div className="flex flex-wrap items-center gap-3 flex-1">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className={`w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 ${
              isLight ? 'text-slate-400' : 'text-slate-500'
            }`} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search tasks, assignees, or meetings..."
              className={`w-full pl-9 pr-3 py-1.5 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-violet-500 ${
                isLight
                  ? 'bg-slate-50 border border-slate-300 text-slate-800 placeholder-slate-400'
                  : 'bg-slate-950 border border-slate-800 text-slate-200 placeholder-slate-500'
              }`}
            />
          </div>

          {/* Meeting dropdown */}
          <select
            value={selectedMeetingId}
            onChange={(e) => setSelectedMeetingId(e.target.value)}
            className={`px-3 py-1.5 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-violet-500 ${
              isLight ? 'bg-slate-50 border border-slate-300 text-slate-700' : 'bg-slate-950 border border-slate-800 text-slate-300'
            }`}
          >
            <option value="All">All Meetings ({meetings.length})</option>
            {meetings.map((m) => (
              <option key={m.id} value={m.id}>
                {m.title}
              </option>
            ))}
          </select>

          {/* Owner dropdown */}
          <select
            value={selectedOwner}
            onChange={(e) => setSelectedOwner(e.target.value)}
            className={`px-3 py-1.5 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-violet-500 ${
              isLight ? 'bg-slate-50 border border-slate-300 text-slate-700' : 'bg-slate-950 border border-slate-800 text-slate-300'
            }`}
          >
            {allOwners.map((o) => (
              <option key={o} value={o}>
                {o === 'All' ? 'All Owners' : o}
              </option>
            ))}
          </select>

          {/* Priority dropdown */}
          <select
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
            className={`px-3 py-1.5 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-violet-500 ${
              isLight ? 'bg-slate-50 border border-slate-300 text-slate-700' : 'bg-slate-950 border border-slate-800 text-slate-300'
            }`}
          >
            <option value="All">All Priorities</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>

          {/* Needs Attention filter */}
          <button
            onClick={() => setOnlyRisk(!onlyRisk)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
              onlyRisk
                ? 'bg-amber-100 text-amber-900 border-amber-300'
                : isLight ? 'bg-slate-50 text-slate-600 border-slate-300' : 'bg-slate-950 text-slate-400 border-slate-800'
            }`}
          >
            <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
            <span>Needs Attention</span>
          </button>
        </div>

        {/* View Mode Toggle */}
        <div className={`flex items-center p-1 rounded-lg border self-end lg:self-auto ${
          isLight ? 'bg-slate-100 border-slate-200' : 'bg-slate-950 border-slate-800'
        }`}>
          <button
            onClick={() => setViewMode('kanban')}
            className={`p-1.5 rounded text-xs font-semibold flex items-center gap-1.5 ${
              viewMode === 'kanban'
                ? 'bg-violet-600 text-white shadow-sm'
                : isLight ? 'text-slate-600' : 'text-slate-400'
            }`}
          >
            <Grid className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Kanban</span>
          </button>
          <button
            onClick={() => setViewMode('table')}
            className={`p-1.5 rounded text-xs font-semibold flex items-center gap-1.5 ${
              viewMode === 'table'
                ? 'bg-violet-600 text-white shadow-sm'
                : isLight ? 'text-slate-600' : 'text-slate-400'
            }`}
          >
            <List className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Table</span>
          </button>
        </div>
      </div>

      {/* Main Task Matrix Content */}
      {viewMode === 'kanban' ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Pending Column */}
          <div className="space-y-3">
            <div className={`flex items-center justify-between pb-2 border-b ${isLight ? 'border-slate-200' : 'border-slate-800'}`}>
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-slate-400" />
                <h3 className={`font-bold text-xs uppercase tracking-wider ${isLight ? 'text-slate-800' : 'text-slate-300'}`}>
                  To Do ({pending.length})
                </h3>
              </div>
            </div>
            <div className="space-y-3">
              {pending.map((item) => renderGlobalCard(item))}
            </div>
          </div>

          {/* In Progress Column */}
          <div className="space-y-3">
            <div className={`flex items-center justify-between pb-2 border-b ${isLight ? 'border-slate-200' : 'border-slate-800'}`}>
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-violet-500 animate-pulse" />
                <h3 className={`font-bold text-xs uppercase tracking-wider ${isLight ? 'text-violet-800' : 'text-violet-300'}`}>
                  In Progress ({inProgress.length})
                </h3>
              </div>
            </div>
            <div className="space-y-3">
              {inProgress.map((item) => renderGlobalCard(item))}
            </div>
          </div>

          {/* Completed Column */}
          <div className="space-y-3">
            <div className={`flex items-center justify-between pb-2 border-b ${isLight ? 'border-slate-200' : 'border-slate-800'}`}>
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <h3 className={`font-bold text-xs uppercase tracking-wider ${isLight ? 'text-emerald-800' : 'text-emerald-300'}`}>
                  Completed ({completed.length})
                </h3>
              </div>
            </div>
            <div className="space-y-3">
              {completed.map((item) => renderGlobalCard(item))}
            </div>
          </div>
        </div>
      ) : (
        /* Table View */
        <div className={`rounded-xl border overflow-hidden ${
          isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-900 border-slate-800'
        }`}>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className={`border-b font-semibold uppercase tracking-wider ${
                isLight ? 'bg-slate-50 text-slate-600 border-slate-200' : 'bg-slate-950 text-slate-400 border-slate-800'
              }`}>
                <tr>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Task Description</th>
                  <th className="py-3 px-4">Meeting Reference</th>
                  <th className="py-3 px-4">Owner</th>
                  <th className="py-3 px-4">Deadline</th>
                  <th className="py-3 px-4">Priority</th>
                  <th className="py-3 px-4">Confidence</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isLight ? 'divide-slate-100 text-slate-700' : 'divide-slate-800 text-slate-300'}`}>
                {filteredTasks.map((t) => (
                  <tr key={t.id} className={isLight ? 'hover:bg-slate-50' : 'hover:bg-slate-800/40'}>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <select
                        value={t.status}
                        onChange={(e) => onUpdateItem(t.meeting_id, t.id, { status: e.target.value as TaskStatus })}
                        className={`px-2 py-0.5 rounded text-xs font-semibold border ${
                          t.status === 'completed'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : t.status === 'in_progress'
                            ? 'bg-violet-50 text-violet-700 border-violet-200'
                            : 'bg-slate-100 text-slate-700 border-slate-200'
                        }`}
                      >
                        <option value="pending">To Do</option>
                        <option value="in_progress">In Progress</option>
                        <option value="completed">Completed</option>
                      </select>
                    </td>
                    <td className="py-3 px-4 max-w-sm font-medium">
                      {t.task_description}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <button
                        onClick={() => onSelectMeeting(t.meeting_obj)}
                        className="text-violet-600 hover:underline flex items-center gap-1 font-semibold"
                      >
                        <span className="truncate max-w-[140px]">{t.meeting_title}</span>
                        <ExternalLink className="w-3 h-3 shrink-0" />
                      </button>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded ${
                        t.is_unassigned_owner ? 'bg-amber-50 text-amber-700 border border-amber-200' : ''
                      }`}>
                        <User className="w-3 h-3 text-slate-400" />
                        <span>{t.owner}</span>
                      </span>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      {t.deadline}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap uppercase font-bold text-[10px]">
                      {t.priority}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <ConfidenceHeatmapBadge
                        score={t.confidence_score}
                        isAmbiguousDeadline={t.is_ambiguous_deadline}
                        isUnassignedOwner={t.is_unassigned_owner}
                        showDetails={false}
                      />
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

  function renderGlobalCard(item: any) {
    return (
      <div
        key={item.id}
        className={`group rounded-xl border p-4 space-y-3 transition-all hover:shadow-md ${
          isLight
            ? 'bg-white border-slate-200 hover:border-violet-300'
            : 'bg-slate-900/70 border-slate-800 hover:border-slate-700'
        }`}
      >
        <div className="flex items-center justify-between text-xs">
          {/* Priority pill */}
          <span
            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
              item.priority === 'high'
                ? 'bg-rose-50 text-rose-700 border border-rose-200'
                : item.priority === 'medium'
                ? 'bg-amber-50 text-amber-700 border border-amber-200'
                : 'bg-slate-100 text-slate-600'
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

        {/* Task description */}
        <h4 className={`text-xs sm:text-sm font-semibold leading-snug ${
          item.status === 'completed'
            ? 'line-through text-slate-400'
            : isLight ? 'text-slate-900' : 'text-white'
        }`}>
          {item.task_description}
        </h4>

        {/* Meeting reference button */}
        <button
          onClick={() => onSelectMeeting(item.meeting_obj)}
          className={`w-full text-left p-2 rounded-lg text-[11px] font-medium transition-colors flex items-center justify-between border ${
            isLight
              ? 'bg-slate-50 hover:bg-violet-50 border-slate-200 text-violet-700'
              : 'bg-slate-950 hover:bg-violet-950/40 border-slate-800 text-violet-300'
          }`}
        >
          <span className="truncate max-w-[210px]">{item.meeting_title}</span>
          <ArrowRight className="w-3 h-3 shrink-0" />
        </button>

        {/* Owner & Deadline */}
        <div className={`flex items-center justify-between text-xs pt-1 border-t ${
          isLight ? 'border-slate-100 text-slate-500' : 'border-slate-800 text-slate-400'
        }`}>
          <span className="flex items-center gap-1 font-medium">
            <User className="w-3 h-3 text-slate-400" />
            <span className="truncate max-w-[120px]">{item.owner}</span>
          </span>

          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3 text-slate-400" />
            <span>{item.deadline}</span>
          </span>
        </div>

        {/* Move button */}
        <div className="flex items-center justify-end pt-1">
          {item.status === 'pending' && (
            <button
              onClick={() => onUpdateItem(item.meeting_id, item.id, { status: 'in_progress' })}
              className="text-xs text-violet-600 hover:text-violet-700 font-semibold cursor-pointer"
            >
              Start Task →
            </button>
          )}
          {item.status === 'in_progress' && (
            <button
              onClick={() => onUpdateItem(item.meeting_id, item.id, { status: 'completed' })}
              className="text-xs text-emerald-600 hover:text-emerald-700 font-semibold cursor-pointer"
            >
              ✓ Mark Complete
            </button>
          )}
          {item.status === 'completed' && (
            <button
              onClick={() => onUpdateItem(item.meeting_id, item.id, { status: 'in_progress' })}
              className="text-xs text-slate-500 hover:text-slate-700 cursor-pointer"
            >
              Reopen
            </button>
          )}
        </div>
      </div>
    );
  }
};
