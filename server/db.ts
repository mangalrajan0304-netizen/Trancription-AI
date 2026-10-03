import fs from 'fs';
import path from 'path';
import { Meeting, ActionItem, DashboardStats, DuplicateSuggestion } from '../src/types.js';

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'meetings.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const INITIAL_MEETINGS: Meeting[] = [
  {
    id: 'meet-sprint-q3-2026',
    title: 'Q3 Product Sprint & Mobile Launch Prep',
    date: '2026-09-24',
    duration_minutes: 42,
    created_at: '2026-09-24T14:30:00.000Z',
    participants: ['Sarah (Product Lead)', 'Liam (Frontend)', 'Elena (QA)', 'Dev (Backend)'],
    tags: ['Sprint', 'Mobile', 'Release', 'Engineering'],
    meeting_platform: 'google_meet',
    meeting_link: 'https://meet.google.com/qaz-wsxe-edc',
    recording_url: 'https://drive.google.com/file/d/1A8zB9yC0xSprintRecord/view',
    recording_passcode: 'sprint-2026',
    recording_duration: '42:18',
    transcript_url: 'https://docs.google.com/document/d/1TranscriptSprintQ3/edit',
    transcript_file_name: 'sprint_q3_mobile_launch.vtt',
    transcript_format: 'vtt',
    summary: 'Sprint planning and readiness check for the iOS & Android cross-platform beta. Liam confirmed biometric auth is ready for audit. Elena raised critical test coverage bottlenecks in checkout flow. Dev will finalize rate limiting by Friday.',
    raw_transcript: `[00:02:15] Sarah (Product Lead): Good morning everyone. Let's dive straight into the Q3 mobile launch roadmap. Liam, what is the status of the biometric face unlock module?
[00:03:00] Liam (Frontend): Biometrics is essentially code-complete. I need to push the biometric encryption keys PR to staging by tomorrow 5 PM so Elena can run smoke tests.
[00:04:12] Elena (QA): Thanks Liam. Speaking of testing, our automated test coverage on the multi-currency checkout is still hovering at 62%. We definitely need someone to write unit tests for the edge-case discount codes before Friday.
[00:05:40] Sarah (Product Lead): Agreed, that is a high risk. Let's make sure someone picks up those checkout tests immediately. Liam, can you sync with Dev on that?
[00:06:55] Dev (Backend): I can handle the backend discount validation suite, but I need the finalized Figma specs for the promo banner component from marketing sometime next week.
[00:08:10] Sarah (Product Lead): I will ping Chloe in brand marketing to deliver the promo banner assets by Wednesday morning.
[00:09:45] Liam (Frontend): Dev, what about the database connection pooling on the authentication microservice? Are we still seeing 504 gateway timeouts under load?
[00:10:30] Dev (Backend): Good catch. I will increase the Redis cache TTL and configure connection pooling on AWS ElastiCache by September 29th.
[00:12:15] Elena (QA): We also discovered a subtle memory leak when switching between dark and light themes on iPad OS 18. We should look into that soon.
[00:13:50] Sarah (Product Lead): Let's log a ticket for that memory leak. It is unassigned for now, but let's review it during Thursday standup.
[00:15:20] Dev (Backend): One more thing: our third-party Stripe webhook secrets rotate on October 1st. I will update the Kubernetes vault config before September 30th.
[00:16:40] Sarah (Product Lead): Perfect. Thank you team, let's execute!`,
    segments: [
      {
        id: 'seg-1',
        meeting_id: 'meet-sprint-q3-2026',
        speaker: 'Sarah (Product Lead)',
        timestamp: '00:02:15',
        text: "Good morning everyone. Let's dive straight into the Q3 mobile launch roadmap. Liam, what is the status of the biometric face unlock module?",
      },
      {
        id: 'seg-2',
        meeting_id: 'meet-sprint-q3-2026',
        speaker: 'Liam (Frontend)',
        timestamp: '00:03:00',
        text: 'Biometrics is essentially code-complete. I need to push the biometric encryption keys PR to staging by tomorrow 5 PM so Elena can run smoke tests.',
        action_item_ids: ['act-1'],
      },
      {
        id: 'seg-3',
        meeting_id: 'meet-sprint-q3-2026',
        speaker: 'Elena (QA)',
        timestamp: '00:04:12',
        text: 'Thanks Liam. Speaking of testing, our automated test coverage on the multi-currency checkout is still hovering at 62%. We definitely need someone to write unit tests for the edge-case discount codes before Friday.',
        action_item_ids: ['act-2'],
      },
      {
        id: 'seg-4',
        meeting_id: 'meet-sprint-q3-2026',
        speaker: 'Sarah (Product Lead)',
        timestamp: '00:05:40',
        text: "Agreed, that is a high risk. Let's make sure someone picks up those checkout tests immediately. Liam, can you sync with Dev on that?",
        action_item_ids: ['act-2'],
      },
      {
        id: 'seg-5',
        meeting_id: 'meet-sprint-q3-2026',
        speaker: 'Dev (Backend)',
        timestamp: '00:06:55',
        text: 'I can handle the backend discount validation suite, but I need the finalized Figma specs for the promo banner component from marketing sometime next week.',
        action_item_ids: ['act-3'],
      },
      {
        id: 'seg-6',
        meeting_id: 'meet-sprint-q3-2026',
        speaker: 'Sarah (Product Lead)',
        timestamp: '00:08:10',
        text: 'I will ping Chloe in brand marketing to deliver the promo banner assets by Wednesday morning.',
        action_item_ids: ['act-4'],
      },
      {
        id: 'seg-7',
        meeting_id: 'meet-sprint-q3-2026',
        speaker: 'Liam (Frontend)',
        timestamp: '00:09:45',
        text: 'Dev, what about the database connection pooling on the authentication microservice? Are we still seeing 504 gateway timeouts under load?',
      },
      {
        id: 'seg-8',
        meeting_id: 'meet-sprint-q3-2026',
        speaker: 'Dev (Backend)',
        timestamp: '00:10:30',
        text: 'Good catch. I will increase the Redis cache TTL and configure connection pooling on AWS ElastiCache by September 29th.',
        action_item_ids: ['act-5'],
      },
      {
        id: 'seg-9',
        meeting_id: 'meet-sprint-q3-2026',
        speaker: 'Elena (QA)',
        timestamp: '00:12:15',
        text: 'We also discovered a subtle memory leak when switching between dark and light themes on iPad OS 18. We should look into that soon.',
        action_item_ids: ['act-6'],
      },
      {
        id: 'seg-10',
        meeting_id: 'meet-sprint-q3-2026',
        speaker: 'Sarah (Product Lead)',
        timestamp: '00:13:50',
        text: "Let's log a ticket for that memory leak. It is unassigned for now, but let's review it during Thursday standup.",
        action_item_ids: ['act-6'],
      },
      {
        id: 'seg-11',
        meeting_id: 'meet-sprint-q3-2026',
        speaker: 'Dev (Backend)',
        timestamp: '00:15:20',
        text: 'One more thing: our third-party Stripe webhook secrets rotate on October 1st. I will update the Kubernetes vault config before September 30th.',
        action_item_ids: ['act-7'],
      },
      {
        id: 'seg-12',
        meeting_id: 'meet-sprint-q3-2026',
        speaker: 'Sarah (Product Lead)',
        timestamp: '00:16:40',
        text: "Perfect. Thank you team, let's execute!",
      },
    ],
    action_items: [
      {
        id: 'act-1',
        meeting_id: 'meet-sprint-q3-2026',
        task_description: 'Push biometric encryption keys PR to staging for QA verification',
        owner: 'Liam (Frontend)',
        deadline: 'Tomorrow, 5:00 PM',
        deadline_iso: '2026-09-25T17:00:00Z',
        confidence_score: 0.96,
        confidence_level: 'high',
        status: 'in_progress',
        priority: 'high',
        source_segment_id: 'seg-2',
        source_quote: 'I need to push the biometric encryption keys PR to staging by tomorrow 5 PM so Elena can run smoke tests.',
        is_ambiguous_deadline: false,
        is_unassigned_owner: false,
        tags: ['Security', 'Mobile', 'Release'],
      },
      {
        id: 'act-2',
        meeting_id: 'meet-sprint-q3-2026',
        task_description: 'Write automated unit tests for checkout edge-case discount codes',
        owner: 'Unassigned',
        deadline: 'Before Friday',
        deadline_iso: '2026-09-27',
        confidence_score: 0.72,
        confidence_level: 'medium',
        status: 'pending',
        priority: 'high',
        source_segment_id: 'seg-3',
        source_quote: 'We definitely need someone to write unit tests for the edge-case discount codes before Friday.',
        is_ambiguous_deadline: true,
        is_unassigned_owner: true,
        risk_reason: 'Unassigned owner & test coverage bottleneck (62%)',
        tags: ['QA', 'Testing', 'Risk'],
      },
      {
        id: 'act-3',
        meeting_id: 'meet-sprint-q3-2026',
        task_description: 'Implement backend discount validation suite once Figma specs arrive',
        owner: 'Dev (Backend)',
        deadline: 'Next week (TBD)',
        deadline_iso: '2026-10-02',
        confidence_score: 0.81,
        confidence_level: 'medium',
        status: 'pending',
        priority: 'medium',
        source_segment_id: 'seg-5',
        source_quote: 'I can handle the backend discount validation suite, but I need the finalized Figma specs for the promo banner component from marketing sometime next week.',
        is_ambiguous_deadline: true,
        is_unassigned_owner: false,
        risk_reason: 'Blocked on external marketing Figma assets',
        tags: ['Backend', 'Promo'],
      },
      {
        id: 'act-4',
        meeting_id: 'meet-sprint-q3-2026',
        task_description: 'Obtain and distribute finalized promo banner Figma specs from Chloe',
        owner: 'Sarah (Product Lead)',
        deadline: 'Wednesday morning',
        deadline_iso: '2026-09-30T10:00:00Z',
        confidence_score: 0.94,
        confidence_level: 'high',
        status: 'in_progress',
        priority: 'medium',
        source_segment_id: 'seg-6',
        source_quote: 'I will ping Chloe in brand marketing to deliver the promo banner assets by Wednesday morning.',
        is_ambiguous_deadline: false,
        is_unassigned_owner: false,
        tags: ['Marketing', 'Assets'],
      },
      {
        id: 'act-5',
        meeting_id: 'meet-sprint-q3-2026',
        task_description: 'Increase Redis cache TTL and configure connection pooling on AWS ElastiCache',
        owner: 'Dev (Backend)',
        deadline: 'Sep 29, 2026',
        deadline_iso: '2026-09-29',
        confidence_score: 0.92,
        confidence_level: 'high',
        status: 'pending',
        priority: 'high',
        source_segment_id: 'seg-8',
        source_quote: 'I will increase the Redis cache TTL and configure connection pooling on AWS ElastiCache by September 29th.',
        is_ambiguous_deadline: false,
        is_unassigned_owner: false,
        tags: ['DevOps', 'Performance', 'Redis'],
      },
      {
        id: 'act-6',
        meeting_id: 'meet-sprint-q3-2026',
        task_description: 'Investigate iPad OS 18 theme-switching memory leak',
        owner: 'Unassigned',
        deadline: 'Soon (Review at Thursday standup)',
        deadline_iso: undefined,
        confidence_score: 0.58,
        confidence_level: 'low',
        status: 'pending',
        priority: 'low',
        source_segment_id: 'seg-9',
        source_quote: 'We also discovered a subtle memory leak when switching between dark and light themes on iPad OS 18. We should look into that soon.',
        is_ambiguous_deadline: true,
        is_unassigned_owner: true,
        risk_reason: 'Low confidence score, vague deadline ("soon"), unassigned owner',
        tags: ['Bug', 'iOS', 'UI'],
      },
      {
        id: 'act-7',
        meeting_id: 'meet-sprint-q3-2026',
        task_description: 'Rotate Stripe webhook signing secret in Kubernetes vault config',
        owner: 'Dev (Backend)',
        deadline: 'Sep 30, 2026',
        deadline_iso: '2026-09-30',
        confidence_score: 0.95,
        confidence_level: 'high',
        status: 'completed',
        priority: 'high',
        source_segment_id: 'seg-11',
        source_quote: 'I will update the Kubernetes vault config before September 30th.',
        is_ambiguous_deadline: false,
        is_unassigned_owner: false,
        tags: ['Security', 'Infra', 'Stripe'],
      },
    ],
    executive_summary: {
      bullets: [
        'Biometric authentication on iOS/Android is ready for staging smoke testing.',
        'Checkout automated test coverage (62%) is below target and flagged as release blocker.',
        'Promo banner backend logic depends on Chloe delivering marketing Figma assets by Wednesday.',
        'Database connection pooling and Redis TTL tuning scheduled before Sept 29 to mitigate 504 errors.',
        'Theme-switching memory leak noted on iPad OS 18 requires triage at Thursday standup.',
      ],
      key_decisions: [
        'Push biometric security keys to staging on Sept 25 for QA clearance.',
        'Mandate 80% checkout test coverage requirement prior to public app store submission.',
        'AWS ElastiCache connection pool max connections bumped from 50 to 200.',
      ],
      sentiment: {
        overall: 'Productive & Focused with Technical Vigilance',
        score: 82,
        tone: 'Action-oriented and alert to test coverage risks',
      },
      speaker_stats: [
        { speaker: 'Sarah (Product Lead)', word_count: 85, talk_percentage: 26, action_item_count: 1 },
        { speaker: 'Dev (Backend)', word_count: 110, talk_percentage: 34, action_item_count: 3 },
        { speaker: 'Liam (Frontend)', word_count: 75, talk_percentage: 23, action_item_count: 1 },
        { speaker: 'Elena (QA)', word_count: 55, talk_percentage: 17, action_item_count: 2 },
      ],
      actionable_ratio: 78,
      topics: ['Biometrics', 'Checkout Tests', 'AWS ElastiCache', 'iPad OS Memory Leak', 'Stripe Vault Secrets'],
    },
  },
  {
    id: 'meet-enterprise-kickoff',
    title: 'Enterprise Client Kickoff & API Security Review',
    date: '2026-09-22',
    duration_minutes: 55,
    created_at: '2026-09-22T10:00:00.000Z',
    participants: ['Marcus (Solutions Architect)', 'Priya (Client Tech Lead)', 'Dave (Account Director)'],
    tags: ['Enterprise', 'Security', 'Onboarding', 'API'],
    meeting_platform: 'zoom',
    meeting_link: 'https://zoom.us/j/98421035512',
    recording_url: 'https://zoom.us/rec/play/EntOnboardingK1992_Archive',
    recording_passcode: 'mTLS#2026',
    recording_duration: '55:04',
    transcript_url: 'https://notion.so/workspace/Enterprise-Kickoff-Transcript-Doc',
    transcript_file_name: 'enterprise_api_security.srt',
    transcript_format: 'srt',
    summary: 'Technical architecture onboarding with global fintech client. Finalized OAuth 2.0 PKCE flow requirements, IP whitelisting for sandbox environments, and SLA definitions for webhook callbacks.',
    raw_transcript: `[00:01:10] Dave (Account Director): Welcome Priya and Marcus. Today our goal is to align on the technical milestones for the Q4 API integration.
[00:02:40] Priya (Client Tech Lead): Thanks Dave. Our compliance team reviewed the data residency architecture. We require all payment transaction logs to stay in AWS eu-central-1 Frankfurt.
[00:04:15] Marcus (Solutions Architect): Understood Priya. I will configure our Terraform tenant isolation module to route your workspace data strictly to Frankfurt by next Monday.
[00:06:20] Priya (Client Tech Lead): What about mutual TLS authentication for webhooks? Can your event dispatcher support custom client certificates?
[00:07:45] Marcus (Solutions Architect): Yes, our API gateway natively supports mTLS. I will send over our public CA certificates and webhook verification sample repo by Thursday close of business.
[00:09:30] Dave (Account Director): Priya, who on your side will sign off on the production rate-limit exemptions?
[00:10:15] Priya (Client Tech Lead): That will be Jordan from Infosec. I will schedule a 30-minute sync between Jordan, Marcus, and Dave for next Tuesday.
[00:12:00] Marcus (Solutions Architect): Excellent. I also need your team's static egress IP CIDR blocks so we can whitelist them in our Cloudflare firewall before testing starts.
[00:13:10] Priya (Client Tech Lead): I will retrieve the egress IP ranges from our network team and email them to Marcus by Friday afternoon.`,
    segments: [
      {
        id: 'ent-seg-1',
        meeting_id: 'meet-enterprise-kickoff',
        speaker: 'Dave (Account Director)',
        timestamp: '00:01:10',
        text: 'Welcome Priya and Marcus. Today our goal is to align on the technical milestones for the Q4 API integration.',
      },
      {
        id: 'ent-seg-2',
        meeting_id: 'meet-enterprise-kickoff',
        speaker: 'Priya (Client Tech Lead)',
        timestamp: '00:02:40',
        text: 'Thanks Dave. Our compliance team reviewed the data residency architecture. We require all payment transaction logs to stay in AWS eu-central-1 Frankfurt.',
      },
      {
        id: 'ent-seg-3',
        meeting_id: 'meet-enterprise-kickoff',
        speaker: 'Marcus (Solutions Architect)',
        timestamp: '00:04:15',
        text: 'Understood Priya. I will configure our Terraform tenant isolation module to route your workspace data strictly to Frankfurt by next Monday.',
        action_item_ids: ['ent-act-1'],
      },
      {
        id: 'ent-seg-4',
        meeting_id: 'meet-enterprise-kickoff',
        speaker: 'Marcus (Solutions Architect)',
        timestamp: '00:07:45',
        text: 'Yes, our API gateway natively supports mTLS. I will send over our public CA certificates and webhook verification sample repo by Thursday close of business.',
        action_item_ids: ['ent-act-2'],
      },
      {
        id: 'ent-seg-5',
        meeting_id: 'meet-enterprise-kickoff',
        speaker: 'Priya (Client Tech Lead)',
        timestamp: '00:10:15',
        text: 'That will be Jordan from Infosec. I will schedule a 30-minute sync between Jordan, Marcus, and Dave for next Tuesday.',
        action_item_ids: ['ent-act-3'],
      },
      {
        id: 'ent-seg-6',
        meeting_id: 'meet-enterprise-kickoff',
        speaker: 'Priya (Client Tech Lead)',
        timestamp: '00:13:10',
        text: 'I will retrieve the egress IP ranges from our network team and email them to Marcus by Friday afternoon.',
        action_item_ids: ['ent-act-4'],
      },
    ],
    action_items: [
      {
        id: 'ent-act-1',
        meeting_id: 'meet-enterprise-kickoff',
        task_description: 'Configure Terraform tenant isolation module to isolate data strictly in AWS eu-central-1 Frankfurt',
        owner: 'Marcus (Solutions Architect)',
        deadline: 'Sep 28, 2026',
        deadline_iso: '2026-09-28',
        confidence_score: 0.97,
        confidence_level: 'high',
        status: 'in_progress',
        priority: 'high',
        source_segment_id: 'ent-seg-3',
        source_quote: 'I will configure our Terraform tenant isolation module to route your workspace data strictly to Frankfurt by next Monday.',
        is_ambiguous_deadline: false,
        is_unassigned_owner: false,
        tags: ['Compliance', 'AWS', 'Terraform'],
      },
      {
        id: 'ent-act-2',
        meeting_id: 'meet-enterprise-kickoff',
        task_description: 'Send public CA certificates and webhook mTLS verification sample repo',
        owner: 'Marcus (Solutions Architect)',
        deadline: 'Thursday COB',
        deadline_iso: '2026-09-24T18:00:00Z',
        confidence_score: 0.93,
        confidence_level: 'high',
        status: 'completed',
        priority: 'medium',
        source_segment_id: 'ent-seg-4',
        source_quote: 'I will send over our public CA certificates and webhook verification sample repo by Thursday close of business.',
        is_ambiguous_deadline: false,
        is_unassigned_owner: false,
        tags: ['Security', 'mTLS', 'Documentation'],
      },
      {
        id: 'ent-act-3',
        meeting_id: 'meet-enterprise-kickoff',
        task_description: 'Schedule 30-min rate-limit exemption sync between Jordan, Marcus, and Dave',
        owner: 'Priya (Client Tech Lead)',
        deadline: 'Next Tuesday',
        deadline_iso: '2026-09-29',
        confidence_score: 0.88,
        confidence_level: 'high',
        status: 'pending',
        priority: 'medium',
        source_segment_id: 'ent-seg-5',
        source_quote: 'I will schedule a 30-minute sync between Jordan, Marcus, and Dave for next Tuesday.',
        is_ambiguous_deadline: false,
        is_unassigned_owner: false,
        tags: ['Calendar', 'Infosec'],
      },
      {
        id: 'ent-act-4',
        meeting_id: 'meet-enterprise-kickoff',
        task_description: 'Retrieve egress IP CIDR blocks from network team and forward to Marcus',
        owner: 'Priya (Client Tech Lead)',
        deadline: 'Friday afternoon',
        deadline_iso: '2026-09-25T16:00:00Z',
        confidence_score: 0.91,
        confidence_level: 'high',
        status: 'pending',
        priority: 'high',
        source_segment_id: 'ent-seg-6',
        source_quote: 'I will retrieve the egress IP ranges from our network team and email them to Marcus by Friday afternoon.',
        is_ambiguous_deadline: false,
        is_unassigned_owner: false,
        tags: ['Firewall', 'Cloudflare', 'Networking'],
      },
    ],
    executive_summary: {
      bullets: [
        'Strict Frankfurt data residency confirmed for client transactions via dedicated Terraform module.',
        'mTLS webhook authentication supported; CA certificates & documentation handed over.',
        'Rate limit exemptions require Infosec review with Jordan scheduled for next Tuesday.',
        'Cloudflare IP whitelisting will be configured as soon as client network team supplies CIDRs.',
      ],
      key_decisions: [
        'Enforce EU Frankfurt isolation strictly for all tenant storage & audit logs.',
        'Adopt mTLS authentication standard for all transactional webhook events.',
      ],
      sentiment: {
        overall: 'Highly Collaborative & Technically Reassuring',
        score: 91,
        tone: 'Professional, solution-oriented, mutual trust',
      },
      speaker_stats: [
        { speaker: 'Marcus (Solutions Architect)', word_count: 145, talk_percentage: 45, action_item_count: 2 },
        { speaker: 'Priya (Client Tech Lead)', word_count: 120, talk_percentage: 37, action_item_count: 2 },
        { speaker: 'Dave (Account Director)', word_count: 58, talk_percentage: 18, action_item_count: 0 },
      ],
      actionable_ratio: 85,
      topics: ['Data Residency', 'mTLS Webhooks', 'Rate Limits', 'Cloudflare CIDRs'],
    },
  },
  {
    id: 'meet-incident-db-latency',
    title: 'Incident Post-Mortem: Production DB Latency Spike',
    date: '2026-09-20',
    duration_minutes: 38,
    created_at: '2026-09-20T16:00:00.000Z',
    participants: ['Alex (DevOps)', 'Chloe (SRE)', 'Nina (Database Engineer)'],
    tags: ['Incident', 'Post-Mortem', 'Database', 'P1'],
    meeting_platform: 'teams',
    meeting_link: 'https://teams.microsoft.com/l/meetup-join/19%3ameeting_inc8921_warroom',
    recording_url: 'https://sharepoint.com/sites/sre/recordings/INC8921_PostMortem.mp4',
    recording_duration: '38:12',
    transcript_url: 'https://github.com/org/sre-incidents/blob/main/inc-8921-diarized-transcript.txt',
    transcript_file_name: 'inc8921_db_latency_spike.txt',
    transcript_format: 'txt',
    summary: 'Investigation of 14-minute P1 incident where read replica replication lag crossed 180 seconds due to unindexed foreign key joins during a batch analytics query.',
    raw_transcript: `[00:01:00] Alex (DevOps): Starting the post-mortem for incident INC-8921. At 14:12 UTC, read replicas experienced severe lag, peaking at 192 seconds. Nina, what did the query execution plan reveal?
[00:02:15] Nina (Database Engineer): An analytical cron job ran a full table scan on the \`organization_audit_events\` table because the \`tenant_id\` and \`created_at\` composite index was dropped in last week's migration.
[00:03:40] Chloe (SRE): That explains why connection saturation spiked to 98%. We must immediately recreate that composite index concurrently in production.
[00:04:30] Nina (Database Engineer): I will generate the non-blocking \`CREATE INDEX CONCURRENTLY\` migration script by 6 PM today and execute it during off-peak hours tonight.
[00:05:50] Alex (DevOps): Chloe, our Datadog alert only fired after 10 minutes of lag. That is unacceptable for a P1.
[00:06:45] Chloe (SRE): Agreed. I will rewrite our PagerDuty Datadog monitor to trigger an escalation page if replication lag exceeds 30 seconds for more than 2 consecutive minutes. I will commit this by tomorrow noon.
[00:08:00] Alex (DevOps): Also, we should restrict large analytical queries from running on transactional read replicas. Can we provision a dedicated analytics read-only replica with query timeouts?
[00:09:10] Nina (Database Engineer): Good idea. Let's spin up an Aurora PostgreSQL read replica with \`statement_timeout = 15000\` (15s). I will write the Terraform PR by Friday.
[00:10:20] Chloe (SRE): We also need to audit all recently applied Flyway migrations to see if any other indexes were inadvertently removed.
[00:11:00] Alex (DevOps): That is critical. Let's assign an engineer to audit migrations. Alex will coordinate with backend team by Wednesday.`,
    segments: [
      {
        id: 'inc-seg-1',
        meeting_id: 'meet-incident-db-latency',
        speaker: 'Alex (DevOps)',
        timestamp: '00:01:00',
        text: 'Starting the post-mortem for incident INC-8921. At 14:12 UTC, read replicas experienced severe lag, peaking at 192 seconds.',
      },
      {
        id: 'inc-seg-2',
        meeting_id: 'meet-incident-db-latency',
        speaker: 'Nina (Database Engineer)',
        timestamp: '00:04:30',
        text: 'I will generate the non-blocking CREATE INDEX CONCURRENTLY migration script by 6 PM today and execute it during off-peak hours tonight.',
        action_item_ids: ['inc-act-1'],
      },
      {
        id: 'inc-seg-3',
        meeting_id: 'meet-incident-db-latency',
        speaker: 'Chloe (SRE)',
        timestamp: '00:06:45',
        text: 'Agreed. I will rewrite our PagerDuty Datadog monitor to trigger an escalation page if replication lag exceeds 30 seconds for more than 2 consecutive minutes. I will commit this by tomorrow noon.',
        action_item_ids: ['inc-act-2'],
      },
      {
        id: 'inc-seg-4',
        meeting_id: 'meet-incident-db-latency',
        speaker: 'Nina (Database Engineer)',
        timestamp: '00:09:10',
        text: "Good idea. Let's spin up an Aurora PostgreSQL read replica with statement_timeout = 15000 (15s). I will write the Terraform PR by Friday.",
        action_item_ids: ['inc-act-3'],
      },
      {
        id: 'inc-seg-5',
        meeting_id: 'meet-incident-db-latency',
        speaker: 'Alex (DevOps)',
        timestamp: '00:11:00',
        text: 'That is critical. Let\'s assign an engineer to audit migrations. Alex will coordinate with backend team by Wednesday.',
        action_item_ids: ['inc-act-4'],
      },
    ],
    action_items: [
      {
        id: 'inc-act-1',
        meeting_id: 'meet-incident-db-latency',
        task_description: 'Generate non-blocking CREATE INDEX CONCURRENTLY migration for organization_audit_events table',
        owner: 'Nina (Database Engineer)',
        deadline: 'Today, 6:00 PM',
        deadline_iso: '2026-09-20T18:00:00Z',
        confidence_score: 0.98,
        confidence_level: 'high',
        status: 'completed',
        priority: 'high',
        source_segment_id: 'inc-seg-2',
        source_quote: 'I will generate the non-blocking CREATE INDEX CONCURRENTLY migration script by 6 PM today and execute it during off-peak hours tonight.',
        is_ambiguous_deadline: false,
        is_unassigned_owner: false,
        tags: ['Database', 'Postgres', 'Index'],
      },
      {
        id: 'inc-act-2',
        meeting_id: 'meet-incident-db-latency',
        task_description: 'Update Datadog monitor & PagerDuty escalation rule to trigger if replication lag >30s for 2 mins',
        owner: 'Chloe (SRE)',
        deadline: 'Tomorrow noon',
        deadline_iso: '2026-09-21T12:00:00Z',
        confidence_score: 0.94,
        confidence_level: 'high',
        status: 'completed',
        priority: 'high',
        source_segment_id: 'inc-seg-3',
        source_quote: 'I will rewrite our PagerDuty Datadog monitor to trigger an escalation page if replication lag exceeds 30 seconds for more than 2 consecutive minutes. I will commit this by tomorrow noon.',
        is_ambiguous_deadline: false,
        is_unassigned_owner: false,
        tags: ['Monitoring', 'Datadog', 'SRE'],
      },
      {
        id: 'inc-act-3',
        meeting_id: 'meet-incident-db-latency',
        task_description: 'Provision dedicated Aurora analytics read replica with 15s query timeout via Terraform',
        owner: 'Nina (Database Engineer)',
        deadline: 'Friday',
        deadline_iso: '2026-09-25',
        confidence_score: 0.89,
        confidence_level: 'high',
        status: 'in_progress',
        priority: 'medium',
        source_segment_id: 'inc-seg-4',
        source_quote: "Good idea. Let's spin up an Aurora PostgreSQL read replica with statement_timeout = 15000 (15s). I will write the Terraform PR by Friday.",
        is_ambiguous_deadline: false,
        is_unassigned_owner: false,
        tags: ['AWS', 'Aurora', 'Terraform'],
      },
      {
        id: 'inc-act-4',
        meeting_id: 'meet-incident-db-latency',
        task_description: 'Audit last 30 Flyway DB migrations to verify no dropped indexes or unindexed foreign keys',
        owner: 'Alex (DevOps)',
        deadline: 'Wednesday',
        deadline_iso: '2026-09-23',
        confidence_score: 0.82,
        confidence_level: 'medium',
        status: 'pending',
        priority: 'high',
        source_segment_id: 'inc-seg-5',
        source_quote: "That is critical. Let's assign an engineer to audit migrations. Alex will coordinate with backend team by Wednesday.",
        is_ambiguous_deadline: false,
        is_unassigned_owner: false,
        tags: ['Audit', 'Flyway', 'Risk'],
      },
    ],
    executive_summary: {
      bullets: [
        'Root cause verified: Missing composite index on organization_audit_events led to table lock & replication lag.',
        'Emergency concurrent index creation successfully executed during off-peak window.',
        'Datadog alert threshold tightened from 10m to 2m with 30s replication lag boundary.',
        'Architectural isolation of heavy analytical jobs to dedicated Aurora replica agreed.',
      ],
      key_decisions: [
        'Enforce mandatory query execution plan check in CI for any migration modifying indexes.',
        'Quarantine analytical batch queries strictly away from transactional replicas.',
      ],
      sentiment: {
        overall: 'Urgent, Rigorous & Blameless',
        score: 75,
        tone: 'Methodical root-cause elimination and rapid stabilization',
      },
      speaker_stats: [
        { speaker: 'Nina (Database Engineer)', word_count: 88, talk_percentage: 42, action_item_count: 2 },
        { speaker: 'Chloe (SRE)', word_count: 72, talk_percentage: 34, action_item_count: 1 },
        { speaker: 'Alex (DevOps)', word_count: 51, talk_percentage: 24, action_item_count: 1 },
      ],
      actionable_ratio: 88,
      topics: ['P1 Incident', 'Replication Lag', 'Composite Index', 'Datadog Monitors'],
    },
  },
];

