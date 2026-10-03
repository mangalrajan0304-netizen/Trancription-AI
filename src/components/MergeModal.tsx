import React, { useState } from 'react';
import { AlertTriangle, ArrowRight, Check, Merge, X } from 'lucide-react';
import { DuplicateSuggestion, Meeting } from '../types.js';

interface MergeModalProps {
  meeting: Meeting;
  duplicates: DuplicateSuggestion[];
  isOpen: boolean;
  onClose: () => void;
  onMerge: (primaryId: string, duplicateId: string, mergedDescription?: string) => Promise<void>;
  onShowToast: (msg: string, type?: 'success' | 'info') => void;
}

export const MergeModal: React.FC<MergeModalProps> = ({
  meeting,
  duplicates,
  isOpen,
  onClose,
  onMerge,
  onShowToast,
}) => {
  const [activeIdx, setActiveIdx] = useState(0);
  const [customText, setCustomText] = useState('');
  const [isMerging, setIsMerging] = useState(false);

  if (!isOpen || duplicates.length === 0) return null;

  const currentDup = duplicates[activeIdx];
  const primaryItem = meeting.action_items.find((a) => a.id === currentDup.primary_id);
  const duplicateItem = meeting.action_items.find((a) => a.id === currentDup.duplicate_id);

  const handleMergeClick = async () => {
    if (!currentDup) return;
    setIsMerging(true);
    try {
      await onMerge(currentDup.primary_id, currentDup.duplicate_id, customText.trim() || undefined);
      onShowToast('Action items successfully merged!', 'success');
      if (activeIdx >= duplicates.length - 1) {
        onClose();
      } else {
        setActiveIdx((prev) => prev + 1);
        setCustomText('');
      }
    } catch (err: any) {
      onShowToast('Error merging tasks: ' + err.message, 'info');
    } finally {
      setIsMerging(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl rounded-2xl border border-slate-800 bg-slate-900 p-6 space-y-6 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="space-y-1">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Merge className="w-5 h-5 text-amber-400" />
              <span>Review Semantic Duplicate Tasks</span>
            </h3>
            <p className="text-xs text-slate-400">
              Pair {activeIdx + 1} of {duplicates.length} • {currentDup.similarity_score}% Semantic Similarity
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Task Comparison */}
        <div className="space-y-4">
          {/* Primary Task */}
          <div className="p-4 rounded-xl bg-slate-950/80 border border-violet-500/40 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-violet-400 uppercase tracking-wider">Primary Target Task</span>
              <span className="text-slate-400">Owner: {primaryItem?.owner || 'Unassigned'}</span>
            </div>
            <p className="text-xs sm:text-sm font-semibold text-slate-100">{currentDup.primary_task}</p>
          </div>

          <div className="flex justify-center -my-2 relative z-10">
            <div className="p-1.5 rounded-full bg-slate-800 text-amber-400 border border-slate-700 shadow">
              <Merge className="w-4 h-4" />
            </div>
          </div>

          {/* Duplicate Task to be merged */}
          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-amber-400 uppercase tracking-wider">Duplicate Item (Will be merged)</span>
              <span className="text-slate-400">Owner: {duplicateItem?.owner || 'Unassigned'}</span>
            </div>
            <p className="text-xs sm:text-sm text-slate-300">{currentDup.duplicate_task}</p>
          </div>

          {/* Merged Title Override */}
          <div className="space-y-1 pt-1">
            <label className="block text-xs font-medium text-slate-400">
              Merged Task Description (Optional Customization)
            </label>
            <input
              type="text"
              value={customText}
              onChange={(e) => setCustomText(e.target.value)}
              placeholder={currentDup.primary_task}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-violet-500"
            />
            <p className="text-[11px] text-slate-500">
              Tags and deadlines will be combined; duplicate item will be pruned and references re-linked.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-800">
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-slate-200"
          >
            Cancel
          </button>

          <button
            disabled={isMerging}
            onClick={handleMergeClick}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold shadow-md shadow-violet-600/30 transition-all cursor-pointer"
          >
            {isMerging ? (
              <span>Merging...</span>
            ) : (
              <>
                <Merge className="w-4 h-4" />
                <span>Merge & Consolidate</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
