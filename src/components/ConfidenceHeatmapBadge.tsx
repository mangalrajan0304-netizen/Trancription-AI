import React from 'react';
import { AlertTriangle, CheckCircle2, HelpCircle } from 'lucide-react';

interface ConfidenceHeatmapBadgeProps {
  score: number; // 0.0 to 1.0
  isAmbiguousDeadline?: boolean;
  isUnassignedOwner?: boolean;
  riskReason?: string;
  showDetails?: boolean;
}

export const ConfidenceHeatmapBadge: React.FC<ConfidenceHeatmapBadgeProps> = ({
  score,
  isAmbiguousDeadline,
  isUnassignedOwner,
  riskReason,
  showDetails = true,
}) => {
  const percentage = Math.round(score * 100);

  // Confidence styling
  let badgeColor = '';
  let dotColor = '';
  let label = '';
  let Icon = CheckCircle2;

  if (percentage >= 85) {
    badgeColor = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
    dotColor = 'bg-emerald-400';
    label = 'High Conf';
    Icon = CheckCircle2;
  } else if (percentage >= 60) {
    badgeColor = 'bg-amber-500/10 text-amber-300 border-amber-500/30';
    dotColor = 'bg-amber-400';
    label = 'Med Conf';
    Icon = AlertTriangle;
  } else {
    badgeColor = 'bg-rose-500/10 text-rose-400 border-rose-500/30';
    dotColor = 'bg-rose-400';
    label = 'Low Conf';
    Icon = HelpCircle;
  }

  const hasRisk = isAmbiguousDeadline || isUnassignedOwner || !!riskReason;

  return (
    <div className="inline-flex items-center gap-1.5 flex-wrap">
      {/* Confidence Pill */}
      <span
        title={`AI extraction confidence: ${percentage}%`}
        className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium border ${badgeColor}`}
      >
        <span className={`w-1.5 h-1.5 rounded-full ${dotColor} animate-pulse`} />
        <span>{percentage}%</span>
        {showDetails && <span className="opacity-75 hidden sm:inline">{label}</span>}
      </span>

      {/* Risk Flag Pill */}
      {hasRisk && (
        <span
          title={
            riskReason ||
            (isUnassignedOwner && isAmbiguousDeadline
              ? 'Unassigned owner and ambiguous deadline'
              : isUnassignedOwner
              ? 'Missing owner assignment'
              : 'Ambiguous deadline (e.g. TBD or vague timing)')
          }
          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-950/40 text-amber-300 border border-amber-500/40"
        >
          <AlertTriangle className="w-3 h-3 text-amber-400" />
          <span>
            {isUnassignedOwner && isAmbiguousDeadline
              ? 'Unassigned & TBD'
              : isUnassignedOwner
              ? 'Unassigned'
              : 'TBD Date'}
          </span>
        </span>
      )}
    </div>
  );
};