// Helper to read DB
export function readDB(): Meeting[] {
  try {
    if (!fs.existsSync(DB_FILE)) {
      writeDB(INITIAL_MEETINGS);
      return INITIAL_MEETINGS;
    }
    const data = fs.readFileSync(DB_FILE, 'utf-8');
    const parsed = JSON.parse(data);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      writeDB(INITIAL_MEETINGS);
      return INITIAL_MEETINGS;
    }

    // Auto-enrich any initial seed items missing the new recording/transcript link fields
    let updated = false;
    const enriched = parsed.map((m: Meeting) => {
      const seed = INITIAL_MEETINGS.find((s) => s.id === m.id);
      if (seed && (!m.recording_url || !m.transcript_url)) {
        updated = true;
        return {
          ...seed,
          ...m,
          meeting_link: m.meeting_link || seed.meeting_link,
          meeting_platform: m.meeting_platform || seed.meeting_platform,
          recording_url: m.recording_url || seed.recording_url,
          recording_passcode: m.recording_passcode || seed.recording_passcode,
          recording_duration: m.recording_duration || seed.recording_duration,
          transcript_url: m.transcript_url || seed.transcript_url,
          transcript_file_name: m.transcript_file_name || seed.transcript_file_name,
          transcript_format: m.transcript_format || seed.transcript_format,
        };
      }
      return m;
    });

    if (updated) {
      writeDB(enriched);
    }

    return enriched;
  } catch (err) {
    console.error('Error reading meetings DB, returning defaults:', err);
    return INITIAL_MEETINGS;
  }
}

