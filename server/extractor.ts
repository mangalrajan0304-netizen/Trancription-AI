import { GoogleGenAI, Type } from '@google/genai';
import { Meeting, TranscriptSegment, ActionItem, ExecutiveSummary, SpeakerStat } from '../src/types.js';

interface RawExtractionResponse {
  title?: string;
  summary: string;
  participants: string[];
  action_items: Array<{
    task_description: string;
    owner?: string;
    deadline?: string;
    deadline_iso?: string;
    confidence_score?: number;
    priority?: 'high' | 'medium' | 'low';
    source_quote?: string;
    risk_reason?: string;
    tags?: string[];
  }>;
  executive_summary?: {
    bullets: string[];
    key_decisions: string[];
    sentiment_overall: string;
    sentiment_score: number;
    sentiment_tone: string;
    topics: string[];
  };
}

/**
 * Parses raw transcript text into structured segments with timestamps and speakers.
 * Supports VTT, SRT, chat format, or plain dialog.
 */
export function parseTranscriptSegments(raw: string, meetingId: string): TranscriptSegment[] {
  const lines = raw.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  const segments: TranscriptSegment[] = [];

  // Check if WebVTT
  const isVTT = raw.includes('WEBVTT') || raw.includes('-->');
  if (isVTT) {
    let currentTimestamp = '00:00';
    let currentSpeaker = 'Speaker';
    let currentText = '';

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (line === 'WEBVTT' || /^\d+$/.test(line)) continue;

      if (line.includes('-->')) {
        const parts = line.split('-->');
        currentTimestamp = parts[0].trim().split('.')[0];
        continue;
      }

      // Check for voice tag <v Speaker> or Speaker:
      const vMatch = line.match(/<v\s+([^>]+)>(.*?)<\/v>/i) || line.match(/<v\s+([^>]+)>(.*)/i);
      if (vMatch) {
        currentSpeaker = vMatch[1];
        currentText = vMatch[2];
      } else {
        const colonMatch = line.match(/^([^:]{2,30}):\s*(.*)$/);
        if (colonMatch) {
          currentSpeaker = colonMatch[1];
          currentText = colonMatch[2];
        } else {
          currentText = line;
        }
      }

      if (currentText) {
        segments.push({
          id: `seg-${segments.length + 1}`,
          meeting_id: meetingId,
          speaker: currentSpeaker,
          timestamp: currentTimestamp,
          text: currentText.replace(/<[^>]*>/g, '').trim(),
        });
      }
    }

    if (segments.length > 0) return segments;
  }

  // Regex for patterns like:
  // [00:02:15] Sarah (Product Lead): Good morning
  // [10:45 AM] Liam: Text
  // Sarah (10:15): Text
  // Sarah: Text
  const timestampColonRegex = /^\[?(\d{1,2}:\d{2}(?::\d{2})?(?:\s*[AP]M)?)\]?\s*([^:()]+(?:\s*\([^)]+\))?):\s*(.*)$/i;
  const speakerTimestampRegex = /^([^:()]+(?:\s*\([^)]+\))?)\s*\[?(\d{1,2}:\d{2}(?::\d{2})?(?:\s*[AP]M)?)\]?:\s*(.*)$/i;
  const simpleColonRegex = /^([A-Z][a-zA-Z0-9_\s.()]{1,35}):\s*(.*)$/;

  let fallbackTimestampSeconds = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    let match = line.match(timestampColonRegex);
    if (match) {
      segments.push({
        id: `seg-${segments.length + 1}`,
        meeting_id: meetingId,
        speaker: match[2].trim(),
        timestamp: match[1].trim(),
        text: match[3].trim(),
      });
      continue;
    }

    match = line.match(speakerTimestampRegex);
    if (match) {
      segments.push({
        id: `seg-${segments.length + 1}`,
        meeting_id: meetingId,
        speaker: match[1].trim(),
        timestamp: match[2].trim(),
        text: match[3].trim(),
      });
      continue;
    }

    match = line.match(simpleColonRegex);
    if (match && !match[1].toLowerCase().startsWith('http') && !match[1].toLowerCase().startsWith('note')) {
      const minutes = Math.floor(fallbackTimestampSeconds / 60)
        .toString()
        .padStart(2, '0');
      const seconds = (fallbackTimestampSeconds % 60).toString().padStart(2, '0');
      fallbackTimestampSeconds += 35;

      segments.push({
        id: `seg-${segments.length + 1}`,
        meeting_id: meetingId,
        speaker: match[1].trim(),
        timestamp: `${minutes}:${seconds}`,
        text: match[2].trim(),
      });
      continue;
    }

    // Line without explicit speaker: attach to previous or create unknown
    if (segments.length > 0) {
      segments[segments.length - 1].text += ' ' + line;
    } else {
      segments.push({
        id: `seg-1`,
        meeting_id: meetingId,
        speaker: 'Participant',
        timestamp: '00:00',
        text: line,
      });
    }
  }

  return segments;
}

