import express, { Request, Response } from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import {
  getMeetings,
  getMeetingById,
  saveMeeting,
  updateMeeting,
  deleteMeeting,
  updateActionItem,
  addActionItem,
  deleteActionItem,
  mergeActionItems,
  detectDuplicates,
  getDashboardStats,
  seedReset,
  getAllTasks,
  getGlobalAnalytics,
} from './server/db.js';
import { extractMeetingInsights } from './server/extractor.js';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

// Health check
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    gemini_configured: !!process.env.GEMINI_API_KEY,
  });
});

// Dashboard stats
app.get('/api/stats', (_req: Request, res: Response) => {
  try {
    const stats = getDashboardStats();
    res.json(stats);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// List meetings with search, tag, and chronological ascending order filters
app.get('/api/meetings', (req: Request, res: Response) => {
  try {
    const { q, tag, order } = req.query;
    // Default to 'asc' for chronological date-wise order as requested
    const sortOrder = order === 'desc' ? 'desc' : 'asc';
    const meetings = getMeetings(
      typeof q === 'string' ? q : undefined,
      typeof tag === 'string' ? tag : undefined,
      sortOrder
    );
    res.json(meetings);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Global task matrix across all transcripts
app.get('/api/tasks', (req: Request, res: Response) => {
  try {
    const { status, owner, priority, meeting_id, search } = req.query;
    const tasks = getAllTasks({
      status: typeof status === 'string' ? status : undefined,
      owner: typeof owner === 'string' ? owner : undefined,
      priority: typeof priority === 'string' ? priority : undefined,
      meetingId: typeof meeting_id === 'string' ? meeting_id : undefined,
      search: typeof search === 'string' ? search : undefined,
    });
    res.json(tasks);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Global analytics across all transcripts
app.get('/api/analytics', (_req: Request, res: Response) => {
  try {
    const analytics = getGlobalAnalytics();
    res.json(analytics);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Get single meeting by ID
app.get('/api/meetings/:id', (req: Request, res: Response) => {
  try {
    const meeting = getMeetingById(req.params.id);
    if (!meeting) {
      return res.status(404).json({ error: 'Meeting not found' });
    }
    res.json(meeting);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Extract meeting from raw transcript
app.post('/api/meetings/extract', async (req: Request, res: Response) => {
  try {
    const {
      transcript,
      title,
      date,
      duration,
      meeting_link,
      meeting_platform,
      recording_url,
      recording_passcode,
      transcript_url,
      transcript_file_name,
    } = req.body;

    if (!transcript || typeof transcript !== 'string' || transcript.trim().length === 0) {
      return res.status(400).json({ error: 'Transcript text is required' });
    }

    const { meeting } = await extractMeetingInsights(transcript, {
      title,
      date,
      duration: duration ? Number(duration) : undefined,
      meeting_link,
      meeting_platform,
      recording_url,
      recording_passcode,
      transcript_url,
      transcript_file_name,
    });

    saveMeeting(meeting);
    res.status(201).json(meeting);
  } catch (err: any) {
    console.error('Error during extraction:', err);
    res.status(500).json({ error: err.message || 'Failed to extract meeting insights' });
  }
});

// Update meeting details (including recording and transcript links)
app.put('/api/meetings/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updated = updateMeeting(id, req.body);
    if (!updated) {
      return res.status(404).json({ error: 'Meeting not found' });
    }
    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Inline edit action item
app.put('/api/meetings/:id/items/:itemId', (req: Request, res: Response) => {
  try {
    const { id, itemId } = req.params;
    const updated = updateActionItem(id, itemId, req.body);
    if (!updated) {
      return res.status(404).json({ error: 'Meeting or Action Item not found' });
    }
    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Manually add action item
app.post('/api/meetings/:id/items', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { task_description, owner, deadline, deadline_iso, priority, status, tags } = req.body;
    if (!task_description) {
      return res.status(400).json({ error: 'Task description is required' });
    }
    const newItem = addActionItem(id, {
      task_description,
      owner: owner || 'Unassigned',
      deadline: deadline || 'TBD',
      deadline_iso,
      priority: priority || 'medium',
      status: status || 'pending',
      confidence_score: 1.0, // manually created
      confidence_level: 'high',
      tags: tags || ['Manual'],
    });
    if (!newItem) {
      return res.status(404).json({ error: 'Meeting not found' });
    }
    res.status(201).json(newItem);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Delete action item (false positive elimination)
app.delete('/api/meetings/:id/items/:itemId', (req: Request, res: Response) => {
  try {
    const { id, itemId } = req.params;
    const success = deleteActionItem(id, itemId);
    if (!success) {
      return res.status(404).json({ error: 'Meeting or Action Item not found' });
    }
    res.json({ success: true, message: 'Action item removed' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Detect duplicates within a meeting
app.get('/api/meetings/:id/duplicates', (req: Request, res: Response) => {
  try {
    const meeting = getMeetingById(req.params.id);
    if (!meeting) {
      return res.status(404).json({ error: 'Meeting not found' });
    }
    const duplicates = detectDuplicates(meeting);
    res.json(duplicates);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Merge duplicate action items
app.post('/api/meetings/:id/merge', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { primary_id, duplicate_id, merged_description } = req.body;
    if (!primary_id || !duplicate_id) {
      return res.status(400).json({ error: 'primary_id and duplicate_id are required' });
    }
    const merged = mergeActionItems(id, primary_id, duplicate_id, merged_description);
    if (!merged) {
      return res.status(404).json({ error: 'Could not merge specified items' });
    }
    res.json(merged);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Delete entire meeting
app.delete('/api/meetings/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const success = deleteMeeting(id);
    if (!success) {
      return res.status(404).json({ error: 'Meeting not found' });
    }
    res.json({ success: true, message: 'Meeting deleted successfully' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Reset sample dataset
app.post('/api/seed/reset', (_req: Request, res: Response) => {
  try {
    const reset = seedReset();
    res.json({ success: true, meetings: reset });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Export .ics calendar file
app.get('/api/meetings/:id/export/ics', (req: Request, res: Response) => {
  try {
    const meeting = getMeetingById(req.params.id);
    if (!meeting) {
      return res.status(404).json({ error: 'Meeting not found' });
    }

    const validItems = meeting.action_items.filter((item) => item.deadline && item.deadline !== 'TBD');

    let icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//PulseAction AI//Meeting Action Items//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
    ];

    validItems.forEach((item, index) => {
      let dtStartStr = '';
      if (item.deadline_iso) {
        const d = new Date(item.deadline_iso);
        if (!isNaN(d.getTime())) {
          dtStartStr = d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
        }
      }
      if (!dtStartStr) {
        // Fallback to today + 1 day
        const d = new Date();
        d.setDate(d.getDate() + (index + 1));
        dtStartStr = d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
      }

      const uid = `pulseaction-${item.id}@pulseaction.ai`;
      const summary = `[PulseAction] ${item.task_description}`;
      const description = `Owner: ${item.owner}\\nStatus: ${item.status}\\nPriority: ${item.priority}\\nMeeting: ${meeting.title}\\nSource Quote: ${item.source_quote || 'N/A'}`;

      icsContent.push(
        'BEGIN:VEVENT',
        `UID:${uid}`,
        `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z`,
        `DTSTART:${dtStartStr}`,
        `SUMMARY:${summary.replace(/\n/g, ' ')}`,
        `DESCRIPTION:${description}`,
        `STATUS:CONFIRMED`,
        'END:VEVENT'
      );
    });

    icsContent.push('END:VCALENDAR');

    const result = icsContent.join('\r\n') + '\r\n';
    res.setHeader('Content-Type', 'text/calendar; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${meeting.title.replace(/[^a-z0-9]/gi, '_')}-tasks.ics"`);
    res.send(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Export CSV
app.get('/api/meetings/:id/export/csv', (req: Request, res: Response) => {
  try {
    const meeting = getMeetingById(req.params.id);
    if (!meeting) {
      return res.status(404).json({ error: 'Meeting not found' });
    }

    const headers = ['Task Description', 'Owner', 'Deadline', 'Status', 'Priority', 'Confidence', 'Risk Reason', 'Source Quote'];
    const rows = meeting.action_items.map((item) => [
      `"${item.task_description.replace(/"/g, '""')}"`,
      `"${item.owner.replace(/"/g, '""')}"`,
      `"${item.deadline.replace(/"/g, '""')}"`,
      `"${item.status}"`,
      `"${item.priority}"`,
      `"${Math.round(item.confidence_score * 100)}%"`,
      `"${(item.risk_reason || '').replace(/"/g, '""')}"`,
      `"${(item.source_quote || '').replace(/"/g, '""')}"`,
    ]);

    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n') + '\r\n';
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${meeting.title.replace(/[^a-z0-9]/gi, '_')}-tasks.csv"`);
    res.send(csv);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Webhook simulation / dispatch
app.post('/api/webhook/simulate', async (req: Request, res: Response) => {
  try {
    const { webhook_url, platform, meeting_id } = req.body;
    const meeting = getMeetingById(meeting_id);
    if (!meeting) {
      return res.status(404).json({ error: 'Meeting not found' });
    }

    const highPriorityItems = meeting.action_items.filter((i) => i.priority === 'high');
    const payload = {
      app: 'PulseAction AI',
      event: 'meeting.action_items_extracted',
      meeting_title: meeting.title,
      date: meeting.date,
      total_items: meeting.action_items.length,
      high_priority_count: highPriorityItems.length,
      summary: meeting.summary,
      action_items: meeting.action_items.map((i) => ({
        task: i.task_description,
        owner: i.owner,
        deadline: i.deadline,
        confidence: `${Math.round(i.confidence_score * 100)}%`,
        status: i.status,
      })),
      timestamp: new Date().toISOString(),
    };

    if (webhook_url && webhook_url.startsWith('http')) {
      try {
        const response = await fetch(webhook_url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        return res.json({
          success: true,
          platform: platform || 'custom',
          status_code: response.status,
          message: 'Webhook dispatched successfully',
          payload,
        });
      } catch (postErr: any) {
        return res.json({
          success: false,
          simulated: true,
          error: postErr.message,
          message: 'External webhook call failed, returned simulated delivery test',
          payload,
        });
      }
    }

    // Default simulation
    res.json({
      success: true,
      simulated: true,
      platform: platform || 'slack',
      message: `Simulated successful delivery to ${platform || 'Slack'} channel #team-action-items`,
      payload,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Vite middleware / Static server setup
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR !== 'true',
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 PulseAction AI server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Fatal error starting server:', err);
  process.exit(1);
});