// Helper to write DB
export function writeDB(meetings: Meeting[]): void {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(meetings, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing meetings DB:', err);
  }
}

// API Methods
export function getMeetings(query?: string, tag?: string, order: 'asc' | 'desc' = 'asc'): Meeting[] {
  const meetings = readDB();
  let filtered = meetings;

  if (query && query.trim()) {
    const q = query.toLowerCase().trim();
    filtered = filtered.filter(
      (m) =>
        m.title.toLowerCase().includes(q) ||
        m.summary.toLowerCase().includes(q) ||
        m.raw_transcript.toLowerCase().includes(q) ||
        m.participants.some((p) => p.toLowerCase().includes(q)) ||
        m.action_items.some(
          (a) =>
            a.task_description.toLowerCase().includes(q) ||
            a.owner.toLowerCase().includes(q)
        )
    );
  }

  if (tag && tag.trim()) {
    const t = tag.toLowerCase().trim();
    filtered = filtered.filter((m) =>
      m.tags.some((mt) => mt.toLowerCase() === t)
    );
  }

  // Sort by date: default is ASCENDING (oldest to newest chronologically) as requested
  return filtered.sort((a, b) => {
    const timeA = new Date(a.date || a.created_at).getTime();
    const timeB = new Date(b.date || b.created_at).getTime();
    return order === 'desc' ? timeB - timeA : timeA - timeB;
  });
}

