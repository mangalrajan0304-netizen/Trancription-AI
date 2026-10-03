import React, { useState, useEffect } from 'react';
import { Meeting, DashboardStats, ActionItem, UserProfile } from './types.js';
import { Navbar, NavView } from './components/Navbar.js';
import { Dashboard } from './components/Dashboard.js';
import { TranscriptsPage } from './components/TranscriptsPage.js';
import { GlobalTasksPage } from './components/GlobalTasksPage.js';
import { ProcessPage } from './components/ProcessPage.js';
import { AnalyticsPage } from './components/AnalyticsPage.js';
import { MeetingWorkspace } from './components/MeetingWorkspace.js';
import { NewMeetingModal } from './components/NewMeetingModal.js';
import { LoginPage } from './components/LoginPage.js';
import { UserToolkitModal } from './components/UserToolkitModal.js';
import { Toast, ToastMessage } from './components/Toast.js';

export default function App() {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);
  const [currentView, setCurrentView] = useState<NavView>('dashboard');
  // Default to LIGHT mode as requested ("change a colour light")
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  // User Profile & Authentication Session
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem('pulse_user_session');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    // Default authenticated user (Mangal Rajan - using user email metadata)
    return {
      id: 'usr-mangal',
      name: 'Mangal Rajan',
      email: 'mangalrajan0304@gmail.com',
      role: 'Lead Architect & Admin',
      organization: 'PulseAction Global',
      assignedNames: ['Mangal', 'Mangal Rajan', 'Admin', 'Sarah (Product Lead)'],
    };
  });

  // User Toolkit Modal (Voice Dictaphone, Personal Action Hub, Email Drafter)
  const [isToolkitOpen, setIsToolkitOpen] = useState(false);

  const [stats, setStats] = useState<DashboardStats>({
    total_meetings: 0,
    total_action_items: 0,
    pending_tasks: 0,
    in_progress_tasks: 0,
    completed_tasks: 0,
    avg_confidence: 90,
    unassigned_tasks_count: 0,
    ambiguous_deadlines_count: 0,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isNewMeetingModalOpen, setIsNewMeetingModalOpen] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (text: string, type: 'success' | 'info' = 'success') => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, text, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Fetch all meetings and stats from backend API
  const fetchAllData = async (query?: string) => {
    try {
      // Pass order=asc for chronological date-wise order as requested
      const url = query
        ? `/api/meetings?q=${encodeURIComponent(query)}&order=asc`
        : '/api/meetings?order=asc';

      const [meetingsRes, statsRes] = await Promise.all([
        fetch(url),
        fetch('/api/stats'),
      ]);

      if (meetingsRes.ok) {
        const meetingsData: Meeting[] = await meetingsRes.json();
        setMeetings(meetingsData);

        // If a meeting is currently selected in workspace, refresh it with updated action items
        if (selectedMeeting) {
          const fresh = meetingsData.find((m) => m.id === selectedMeeting.id);
          if (fresh) setSelectedMeeting(fresh);
        }
      }

      if (statsRes.ok) {
        const statsData: DashboardStats = await statsRes.json();
        setStats(statsData);
      }
    } catch (err) {
      console.error('Backend connection error:', err);
      addToast('Unable to connect to backend service', 'info');
    }
  };

  useEffect(() => {
    fetchAllData(searchQuery);
  }, [searchQuery]);

  // Handle URL history navigation
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;
      if (path.startsWith('/meeting/')) {
        const id = path.replace('/meeting/', '');
        const target = meetings.find((m) => m.id === id);
        if (target) {
          setSelectedMeeting(target);
          return;
        }
      } else if (path === '/transcripts') {
        setCurrentView('transcripts');
        setSelectedMeeting(null);
      } else if (path === '/tasks') {
        setCurrentView('tasks');
        setSelectedMeeting(null);
      } else if (path === '/process') {
        setCurrentView('process');
        setSelectedMeeting(null);
      } else if (path === '/analytics') {
        setCurrentView('analytics');
        setSelectedMeeting(null);
      } else if (path === '/login') {
        setCurrentView('login');
        setSelectedMeeting(null);
      } else {
        setCurrentView('dashboard');
        setSelectedMeeting(null);
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [meetings]);

  // View navigation handler
  const handleNavigate = (view: NavView) => {
    setSelectedMeeting(null);
    setCurrentView(view);
    const path = view === 'dashboard' ? '/' : `/${view}`;
    window.history.pushState({}, '', path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectMeeting = (meeting: Meeting) => {
    setSelectedMeeting(meeting);
    window.history.pushState({}, '', `/meeting/${meeting.id}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToTranscripts = () => {
    setSelectedMeeting(null);
    setCurrentView('transcripts');
    window.history.pushState({}, '', '/transcripts');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // User Login & Logout
  const handleLogin = (user: UserProfile) => {
    setCurrentUser(user);
    try {
      localStorage.setItem('pulse_user_session', JSON.stringify(user));
    } catch (e) {}
    addToast(`Welcome back, ${user.name}!`, 'success');
    handleNavigate('dashboard');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    try {
      localStorage.removeItem('pulse_user_session');
    } catch (e) {}
    addToast('Signed out of session', 'info');
    handleNavigate('login');
  };

  const handleOpenToolkit = () => {
    setIsToolkitOpen(true);
  };

  // Extract action items from raw transcript
  const handleExtractMeeting = async (payload: {
    transcript: string;
    title?: string;
    date?: string;
    duration?: number;
  }) => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/meetings/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to extract meeting insights');
      }

      const newMeeting: Meeting = await res.json();
      await fetchAllData();
      handleSelectMeeting(newMeeting);
      addToast(
        `Successfully extracted ${newMeeting.action_items.length} action items from transcript!`,
        'success'
      );
    } catch (err: any) {
      addToast(`Extraction error: ${err.message}`, 'info');
    } finally {
      setIsLoading(false);
    }
  };

  // Inline update item (connected to backend)
  const handleUpdateItem = async (
    meetingId: string,
    itemId: string,
    updates: Partial<ActionItem>
  ) => {
    try {
      const res = await fetch(`/api/meetings/${meetingId}/items/${itemId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });

      if (res.ok) {
        const updatedItem: ActionItem = await res.json();
        // Update local meeting state if currently in workspace
        setSelectedMeeting((prev) => {
          if (!prev || prev.id !== meetingId) return prev;
          return {
            ...prev,
            action_items: prev.action_items.map((i) => (i.id === itemId ? updatedItem : i)),
          };
        });
        fetchAllData();
        addToast('Action item updated', 'success');
      }
    } catch (err) {
      console.error('Error updating item:', err);
    }
  };

  // Add item manually
  const handleAddItem = async (itemData: Omit<ActionItem, 'id' | 'meeting_id'>) => {
    if (!selectedMeeting) return;
    try {
      const res = await fetch(`/api/meetings/${selectedMeeting.id}/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(itemData),
      });

      if (res.ok) {
        const newItem: ActionItem = await res.json();
        setSelectedMeeting((prev) => {
          if (!prev) return null;
          return {
            ...prev,
            action_items: [newItem, ...prev.action_items],
          };
        });
        addToast('Action item added to workspace', 'success');
        fetchAllData();
      }
    } catch (err) {
      console.error('Error adding item:', err);
    }
  };

  // Delete item
  const handleDeleteItem = async (itemId: string) => {
    if (!selectedMeeting) return;
    try {
      const res = await fetch(`/api/meetings/${selectedMeeting.id}/items/${itemId}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setSelectedMeeting((prev) => {
          if (!prev) return null;
          return {
            ...prev,
            action_items: prev.action_items.filter((i) => i.id !== itemId),
          };
        });
        addToast('Action item removed', 'info');
        fetchAllData();
      }
    } catch (err) {
      console.error('Error deleting item:', err);
    }
  };

  // Delete entire meeting
  const handleDeleteMeeting = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this meeting transcript?')) return;
    try {
      const res = await fetch(`/api/meetings/${id}`, { method: 'DELETE' });
      if (res.ok) {
        if (selectedMeeting?.id === id) {
          handleBackToTranscripts();
        }
        await fetchAllData();
        addToast('Meeting deleted successfully', 'info');
      }
    } catch (err) {
      console.error('Error deleting meeting:', err);
    }
  };

  // Merge items
  const handleMergeItems = async (
    primaryId: string,
    duplicateId: string,
    mergedDescription?: string
  ) => {
    if (!selectedMeeting) return;
    const res = await fetch(`/api/meetings/${selectedMeeting.id}/merge`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        primary_id: primaryId,
        duplicate_id: duplicateId,
        merged_description: mergedDescription,
      }),
    });

    if (!res.ok) {
      throw new Error('Merge request failed');
    }

    const merged = await res.json();
    setSelectedMeeting((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        action_items: prev.action_items
          .filter((i) => i.id !== duplicateId)
          .map((i) => (i.id === primaryId ? merged : i)),
      };
    });
    fetchAllData();
  };

  // Reset to initial demo dataset
  const handleResetSeed = async () => {
    try {
      const res = await fetch('/api/seed/reset', { method: 'POST' });
      if (res.ok) {
        await fetchAllData();
        if (selectedMeeting) {
          const fresh = meetings.find((m) => m.id === selectedMeeting.id);
          if (fresh) setSelectedMeeting(fresh);
        }
        addToast('Demo dataset reset to initial state', 'success');
      }
    } catch (err) {
      console.error('Error resetting demo:', err);
    }
  };

  // Update meeting recording & transcript links
  const handleUpdateMeetingLinks = async (
    updates: Partial<Meeting>
  ) => {
    if (!selectedMeeting) return;
    try {
      const res = await fetch(`/api/meetings/${selectedMeeting.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });

      if (res.ok) {
        const updatedMeeting: Meeting = await res.json();
        setSelectedMeeting(updatedMeeting);
        setMeetings((prev) =>
          prev.map((m) => (m.id === selectedMeeting.id ? updatedMeeting : m))
        );
        addToast('Meeting recording & transcript links updated', 'success');
      } else {
        throw new Error('Failed to save links');
      }
    } catch (err: any) {
      console.error('Error updating links:', err);
      addToast(err.message || 'Error updating meeting links', 'info');
    }
  };

  const isLight = theme === 'light';

  return (
    <div className={`min-h-screen transition-colors duration-200 flex flex-col font-sans ${
      isLight ? 'bg-[#fcfaff] text-slate-900' : 'bg-slate-950 text-slate-100'
    }`}>
      {/* Top Navbar with Page Navigation, Light/Dark Mode, and User Profile */}
      <Navbar
        currentView={currentView}
        onNavigate={handleNavigate}
        onResetSeed={handleResetSeed}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        meetingCount={meetings.length}
        taskCount={stats.total_action_items}
        isLight={isLight}
        onToggleTheme={() => setTheme(isLight ? 'dark' : 'light')}
        currentUser={currentUser}
        onOpenToolkit={handleOpenToolkit}
        onLogout={handleLogout}
      />

      {/* Main Page Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {selectedMeeting ? (
          <MeetingWorkspace
            meeting={selectedMeeting}
            allMeetings={meetings}
            onSelectMeeting={handleSelectMeeting}
            onBack={handleBackToTranscripts}
            onUpdateItem={(itemId, updates) => handleUpdateItem(selectedMeeting.id, itemId, updates)}
            onAddItem={handleAddItem}
            onDeleteItem={handleDeleteItem}
            onMergeItems={handleMergeItems}
            onUpdateMeetingLinks={handleUpdateMeetingLinks}
            onShowToast={addToast}
            isLight={isLight}
          />
        ) : currentView === 'login' ? (
          <LoginPage
            currentUser={currentUser}
            onLogin={handleLogin}
            onLogout={handleLogout}
            onBackToDashboard={() => handleNavigate('dashboard')}
            isLight={isLight}
          />
        ) : currentView === 'transcripts' ? (
          <TranscriptsPage
            meetings={meetings}
            onSelectMeeting={handleSelectMeeting}
            onNewMeetingClick={() => setCurrentView('process')}
            onDeleteMeeting={handleDeleteMeeting}
            isLight={isLight}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
          />
        ) : currentView === 'tasks' ? (
          <GlobalTasksPage
            meetings={meetings}
            onUpdateItem={handleUpdateItem}
            onSelectMeeting={handleSelectMeeting}
            isLight={isLight}
          />
        ) : currentView === 'process' ? (
          <ProcessPage
            onExtract={handleExtractMeeting}
            isLoading={isLoading}
            isLight={isLight}
          />
        ) : currentView === 'analytics' ? (
          <AnalyticsPage
            meetings={meetings}
            isLight={isLight}
          />
        ) : (
          <Dashboard
            meetings={meetings}
            stats={stats}
            onSelectMeeting={handleSelectMeeting}
            onNewMeetingClick={() => setCurrentView('process')}
            onDeleteMeeting={handleDeleteMeeting}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onQuickExtract={(transcript, title) =>
              handleExtractMeeting({ transcript, title })
            }
            isLoading={isLoading}
            isLight={isLight}
            onNavigate={handleNavigate}
            currentUser={currentUser}
            onOpenToolkit={handleOpenToolkit}
          />
        )}
      </main>

      {/* Global New Meeting Modal */}
      <NewMeetingModal
        isOpen={isNewMeetingModalOpen}
        onClose={() => setIsNewMeetingModalOpen(false)}
        onSubmit={handleExtractMeeting}
        isLoading={isLoading}
      />

      {/* User Productivity Toolkit Modal (Voice Recorder, My Assigned Action Items, Email Drafter) */}
      <UserToolkitModal
        isOpen={isToolkitOpen}
        onClose={() => setIsToolkitOpen(false)}
        currentUser={currentUser}
        meetings={meetings}
        onQuickExtract={(transcript, title) =>
          handleExtractMeeting({ transcript, title })
        }
        onUpdateItem={handleUpdateItem}
        onShowToast={addToast}
        isLight={isLight}
      />

      {/* Toast Notifications */}
      <Toast toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