/**
 * Normalizes relative dates like "tomorrow", "next Monday", "by Friday"
 * into approximate ISO date strings based on meetingDate (YYYY-MM-DD).
 */
export function normalizeRelativeDate(deadlineStr: string, meetingDateStr: string): { display: string; iso?: string; isAmbiguous: boolean } {
  if (!deadlineStr || deadlineStr.trim() === '' || deadlineStr.toLowerCase().includes('tbd')) {
    return { display: 'TBD', isAmbiguous: true };
  }

  const clean = deadlineStr.trim();
  const lower = clean.toLowerCase();

  // If already full ISO or YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}/.test(clean)) {
    return { display: clean, iso: clean, isAmbiguous: false };
  }

  const baseDate = new Date(meetingDateStr || new Date().toISOString().slice(0, 10));
  if (isNaN(baseDate.getTime())) {
    return { display: clean, isAmbiguous: true };
  }

  if (lower.includes('soon') || lower.includes('asap') || lower.includes('next week') || lower.includes('later')) {
    return { display: clean, isAmbiguous: true };
  }

  const target = new Date(baseDate);

  if (lower.includes('today')) {
    return { display: 'Today', iso: target.toISOString().slice(0, 10), isAmbiguous: false };
  }

  if (lower.includes('tomorrow')) {
    target.setDate(target.getDate() + 1);
    return { display: 'Tomorrow', iso: target.toISOString().slice(0, 10), isAmbiguous: false };
  }

  const daysOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  for (let i = 0; i < daysOfWeek.length; i++) {
    const day = daysOfWeek[i];
    if (lower.includes(day)) {
      const currentDay = baseDate.getDay();
      let diff = (i - currentDay + 7) % 7;
      if (diff === 0) diff = 7; // Next occurrence
      if (lower.includes('next ' + day)) diff += 7;
      target.setDate(baseDate.getDate() + diff);
      const iso = target.toISOString().slice(0, 10);
      return { display: clean, iso, isAmbiguous: false };
    }
  }

  // Month day formats e.g. "Sep 30", "October 1st", "09/30"
  const monthMatch = lower.match(/(jan|feb|mar|apr|may|jun|jul|aug|sep|sept|oct|nov|dec)[a-z]*\s+(\d{1,2})/);
  if (monthMatch) {
    const months: Record<string, number> = {
      jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5, jul: 6, aug: 7, sep: 8, sept: 8, oct: 9, nov: 10, dec: 11,
    };
    const m = months[monthMatch[1].slice(0, 4)] ?? months[monthMatch[1].slice(0, 3)];
    const d = parseInt(monthMatch[2], 10);
    const yr = baseDate.getFullYear();
    const dObj = new Date(yr, m, d);
    if (!isNaN(dObj.getTime())) {
      return { display: clean, iso: dObj.toISOString().slice(0, 10), isAmbiguous: false };
    }
  }

  return { display: clean, isAmbiguous: true };
}

/**
 * Extracts action items, executive summary, decisions, and speaker metrics using Gemini 3.8 Flash.
 */