export function getAllTasks(filters?: {
  status?: string;
  owner?: string;
  priority?: string;
  meetingId?: string;
  search?: string;
}): Array<ActionItem & { meeting_title: string; meeting_date: string }> {
  const meetings = readDB();
  let all: Array<ActionItem & { meeting_title: string; meeting_date: string }> = [];

  meetings.forEach((m) => {
    m.action_items.forEach((item) => {
      all.push({
        ...item,
        meeting_title: m.title,
        meeting_date: m.date,
      });
    });
  });

  if (filters?.status && filters.status !== 'All') {
    all = all.filter((i) => i.status === filters.status);
  }
  if (filters?.owner && filters.owner !== 'All') {
    all = all.filter((i) => i.owner.toLowerCase() === filters.owner!.toLowerCase());
  }
  if (filters?.priority && filters.priority !== 'All') {
    all = all.filter((i) => i.priority === filters.priority);
  }
  if (filters?.meetingId && filters.meetingId !== 'All') {
    all = all.filter((i) => i.meeting_id === filters.meetingId);
  }
  if (filters?.search && filters.search.trim()) {
    const q = filters.search.toLowerCase().trim();
    all = all.filter(
      (i) =>
        i.task_description.toLowerCase().includes(q) ||
        i.owner.toLowerCase().includes(q) ||
        i.meeting_title.toLowerCase().includes(q)
    );
  }

  return all;
}

