import React from 'react';
import {
  Activity,
  BarChart2,
  CheckCircle2,
  Clock,
  Compass,
  FileText,
  PieChart,
  Sparkles,
  TrendingUp,
  Users,
} from 'lucide-react';
import { Meeting } from '../types.js';

interface AnalyticsPageProps {
  meetings: Meeting[];
  isLight: boolean;
}

export const AnalyticsPage: React.FC<AnalyticsPageProps> = ({ meetings, isLight }) => {
  const allTasks = meetings.flatMap((m) => m.action_items);
  const totalTasks = allTasks.length;
  const completedTasks = allTasks.filter((t) => t.status === 'completed').length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const highPriority = allTasks.filter((t) => t.priority === 'high').length;
  const medPriority = allTasks.filter((t) => t.priority === 'medium').length;
  const lowPriority = allTasks.filter((t) => t.priority === 'low').length;

  const totalMinutes = meetings.reduce((acc, curr) => acc + (curr.duration_minutes || 0), 0);

  // Group speaker tasks
  const speakerCountMap: Record<string, number> = {};
  allTasks.forEach((t) => {
    if (t.owner && t.owner !== 'Unassigned') {
      speakerCountMap[t.owner] = (speakerCountMap[t.owner] || 0) + 1;
    }
  });

  const sortedSpeakers = Object.entries(speakerCountMap).sort((a, b) => b[1] - a[1]);

  return (
    <div className="space-y-6 pb-20">
      {/* Page Header */}
      <div className={`rounded-2xl border p-6 sm:p-7 shadow-sm transition-all ${
        isLight
          ? 'bg-white border-violet-100 shadow-violet-100/30'
          : 'bg-slate-900/60 border-slate-800'
      }`}>
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-violet-100/80 text-violet-800 border border-violet-200">
            <TrendingUp className="w-3.5 h-3.5 text-violet-600" />
            <span>Organization Meeting Intelligence</span>
          </div>
          <h1 className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${
            isLight ? 'text-slate-900' : 'text-white'
          }`}>
            Meeting Productivity & Task Velocity
          </h1>
          <p className={`text-xs sm:text-sm ${
            isLight ? 'text-slate-600' : 'text-slate-400'
          }`}>
            Deep-dive metrics across {meetings.length} recorded meeting sessions and {allTasks.length} commitments.
          </p>
        </div>
      </div>

      {/* 4 Primary Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Time */}
        <div className={`p-5 rounded-2xl border flex flex-col justify-between ${
          isLight ? 'bg-white border-violet-100 shadow-sm' : 'bg-slate-900/70 border-slate-800'
        }`}>
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider">
            <span>Total Discussion Time</span>
            <Clock className="w-4 h-4 text-violet-600" />
          </div>
          <div className="mt-4">
            <span className={`text-3xl font-extrabold ${isLight ? 'text-slate-900' : 'text-white'}`}>
              {totalMinutes}
            </span>
            <span className="text-xs text-slate-500 ml-1.5">minutes</span>
          </div>
        </div>

        {/* Completion Rate */}
        <div className={`p-5 rounded-2xl border flex flex-col justify-between ${
          isLight ? 'bg-white border-violet-100 shadow-sm' : 'bg-slate-900/70 border-slate-800'
        }`}>
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider">
            <span>Task Completion Rate</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="mt-4">
            <span className="text-3xl font-extrabold text-emerald-600">
              {completionRate}%
            </span>
            <span className="text-xs text-slate-500 ml-1.5">({completedTasks}/{totalTasks} done)</span>
          </div>
        </div>

        {/* High Priority Burden */}
        <div className={`p-5 rounded-2xl border flex flex-col justify-between ${
          isLight ? 'bg-white border-violet-100 shadow-sm' : 'bg-slate-900/70 border-slate-800'
        }`}>
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider">
            <span>High Priority Deliverables</span>
            <Activity className="w-4 h-4 text-rose-500" />
          </div>
          <div className="mt-4">
            <span className="text-3xl font-extrabold text-rose-600">
              {highPriority}
            </span>
            <span className="text-xs text-slate-500 ml-1.5">urgent items</span>
          </div>
        </div>

        {/* Meeting Velocity */}
        <div className={`p-5 rounded-2xl border flex flex-col justify-between ${
          isLight ? 'bg-white border-violet-100 shadow-sm' : 'bg-slate-900/70 border-slate-800'
        }`}>
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider">
            <span>Tasks Per Session</span>
            <Sparkles className="w-4 h-4 text-violet-500" />
          </div>
          <div className="mt-4">
            <span className={`text-3xl font-extrabold ${isLight ? 'text-slate-900' : 'text-white'}`}>
              {meetings.length > 0 ? (totalTasks / meetings.length).toFixed(1) : 0}
            </span>
            <span className="text-xs text-slate-500 ml-1.5">avg per call</span>
          </div>
        </div>
      </div>

      {/* 2-Column: Priority Matrix & Speaker Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Priority Matrix */}
        <div className={`p-6 rounded-2xl border space-y-5 ${
          isLight ? 'bg-white border-violet-100 shadow-sm' : 'bg-slate-900/60 border-slate-800'
        }`}>
          <div className="flex items-center justify-between pb-3 border-b border-violet-100 dark:border-slate-800">
            <h3 className={`font-bold text-base ${isLight ? 'text-slate-900' : 'text-white'}`}>
              Task Urgency Distribution
            </h3>
            <span className="text-xs text-slate-500">{totalTasks} items</span>
          </div>

          <div className="space-y-4">
            {/* High */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-rose-600">High Priority</span>
                <span>{highPriority} tasks ({totalTasks > 0 ? Math.round((highPriority / totalTasks) * 100) : 0}%)</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-rose-500 rounded-full"
                  style={{ width: `${totalTasks > 0 ? (highPriority / totalTasks) * 100 : 0}%` }}
                />
              </div>
            </div>

            {/* Medium */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-amber-600">Medium Priority</span>
                <span>{medPriority} tasks ({totalTasks > 0 ? Math.round((medPriority / totalTasks) * 100) : 0}%)</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-amber-500 rounded-full"
                  style={{ width: `${totalTasks > 0 ? (medPriority / totalTasks) * 100 : 0}%` }}
                />
              </div>
            </div>

            {/* Low */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-slate-500">Low Priority</span>
                <span>{lowPriority} tasks ({totalTasks > 0 ? Math.round((lowPriority / totalTasks) * 100) : 0}%)</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-slate-400 rounded-full"
                  style={{ width: `${totalTasks > 0 ? (lowPriority / totalTasks) * 100 : 0}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Top Speaker Task Ownership */}
        <div className={`p-6 rounded-2xl border space-y-4 ${
          isLight ? 'bg-white border-violet-100 shadow-sm' : 'bg-slate-900/60 border-slate-800'
        }`}>
          <div className="flex items-center justify-between pb-3 border-b border-violet-100 dark:border-slate-800">
            <h3 className={`font-bold text-base ${isLight ? 'text-slate-900' : 'text-white'}`}>
              Top Task Assignees
            </h3>
            <span className="text-xs text-slate-500">{sortedSpeakers.length} owners</span>
          </div>

          <div className="space-y-3">
            {sortedSpeakers.slice(0, 5).map(([name, count]) => (
              <div
                key={name}
                className={`p-3 rounded-xl border flex items-center justify-between text-xs ${
                  isLight ? 'bg-violet-50/50 border-violet-100' : 'bg-slate-950 border-slate-800'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-violet-500/10 text-violet-700 font-bold flex items-center justify-center text-xs">
                    {name.charAt(0)}
                  </div>
                  <span className={`font-semibold ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>{name}</span>
                </div>
                <span className="font-extrabold text-violet-700 bg-violet-100/70 border border-violet-200 px-2.5 py-0.5 rounded-full">
                  {count} {count === 1 ? 'task' : 'tasks'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