export async function extractMeetingInsights(
  rawTranscript: string,
  meta?: {
    title?: string;
    date?: string;
    duration?: number;
    meeting_link?: string;
    meeting_platform?: 'google_meet' | 'zoom' | 'teams' | 'webex' | 'custom';
    recording_url?: string;
    recording_passcode?: string;
    recording_duration?: string;
    transcript_url?: string;
    transcript_file_name?: string;
    transcript_format?: 'vtt' | 'srt' | 'txt' | 'doc';
  }
): Promise<{
  meeting: Meeting;
}> {
  const meetingId = `meet-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
  const meetingDate = meta?.date || new Date().toISOString().slice(0, 10);
  const segments = parseTranscriptSegments(rawTranscript, meetingId);

  // Compute speaker stats baseline from segments
  const speakerWordCounts: Record<string, number> = {};
  let totalWords = 0;
  segments.forEach((seg) => {
    const words = seg.text.split(/\s+/).filter(Boolean).length;
    speakerWordCounts[seg.speaker] = (speakerWordCounts[seg.speaker] || 0) + words;
    totalWords += words;
  });

  const participantsList = Object.keys(speakerWordCounts);

  let rawExtraction: RawExtractionResponse | null = null;
  const apiKey = process.env.GEMINI_API_KEY;

  if (apiKey) {
    try {
      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });

      const prompt = `You are PulseAction AI, an intelligent executive meeting analyst and task extraction engine.
Analyze the following diarized meeting transcript thoroughly. Extract every concrete action item, commitment, follow-up, and decision.

Reference Meeting Date: ${meetingDate}
Participants detected: ${participantsList.join(', ')}

TRANSCRIPT:
"""
${rawTranscript}
"""

Rules:
1. Every action item must have a clear, actionable task description beginning with an imperative verb (e.g. "Configure Terraform module", "Conduct unit test coverage audit").
2. Assign the owner accurately to the participant who agreed or was assigned to execute it. If no owner is assigned or agreed upon, return "Unassigned".
3. Extract explicit deadlines. If a relative date is mentioned (e.g. "by tomorrow 5 PM", "next Tuesday", "before Friday"), resolve or specify it. If none or vague, specify "TBD" or describe (e.g. "Soon").
4. Assign a calibrated confidence score between 0.10 and 0.99. Items with clear owner, direct commitment ("I will..."), and firm deadline should be >0.90. Items with unassigned owners or vague deadlines should be <=0.75.
5. Provide the exact source quote from the transcript from which the task originated.
6. Provide an objective risk reason if the task lacks an owner, has an ambiguous deadline, or faces dependencies.
7. Include an Executive Summary with 4-6 concise bullet points, 2-4 key decisions made, and overall sentiment analysis.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING, description: 'Descriptive title of the meeting' },
              summary: { type: Type.STRING, description: '2-3 sentence overview of the meeting discussion' },
              participants: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: 'List of participants in the meeting',
              },
              action_items: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    task_description: { type: Type.STRING },
                    owner: { type: Type.STRING },
                    deadline: { type: Type.STRING },
                    confidence_score: { type: Type.NUMBER },
                    priority: { type: Type.STRING, enum: ['high', 'medium', 'low'] },
                    source_quote: { type: Type.STRING },
                    risk_reason: { type: Type.STRING },
                    tags: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING },
                    },
                  },
                  required: ['task_description', 'owner', 'confidence_score', 'priority'],
                },
              },
              executive_summary: {
                type: Type.OBJECT,
                properties: {
                  bullets: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                  key_decisions: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                  sentiment_overall: { type: Type.STRING },
                  sentiment_score: { type: Type.NUMBER },
                  sentiment_tone: { type: Type.STRING },
                  topics: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                },
                required: ['bullets', 'key_decisions', 'sentiment_overall', 'sentiment_score'],
              },
            },
            required: ['summary', 'action_items'],
          },
        },
      });

      if (response.text) {
        rawExtraction = JSON.parse(response.text.trim()) as RawExtractionResponse;
      }
    } catch (err) {
      console.warn('Gemini extraction failed or rate limited, falling back to deterministic extraction:', err);
    }
  }

  // If Gemini was not available or failed, run rule-based deterministic extraction
  if (!rawExtraction || !rawExtraction.action_items || rawExtraction.action_items.length === 0) {
    rawExtraction = fallbackDeterministicExtract(segments, rawTranscript, meetingDate);
  }

  // Construct ActionItems and link to TranscriptSegments
  const actionItems: ActionItem[] = [];

  rawExtraction.action_items.forEach((item, idx) => {
    const rawDeadline = item.deadline || 'TBD';
    const normDate = normalizeRelativeDate(rawDeadline, meetingDate);
    const owner = item.owner && item.owner.trim() !== '' ? item.owner.trim() : 'Unassigned';
    const isUnassigned = owner.toLowerCase() === 'unassigned' || owner.toLowerCase() === 'tbd';
    const isAmbiguous = normDate.isAmbiguous || rawDeadline.toLowerCase().includes('tbd');
    const conf = typeof item.confidence_score === 'number' ? Math.min(Math.max(item.confidence_score, 0.4), 0.99) : 0.85;

    const actionId = `act-${Date.now().toString(36)}-${idx + 1}`;

    // Link to best segment match
    let matchedSegId: string | undefined;
    if (item.source_quote) {
      const qLower = item.source_quote.toLowerCase();
      const matched = segments.find((s) => s.text.toLowerCase().includes(qLower) || qLower.includes(s.text.toLowerCase().substring(0, 30)));
      if (matched) {
        matchedSegId = matched.id;
      }
    }

    if (!matchedSegId && segments.length > 0) {
      // Find segment with owner or keyword match
      const matched = segments.find(
        (s) => s.speaker.toLowerCase().includes(owner.toLowerCase()) || s.text.toLowerCase().includes(item.task_description.toLowerCase().split(' ')[0])
      );
      if (matched) matchedSegId = matched.id;
    }

    // Attach action item id to segment
    if (matchedSegId) {
      const seg = segments.find((s) => s.id === matchedSegId);
      if (seg) {
        seg.action_item_ids = seg.action_item_ids || [];
        seg.action_item_ids.push(actionId);
      }
    }

    actionItems.push({
      id: actionId,
      meeting_id: meetingId,
      task_description: item.task_description,
      owner: isUnassigned ? 'Unassigned' : owner,
      deadline: normDate.display,
      deadline_iso: normDate.iso,
      confidence_score: conf,
      confidence_level: conf > 0.85 ? 'high' : conf >= 0.6 ? 'medium' : 'low',
      status: 'pending',
      priority: item.priority || 'medium',
      source_segment_id: matchedSegId,
      source_quote: item.source_quote,
      is_ambiguous_deadline: isAmbiguous,
      is_unassigned_owner: isUnassigned,
      risk_reason:
        item.risk_reason ||
        (isUnassigned && isAmbiguous
          ? 'No assigned owner & ambiguous timeline'
          : isUnassigned
          ? 'Owner not explicitly assigned'
          : isAmbiguous
          ? 'Target completion date unspecified'
          : undefined),
      tags: item.tags || ['Action Item'],
      created_at: new Date().toISOString(),
    });
  });

  // Calculate speaker metrics
  const speakerStats: SpeakerStat[] = participantsList.map((speaker) => {
    const wordCount = speakerWordCounts[speaker] || 0;
    const talkPercentage = totalWords > 0 ? Math.round((wordCount / totalWords) * 100) : 0;
    const taskCount = actionItems.filter((a) => a.owner.toLowerCase().includes(speaker.toLowerCase())).length;
    return {
      speaker,
      word_count: wordCount,
      talk_percentage: talkPercentage,
      action_item_count: taskCount,
    };
  });

  const actionableRatio = segments.length > 0 ? Math.round((actionItems.length / segments.length) * 100) : 50;

  const executiveSummary: ExecutiveSummary = {
    bullets: rawExtraction.executive_summary?.bullets || [
      'Reviewed current project milestones and identified core technical deliverables.',
      'Assigned key follow-up action items with timelines.',
      'Highlighted dependencies and testing bottlenecks requiring attention.',
    ],
    key_decisions: rawExtraction.executive_summary?.key_decisions || [
      'Prioritize high-confidence release items before next milestone.',
      'Triage unassigned tickets during upcoming standup.',
    ],
    sentiment: {
      overall: rawExtraction.executive_summary?.sentiment_overall || 'Collaborative & Constructive',
      score: rawExtraction.executive_summary?.sentiment_score || 85,
      tone: rawExtraction.executive_summary?.sentiment_tone || 'Professional, goal-focused dialogue',
    },
    speaker_stats: speakerStats,
    actionable_ratio: actionableRatio,
    topics: rawExtraction.executive_summary?.topics || ['Milestones', 'Roadmap', 'Action Items'],
  };

  const meeting: Meeting = {
    id: meetingId,
    title: meta?.title || rawExtraction.title || 'Meeting Summary & Tasks',
    date: meetingDate,
    duration_minutes: meta?.duration || Math.max(15, Math.round(totalWords / 130)),
    created_at: new Date().toISOString(),
    participants: participantsList.length > 0 ? participantsList : ['Team'],
    tags: executiveSummary.topics.slice(0, 4),
    summary: rawExtraction.summary || 'Meeting notes and extracted action items.',
    executive_summary: executiveSummary,
    segments,
    action_items: actionItems,
    raw_transcript: rawTranscript,
    meeting_link: meta?.meeting_link,
    meeting_platform: meta?.meeting_platform || (meta?.meeting_link?.includes('zoom') ? 'zoom' : meta?.meeting_link?.includes('teams') ? 'teams' : meta?.meeting_link?.includes('meet.google') ? 'google_meet' : 'custom'),
    recording_url: meta?.recording_url,
    recording_passcode: meta?.recording_passcode,
    recording_duration: meta?.recording_duration,
    transcript_url: meta?.transcript_url,
    transcript_file_name: meta?.transcript_file_name,
    transcript_format: meta?.transcript_format || 'txt',
  };

  return { meeting };
}