export function getGlobalAnalytics() {
  const meetings = readDB();
  const allTasks = meetings.flatMap((m) => m.action_items);
  const totalMeetings = meetings.length;
  const totalTasks = allTasks.length;

  const speakerMap: Record<string, { tasks: number; meetings: number }> = {};
  meetings.forEach((m) => {
    m.participants.forEach((p) => {
      if (!speakerMap[p]) speakerMap[p] = { tasks: 0, meetings: 0 };
      speakerMap[p].meetings++;
    });
    m.action_items.forEach((item) => {
      if (item.owner && item.owner !== 'Unassigned') {
        if (!speakerMap[item.owner]) speakerMap[item.owner] = { tasks: 0, meetings: 1 };
        speakerMap[item.owner].tasks++;
      }
    });
  });

  const priorityBreakdown = {
    high: allTasks.filter((t) => t.priority === 'high').length,
    medium: allTasks.filter((t) => t.priority === 'medium').length,
    low: allTasks.filter((t) => t.priority === 'low').length,
  };

  const statusBreakdown = {
    pending: allTasks.filter((t) => t.status === 'pending').length,
    in_progress: allTasks.filter((t) => t.status === 'in_progress').length,
    completed: allTasks.filter((t) => t.status === 'completed').length,
  };

  return {
    total_meetings: totalMeetings,
    total_tasks: totalTasks,
    priority_breakdown: priorityBreakdown,
    status_breakdown: statusBreakdown,
    speakers: Object.entries(speakerMap).map(([name, data]) => ({
      name,
      tasks: data.tasks,
      meetings: data.meetings,
    })),
    completion_rate: totalTasks > 0 ? Math.round((statusBreakdown.completed / totalTasks) * 100) : 0,
  };
}

