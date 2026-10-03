import React, { useState, useRef, useEffect } from 'react';
import {
  Activity,
  BarChart2,
  Calendar,
  CheckCircle2,
  ChevronDown,
  Layers,
  LogOut,
  Mail,
  Mic,
  Moon,
  Plus,
  RotateCcw,
  Search,
  Sparkles,
  Sun,
  User,
  Users,
  Zap,
} from 'lucide-react';
import { UserProfile } from '../types.js';

export type NavView = 'dashboard' | 'transcripts' | 'tasks' | 'process' | 'analytics' | 'login';

interface NavbarProps {
  currentView: NavView;
  onNavigate: (view: NavView) => void;
  onResetSeed: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  meetingCount: number;
  taskCount: number;
  isLight: boolean;
  onToggleTheme: () => void;
  currentUser: UserProfile | null;
  onOpenToolkit: () => void;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onNavigate,
  onResetSeed,
  searchQuery,
  onSearchChange,
  meetingCount,
  taskCount,
  isLight,
  onToggleTheme,
  currentUser,
  onOpenToolkit,
  onLogout,
}) => {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className={`sticky top-0 z-40 w-full border-b transition-colors ${
      isLight
        ? 'bg-white/95 border-violet-100 backdrop-blur-md shadow-xs text-slate-800'
        : 'bg-slate-950/85 border-slate-800 backdrop-blur-md text-slate-100'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="h-16 flex items-center justify-between gap-4">
          {/* Left: Brand Logo & Navigation */}
          <div className="flex items-center gap-7">
            <button
              onClick={() => onNavigate('dashboard')}
              className="flex items-center gap-2.5 group focus:outline-none text-left cursor-pointer"
            >
              <div className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-tr from-violet-600 via-purple-600 to-fuchsia-500 p-[1px] shadow-sm group-hover:scale-105 transition-transform">
                <div className={`w-full h-full rounded-[11px] flex items-center justify-center ${
                  isLight ? 'bg-white' : 'bg-slate-950'
                }`}>
                  <Activity className="w-5 h-5 text-violet-600" />
                </div>
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className={`font-extrabold text-base tracking-tight ${
                    isLight ? 'text-slate-900' : 'text-white'
                  }`}>
                    PulseAction
                  </span>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider px-1.5 py-0.2 rounded-md bg-violet-100 text-violet-700 border border-violet-200">
                    AI
                  </span>
                </div>
              </div>
            </button>

            {/* Main Navigation Links */}
            <nav className="hidden md:flex items-center gap-1">
              <button
                onClick={() => onNavigate('dashboard')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  currentView === 'dashboard'
                    ? isLight
                      ? 'bg-violet-100/70 text-violet-800 border border-violet-200 shadow-xs'
                      : 'bg-slate-900 text-violet-300 border border-violet-500/40'
                    : isLight
                    ? 'text-slate-600 hover:text-violet-700 hover:bg-violet-50/60'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                Dashboard
              </button>

              <button
                onClick={() => onNavigate('transcripts')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  currentView === 'transcripts'
                    ? isLight
                      ? 'bg-violet-100/70 text-violet-800 border border-violet-200 shadow-xs'
                      : 'bg-slate-900 text-violet-300 border border-violet-500/40'
                    : isLight
                    ? 'text-slate-600 hover:text-violet-700 hover:bg-violet-50/60'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                <Calendar className="w-3.5 h-3.5 text-violet-600" />
                <span>Transcripts (Date-Wise)</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-semibold ${
                  isLight ? 'bg-violet-200/70 text-violet-800' : 'bg-slate-800 text-slate-400'
                }`}>
                  {meetingCount}
                </span>
              </button>

              <button
                onClick={() => onNavigate('tasks')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  currentView === 'tasks'
                    ? isLight
                      ? 'bg-violet-100/70 text-violet-800 border border-violet-200 shadow-xs'
                      : 'bg-slate-900 text-violet-300 border border-violet-500/40'
                    : isLight
                    ? 'text-slate-600 hover:text-violet-700 hover:bg-violet-50/60'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                <Layers className="w-3.5 h-3.5 text-violet-600" />
                <span>Task Matrix</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-semibold ${
                  isLight ? 'bg-violet-200/70 text-violet-800' : 'bg-slate-800 text-slate-400'
                }`}>
                  {taskCount}
                </span>
              </button>

              <button
                onClick={() => onNavigate('analytics')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  currentView === 'analytics'
                    ? isLight
                      ? 'bg-violet-100/70 text-violet-800 border border-violet-200 shadow-xs'
                      : 'bg-slate-900 text-violet-300 border border-violet-500/40'
                    : isLight
                    ? 'text-slate-600 hover:text-violet-700 hover:bg-violet-50/60'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                <BarChart2 className="w-3.5 h-3.5 text-violet-600" />
                <span>Analytics</span>
              </button>
            </nav>
          </div>

          {/* Right: Search, Toolkit, User Profile & Actions */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* User Productivity Tools Button (Live recorder, personal task list, email drafter) */}
            <button
              onClick={onOpenToolkit}
              title="Open User Productivity Toolkit (Voice memo recorder, personal task plan, email generator)"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white text-xs font-bold shadow-sm shadow-violet-600/30 transition-all cursor-pointer"
            >
              <Zap className="w-3.5 h-3.5 fill-white" />
              <span className="hidden sm:inline">User Tools</span>
            </button>

            {/* Process New Transcript Button */}
            <button
              onClick={() => onNavigate('process')}
              className={`hidden lg:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-bold transition-all cursor-pointer ${
                isLight
                  ? 'bg-violet-50/80 hover:bg-violet-100 text-violet-800 border-violet-200'
                  : 'bg-slate-900 hover:bg-slate-800 text-violet-300 border-slate-800'
              }`}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Process</span>
            </button>

            {/* Theme Toggle (Light / Dark) */}
            <button
              onClick={onToggleTheme}
              title={isLight ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
              className={`p-1.5 sm:p-2 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                isLight
                  ? 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700'
                  : 'bg-slate-900 hover:bg-slate-800 border-slate-800 text-amber-300'
              }`}
            >
              {isLight ? (
                <Moon className="w-4 h-4 text-violet-700" />
              ) : (
                <Sun className="w-4 h-4 text-amber-400" />
              )}
            </button>

            {/* Reset Demo Button */}
            <button
              onClick={onResetSeed}
              title="Reset Demo Dataset"
              className={`hidden sm:flex p-2 rounded-lg border text-xs font-medium items-center gap-1 transition-colors cursor-pointer ${
                isLight
                  ? 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-600'
                  : 'bg-slate-900 hover:bg-slate-800 border-slate-800 text-slate-400'
              }`}
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>

            {/* ================= USER PROFILE / LOGIN BUTTON ================= */}
            <div className="relative" ref={userMenuRef}>
              {currentUser ? (
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className={`flex items-center gap-2 p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl border transition-all cursor-pointer ${
                    currentView === 'login'
                      ? 'border-violet-500 bg-violet-50 dark:bg-violet-950/40 ring-2 ring-violet-500/20'
                      : isLight
                      ? 'bg-white hover:bg-violet-50/70 border-violet-200 text-slate-800 shadow-xs'
                      : 'bg-slate-900 hover:bg-slate-800 border-slate-800 text-slate-200'
                  }`}
                >
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-violet-600 to-purple-600 text-white font-extrabold flex items-center justify-center text-xs shadow-xs">
                    {currentUser.name.charAt(0)}
                  </div>
                  <div className="hidden xl:block text-left">
                    <div className="text-xs font-extrabold leading-none line-clamp-1">
                      {currentUser.name}
                    </div>
                    <div className="text-[10px] text-violet-600 dark:text-violet-400 font-medium">
                      {currentUser.role.split(' ')[0]}
                    </div>
                  </div>
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </button>
              ) : (
                <button
                  onClick={() => onNavigate('login')}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-violet-300 text-violet-700 bg-violet-50 hover:bg-violet-100 text-xs font-bold transition-all cursor-pointer"
                >
                  <User className="w-3.5 h-3.5" />
                  <span>Sign In</span>
                </button>
              )}

              {/* User Dropdown Menu */}
              {isUserMenuOpen && currentUser && (
                <div
                  className={`absolute right-0 mt-2 w-64 rounded-2xl border shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-2 text-xs ${
                    isLight ? 'bg-white border-violet-100' : 'bg-slate-900 border-slate-800'
                  }`}
                >
                  {/* User Profile Card */}
                  <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800">
                    <div className="font-extrabold text-sm text-slate-900 dark:text-white">
                      {currentUser.name}
                    </div>
                    <div className="text-[11px] text-slate-500 font-mono truncate">
                      {currentUser.email}
                    </div>
                    <div className="mt-1.5 inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-violet-100 dark:bg-violet-950/60 text-violet-800 dark:text-violet-300">
                      <span>{currentUser.role}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="py-1">
                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        onOpenToolkit();
                      }}
                      className="w-full px-4 py-2 text-left hover:bg-violet-50 dark:hover:bg-slate-800 flex items-center gap-2 text-slate-700 dark:text-slate-300 font-semibold cursor-pointer"
                    >
                      <CheckCircle2 className="w-4 h-4 text-violet-600" />
                      <span>My Assigned Action Items</span>
                    </button>

                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        onOpenToolkit();
                      }}
                      className="w-full px-4 py-2 text-left hover:bg-violet-50 dark:hover:bg-slate-800 flex items-center gap-2 text-slate-700 dark:text-slate-300 font-semibold cursor-pointer"
                    >
                      <Mic className="w-4 h-4 text-violet-600" />
                      <span>Live Voice Memo Recorder</span>
                    </button>

                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        onOpenToolkit();
                      }}
                      className="w-full px-4 py-2 text-left hover:bg-violet-50 dark:hover:bg-slate-800 flex items-center gap-2 text-slate-700 dark:text-slate-300 font-semibold cursor-pointer"
                    >
                      <Mail className="w-4 h-4 text-violet-600" />
                      <span>Follow-Up Email & Slack Drafter</span>
                    </button>

                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        onNavigate('login');
                      }}
                      className="w-full px-4 py-2 text-left hover:bg-violet-50 dark:hover:bg-slate-800 flex items-center gap-2 text-slate-700 dark:text-slate-300 font-semibold cursor-pointer"
                    >
                      <Users className="w-4 h-4 text-violet-600" />
                      <span>Switch Account / Manage Profiles</span>
                    </button>
                  </div>

                  <div className="pt-1 border-t border-slate-100 dark:border-slate-800">
                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        onLogout();
                      }}
                      className="w-full px-4 py-2 text-left hover:bg-rose-50 dark:hover:bg-rose-950/30 flex items-center gap-2 text-rose-600 font-semibold cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Navigation Row */}
        <div className="flex md:hidden items-center justify-around py-2 border-t border-violet-100 dark:border-slate-800 text-xs">
          <button
            onClick={() => onNavigate('dashboard')}
            className={`font-semibold ${currentView === 'dashboard' ? 'text-violet-600' : 'text-slate-500'}`}
          >
            Dashboard
          </button>
          <button
            onClick={() => onNavigate('transcripts')}
            className={`font-semibold ${currentView === 'transcripts' ? 'text-violet-600' : 'text-slate-500'}`}
          >
            Transcripts ({meetingCount})
          </button>
          <button
            onClick={() => onNavigate('tasks')}
            className={`font-semibold ${currentView === 'tasks' ? 'text-violet-600' : 'text-slate-500'}`}
          >
            Tasks ({taskCount})
          </button>
          <button
            onClick={onOpenToolkit}
            className="font-bold text-violet-700 flex items-center gap-1"
          >
            <Zap className="w-3.5 h-3.5 fill-violet-700" />
            <span>Tools</span>
          </button>
          <button
            onClick={() => onNavigate('login')}
            className={`font-semibold ${currentView === 'login' ? 'text-violet-600' : 'text-slate-500'}`}
          >
            {currentUser ? currentUser.name.split(' ')[0] : 'Login'}
          </button>
        </div>
      </div>
    </header>
  );
};