/**
 * Fallback deterministic extractor that uses linguistic heuristics
 * (imperative clauses, modals, speaker turns) when Gemini API is unavailable.
 */
function fallbackDeterministicExtract(
  segments: TranscriptSegment[],
  rawTranscript: string,
  meetingDate: string
): RawExtractionResponse {
  const actionItems: RawExtractionResponse['action_items'] = [];
  const triggerPhrases = [
    { pattern: /(?:i will|i'll|let me|i can)\s+([^.?!]+)/i, defaultConf: 0.92, priority: 'high' as const },
    { pattern: /(?:we need to|someone should|we must|make sure to)\s+([^.?!]+)/i, defaultConf: 0.74, priority: 'high' as const },
    { pattern: /(?:can you|could you|please)\s+([^.?!]+)/i, defaultConf: 0.82, priority: 'medium' as const },
    { pattern: /(?:action item|takeaway|follow up on|todo):\s*([^.?!]+)/i, defaultConf: 0.95, priority: 'high' as const },
    { pattern: /(?:look into|investigate|schedule|draft|send)\s+([^.?!]+)/i, defaultConf: 0.78, priority: 'medium' as const },
  ];

  segments.forEach((seg) => {
    triggerPhrases.forEach(({ pattern, defaultConf, priority }) => {
      const match = seg.text.match(pattern);
      if (match && match[1] && match[1].length > 10 && match[1].length < 150) {
        const clause = match[1].trim();
        // Capitalize first letter
        const taskDescription = clause.charAt(0).toUpperCase() + clause.slice(1);

        // Detect deadline hints
        let deadline = 'TBD';
        const dateMatch = seg.text.match(/(?:by|before|on|at|until)\s+([A-Za-z0-9\s:,-]+?)(?=[.?!]|$)/i);
        if (dateMatch) {
          deadline = dateMatch[1].trim();
        }

        // Detect owner
        let owner = seg.speaker;
        let isUnassigned = false;
        if (pattern.source.includes('someone should') || pattern.source.includes('we need to')) {
          owner = 'Unassigned';
          isUnassigned = true;
        }

        actionItems.push({
          task_description: taskDescription,
          owner: isUnassigned ? 'Unassigned' : owner,
          deadline: deadline,
          confidence_score: isUnassigned ? 0.68 : defaultConf,
          priority: priority,
          source_quote: seg.text,
          risk_reason: isUnassigned ? 'Unassigned owner requires assignment' : undefined,
          tags: ['Action Item'],
        });
      }
    });
  });

  // Deduplicate near-identical tasks
  const uniqueItems = actionItems.filter(
    (item, index, self) => index === self.findIndex((t) => t.task_description.toLowerCase() === item.task_description.toLowerCase())
  );

  return {
    title: 'Extracted Meeting Action Items',
    summary: `Extracted ${uniqueItems.length} actionable commitments and follow-ups from discussion transcript.`,
    participants: Array.from(new Set(segments.map((s) => s.speaker))),
    action_items: uniqueItems.length > 0 ? uniqueItems : [
      {
        task_description: 'Review transcript notes and follow up on team commitments',
        owner: 'Unassigned',
        deadline: 'Next week',
        confidence_score: 0.7,
        priority: 'medium',
        source_quote: segments[0]?.text || '',
        risk_reason: 'Automated fallback task',
        tags: ['Review'],
      },
    ],
    executive_summary: {
      bullets: [
        'Detailed transcript processed and decomposed into speaker turns.',
        'Extracted primary commitments, deadlines, and ownership responsibilities.',
        'Flagged ambiguous timelines and unassigned tasks for review.',
      ],
      key_decisions: ['Assign clear owners to pending action items in upcoming sync.'],
      sentiment_overall: 'Focused & Professional',
      sentiment_score: 82,
      sentiment_tone: 'Pragmatic and execution-oriented',
      topics: ['Execution', 'Follow-ups', 'Planning'],
    },
  };
}
