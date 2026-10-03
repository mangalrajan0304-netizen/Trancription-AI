import React, { useState } from 'react';
import {
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  Calendar,
  CheckCircle,
  CheckCircle2,
  Clock,
  Edit2,
  Filter,
  Grid,
  Layers,
  List,
  MessageSquare,
  Plus,
  Quote,
  Search,
  Tag,
  Trash2,
  User,
  X,
} from 'lucide-react';
import { ActionItem, Meeting, Priority, TaskStatus, DuplicateSuggestion } from '../types.js';
import { ConfidenceHeatmapBadge } from './ConfidenceHeatmapBadge.js';

interface ActionItemsWorkspaceProps {
  meeting: Meeting;
  onUpdateItem: (itemId: string, updates: Partial<ActionItem>) => void;
  onAddItem: (item: Omit<ActionItem, 'id' | 'meeting_id'>) => void;
  onDeleteItem: (itemId: string) => void;
  onSelectSegment: (segmentId?: string) => void;
  duplicates: DuplicateSuggestion[];
  onOpenMergeModal: () => void;
}

export const ActionItemsWorkspace: React.FC<ActionItemsWorkspaceProps> = ({
  meeting,
  onUpdateItem,
  onAddItem,
  onDeleteItem,
  onSelectSegment,
  duplicates,
  onOpenMergeModal,
}) => {
  const [viewMode, setViewMode] = useState<'kanban' | 'table'>('kanban');
  const [searchFilter, setSearchFilter] = useState('');
  const [ownerFilter, setOwnerFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [onlyRiskFlags, setOnlyRiskFlags] = useState(false);

  // Editing state
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editDesc, setEditDesc] = useState('');
  const [editOwner, setEditOwner] = useState('');
  const [editDeadline, setEditDeadline] = useState('');
  const [editPriority, setEditPriority] = useState<Priority>('medium');

  // New Item State
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newTaskDesc, setNewTaskDesc] = useState('');
  const [newTaskOwner, setNewTaskOwner] = useState('');
  const [newTaskDeadline, setNewTaskDeadline] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState<Priority>('medium');

  // List of all potential owners (participants + Unassigned)
  const allOwners = ['Unassigned', ...meeting.participants];

  // Filtering
  const filteredItems = meeting.action_items.filter((item) => {
    if (searchFilter) {
      const q = searchFilter.toLowerCase();
      const match =
        item.task_description.toLowerCase().includes(q) ||
        item.owner.toLowerCase().includes(q) ||
        (item.source_quote && item.source_quote.toLowerCase().includes(q)) ||
        item.deadline.toLowerCase().includes(q);
      if (!match) return false;
    }
    if (ownerFilter !== 'All' && item.owner !== ownerFilter) return false;
    if (priorityFilter !== 'All' && item.priority !== priorityFilter) return false;
    if (statusFilter !== 'All' && item.status !== statusFilter) return false;
    if (onlyRiskFlags && !item.is_unassigned_owner && !item.is_ambiguous_deadline && !item.risk_reason) return false;
    return true;
  });

  const startEditing = (item: ActionItem) => {
    setEditingItemId(item.id);
    setEditDesc(item.task_description);
    setEditOwner(item.owner);
    setEditDeadline(item.deadline);
    setEditPriority(item.priority);
  };

  const saveEdit = (itemId: string) => {
    if (!editDesc.trim()) return;
    onUpdateItem(itemId, {
      task_description: editDesc.trim(),
      owner: editOwner || 'Unassigned',
      deadline: editDeadline || 'TBD',
      priority: editPriority,
    });
    setEditingItemId(null);
  };

  const handleAddNewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskDesc.trim()) return;
    onAddItem({
      task_description: newTaskDesc.trim(),
      owner: newTaskOwner || 'Unassigned',
      deadline: newTaskDeadline || 'TBD',
      priority: newTaskPriority,
      status: 'pending',
      confidence_score: 1.0,
      confidence_level: 'high',
      tags: ['Manual'],
    });
    setNewTaskDesc('');
    setNewTaskOwner('');
    setNewTaskDeadline('');
    setNewTaskPriority('medium');
    setIsAddingNew(false);
  };

  const pendingItems = filteredItems.filter((i) => i.status === 'pending');
  const inProgressItems = filteredItems.filter((i) => i.status === 'in_progress');
  const completedItems = filteredItems.filter((i) => i.status === 'completed');

  return (
    <div className="space-y-6">
      {/* Duplicates Banner if detected */}
      {duplicates.length > 0 && (
        <div className="rounded-xl border border-amber-500/40 bg-amber-500/10 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-500/20 text-amber-300">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-amber-200">
                Potential Duplicate Tasks Detected ({duplicates.length})
              </h4>
              <p className="text-xs text-amber-300/80">
                Our AI semantic matcher identified closely related tasks that can be consolidated.
              </p>
            </div>
          </div>
          <button
            onClick={onOpenMergeModal}
            className="px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md shadow-amber-500/20 transition-all cursor-pointer whitespace-nowrap self-start sm:self-auto"
          >
            Review & Merge
          </button>
        </div>
      )}

      {/* Filter and Control Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-4 rounded-xl bg-slate-900/60 border border-slate-800">
        <div className="flex flex-wrap items-center gap-3 flex-1">
          {/* Search inside tasks */}
          <div className="relative min-w-[200px] flex-1 sm:flex-initial">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder="Filter tasks or quote..."
              className="w-full pl-9 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-violet-500"
            />
          </div>

          {/* Owner Filter */}
          <select
            value={ownerFilter}
            onChange={(e) => setOwnerFilter(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-300 focus:outline-none focus:border-violet-500"
          >
            <option value="All">All Owners ({meeting.action_items.length})</option>
            {allOwners.map((owner) => (
              <option key={owner} value={owner}>
                {owner}
              </option>
            ))}
          </select>

          {/* Priority Filter */}
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-300 focus:outline-none focus:border-violet-500"
          >
            <option value="All">All Priorities</option>
            <option value="high">High Priority</option>
            <option value="medium">Medium Priority</option>
            <option value="low">Low Priority</option>
          </select>

          {/* Risk Flag Toggle */}
          <button
            onClick={() => setOnlyRiskFlags(!onlyRiskFlags)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
              onlyRiskFlags
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                : 'bg-slate-950 text-slate-400 hover:text-slate-200 border-slate-800'
            }`}
          >
            <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
            <span>Needs Attention</span>
          </button>
        </div>

        {/* View Switcher & Add Button */}
        <div className="flex items-center gap-2.5 self-end lg:self-auto">
          {/* View Toggle */}
          <div className="flex items-center p-1 rounded-lg bg-slate-950 border border-slate-800">
            <button
              onClick={() => setViewMode('kanban')}
              className={`p-1.5 rounded-md text-xs font-medium flex items-center gap-1.5 transition-colors ${
                viewMode === 'kanban' ? 'bg-violet-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Kanban Board View"
            >
              <Grid className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Kanban</span>
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-md text-xs font-medium flex items-center gap-1.5 transition-colors ${
                viewMode === 'table' ? 'bg-violet-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Table View"
            >
              <List className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Table</span>
            </button>
          </div>

          {/* Add Item Button */}
          <button
            onClick={() => setIsAddingNew(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold shadow-sm transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Task</span>
          </button>
        </div>
      </div>

      {/* Add New Task Modal/Drawer Form */}
      {isAddingNew && (
        <form
          onSubmit={handleAddNewSubmit}
          className="rounded-xl border border-violet-500/30 bg-slate-900 p-5 space-y-4 shadow-xl"
        >
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <Plus className="w-4 h-4 text-violet-400" />
              <span>Create Manual Action Item</span>
            </h4>
            <button
              type="button"
              onClick={() => setIsAddingNew(false)}
              className="text-slate-400 hover:text-slate-200"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Task Description *</label>
              <input
                type="text"
                required
                value={newTaskDesc}
                onChange={(e) => setNewTaskDesc(e.target.value)}
                placeholder="e.g. Schedule follow-up architecture review with solutions engineer"
                className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-violet-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Assignee / Owner</label>
                <select
                  value={newTaskOwner}
                  onChange={(e) => setNewTaskOwner(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-violet-500"
                >
                  <option value="Unassigned">Unassigned</option>
                  {meeting.participants.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Target Deadline</label>
                <input
                  type="text"
                  value={newTaskDeadline}
                  onChange={(e) => setNewTaskDeadline(e.target.value)}
                  placeholder="e.g. Oct 15, or next Tuesday"
                  className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-violet-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Priority</label>
                <select
                  value={newTaskPriority}
                  onChange={(e) => setNewTaskPriority(e.target.value as Priority)}
                  className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-violet-500"
                >
                  <option value="high">High Priority</option>
                  <option value="medium">Medium Priority</option>
                  <option value="low">Low Priority</option>
                </select>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsAddingNew(false)}
              className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-slate-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold shadow-sm"
            >
              Save Action Item
            </button>
          </div>
        </form>
      )}

      {/* Kanban Board View */}
      {viewMode === 'kanban' ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Column 1: Pending / To Do */}
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-slate-400" />
                <h3 className="font-bold text-sm text-slate-200 uppercase tracking-wider">To Do</h3>
              </div>
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-slate-800 text-slate-300">
                {pendingItems.length}
              </span>
            </div>

            <div className="space-y-3 min-h-[250px]">
              {pendingItems.length === 0 ? (
                <div className="p-6 rounded-xl border border-dashed border-slate-800/80 text-center text-xs text-slate-500">
                  No pending items
                </div>
              ) : (
                pendingItems.map((item) => renderActionCard(item))
              )}
            </div>
          </div>

          {/* Column 2: In Progress */}
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-violet-400 animate-pulse" />
                <h3 className="font-bold text-sm text-violet-300 uppercase tracking-wider">In Progress</h3>
              </div>
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-violet-950/60 border border-violet-800 text-violet-300">
                {inProgressItems.length}
              </span>
            </div>

            <div className="space-y-3 min-h-[250px]">
              {inProgressItems.length === 0 ? (
                <div className="p-6 rounded-xl border border-dashed border-slate-800/80 text-center text-xs text-slate-500">
                  No active tasks in progress
                </div>
              ) : (
                inProgressItems.map((item) => renderActionCard(item))
              )}
            </div>
          </div>

          {/* Column 3: Completed */}
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                <h3 className="font-bold text-sm text-emerald-300 uppercase tracking-wider">Completed</h3>
              </div>
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-950/60 border border-emerald-800 text-emerald-300">
                {completedItems.length}
              </span>
            </div>

            <div className="space-y-3 min-h-[250px]">
              {completedItems.length === 0 ? (
                <div className="p-6 rounded-xl border border-dashed border-slate-800/80 text-center text-xs text-slate-500">
                  No completed tasks yet
                </div>
              ) : (
                completedItems.map((item) => renderActionCard(item))
              )}
            </div>
          </div>
        </div>
      ) : (
        /* Table Matrix View */
        <div className="rounded-xl border border-slate-800 overflow-hidden bg-slate-900/40">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Task Description</th>
                  <th className="py-3 px-4">Owner</th>
                  <th className="py-3 px-4">Deadline</th>
                  <th className="py-3 px-4">Priority</th>
                  <th className="py-3 px-4">Confidence & Risk</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-200">
                {filteredItems.map((item) => {
                  const isEditing = editingItemId === item.id;

                  return (
                    <tr key={item.id} className="hover:bg-slate-800/30 transition-colors">
                      {/* Status toggle cell */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <select
                          value={item.status}
                          onChange={(e) => onUpdateItem(item.id, { status: e.target.value as TaskStatus })}
                          className={`px-2 py-1 rounded text-xs font-semibold border ${
                            item.status === 'completed'
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                              : item.status === 'in_progress'
                              ? 'bg-violet-500/10 text-violet-400 border-violet-500/30'
                              : 'bg-slate-800 text-slate-300 border-slate-700'
                          }`}
                        >
                          <option value="pending">To Do</option>
                          <option value="in_progress">In Progress</option>
                          <option value="completed">Completed</option>
                        </select>
                      </td>

                      {/* Description cell */}
                      <td className="py-3 px-4 max-w-sm">
                        {isEditing ? (
                          <input
                            type="text"
                            value={editDesc}
                            onChange={(e) => setEditDesc(e.target.value)}
                            className="w-full px-2 py-1 bg-slate-950 border border-violet-500 rounded text-xs text-white"
                          />
                        ) : (
                          <div>
                            <span
                              className={`font-medium ${
                                item.status === 'completed' ? 'line-through text-slate-400' : 'text-slate-100'
                              }`}
                            >
                              {item.task_description}
                            </span>
                            {item.source_quote && (
                              <button
                                onClick={() => onSelectSegment(item.source_segment_id)}
                                className="block mt-1 text-[11px] text-slate-400 hover:text-violet-300 italic truncate max-w-xs text-left"
                              >
                                &ldquo;{item.source_quote}&rdquo;
                              </button>
                            )}
                          </div>
                        )}
                      </td>

                      {/* Owner cell */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        {isEditing ? (
                          <select
                            value={editOwner}
                            onChange={(e) => setEditOwner(e.target.value)}
                            className="px-2 py-1 bg-slate-950 border border-slate-700 rounded text-xs"
                          >
                            {allOwners.map((o) => (
                              <option key={o} value={o}>
                                {o}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <span
                            className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium ${
                              item.is_unassigned_owner
                                ? 'bg-amber-500/10 text-amber-300 border border-amber-500/30'
                                : 'bg-slate-800/80 text-slate-300'
                            }`}
                          >
                            <User className="w-3 h-3 text-slate-400" />
                            <span>{item.owner}</span>
                          </span>
                        )}
                      </td>

                      {/* Deadline cell */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        {isEditing ? (
                          <input
                            type="text"
                            value={editDeadline}
                            onChange={(e) => setEditDeadline(e.target.value)}
                            className="w-28 px-2 py-1 bg-slate-950 border border-slate-700 rounded text-xs"
                          />
                        ) : (
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs ${
                              item.is_ambiguous_deadline
                                ? 'text-amber-400 font-medium'
                                : 'text-slate-300'
                            }`}
                          >
                            <Calendar className="w-3 h-3 text-slate-400" />
                            <span>{item.deadline}</span>
                          </span>
                        )}
                      </td>

                      {/* Priority cell */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        {isEditing ? (
                          <select
                            value={editPriority}
                            onChange={(e) => setEditPriority(e.target.value as Priority)}
                            className="px-2 py-1 bg-slate-950 border border-slate-700 rounded text-xs"
                          >
                            <option value="high">High</option>
                            <option value="medium">Medium</option>
                            <option value="low">Low</option>
                          </select>
                        ) : (
                          <span
                            className={`px-2 py-0.5 rounded text-[11px] font-semibold uppercase ${
                              item.priority === 'high'
                                ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                                : item.priority === 'medium'
                                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                                : 'bg-slate-800 text-slate-400'
                            }`}
                          >
                            {item.priority}
                          </span>
                        )}
                      </td>

                      {/* Confidence & Risk */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <ConfidenceHeatmapBadge
                          score={item.confidence_score}
                          isAmbiguousDeadline={item.is_ambiguous_deadline}
                          isUnassignedOwner={item.is_unassigned_owner}
                          riskReason={item.risk_reason}
                        />
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          {isEditing ? (
                            <>
                              <button
                                onClick={() => saveEdit(item.id)}
                                className="px-2 py-1 rounded bg-violet-600 text-white font-semibold text-xs"
                              >
                                Save
                              </button>
                              <button
                                onClick={() => setEditingItemId(null)}
                                className="px-2 py-1 rounded bg-slate-800 text-slate-300 text-xs"
                              >
                                Cancel
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() => startEditing(item)}
                                title="Edit task"
                                className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => onDeleteItem(item.id)}
                                title="Delete task / reject false positive"
                                className="p-1 rounded hover:bg-rose-500/10 text-slate-500 hover:text-rose-400"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );

  function renderActionCard(item: ActionItem) {
    const isEditing = editingItemId === item.id;

    return (
      <div
        key={item.id}
        className={`group relative rounded-xl border p-4 transition-all ${
          item.status === 'completed'
            ? 'bg-slate-900/30 border-slate-800/80 opacity-80'
            : item.priority === 'high'
            ? 'bg-slate-900/80 border-slate-800 hover:border-violet-500/50 shadow-md'
            : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 shadow-sm'
        }`}
      >
        {/* Top meta: Priority & Confidence */}
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <span
            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
              item.priority === 'high'
                ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                : item.priority === 'medium'
                ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                : 'bg-slate-800 text-slate-400 border border-slate-700'
            }`}
          >
            {item.priority} priority
          </span>

          <ConfidenceHeatmapBadge
            score={item.confidence_score}
            isAmbiguousDeadline={item.is_ambiguous_deadline}
            isUnassignedOwner={item.is_unassigned_owner}
            riskReason={item.risk_reason}
            showDetails={false}
          />
        </div>

        {/* Task description or Inline Edit Input */}
        {isEditing ? (
          <div className="space-y-2 mb-3">
            <textarea
              rows={2}
              value={editDesc}
              onChange={(e) => setEditDesc(e.target.value)}
              className="w-full p-2 bg-slate-950 border border-violet-500 rounded text-xs text-white focus:outline-none"
            />
            <div className="grid grid-cols-2 gap-2 text-xs">
              <select
                value={editOwner}
                onChange={(e) => setEditOwner(e.target.value)}
                className="px-2 py-1 bg-slate-950 border border-slate-700 rounded text-xs text-slate-200"
              >
                {allOwners.map((o) => (
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
              </select>
              <input
                type="text"
                value={editDeadline}
                onChange={(e) => setEditDeadline(e.target.value)}
                placeholder="Deadline"
                className="px-2 py-1 bg-slate-950 border border-slate-700 rounded text-xs text-slate-200"
              />
            </div>
            <div className="flex items-center justify-end gap-1.5 pt-1">
              <button
                onClick={() => saveEdit(item.id)}
                className="px-2.5 py-1 rounded bg-violet-600 text-white font-semibold text-xs"
              >
                Save
              </button>
              <button
                onClick={() => setEditingItemId(null)}
                className="px-2.5 py-1 rounded bg-slate-800 text-slate-400 text-xs"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <h4
            onClick={() => startEditing(item)}
            className={`font-semibold text-sm leading-snug cursor-pointer group-hover:text-violet-200 transition-colors mb-2.5 ${
              item.status === 'completed' ? 'line-through text-slate-400' : 'text-slate-100'
            }`}
          >
            {item.task_description}
          </h4>
        )}

        {/* Source quote anchor button */}
        {item.source_quote && !isEditing && (
          <button
            onClick={() => onSelectSegment(item.source_segment_id)}
            title="Click to highlight this quote in the diarized transcript timeline"
            className="w-full text-left p-2 rounded-lg bg-slate-950/70 hover:bg-slate-950 border border-slate-800/80 text-[11px] text-slate-400 hover:text-violet-300 transition-colors mb-3 flex items-start gap-1.5"
          >
            <Quote className="w-3 h-3 text-slate-500 shrink-0 mt-0.5" />
            <span className="line-clamp-2 italic">&ldquo;{item.source_quote}&rdquo;</span>
          </button>
        )}

        {/* Owner & Deadline Info */}
        {!isEditing && (
          <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-800/60 mb-3">
            {/* Owner pill */}
            <div
              className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-medium ${
                item.is_unassigned_owner
                  ? 'bg-amber-500/10 text-amber-300 border border-amber-500/30'
                  : 'bg-slate-800/80 text-slate-300'
              }`}
            >
              <User className="w-3 h-3 text-slate-400" />
              <span className="truncate max-w-[120px]">{item.owner}</span>
            </div>

            {/* Deadline */}
            <div
              className={`inline-flex items-center gap-1 text-[11px] ${
                item.is_ambiguous_deadline
                  ? 'text-amber-400 font-semibold'
                  : 'text-slate-400 font-medium'
              }`}
            >
              <Clock className="w-3 h-3 text-slate-500" />
              <span>{item.deadline}</span>
            </div>
          </div>
        )}

        {/* Quick Progression & Action Buttons */}
        {!isEditing && (
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-1">
              <button
                onClick={() => startEditing(item)}
                title="Edit item"
                className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
              >
                <Edit2 className="w-3 h-3" />
              </button>
              <button
                onClick={() => onDeleteItem(item.id)}
                title="Delete false positive"
                className="p-1.5 rounded hover:bg-rose-500/10 text-slate-500 hover:text-rose-400 transition-colors"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>

            {/* Next state button */}
            {item.status === 'pending' && (
              <button
                onClick={() => onUpdateItem(item.id, { status: 'in_progress' })}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-violet-600/20 hover:bg-violet-600 text-violet-300 hover:text-white text-[11px] font-medium transition-all"
              >
                <span>Start</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            )}

            {item.status === 'in_progress' && (
              <button
                onClick={() => onUpdateItem(item.id, { status: 'completed' })}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white text-[11px] font-medium transition-all"
              >
                <CheckCircle2 className="w-3 h-3" />
                <span>Mark Done</span>
              </button>
            )}

            {item.status === 'completed' && (
              <button
                onClick={() => onUpdateItem(item.id, { status: 'in_progress' })}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-slate-400 hover:text-slate-200 text-[11px]"
              >
                <span>Re-open</span>
              </button>
            )}
          </div>
        )}
      </div>
    );
  }
};
