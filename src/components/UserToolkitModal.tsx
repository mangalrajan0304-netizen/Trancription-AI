import React, { useState, useEffect, useRef } from 'react';
import {
  Calendar,
  Check,
  CheckCircle2,
  Clock,
  Copy,
  ExternalLink,
  FileText,
  Mail,
  Mic,
  MicOff,
  Pause,
  Play,
  Plus,
  Send,
  Sparkles,
  StopCircle,
  Volume2,
  X,
  Zap,
} from 'lucide-react';
import { ActionItem, Meeting, UserProfile } from '../types.js';

interface UserToolkitModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile | null;
  meetings: Meeting[];
  onQuickExtract: (transcript: string, title?: string) => Promise<void>;
  onUpdateItem: (meetingId: string, itemId: string, updates: Partial<ActionItem>) => Promise<void>;
  onShowToast: (msg: string, type?: 'success' | 'info') => void;
  isLight: boolean;
}

export const UserToolkitModal: React.FC<UserToolkitModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  meetings,
  onQuickExtract,
  onUpdateItem,
  onShowToast,
  isLight,
}) => {
  const [activeTab, setActiveTab] = useState<'recorder' | 'mytasks' | 'emaildraft' | 'quicktask'>('mytasks');

  // ================= 1. Live Voice Recorder State =================
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [transcriptDraft, setTranscriptDraft] = useState('');
  const [recognitionSupported, setRecognitionSupported] = useState(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Check Web Speech API support
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      setRecognitionSupported(true);
      const rec = new SpeechRecognition();
      rec.continuous = true;
      rec.interimResults = true;
      rec.lang = 'en-US';

      rec.onresult = (event: any) => {
        let text = '';
        for (let i = 0; i < event.results.length; i++) {
          text += event.results[i][0].transcript + ' ';
        }
        if (text) setTranscriptDraft(text);
      };

      rec.onerror = (e: any) => {
        console.error('Speech recognition error:', e);
      };

      recognitionRef.current = rec;
    }
  }, []);

  // Timer for recording
  useEffect(() => {
    let interval: any = null;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  const toggleRecording = () => {
    if (!isRecording) {
      setRecordingSeconds(0);
      setIsRecording(true);
      if (recognitionRef.current) {
        try {
          recognitionRef.current.start();
        } catch (e) {
          console.log(e);
        }
      }
      onShowToast('Microphone recording started. Speak your meeting notes or dictation!', 'info');
    } else {
      setIsRecording(false);
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          console.log(e);
        }
      }
      onShowToast('Recording stopped. Ready to extract action items!', 'success');
    }
  };

  const handleExtractFromRecording = async () => {
    if (!transcriptDraft.trim()) {
      onShowToast('No voice transcript captured yet. Please speak or type your notes.', 'info');
      return;
    }
    await onQuickExtract(transcriptDraft, `Voice Note Session (${new Date().toLocaleDateString()})`);
    onClose();
  };

  // ================= 2. My Assigned Tasks Filter =================
  const userAssignedNames = currentUser?.assignedNames || ['Mangal', 'Mangal Rajan'];
  const allMeetingTasks = meetings.flatMap((m) =>
    m.action_items.map((i) => ({ ...i, meeting_title: m.title, meeting_date: m.date }))
  );

  const myTasks = allMeetingTasks.filter((t) => {
    if (t.owner === 'Unassigned') return false;
    return userAssignedNames.some(
      (name) =>
        t.owner.toLowerCase().includes(name.toLowerCase()) ||
        name.toLowerCase().includes(t.owner.toLowerCase())
    );
  });

  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'completed'>('all');
  const filteredMyTasks = myTasks.filter((t) => {
    if (filterStatus === 'pending') return t.status !== 'completed';
    if (filterStatus === 'completed') return t.status === 'completed';
    return true;
  });

  const handleToggleTaskStatus = async (meetingId: string, itemId: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'completed' ? 'pending' : 'completed';
    await onUpdateItem(meetingId, itemId, { status: nextStatus });
    onShowToast(
      nextStatus === 'completed' ? 'Great job! Task marked completed 🎉' : 'Task reopened as pending',
      'success'
    );
  };

  // Google Calendar one-click link generator
  const getGoogleCalendarUrl = (task: ActionItem) => {
    const title = encodeURIComponent(`[PulseAction] ${task.task_description}`);
    const details = encodeURIComponent(
      `Action Item from Meeting.\nOwner: ${task.owner}\nPriority: ${task.priority.toUpperCase()}\nQuote: "${task.source_quote || ''}"`
    );
    // If deadline iso exists, set dates, else default to next day
    const startDate = task.deadline_iso ? task.deadline_iso.replace(/[-:]/g, '').slice(0, 8) : '';
    const dateParam = startDate ? `&dates=${startDate}T090000Z/${startDate}T100000Z` : '';
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}${dateParam}`;
  };

  // ================= 3. Email & Slack Drafter =================
  const [selectedMeetingForEmail, setSelectedMeetingForEmail] = useState<string>(
    meetings[0]?.id || ''
  );
  const targetMeeting = meetings.find((m) => m.id === selectedMeetingForEmail) || meetings[0];
  const [emailTone, setEmailTone] = useState<'executive' | 'team' | 'action_only'>('team');
  const [copiedDraft, setCopiedDraft] = useState(false);

  const generateEmailDraft = () => {
    if (!targetMeeting) return { subject: '', body: '' };

    const subject = `Meeting Follow-Up & Action Items: ${targetMeeting.title}`;
    const openTasks = targetMeeting.action_items.filter((i) => i.status !== 'completed');

    let body = `Hi Team,\n\nThank you for today's discussion on "${targetMeeting.title}" (${targetMeeting.date}).\n\n`;

    if (emailTone === 'executive') {
      body += `## EXECUTIVE SUMMARY\n${targetMeeting.summary}\n\n`;
      if (targetMeeting.executive_summary?.key_decisions?.length) {
        body += `## KEY DECISIONS\n${targetMeeting.executive_summary.key_decisions.map((d) => `• ${d}`).join('\n')}\n\n`;
      }
    }

    body += `## ACTION ITEMS & DELIVERABLES\n`;
    if (openTasks.length === 0) {
      body += `No pending deliverables recorded.\n\n`;
    } else {
      openTasks.forEach((t, i) => {
        body += `${i + 1}. [${t.priority.toUpperCase()}] ${t.task_description}\n   Owner: ${t.owner} | Due: ${t.deadline}\n\n`;
      });
    }

    body += `Please review and let me know if any deadlines or ownership need calibration.\n\nBest regards,\n${currentUser?.name || 'PulseAction AI Lead'}`;

    return { subject, body };
  };

  const draft = generateEmailDraft();

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(`${draft.subject}\n\n${draft.body}`);
    setCopiedDraft(true);
    onShowToast('Follow-up draft copied to clipboard!', 'success');
    setTimeout(() => setCopiedDraft(false), 2000);
  };

  const handleOpenMailto = () => {
    const mailto = `mailto:?subject=${encodeURIComponent(draft.subject)}&body=${encodeURIComponent(draft.body)}`;
    window.location.href = mailto;
  };

  // ================= 4. Quick Task Add State =================
  const [quickTaskMeetingId, setQuickTaskMeetingId] = useState(meetings[0]?.id || '');
  const [quickTaskDesc, setQuickTaskDesc] = useState('');
  const [quickTaskOwner, setQuickTaskOwner] = useState(currentUser?.name || '');
  const [quickTaskDeadline, setQuickTaskDeadline] = useState('Tomorrow 5 PM');
  const [quickTaskPriority, setQuickTaskPriority] = useState<'high' | 'medium' | 'low'>('medium');

  const handleCreateQuickTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickTaskDesc.trim() || !quickTaskMeetingId) return;

    try {
      const res = await fetch(`/api/meetings/${quickTaskMeetingId}/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          task_description: quickTaskDesc.trim(),
          owner: quickTaskOwner.trim() || 'Unassigned',
          deadline: quickTaskDeadline.trim() || 'TBD',
          priority: quickTaskPriority,
          status: 'pending',
          confidence_score: 0.98,
          confidence_level: 'high',
          tags: ['Manual Quick Task'],
        }),
      });

      if (res.ok) {
        onShowToast('Action item added directly to meeting workspace!', 'success');
        setQuickTaskDesc('');
        onClose();
      }
    } catch (err) {
      console.error(err);
      onShowToast('Failed to add quick action item', 'info');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
      <div
        className={`w-full max-w-3xl max-h-[90vh] flex flex-col rounded-2xl border shadow-2xl overflow-hidden ${
          isLight ? 'bg-white border-violet-100' : 'bg-slate-900 border-slate-800'
        }`}
      >
        {/* Header */}
        <div className={`p-5 border-b flex items-center justify-between ${
          isLight ? 'bg-violet-50/50 border-violet-100' : 'bg-slate-950/80 border-slate-800'
        }`}>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-violet-600 text-white shadow-md shadow-violet-600/30">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <span>User Productivity Toolkit</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-violet-100 text-violet-700 border border-violet-200">
                  Useful Tools
                </span>
              </h2>
              <p className="text-xs text-slate-500">
                Live voice recorder, your personal task plan, follow-up email drafts, and quick calendar sync.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className={`flex items-center border-b px-5 pt-3 gap-2 text-xs font-bold overflow-x-auto ${
          isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/50 border-slate-800'
        }`}>
          <button
            onClick={() => setActiveTab('mytasks')}
            className={`pb-2.5 px-3 border-b-2 flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'mytasks'
                ? 'border-violet-600 text-violet-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <CheckCircle2 className="w-4 h-4 text-violet-600" />
            <span>My Action Items ({myTasks.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('recorder')}
            className={`pb-2.5 px-3 border-b-2 flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'recorder'
                ? 'border-violet-600 text-violet-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Mic className="w-4 h-4 text-violet-600" />
            <span>Voice / Dictaphone Recorder</span>
            {isRecording && (
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('emaildraft')}
            className={`pb-2.5 px-3 border-b-2 flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'emaildraft'
                ? 'border-violet-600 text-violet-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Mail className="w-4 h-4 text-violet-600" />
            <span>Follow-Up Email & Slack Drafter</span>
          </button>

          <button
            onClick={() => setActiveTab('quicktask')}
            className={`pb-2.5 px-3 border-b-2 flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'quicktask'
                ? 'border-violet-600 text-violet-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Plus className="w-4 h-4 text-violet-600" />
            <span>Quick Task Add</span>
          </button>
        </div>

        {/* Tab Contents */}
        <div className="flex-1 overflow-y-auto p-6 text-xs space-y-4">
          {/* ================= TAB 1: MY ACTION ITEMS ================= */}
          {activeTab === 'mytasks' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                    Action Items Assigned to {currentUser?.name || 'You'}
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Aggregated across all meetings. Click checkbox to complete or add to Google Calendar.
                  </p>
                </div>

                <div className="flex items-center gap-1">
                  {(['all', 'pending', 'completed'] as const).map((st) => (
                    <button
                      key={st}
                      onClick={() => setFilterStatus(st)}
                      className={`px-2.5 py-1 rounded-lg text-xs capitalize font-bold ${
                        filterStatus === st
                          ? 'bg-violet-600 text-white shadow-xs'
                          : isLight ? 'bg-slate-100 text-slate-600 hover:bg-slate-200' : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              {filteredMyTasks.length === 0 ? (
                <div className="p-8 text-center rounded-xl border border-dashed text-slate-500 space-y-2">
                  <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-500" />
                  <p className="font-bold text-slate-700 dark:text-slate-300">
                    {filterStatus === 'pending'
                      ? 'All caught up! No pending action items assigned to you.'
                      : 'No tasks found matching your filter.'}
                  </p>
                  <p className="text-[11px] text-slate-400">
                    You can switch accounts in the login page or assign yourself tasks in the workspace.
                  </p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {filteredMyTasks.map((task) => {
                    const isDone = task.status === 'completed';
                    return (
                      <div
                        key={task.id}
                        className={`p-3.5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all ${
                          isDone
                            ? isLight ? 'bg-slate-50/80 border-slate-200 opacity-70' : 'bg-slate-950/60 border-slate-800 opacity-70'
                            : isLight ? 'bg-white border-violet-100 hover:border-violet-300 shadow-xs' : 'bg-slate-900/80 border-slate-800'
                        }`}
                      >
                        <div className="flex items-start gap-3 flex-1">
                          <button
                            onClick={() => handleToggleTaskStatus(task.meeting_id, task.id, task.status)}
                            className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors cursor-pointer mt-0.5 shrink-0 ${
                              isDone
                                ? 'bg-emerald-600 border-emerald-600 text-white'
                                : 'border-slate-300 dark:border-slate-600 hover:border-violet-500'
                            }`}
                          >
                            {isDone && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                          </button>

                          <div className="space-y-1">
                            <div className={`font-semibold text-xs leading-snug ${
                              isDone ? 'line-through text-slate-400' : 'text-slate-900 dark:text-slate-100'
                            }`}>
                              {task.task_description}
                            </div>

                            <div className="flex items-center gap-2 text-[11px] text-slate-500 flex-wrap">
                              <span className="font-bold text-violet-600">
                                📅 {task.deadline}
                              </span>
                              <span>•</span>
                              <span className="truncate max-w-xs text-slate-600 dark:text-slate-400">
                                {task.meeting_title}
                              </span>
                              <span className={`px-1.5 py-0.2 rounded uppercase text-[9px] font-extrabold ${
                                task.priority === 'high'
                                  ? 'bg-rose-100 text-rose-700'
                                  : task.priority === 'medium'
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-slate-100 text-slate-600'
                              }`}>
                                {task.priority}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Direct Google Calendar Add */}
                        <div className="flex items-center gap-2 self-end sm:self-center">
                          <a
                            href={getGoogleCalendarUrl(task)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-violet-50 hover:bg-violet-100 text-violet-700 border border-violet-200 text-[11px] font-bold transition-all cursor-pointer"
                            title="Add event to your Google Calendar"
                          >
                            <Calendar className="w-3 h-3 text-violet-600" />
                            <span>Add to GCal</span>
                            <ExternalLink className="w-2.5 h-2.5" />
                          </a>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ================= TAB 2: VOICE RECORDER ================= */}
          {activeTab === 'recorder' && (
            <div className="space-y-5">
              <div className="p-4 rounded-xl bg-violet-50/60 dark:bg-violet-950/30 border border-violet-200 dark:border-violet-900 flex items-start gap-3">
                <Mic className="w-5 h-5 text-violet-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white">
                    Live Dictaphone & Voice Meeting Transcriber
                  </h4>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400">
                    Record live meetings or voice memos directly through your microphone. We'll transcribe speech in real-time and feed it into the AI extraction pipeline.
                  </p>
                </div>
              </div>

              {/* Recorder Surface */}
              <div className={`p-6 rounded-2xl border text-center space-y-4 ${
                isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800'
              }`}>
                {/* Visualizer wave */}
                <div className="flex items-center justify-center gap-1.5 h-12">
                  {[20, 45, 75, 100, 60, 85, 40, 95, 30, 70, 50, 80].map((h, i) => (
                    <div
                      key={i}
                      className={`w-1.5 rounded-full transition-all duration-200 ${
                        isRecording ? 'bg-violet-600 animate-pulse' : 'bg-slate-300 dark:bg-slate-700'
                      }`}
                      style={{
                        height: isRecording ? `${Math.max(15, (h * (Math.random() + 0.4)))}%` : '15%',
                      }}
                    />
                  ))}
                </div>

                {/* Timer */}
                <div className="text-2xl font-mono font-extrabold text-slate-900 dark:text-white">
                  {Math.floor(recordingSeconds / 60)
                    .toString()
                    .padStart(2, '0')}
                  :{(recordingSeconds % 60).toString().padStart(2, '0')}
                </div>

                <div className="flex items-center justify-center gap-3">
                  <button
                    onClick={toggleRecording}
                    className={`inline-flex items-center gap-2 px-6 py-3 rounded-full font-bold text-sm text-white shadow-lg transition-all cursor-pointer ${
                      isRecording
                        ? 'bg-rose-600 hover:bg-rose-500 shadow-rose-600/30'
                        : 'bg-violet-600 hover:bg-violet-500 shadow-violet-600/30'
                    }`}
                  >
                    {isRecording ? (
                      <>
                        <StopCircle className="w-5 h-5 fill-white" />
                        <span>Stop Voice Recording</span>
                      </>
                    ) : (
                      <>
                        <Mic className="w-5 h-5" />
                        <span>Start Recording Microphone</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Transcription Area */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 dark:text-slate-300">
                  Live Voice Transcript / Dictated Notes:
                </label>
                <textarea
                  rows={4}
                  value={transcriptDraft}
                  onChange={(e) => setTranscriptDraft(e.target.value)}
                  placeholder="Speak into microphone or review transcribed speech here...&#10;Example: 'Alice will update OAuth client secrets by Friday afternoon, while Bob checks server memory leak.'"
                  className={`w-full p-3.5 rounded-xl border text-xs font-mono leading-relaxed ${
                    isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-slate-950 border-slate-800 text-slate-100'
                  }`}
                />
              </div>

              <div className="flex items-center justify-end gap-2">
                <button
                  onClick={handleExtractFromRecording}
                  disabled={!transcriptDraft.trim()}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs shadow-md shadow-violet-600/30 transition-all disabled:opacity-50 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Extract Action Items from Voice Note</span>
                </button>
              </div>
            </div>
          )}

          {/* ================= TAB 3: EMAIL & SLACK DRAFTER ================= */}
          {activeTab === 'emaildraft' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Select Meeting to Recap:
                  </label>
                  <select
                    value={selectedMeetingForEmail}
                    onChange={(e) => setSelectedMeetingForEmail(e.target.value)}
                    className={`w-full p-2 rounded-lg border font-semibold ${
                      isLight ? 'bg-slate-50 border-slate-200 text-slate-800' : 'bg-slate-950 border-slate-800 text-slate-200'
                    }`}
                  >
                    {meetings.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.title} ({m.date})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Email Tone / Structure:
                  </label>
                  <select
                    value={emailTone}
                    onChange={(e) => setEmailTone(e.target.value as any)}
                    className={`w-full p-2 rounded-lg border font-semibold ${
                      isLight ? 'bg-slate-50 border-slate-200 text-slate-800' : 'bg-slate-950 border-slate-800 text-slate-200'
                    }`}
                  >
                    <option value="team">Team Follow-Up (Deliverables & Actions)</option>
                    <option value="executive">Executive Brief (Decisions + Actions)</option>
                    <option value="action_only">Bullet Tasks Only</option>
                  </select>
                </div>
              </div>

              {/* Draft Preview */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-700 dark:text-slate-300">
                    Subject: <span className="font-normal text-violet-700 font-mono">{draft.subject}</span>
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleCopyEmail}
                      className="px-2.5 py-1 rounded-lg border text-[11px] font-bold flex items-center gap-1.5 cursor-pointer bg-white dark:bg-slate-800 hover:bg-violet-50 text-violet-700 border-violet-200"
                    >
                      {copiedDraft ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedDraft ? 'Copied!' : 'Copy Body'}</span>
                    </button>
                    <button
                      onClick={handleOpenMailto}
                      className="px-3 py-1 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-[11px] font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Open in Email App</span>
                    </button>
                  </div>
                </div>

                <textarea
                  readOnly
                  rows={9}
                  value={draft.body}
                  className={`w-full p-3.5 rounded-xl border text-xs font-mono leading-relaxed resize-none ${
                    isLight ? 'bg-slate-50 border-slate-200 text-slate-800' : 'bg-slate-950 border-slate-800 text-slate-200'
                  }`}
                />
              </div>
            </div>
          )}

          {/* ================= TAB 4: QUICK TASK ADD ================= */}
          {activeTab === 'quicktask' && (
            <form onSubmit={handleCreateQuickTask} className="space-y-4">
              <div className="space-y-1">
                <label className="block font-bold text-slate-700 dark:text-slate-300">
                  Target Meeting
                </label>
                <select
                  value={quickTaskMeetingId}
                  onChange={(e) => setQuickTaskMeetingId(e.target.value)}
                  className={`w-full p-2.5 rounded-xl border font-semibold ${
                    isLight ? 'bg-slate-50 border-slate-200 text-slate-800' : 'bg-slate-950 border-slate-800 text-slate-200'
                  }`}
                >
                  {meetings.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.title} ({m.date})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="block font-bold text-slate-700 dark:text-slate-300">
                  Action Item Description
                </label>
                <input
                  type="text"
                  required
                  value={quickTaskDesc}
                  onChange={(e) => setQuickTaskDesc(e.target.value)}
                  placeholder="e.g. Verify biometric token invalidation on logout"
                  className={`w-full p-2.5 rounded-xl border ${
                    isLight ? 'bg-slate-50 border-slate-200 text-slate-900' : 'bg-slate-950 border-slate-800 text-slate-100'
                  }`}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Assignee / Owner
                  </label>
                  <input
                    type="text"
                    value={quickTaskOwner}
                    onChange={(e) => setQuickTaskOwner(e.target.value)}
                    placeholder="e.g. Mangal Rajan"
                    className={`w-full p-2 rounded-xl border ${
                      isLight ? 'bg-slate-50 border-slate-200 text-slate-900' : 'bg-slate-950 border-slate-800 text-slate-100'
                    }`}
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Deadline
                  </label>
                  <input
                    type="text"
                    value={quickTaskDeadline}
                    onChange={(e) => setQuickTaskDeadline(e.target.value)}
                    placeholder="e.g. Next Tuesday 3 PM"
                    className={`w-full p-2 rounded-xl border ${
                      isLight ? 'bg-slate-50 border-slate-200 text-slate-900' : 'bg-slate-950 border-slate-800 text-slate-100'
                    }`}
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Priority
                  </label>
                  <select
                    value={quickTaskPriority}
                    onChange={(e) => setQuickTaskPriority(e.target.value as any)}
                    className={`w-full p-2 rounded-xl border font-semibold ${
                      isLight ? 'bg-slate-50 border-slate-200 text-slate-900' : 'bg-slate-950 border-slate-800 text-slate-100'
                    }`}
                  >
                    <option value="high">High Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="low">Low Priority</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl text-slate-500 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs shadow-md shadow-violet-600/30 transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Action Item</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