export function getMeetingById(id: string): Meeting | undefined {
  const meetings = readDB();
  return meetings.find((m) => m.id === id);
}

export function saveMeeting(meeting: Meeting): Meeting {
  const meetings = readDB();
  const existingIdx = meetings.findIndex((m) => m.id === meeting.id);
  if (existingIdx >= 0) {
    meetings[existingIdx] = meeting;
  } else {
    meetings.unshift(meeting);
  }
  writeDB(meetings);
  return meeting;
}

export function updateMeeting(id: string, updates: Partial<Meeting>): Meeting | null {
  const meetings = readDB();
  const idx = meetings.findIndex((m) => m.id === id);
  if (idx === -1) return null;
  meetings[idx] = {
    ...meetings[idx],
    ...updates,
  };
  writeDB(meetings);
  return meetings[idx];
}

export function deleteMeeting(id: string): boolean {
  const meetings = readDB();
  const filtered = meetings.filter((m) => m.id !== id);
  if (filtered.length !== meetings.length) {
    writeDB(filtered);
    return true;
  }
  return false;
}

export function updateActionItem(
  meetingId: string,
  itemId: string,
  updates: Partial<ActionItem>
): ActionItem | null {
  const meetings = readDB();
  const meeting = meetings.find((m) => m.id === meetingId);
  if (!meeting) return null;

  const itemIdx = meeting.action_items.findIndex((a) => a.id === itemId);
  if (itemIdx === -1) return null;

  const current = meeting.action_items[itemIdx];
  const updatedItem: ActionItem = {
    ...current,
    ...updates,
    // recalculate confidence level if confidence score changed
    confidence_level:
      updates.confidence_score !== undefined
        ? updates.confidence_score > 0.85
          ? 'high'
          : updates.confidence_score >= 0.6
          ? 'medium'
          : 'low'
        : current.confidence_level,
    // update is_unassigned_owner
    is_unassigned_owner:
      updates.owner !== undefined
        ? !updates.owner || updates.owner.toLowerCase() === 'unassigned'
        : current.is_unassigned_owner,
  };

  meeting.action_items[itemIdx] = updatedItem;
  writeDB(meetings);
  return updatedItem;
}

