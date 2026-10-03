import React, { useState } from 'react';
import {
  Check,
  Copy,
  Download,
  Edit2,
  ExternalLink,
  Eye,
  FileCode,
  FileText,
  Key,
  Link,
  Maximize2,
  Pause,
  Play,
  Plus,
  RotateCcw,
  Sparkles,
  Tv,
  Video,
  Volume2,
  X,
} from 'lucide-react';
import { Meeting } from '../types.js';

interface MeetingMediaLinksBarProps {
  meeting: Meeting;
  isLight: boolean;
  onUpdateMeetingLinks: (updates: {
    meeting_link?: string;
    meeting_platform?: 'google_meet' | 'zoom' | 'teams' | 'webex' | 'custom';
    recording_url?: string;
    recording_passcode?: string;
    transcript_url?: string;
    transcript_file_name?: string;
  }) => Promise<void>;
  onShowToast: (msg: string, type?: 'success' | 'info') => void;
  onJumpToTimestamp?: (timestamp: string) => void;
}

export const MeetingMediaLinksBar: React.FC<MeetingMediaLinksBarProps> = ({
  meeting,
  isLight,
  onUpdateMeetingLinks,
  onShowToast,
  onJumpToTimestamp,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSeconds, setPlaybackSeconds] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [isEditingLinks, setIsEditingLinks] = useState(false);
  const [copiedPasscode, setCopiedPasscode] = useState(false);
  const [copiedTranscriptLink, setCopiedTranscriptLink] = useState(false);

  // Form edit states
  const [editMeetingLink, setEditMeetingLink] = useState(meeting.meeting_link || '');
  const [editPlatform, setEditPlatform] = useState(meeting.meeting_platform || 'google_meet');
  const [editRecordingUrl, setEditRecordingUrl] = useState(meeting.recording_url || '');
  const [editPasscode, setEditPasscode] = useState(meeting.recording_passcode || '');
  const [editTranscriptUrl, setEditTranscriptUrl] = useState(meeting.transcript_url || '');
  const [editTranscriptFileName, setEditTranscriptFileName] = useState(meeting.transcript_file_name || '');

  const totalDurationSeconds = (meeting.duration_minutes || 30) * 60;

  // Format seconds to mm:ss
  const formatTime = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60).toString().padStart(2, '0');
    const secs = Math.floor(totalSec % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  };

  // Play/pause simulation timer
  React.useEffect(() => {
    let interval: any = null;
    if (isPlaying) {
      interval = setInterval(() => {
        setPlaybackSeconds((prev) => {
          if (prev >= totalDurationSeconds) {
            setIsPlaying(false);
            return 0;
          }
          return prev + playbackSpeed;
        });
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isPlaying, playbackSpeed, totalDurationSeconds]);

  const handleCopyPasscode = () => {
    if (meeting.recording_passcode) {
      navigator.clipboard.writeText(meeting.recording_passcode);
      setCopiedPasscode(true);
      onShowToast('Recording passcode copied!', 'success');
      setTimeout(() => setCopiedPasscode(false), 2000);
    }
  };

  const handleCopyTranscriptLink = () => {
    const url = meeting.transcript_url || window.location.href;
    navigator.clipboard.writeText(url);
    setCopiedTranscriptLink(true);
    onShowToast('Transcript URL copied to clipboard!', 'success');
    setTimeout(() => setCopiedTranscriptLink(false), 2000);
  };

  const handleDownloadTranscriptFile = () => {
    const blob = new Blob([meeting.raw_transcript], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = meeting.transcript_file_name || `${meeting.title.replace(/\s+/g, '_')}_transcript.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    onShowToast('Raw transcript downloaded!', 'success');
  };

  const handleSaveLinks = async (e: React.FormEvent) => {
    e.preventDefault();
    await onUpdateMeetingLinks({
      meeting_link: editMeetingLink.trim() || undefined,
      meeting_platform: editPlatform as any,
      recording_url: editRecordingUrl.trim() || undefined,
      recording_passcode: editPasscode.trim() || undefined,
      transcript_url: editTranscriptUrl.trim() || undefined,
      transcript_file_name: editTranscriptFileName.trim() || undefined,
    });
    setIsEditingLinks(false);
    onShowToast('Meeting recording & transcript links updated!', 'success');
  };

  // Platform styling
  const platformLabel =
    meeting.meeting_platform === 'zoom'
      ? 'Zoom Meeting'
      : meeting.meeting_platform === 'teams'
      ? 'Microsoft Teams'
      : meeting.meeting_platform === 'webex'
      ? 'Cisco Webex'
      : meeting.meeting_platform === 'google_meet'
      ? 'Google Meet'
      : 'Online Room';

  const progressPercent = totalDurationSeconds > 0 ? (playbackSeconds / totalDurationSeconds) * 100 : 0;

  return (
    <div className="space-y-4">
      {/* 2 Distinct Separated Link Sections: Meeting Media vs Transcript Source */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* ================= SECTION 1: MEETING LIVE ROOM & RECORDING ================= */}
        <div
          className={`rounded-2xl border p-5 transition-all shadow-xs ${
            isLight
              ? 'bg-gradient-to-br from-violet-50/70 via-white to-purple-50/40 border-violet-200'
              : 'bg-gradient-to-br from-slate-900/90 via-slate-900/50 to-violet-950/20 border-violet-900/40'
          }`}
        >
          <div className="flex items-center justify-between pb-3 border-b border-violet-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-violet-600 text-white shadow-sm shadow-violet-600/30">
                <Video className="w-4 h-4" />
              </div>
              <div>
                <h3 className={`font-bold text-sm leading-none ${isLight ? 'text-slate-900' : 'text-white'}`}>
                  Meeting Recording & Live Room
                </h3>
                <span className="text-[11px] font-semibold text-violet-600">
                  {platformLabel} • {meeting.recording_duration || `${meeting.duration_minutes}:00`}
                </span>
              </div>
            </div>

            <button
              onClick={() => setIsEditingLinks(true)}
              className={`p-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer ${
                isLight
                  ? 'bg-white hover:bg-violet-50 border-violet-200 text-violet-700'
                  : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-violet-300'
              }`}
              title="Edit recording links"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span className="text-[11px]">Edit Links</span>
            </button>
          </div>

          {/* Player Bar & Controls */}
          <div className="mt-4 space-y-3">
            {/* Embedded Player Simulator Surface */}
            <div
              className={`rounded-xl p-3.5 border relative overflow-hidden ${
                isLight ? 'bg-white border-slate-200 shadow-xs' : 'bg-slate-950/80 border-slate-800'
              }`}
            >
              <div className="flex items-center justify-between text-xs mb-2">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="w-8 h-8 rounded-full bg-violet-600 hover:bg-violet-500 text-white flex items-center justify-center shadow-md shadow-violet-600/30 transition-transform active:scale-95 cursor-pointer"
                    title={isPlaying ? 'Pause simulation playback' : 'Play recording audio/video sync'}
                  >
                    {isPlaying ? <Pause className="w-4 h-4 fill-white" /> : <Play className="w-4 h-4 fill-white ml-0.5" />}
                  </button>
                  <div className="text-[11px] font-mono font-bold">
                    <span className="text-violet-600">{formatTime(playbackSeconds)}</span>
                    <span className="text-slate-400"> / {formatTime(totalDurationSeconds)}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 text-[11px]">
                  <span className="text-slate-400 font-medium">Speed:</span>
                  {[1, 1.25, 1.5].map((spd) => (
                    <button
                      key={spd}
                      onClick={() => setPlaybackSpeed(spd)}
                      className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                        playbackSpeed === spd
                          ? 'bg-violet-600 text-white'
                          : isLight
                          ? 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {spd}x
                    </button>
                  ))}
                </div>
              </div>

              {/* Progress Scrubber */}
              <div
                className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden cursor-pointer relative"
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const pos = (e.clientX - rect.left) / rect.width;
                  setPlaybackSeconds(Math.floor(pos * totalDurationSeconds));
                }}
              >
                <div
                  className="h-full bg-gradient-to-r from-violet-600 to-purple-500 rounded-full transition-all duration-150"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1">
                <span>Start: [00:00]</span>
                <span>Scrub synced with transcript turns</span>
                <span>End: [{meeting.duration_minutes}:00]</span>
              </div>
            </div>

            {/* Live Link & Recording Action Buttons */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              {/* External Cloud Recording Link */}
              {meeting.recording_url ? (
                <a
                  href={meeting.recording_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold shadow-sm shadow-violet-600/30 transition-all cursor-pointer"
                >
                  <Tv className="w-3.5 h-3.5" />
                  <span>Open Cloud Recording</span>
                  <ExternalLink className="w-3 h-3 ml-0.5" />
                </a>
              ) : (
                <button
                  onClick={() => setIsEditingLinks(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-dashed border-violet-300 dark:border-violet-800 text-violet-600 text-xs font-semibold hover:bg-violet-50 dark:hover:bg-violet-950/30 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Recording URL</span>
                </button>
              )}

              {/* Live Meeting Room Link */}
              {meeting.meeting_link && (
                <a
                  href={meeting.meeting_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                    isLight
                      ? 'bg-white hover:bg-slate-50 text-slate-800 border-slate-300'
                      : 'bg-slate-900 hover:bg-slate-800 text-slate-200 border-slate-700'
                  }`}
                >
                  <Video className="w-3.5 h-3.5 text-violet-600" />
                  <span>Join Meeting Room</span>
                  <ExternalLink className="w-3 h-3 text-slate-400" />
                </a>
              )}

              {/* Passcode Chip */}
              {meeting.recording_passcode && (
                <button
                  onClick={handleCopyPasscode}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-mono border transition-colors cursor-pointer ${
                    isLight
                      ? 'bg-violet-50/80 hover:bg-violet-100 text-violet-800 border-violet-200'
                      : 'bg-slate-900 hover:bg-slate-800 text-violet-300 border-slate-800'
                  }`}
                  title="Click to copy passcode"
                >
                  <Key className="w-3 h-3 text-violet-500" />
                  <span>Pass: {meeting.recording_passcode}</span>
                  {copiedPasscode ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3 text-slate-400" />}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ================= SECTION 2: SEPARATED TRANSCRIPT LINKS & SOURCE ================= */}
        <div
          className={`rounded-2xl border p-5 transition-all shadow-xs ${
            isLight
              ? 'bg-gradient-to-br from-fuchsia-50/50 via-white to-violet-50/30 border-purple-200'
              : 'bg-gradient-to-br from-slate-900/90 via-slate-900/50 to-purple-950/20 border-purple-900/40'
          }`}
        >
          <div className="flex items-center justify-between pb-3 border-b border-purple-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-purple-600 text-white shadow-sm shadow-purple-600/30">
                <FileText className="w-4 h-4" />
              </div>
              <div>
                <h3 className={`font-bold text-sm leading-none ${isLight ? 'text-slate-900' : 'text-white'}`}>
                  Separate Transcript Source & Links
                </h3>
                <span className="text-[11px] font-semibold text-purple-600">
                  {meeting.segments.length} Diarized Turns • Format: {meeting.transcript_format?.toUpperCase() || 'VTT'}
                </span>
              </div>
            </div>

            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
              Verified Diarized Source
            </span>
          </div>

          {/* Transcript Details & Link Cards */}
          <div className="mt-4 space-y-3">
            {/* File info box */}
            <div
              className={`p-3.5 rounded-xl border flex items-center justify-between text-xs ${
                isLight ? 'bg-white border-slate-200 shadow-xs' : 'bg-slate-950/80 border-slate-800'
              }`}
            >
              <div className="flex items-center gap-3">
                <FileCode className="w-6 h-6 text-purple-600 shrink-0" />
                <div>
                  <div className="font-bold text-slate-800 dark:text-slate-200 line-clamp-1">
                    {meeting.transcript_file_name || `${meeting.title.replace(/\s+/g, '_')}.vtt`}
                  </div>
                  <div className="text-[11px] text-slate-500">
                    {meeting.raw_transcript.split(/\s+/).filter(Boolean).length} total words extracted
                  </div>
                </div>
              </div>

              {/* Download raw transcript */}
              <button
                onClick={handleDownloadTranscriptFile}
                className="px-2.5 py-1.5 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                title="Download raw timestamped transcript"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download</span>
              </button>
            </div>

            {/* Transcript Link buttons */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              {/* External Cloud Transcript Document (Google Doc, Notion, Otter) */}
              {meeting.transcript_url ? (
                <a
                  href={meeting.transcript_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-sm shadow-purple-600/30 transition-all cursor-pointer"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Open Transcript Document</span>
                </a>
              ) : (
                <button
                  onClick={() => setIsEditingLinks(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-dashed border-purple-300 dark:border-purple-800 text-purple-600 text-xs font-semibold hover:bg-purple-50 dark:hover:bg-purple-950/30 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Attach Document URL</span>
                </button>
              )}

              {/* Copy Transcript URL */}
              <button
                onClick={handleCopyTranscriptLink}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                  isLight
                    ? 'bg-white hover:bg-slate-50 text-slate-800 border-slate-300'
                    : 'bg-slate-900 hover:bg-slate-800 text-slate-200 border-slate-700'
                }`}
              >
                {copiedTranscriptLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
                <span>{copiedTranscriptLink ? 'Copied Link!' : 'Copy Transcript Link'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ================= EDIT LINKS MODAL ================= */}
      {isEditingLinks && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
          <div
            className={`w-full max-w-lg rounded-2xl border p-6 space-y-4 shadow-2xl ${
              isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
            }`}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <Link className="w-4 h-4 text-violet-600" />
                <span>Configure Meeting & Transcript Links</span>
              </h3>
              <button
                onClick={() => setIsEditingLinks(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveLinks} className="space-y-4 text-xs">
              {/* Meeting platform & Live link */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 dark:text-slate-300">
                  Meeting Platform & Live Room Link
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <select
                    value={editPlatform}
                    onChange={(e) => setEditPlatform(e.target.value as any)}
                    className="p-2 rounded-lg border bg-slate-50 dark:bg-slate-950 border-slate-300 dark:border-slate-800 font-semibold"
                  >
                    <option value="google_meet">Google Meet</option>
                    <option value="zoom">Zoom</option>
                    <option value="teams">Microsoft Teams</option>
                    <option value="webex">Cisco Webex</option>
                    <option value="custom">Custom Platform</option>
                  </select>
                  <input
                    type="url"
                    value={editMeetingLink}
                    onChange={(e) => setEditMeetingLink(e.target.value)}
                    placeholder="https://meet.google.com/xyz or https://zoom.us/j/..."
                    className="col-span-2 p-2 rounded-lg border bg-slate-50 dark:bg-slate-950 border-slate-300 dark:border-slate-800"
                  />
                </div>
              </div>

              {/* Recording URL & Passcode */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 dark:text-slate-300">
                  Cloud Recording URL & Passcode
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <input
                    type="url"
                    value={editRecordingUrl}
                    onChange={(e) => setEditRecordingUrl(e.target.value)}
                    placeholder="https://zoom.us/rec/play/... or Drive video link"
                    className="col-span-2 p-2 rounded-lg border bg-slate-50 dark:bg-slate-950 border-slate-300 dark:border-slate-800"
                  />
                  <input
                    type="text"
                    value={editPasscode}
                    onChange={(e) => setEditPasscode(e.target.value)}
                    placeholder="Passcode"
                    className="p-2 rounded-lg border bg-slate-50 dark:bg-slate-950 border-slate-300 dark:border-slate-800 font-mono"
                  />
                </div>
              </div>

              {/* Separate Transcript URL & File name */}
              <div className="space-y-1.5 pt-1 border-t border-slate-200 dark:border-slate-800">
                <label className="font-bold text-slate-700 dark:text-slate-300">
                  Separate Transcript Document Link (Google Doc / Notion / Cloud)
                </label>
                <input
                  type="url"
                  value={editTranscriptUrl}
                  onChange={(e) => setEditTranscriptUrl(e.target.value)}
                  placeholder="https://docs.google.com/document/d/... or Notion link"
                  className="w-full p-2 rounded-lg border bg-slate-50 dark:bg-slate-950 border-slate-300 dark:border-slate-800"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 dark:text-slate-300">
                  Transcript File Name
                </label>
                <input
                  type="text"
                  value={editTranscriptFileName}
                  onChange={(e) => setEditTranscriptFileName(e.target.value)}
                  placeholder="e.g. mobile_sync_transcript.vtt"
                  className="w-full p-2 rounded-lg border bg-slate-50 dark:bg-slate-950 border-slate-300 dark:border-slate-800"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsEditingLinks(false)}
                  className="px-3.5 py-1.5 rounded-lg text-slate-500 hover:text-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold shadow-md shadow-violet-600/30"
                >
                  Save Links
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
