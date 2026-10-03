import React, { useState } from 'react';
import {
  Activity,
  ArrowRight,
  Check,
  CheckCircle2,
  Key,
  Lock,
  Mail,
  Shield,
  Sparkles,
  User,
  Users,
} from 'lucide-react';
import { UserProfile } from '../types.js';

interface LoginPageProps {
  currentUser: UserProfile | null;
  onLogin: (user: UserProfile) => void;
  onLogout: () => void;
  onBackToDashboard: () => void;
  isLight: boolean;
}

export const DEMO_USERS: UserProfile[] = [
  {
    id: 'usr-mangal',
    name: 'Mangal Rajan',
    email: 'mangalrajan0304@gmail.com',
    role: 'Lead Architect & Admin',
    organization: 'PulseAction Global',
    assignedNames: ['Mangal', 'Mangal Rajan', 'Admin', 'Sarah (Product Lead)'],
  },
  {
    id: 'usr-sarah',
    name: 'Sarah Chen',
    email: 'sarah.lead@pulseaction.ai',
    role: 'Senior Product Lead',
    organization: 'Product & Growth',
    assignedNames: ['Sarah', 'Sarah (Product Lead)', 'Sarah Chen'],
  },
  {
    id: 'usr-liam',
    name: 'Liam Foster',
    email: 'liam.frontend@pulseaction.ai',
    role: 'Staff Frontend Engineer',
    organization: 'Core Mobile Engineering',
    assignedNames: ['Liam', 'Liam (Frontend)', 'Liam Foster'],
  },
  {
    id: 'usr-priya',
    name: 'Priya Nair',
    email: 'priya.client@fintechcorp.io',
    role: 'Client Tech Lead',
    organization: 'FinTech Compliance Partner',
    assignedNames: ['Priya', 'Priya (Client Tech Lead)', 'Priya (Fintech Tech Lead)'],
  },
];