export function addActionItem(
  meetingId: string,
  itemData: Omit<ActionItem, 'id' | 'meeting_id'>
): ActionItem | null {
  const meetings = readDB();
  const meeting = meetings.find((m) => m.id === meetingId);
  if (!meeting) return null;

  const newItem: ActionItem = {
    ...itemData,
    id: `act-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    meeting_id: meetingId,
    confidence_score: itemData.confidence_score ?? 0.95,
    confidence_level: (itemData.confidence_score ?? 0.95) > 0.85 ? 'high' : 'medium',
    status: itemData.status || 'pending',
    priority: itemData.priority || 'medium',
    created_at: new Date().toISOString(),
    is_unassigned_owner: !itemData.owner || itemData.owner.toLowerCase() === 'unassigned',
  };

  meeting.action_items.unshift(newItem);
  writeDB(meetings);
  return newItem;
}

export function deleteActionItem(meetingId: string, itemId: string): boolean {
  const meetings = readDB();
  const meeting = meetings.find((m) => m.id === meetingId);
  if (!meeting) return false;

  const initialLen = meeting.action_items.length;
  meeting.action_items = meeting.action_items.filter((a) => a.id !== itemId);
  if (meeting.action_items.length !== initialLen) {
    // Also remove from segments action_item_ids
    meeting.segments.forEach((seg) => {
      if (seg.action_item_ids) {
        seg.action_item_ids = seg.action_item_ids.filter((id) => id !== itemId);
      }
    });
    writeDB(meetings);
    return true;
  }
  return false;
}

export function mergeActionItems(
  meetingId: string,
  primaryId: string,
  duplicateId: string,
  mergedDescription?: string
): ActionItem | null {
  const meetings = readDB();
  const meeting = meetings.find((m) => m.id === meetingId);
  if (!meeting) return null;

  const primary = meeting.action_items.find((a) => a.id === primaryId);
  const duplicate = meeting.action_items.find((a) => a.id === duplicateId);
  if (!primary || !duplicate) return null;

  // Merge tags, keep earliest deadline or non-ambiguous
  const mergedTags = Array.from(new Set([...(primary.tags || []), ...(duplicate.tags || [])]));
  primary.tags = mergedTags;
  if (mergedDescription) {
    primary.task_description = mergedDescription;
  }
  if (primary.is_unassigned_owner && !duplicate.is_unassigned_owner) {
    primary.owner = duplicate.owner;
    primary.is_unassigned_owner = false;
  }
  if ((primary.is_ambiguous_deadline || primary.deadline === 'TBD') && duplicate.deadline !== 'TBD') {
    primary.deadline = duplicate.deadline;
    primary.deadline_iso = duplicate.deadline_iso;
    primary.is_ambiguous_deadline = duplicate.is_ambiguous_deadline;
  }

  // Remove duplicate item
  meeting.action_items = meeting.action_items.filter((a) => a.id !== duplicateId);

  // Re-link segments
  meeting.segments.forEach((seg) => {
    if (seg.action_item_ids && seg.action_item_ids.includes(duplicateId)) {
      seg.action_item_ids = seg.action_item_ids.filter((id) => id !== duplicateId);
      if (!seg.action_item_ids.includes(primaryId)) {
        seg.action_item_ids.push(primaryId);
      }
    }
  });

  writeDB(meetings);
  return primary;
}

export function detectDuplicates(meeting: Meeting): DuplicateSuggestion[] {
  const suggestions: DuplicateSuggestion[] = [];
  const items = meeting.action_items;

  for (let i = 0; i < items.length; i++) {
    for (let j = i + 1; j < items.length; j++) {
      const a = items[i];
      const b = items[j];

      // Calculate token similarity
      const wordsA = new Set(a.task_description.toLowerCase().replace(/[^a-z0-9 ]/g, '').split(/\s+/));
      const wordsB = new Set(b.task_description.toLowerCase().replace(/[^a-z0-9 ]/g, '').split(/\s+/));

      const intersection = new Set([...wordsA].filter((x) => wordsB.has(x)));
      const union = new Set([...wordsA, ...wordsB]);
      const jaccard = union.size > 0 ? intersection.size / union.size : 0;

      // Check if same owner or semantic overlap
      const sameOwner = a.owner.toLowerCase() === b.owner.toLowerCase() && a.owner.toLowerCase() !== 'unassigned';
      if (jaccard >= 0.4 || (jaccard >= 0.3 && sameOwner)) {
        suggestions.push({
          primary_id: a.id,
          duplicate_id: b.id,
          primary_task: a.task_description,
          duplicate_task: b.task_description,
          similarity_score: Math.round(jaccard * 100),
          suggested_action: `Merge duplicate task into "${a.task_description.substring(0, 40)}..."`,
        });
      }
    }
  }

  return suggestions;
}

export function getDashboardStats(): DashboardStats {
  const meetings = readDB();
  const allItems = meetings.flatMap((m) => m.action_items);

  const totalActionItems = allItems.length;
  const pendingTasks = allItems.filter((i) => i.status === 'pending').length;
  const inProgressTasks = allItems.filter((i) => i.status === 'in_progress').length;
  const completedTasks = allItems.filter((i) => i.status === 'completed').length;

  const totalConf = allItems.reduce((acc, curr) => acc + (curr.confidence_score || 0.8), 0);
  const avgConfidence = totalActionItems > 0 ? Math.round((totalConf / totalActionItems) * 100) : 92;

  const unassignedTasksCount = allItems.filter(
    (i) => i.is_unassigned_owner || !i.owner || i.owner.toLowerCase() === 'unassigned'
  ).length;

  const ambiguousDeadlinesCount = allItems.filter(
    (i) => i.is_ambiguous_deadline || !i.deadline || i.deadline.toLowerCase().includes('tbd') || i.deadline.toLowerCase().includes('soon')
  ).length;

  return {
    total_meetings: meetings.length,
    total_action_items: totalActionItems,
    pending_tasks: pendingTasks,
    in_progress_tasks: inProgressTasks,
    completed_tasks: completedTasks,
    avg_confidence: avgConfidence,
    unassigned_tasks_count: unassignedTasksCount,
    ambiguous_deadlines_count: ambiguousDeadlinesCount,
  };
}

export function seedReset(): Meeting[] {
  writeDB(INITIAL_MEETINGS);
  return INITIAL_MEETINGS;
}
