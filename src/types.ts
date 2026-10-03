export type Priority = 'high' | 'medium' | 'low';
export type TaskStatus = 'pending' | 'in_progress' | 'completed';

export interface TranscriptSegment {
  id: string;
  meeting_id: string;
  speaker: string;
  timestamp: string; // e.g. "02:15" or "10:45 AM"
  text: string;
  action_item_ids?: string[]; // IDs of action items derived from this segment
}

export interface ActionItem {
  id: string;
  meeting_id: string;
  task_description: string;
  owner: string; // Name or "Unassigned"
  deadline: string; // User display deadline, e.g., "Oct 15, 2026" or "TBD"
  deadline_iso?: string; // Standard ISO date if resolvable (e.g. "2026-10-15")
  confidence_score: number; // 0.0 to 1.0 (e.g. 0.94)
  confidence_level?: 'high' | 'medium' | 'low'; // High >0.85, Med 0.60-0.85, Low <0.60
  status: TaskStatus;
  priority: Priority;
  source_segment_id?: string;
  source_quote?: string;
  is_ambiguous_deadline?: boolean;
  is_unassigned_owner?: boolean;
  risk_reason?: string; // e.g. "Missing specific date", "Unassigned assignee", "Dependencies mentioned"
  tags?: string[];
  created_at?: string;
}

export interface SpeakerStat {
  speaker: string;
  word_count: number;
  talk_percentage: number;
  action_item_count: number;
}

export interface ExecutiveSummary {
  bullets: string[];
  key_decisions: string[];
  sentiment: {
    overall: string; // e.g. "Optimistic & Decisive", "Neutral & Objective", "Concerned"
    score: number; // 0 to 100
    tone: string;
  };
  speaker_stats: SpeakerStat[];
  actionable_ratio: number; // percentage of discussion yielding tasks
  topics: string[];
}

export interface Meeting {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  duration_minutes: number;
  raw_transcript: string;
  summary: string;
  executive_summary?: ExecutiveSummary;
  segments: TranscriptSegment[];
  action_items: ActionItem[];
  created_at: string;
  participants: string[];
  tags: string[];

  // Meeting Live Room & Recording Links
  meeting_link?: string; // Live meeting URL e.g. "https://meet.google.com/abc-defg-hij"
  meeting_platform?: 'google_meet' | 'zoom' | 'teams' | 'webex' | 'custom';
  recording_url?: string; // Cloud recording playback URL e.g. "https://zoom.us/rec/play/xyz"
  recording_passcode?: string;
  recording_duration?: string; // e.g. "42:15"
  recording_thumbnail?: string;

  // Separate Transcript Links & Document Source
  transcript_url?: string; // External document link (e.g. Google Doc, Notion, Otter)
  transcript_file_name?: string; // e.g. "transcript_q3_sprint.vtt"
  transcript_format?: 'vtt' | 'srt' | 'txt' | 'doc';
}

export interface DuplicateSuggestion {
  primary_id: string;
  duplicate_id: string;
  primary_task: string;
  duplicate_task: string;
  similarity_score: number;
  suggested_action: string;
}

export interface DashboardStats {
  total_meetings: number;
  total_action_items: number;
  pending_tasks: number;
  in_progress_tasks: number;
  completed_tasks: number;
  avg_confidence: number;
  unassigned_tasks_count: number;
  ambiguous_deadlines_count: number;
}

export interface GlobalTask extends ActionItem {
  meeting_title: string;
  meeting_date: string;
}

export interface GlobalAnalytics {
  total_meetings: number;
  total_tasks: number;
  priority_breakdown: { high: number; medium: number; low: number };
  status_breakdown: { pending: number; in_progress: number; completed: number };
  speakers: Array<{ name: string; tasks: number; meetings: number }>;
  completion_rate: number;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: string;
  organization: string;
  assignedNames: string[];
  theme_preference?: 'light' | 'dark';
}