export const LoginPage: React.FC<LoginPageProps> = ({
  currentUser,
  onLogin,
  onLogout,
  onBackToDashboard,
  isLight,
}) => {
  const [tab, setTab] = useState<'signin' | 'signup' | 'profiles'>('signin');
  const [email, setEmail] = useState('mangalrajan0304@gmail.com');
  const [password, setPassword] = useState('••••••••••••');
  const [name, setName] = useState('');
  const [org, setOrg] = useState('');
  const [rememberMe, setRememberMe] = useState(true);

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    // Check if matches known demo user or create session
    const matched = DEMO_USERS.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
    if (matched) {
      onLogin(matched);
    } else {
      const derivedName = name.trim() || email.split('@')[0].replace(/[._]/g, ' ');
      const newUser: UserProfile = {
        id: `usr-${Date.now()}`,
        name: derivedName.charAt(0).toUpperCase() + derivedName.slice(1),
        email: email.trim(),
        role: 'Team Member',
        organization: org.trim() || 'PulseAction Workspace',
        assignedNames: [derivedName, derivedName.split(' ')[0]],
      };
      onLogin(newUser);
    }
  };

  const handleQuickSelectDemo = (u: UserProfile) => {
    onLogin(u);
  };

  return (
    <div className="max-w-xl mx-auto py-8 sm:py-12 px-4 space-y-6 animate-in fade-in">
      {/* Top Brand & Title */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-tr from-violet-600 via-purple-600 to-fuchsia-500 p-[1.5px] shadow-lg shadow-violet-500/25 mx-auto">
          <div className={`w-full h-full rounded-[14px] flex items-center justify-center ${
            isLight ? 'bg-white' : 'bg-slate-950'
          }`}>
            <Activity className="w-6 h-6 text-violet-600" />
          </div>
        </div>
        <h1 className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${
          isLight ? 'text-slate-900' : 'text-white'
        }`}>
          {currentUser ? 'Your PulseAction Account' : 'Welcome to PulseAction AI'}
        </h1>
        <p className={`text-xs sm:text-sm max-w-sm mx-auto ${
          isLight ? 'text-slate-600' : 'text-slate-400'
        }`}>
          {currentUser
            ? 'You are signed in. Manage your workspace role or switch demo accounts.'
            : 'Sign in to access your personal action item hub, recordings, and workspace integrations.'}
        </p>
      </div>

      {/* Current Active Account Box */}
      {currentUser && (
        <div className={`p-5 rounded-2xl border space-y-4 shadow-sm ${
          isLight
            ? 'bg-gradient-to-br from-violet-50 via-white to-purple-50/40 border-violet-200'
            : 'bg-slate-900/80 border-violet-900/40'
        }`}>
          <div className="flex items-center justify-between pb-3 border-b border-violet-100 dark:border-slate-800">
            <span className="text-xs font-bold text-violet-700 dark:text-violet-300 uppercase tracking-wider flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Active Session</span>
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-violet-100 dark:bg-violet-950/60 text-violet-800 dark:text-violet-300 border border-violet-200 dark:border-violet-800">
              {currentUser.role}
            </span>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-violet-600 text-white font-extrabold flex items-center justify-center text-lg shadow-md shadow-violet-600/30">
              {currentUser.name.charAt(0)}
            </div>
            <div>
              <div className="font-extrabold text-base text-slate-900 dark:text-white">
                {currentUser.name}
              </div>
              <div className="text-xs text-slate-500 font-mono">
                {currentUser.email}
              </div>
              <div className="text-[11px] text-violet-600 font-medium">
                {currentUser.organization}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={onBackToDashboard}
              className="flex-1 py-2 px-3 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs shadow-md shadow-violet-600/30 transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              <span>Go to Dashboard</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={onLogout}
              className={`py-2 px-3 rounded-xl border text-xs font-semibold transition-colors cursor-pointer ${
                isLight
                  ? 'bg-white hover:bg-rose-50 text-rose-600 border-slate-200 hover:border-rose-200'
                  : 'bg-slate-800 hover:bg-rose-950/40 text-rose-400 border-slate-700'
              }`}
            >
              Sign Out
            </button>
          </div>
        </div>
      )}

      {/* Main Authentication Box */}
      <div className={`rounded-2xl border p-6 sm:p-7 shadow-sm transition-all ${
        isLight
          ? 'bg-white border-violet-100 shadow-violet-100/30'
          : 'bg-slate-900/60 border-slate-800'
      }`}>
        {/* Tab switcher */}
        <div className={`grid grid-cols-3 p-1 rounded-xl border mb-6 text-xs font-bold ${
          isLight ? 'bg-slate-100 border-slate-200' : 'bg-slate-950 border-slate-800'
        }`}>
          <button
            onClick={() => setTab('signin')}
            className={`py-1.5 rounded-lg transition-all cursor-pointer ${
              tab === 'signin'
                ? 'bg-violet-600 text-white shadow-sm'
                : isLight ? 'text-slate-600 hover:text-slate-900' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => setTab('signup')}
            className={`py-1.5 rounded-lg transition-all cursor-pointer ${
              tab === 'signup'
                ? 'bg-violet-600 text-white shadow-sm'
                : isLight ? 'text-slate-600 hover:text-slate-900' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Create Account
          </button>
          <button
            onClick={() => setTab('profiles')}
            className={`py-1.5 rounded-lg transition-all cursor-pointer ${
              tab === 'profiles'
                ? 'bg-violet-600 text-white shadow-sm'
                : isLight ? 'text-slate-600 hover:text-slate-900' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            1-Click Profiles
          </button>
        </div>

        {/* Tab 1: Sign In */}
        {tab === 'signin' && (
          <form onSubmit={handleSignIn} className="space-y-4">
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className={`w-full pl-9 pr-3.5 py-2.5 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-violet-500 font-medium ${
                    isLight
                      ? 'bg-slate-50 border border-slate-200 text-slate-900'
                      : 'bg-slate-950 border border-slate-800 text-slate-100'
                  }`}
                />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <label className="font-bold text-slate-700 dark:text-slate-300">
                  Password
                </label>
                <span className="text-violet-600 font-semibold cursor-pointer hover:underline text-[11px]">
                  Forgot password?
                </span>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className={`w-full pl-9 pr-3.5 py-2.5 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-violet-500 font-medium ${
                    isLight
                      ? 'bg-slate-50 border border-slate-200 text-slate-900'
                      : 'bg-slate-950 border border-slate-800 text-slate-100'
                  }`}
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-slate-600 dark:text-slate-400">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded text-violet-600 focus:ring-violet-500 cursor-pointer"
                />
                <span>Remember this workstation</span>
              </label>

              <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                <Shield className="w-3 h-3" />
                <span>256-bit encrypted</span>
              </span>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs sm:text-sm shadow-md shadow-violet-600/30 transition-all cursor-pointer flex items-center justify-center gap-2 mt-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>Sign In to PulseAction</span>
            </button>
          </form>
        )}

        {/* Tab 2: Create Account */}
        {tab === 'signup' && (
          <form onSubmit={handleSignIn} className="space-y-4">
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                Full Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Mangal Rajan"
                  className={`w-full pl-9 pr-3.5 py-2.5 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-violet-500 font-medium ${
                    isLight
                      ? 'bg-slate-50 border border-slate-200 text-slate-900'
                      : 'bg-slate-950 border border-slate-800 text-slate-100'
                  }`}
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                Work Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@organization.com"
                  className={`w-full pl-9 pr-3.5 py-2.5 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-violet-500 font-medium ${
                    isLight
                      ? 'bg-slate-50 border border-slate-200 text-slate-900'
                      : 'bg-slate-950 border border-slate-800 text-slate-100'
                  }`}
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                Organization / Team
              </label>
              <input
                type="text"
                value={org}
                onChange={(e) => setOrg(e.target.value)}
                placeholder="e.g. Engineering & Product Operations"
                className={`w-full px-3.5 py-2.5 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-violet-500 font-medium ${
                  isLight
                    ? 'bg-slate-50 border border-slate-200 text-slate-900'
                    : 'bg-slate-950 border border-slate-800 text-slate-100'
                }`}
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs sm:text-sm shadow-md shadow-violet-600/30 transition-all cursor-pointer flex items-center justify-center gap-2 mt-2"
            >
              <span>Create Account & Start</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* Tab 3: One-Click Demo Profiles */}
        {tab === 'profiles' && (
          <div className="space-y-3">
            <p className={`text-xs ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
              Click any workspace persona to immediately authenticate as them and view their assigned tasks across transcripts:
            </p>

            <div className="space-y-2">
              {DEMO_USERS.map((user) => {
                const isActive = currentUser?.email === user.email;
                return (
                  <button
                    key={user.id}
                    onClick={() => handleQuickSelectDemo(user)}
                    className={`w-full p-3 rounded-xl border flex items-center justify-between text-left transition-all cursor-pointer ${
                      isActive
                        ? 'bg-violet-50 border-violet-400 ring-2 ring-violet-500/20 shadow-xs'
                        : isLight
                        ? 'bg-slate-50/70 hover:bg-violet-50/40 border-slate-200 hover:border-violet-200'
                        : 'bg-slate-950 hover:bg-slate-900 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-lg font-extrabold flex items-center justify-center text-sm ${
                        isActive
                          ? 'bg-violet-600 text-white shadow-xs'
                          : 'bg-violet-100 text-violet-700'
                      }`}>
                        {user.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-bold text-xs text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                          <span>{user.name}</span>
                          {user.email === 'mangalrajan0304@gmail.com' && (
                            <span className="px-1.5 py-0.2 rounded text-[10px] font-extrabold bg-violet-200 text-violet-800">
                              Primary User
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {user.role} • {user.email}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {isActive ? (
                        <span className="text-xs font-bold text-violet-700 flex items-center gap-1">
                          <Check className="w-4 h-4 text-emerald-600" />
                          <span>Active</span>
                        </span>
                      ) : (
                        <span className="text-xs font-semibold text-violet-600 hover:underline">
                          Switch
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
