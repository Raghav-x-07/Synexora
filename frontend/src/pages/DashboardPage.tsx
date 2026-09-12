import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import {
  Sparkles,
  Flame,
  Award,
  BookOpen,
  Clock,
  TrendingUp,
  Brain,
  CheckCircle2,
  LogOut,
  Send,
  Zap,
  Shield,
  User,
  Sliders,
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const { user, logout, updateProfile } = useAuth();
  const [promptInput, setPromptInput] = useState('');
  const [activeTab, setActiveTab] = useState<'overview' | 'profile' | 'modules'>('overview');
  const [aiChatHistory, setAiChatHistory] = useState([
    {
      sender: 'ai',
      text: `Hello ${user?.name.split(' ')[0] || 'Scholar'}! Synexora Intelligence is synced with your ${user?.major || 'academics'}. What concept or study block shall we tackle today?`,
      time: 'Just now',
    },
  ]);
  const [isAiThinking, setIsAiThinking] = useState(false);

  // Profile edit state
  const [editMajor, setEditMajor] = useState(user?.major || 'Computer Science & AI');
  const [editUniversity, setEditUniversity] = useState(user?.university || 'Stanford University');
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [profileMessage, setProfileMessage] = useState<string | null>(null);

  const handleSendPrompt = (e: React.FormEvent) => {
    e.preventDefault();
    if (!promptInput.trim()) return;

    const userMessage = promptInput;
    setAiChatHistory((prev) => [...prev, { sender: 'user', text: userMessage, time: 'Now' }]);
    setPromptInput('');
    setIsAiThinking(true);

    setTimeout(() => {
      setIsAiThinking(false);
      setAiChatHistory((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: `Here is a Socratic breakdown for "${userMessage}": To master this principle, let's identify the core constraint first. What is the fundamental trade-off occurring at this boundary?`,
          time: 'Just now',
        },
      ]);
    }, 900);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdatingProfile(true);
    setProfileMessage(null);

    const res = await updateProfile({ major: editMajor, university: editUniversity });
    setIsUpdatingProfile(false);
    if (res.success) {
      setProfileMessage('Profile settings saved successfully!');
      setTimeout(() => setProfileMessage(null), 3000);
    } else {
      setProfileMessage(res.message || 'Failed to update profile');
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-100 flex flex-col selection:bg-cyan-500/30 selection:text-cyan-200">
      <Navbar />

      <main className="flex-1 pt-28 pb-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        {/* Welcome Header Banner */}
        <div className="relative rounded-3xl p-[1px] bg-gradient-to-r from-indigo-500/40 via-cyan-500/30 to-indigo-500/20 mb-8 overflow-hidden">
          <div className="rounded-3xl bg-slate-900/90 backdrop-blur-xl p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2.5 mb-2">
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-950/80 border border-emerald-500/30 text-emerald-300 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  Authenticated Session Active
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-indigo-950 border border-indigo-500/30 text-indigo-300">
                  Semester {user?.semester || 4}
                </span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
                Welcome back, {user?.name || 'Student'}
              </h1>
              <p className="text-sm text-slate-400 mt-1 flex items-center gap-2">
                <span>{user?.major || 'Computer Science & AI'}</span>
                <span>•</span>
                <span>{user?.university || 'Synexora Institute of Technology'}</span>
              </p>
            </div>

            {/* Quick stats pills */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-[#0b0f19] border border-indigo-500/20 shadow-md">
                <Flame className="w-5 h-5 text-amber-400 animate-pulse" />
                <div>
                  <div className="text-xs text-slate-400">Streak</div>
                  <div className="text-sm font-bold text-white">{user?.streak || 7} Days</div>
                </div>
              </div>

              <div className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-[#0b0f19] border border-cyan-500/20 shadow-md">
                <Award className="w-5 h-5 text-cyan-400" />
                <div>
                  <div className="text-xs text-slate-400">Target GPA</div>
                  <div className="text-sm font-bold text-white">{user?.gpa || 3.85}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Dashboard Tabs */}
        <div className="flex items-center gap-2 mb-8 border-b border-slate-800 pb-3">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 ${
              activeTab === 'overview'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Brain className="w-4 h-4" /> Academic Cockpit
          </button>
          <button
            onClick={() => setActiveTab('modules')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 ${
              activeTab === 'modules'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <BookOpen className="w-4 h-4" /> Enrolled Modules
          </button>
          <button
            onClick={() => setActiveTab('profile')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 ${
              activeTab === 'profile'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <User className="w-4 h-4" /> Account & Preferences
          </button>
        </div>

        {/* Tab 1: Overview */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* 4 Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="glass-panel rounded-2xl p-5 flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Weekly Focus</p>
                  <h3 className="text-2xl font-black text-white mt-1">18.4 hrs</h3>
                  <p className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" /> +2.1 hrs vs last week
                  </p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-cyan-400">
                  <Clock className="w-6 h-6" />
                </div>
              </div>

              <div className="glass-panel rounded-2xl p-5 flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Socratic Prompts</p>
                  <h3 className="text-2xl font-black text-white mt-1">42 Inquiries</h3>
                  <p className="text-[11px] text-cyan-400 mt-1">94% Mastery verified</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-cyan-600/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                  <Sparkles className="w-6 h-6" />
                </div>
              </div>

              <div className="glass-panel rounded-2xl p-5 flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Active Flashcards</p>
                  <h3 className="text-2xl font-black text-white mt-1">128 Cards</h3>
                  <p className="text-[11px] text-indigo-300 mt-1">Spaced repetition synced</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-300">
                  <Zap className="w-6 h-6" />
                </div>
              </div>

              <div className="glass-panel rounded-2xl p-5 flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Burnout Shield</p>
                  <h3 className="text-2xl font-black text-emerald-400 mt-1">Optimal</h3>
                  <p className="text-[11px] text-slate-400 mt-1">Low cognitive fatigue</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <Shield className="w-6 h-6" />
                </div>
              </div>
            </div>

            {/* Socratic AI Live Workspace Box */}
            <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-indigo-500/25 relative overflow-hidden">
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-400 flex items-center justify-center text-white">
                    <Brain className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">Socratic Dialogue Assistant</h3>
                    <p className="text-xs text-slate-400">First-principles reasoning & guided conceptual breakthroughs</p>
                  </div>
                </div>
                <span className="text-[11px] font-mono px-2.5 py-1 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-500/30">
                  Model: Synexora-Core-v2
                </span>
              </div>

              {/* Chat Thread */}
              <div className="space-y-4 max-h-80 overflow-y-auto pr-2 mb-6">
                {aiChatHistory.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex items-start gap-3 ${
                      msg.sender === 'user' ? 'flex-row-reverse' : ''
                    }`}
                  >
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${
                        msg.sender === 'user'
                          ? 'bg-indigo-600 text-white'
                          : 'bg-gradient-to-r from-cyan-500 to-indigo-500 text-white'
                      }`}
                    >
                      {msg.sender === 'user' ? 'U' : 'AI'}
                    </div>
                    <div
                      className={`p-3.5 rounded-2xl text-xs max-w-xl leading-relaxed ${
                        msg.sender === 'user'
                          ? 'bg-indigo-950/80 text-indigo-100 border border-indigo-500/30 rounded-tr-none'
                          : 'bg-[#070a11] text-slate-200 border border-slate-800 rounded-tl-none'
                      }`}
                    >
                      <p>{msg.text}</p>
                      <span className="text-[10px] text-slate-500 mt-1 block text-right">{msg.time}</span>
                    </div>
                  </div>
                ))}

                {isAiThinking && (
                  <div className="flex items-center gap-2 text-xs text-cyan-400 animate-pulse">
                    <Sparkles className="w-4 h-4 animate-spin" />
                    <span>Socratic reasoning in progress...</span>
                  </div>
                )}
              </div>

              {/* Prompt Input Form */}
              <form onSubmit={handleSendPrompt} className="relative">
                <input
                  type="text"
                  value={promptInput}
                  onChange={(e) => setPromptInput(e.target.value)}
                  placeholder="Ask a question or describe a concept you want to master..."
                  className="w-full py-3.5 pl-4 pr-12 rounded-2xl bg-[#070a11] border border-slate-700/80 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
                />
                <button
                  type="submit"
                  disabled={!promptInput.trim() || isAiThinking}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-xl bg-indigo-600 hover:bg-cyan-500 text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Tab 2: Enrolled Modules */}
        {activeTab === 'modules' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="glass-panel rounded-2xl p-6 border border-indigo-500/20">
              <div className="flex items-center justify-between mb-4">
                <span className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-indigo-950 text-indigo-300 border border-indigo-500/30">
                  CS 301
                </span>
                <span className="text-xs font-semibold text-emerald-400">95% Mastery</span>
              </div>
              <h4 className="text-lg font-bold text-white mb-2">Distributed Systems</h4>
              <p className="text-xs text-slate-400 mb-4">Consensus protocols, Raft, Paxos, and fault-tolerant architecture.</p>
              <div className="w-full bg-slate-800 rounded-full h-2 mb-2">
                <div className="bg-gradient-to-r from-indigo-500 to-cyan-400 h-2 rounded-full w-[95%]" />
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span>Next Exam: in 12 days</span>
                <span className="text-cyan-400">32 Notes</span>
              </div>
            </div>

            <div className="glass-panel rounded-2xl p-6 border border-indigo-500/20">
              <div className="flex items-center justify-between mb-4">
                <span className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-cyan-950 text-cyan-300 border border-cyan-500/30">
                  AI 402
                </span>
                <span className="text-xs font-semibold text-cyan-400">88% Mastery</span>
              </div>
              <h4 className="text-lg font-bold text-white mb-2">Deep Learning & Transformers</h4>
              <p className="text-xs text-slate-400 mb-4">Attention mechanisms, self-attention matrix, and generative models.</p>
              <div className="w-full bg-slate-800 rounded-full h-2 mb-2">
                <div className="bg-gradient-to-r from-indigo-500 to-cyan-400 h-2 rounded-full w-[88%]" />
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span>Next Lab: Tomorrow</span>
                <span className="text-cyan-400">45 Notes</span>
              </div>
            </div>

            <div className="glass-panel rounded-2xl p-6 border border-indigo-500/20">
              <div className="flex items-center justify-between mb-4">
                <span className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-purple-950 text-purple-300 border border-purple-500/30">
                  MATH 215
                </span>
                <span className="text-xs font-semibold text-purple-400">91% Mastery</span>
              </div>
              <h4 className="text-lg font-bold text-white mb-2">Linear Algebra & Matrix Methods</h4>
              <p className="text-xs text-slate-400 mb-4">Eigenvalues, SVD, Jordan canonical forms, and vector spaces.</p>
              <div className="w-full bg-slate-800 rounded-full h-2 mb-2">
                <div className="bg-gradient-to-r from-indigo-500 to-purple-400 h-2 rounded-full w-[91%]" />
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span>Next Problem Set: Friday</span>
                <span className="text-cyan-400">28 Notes</span>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Account & Profile Details */}
        {activeTab === 'profile' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Account Card */}
            <div className="glass-panel rounded-3xl p-6 border border-indigo-500/20">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 to-cyan-400 flex items-center justify-center text-white text-2xl font-black mb-4 shadow-lg shadow-indigo-600/30">
                {user?.name.charAt(0).toUpperCase()}
              </div>
              <h3 className="text-xl font-extrabold text-white">{user?.name}</h3>
              <p className="text-xs text-slate-400">{user?.email}</p>

              <div className="mt-6 pt-6 border-t border-slate-800 space-y-3 text-xs">
                <div className="flex items-center justify-between text-slate-400">
                  <span>Role:</span>
                  <span className="font-semibold text-white capitalize">{user?.role}</span>
                </div>
                <div className="flex items-center justify-between text-slate-400">
                  <span>Joined:</span>
                  <span className="text-slate-300">
                    {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Active Member'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-slate-400">
                  <span>Security Auth:</span>
                  <span className="text-emerald-400 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> JWT Verified
                  </span>
                </div>
              </div>

              <div className="mt-8">
                <button
                  onClick={logout}
                  className="w-full py-2.5 px-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 hover:bg-rose-500/20 hover:text-white transition-all text-xs font-semibold flex items-center justify-center gap-2"
                >
                  <LogOut className="w-4 h-4" /> Sign Out of Session
                </button>
              </div>
            </div>

            {/* Profile Edit Form */}
            <div className="lg:col-span-2 glass-panel rounded-3xl p-6 sm:p-8 border border-indigo-500/20">
              <h3 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
                <Sliders className="w-5 h-5 text-cyan-400" /> Academic Profile Configuration
              </h3>
              <p className="text-xs text-slate-400 mb-6">
                Update your major and institution to let the Socratic engine tailor course difficulty.
              </p>

              {profileMessage && (
                <div className="mb-6 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>{profileMessage}</span>
                </div>
              )}

              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-2">Major / Concentration</label>
                  <input
                    type="text"
                    value={editMajor}
                    onChange={(e) => setEditMajor(e.target.value)}
                    className="w-full py-2.5 px-4 rounded-xl bg-[#070a11] border border-slate-700 text-xs text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-2">University / Institution</label>
                  <input
                    type="text"
                    value={editUniversity}
                    onChange={(e) => setEditUniversity(e.target.value)}
                    className="w-full py-2.5 px-4 rounded-xl bg-[#070a11] border border-slate-700 text-xs text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={isUpdatingProfile}
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-500 text-white text-xs font-bold shadow-md hover:shadow-cyan-500/30 transition-all disabled:opacity-50"
                  >
                    {isUpdatingProfile ? 'Saving Changes...' : 'Save Profile Changes'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};
