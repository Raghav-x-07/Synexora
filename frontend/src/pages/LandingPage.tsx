import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  ArrowRight,
  Brain,
  Target,
  Clock,
  ShieldCheck,
  Cpu,
  Layers,
  CheckCircle2,
  TrendingUp,
  Flame,
  Bot,
  Compass,
} from 'lucide-react';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';

export const LandingPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'socratic' | 'schedule' | 'analytics'>('socratic');
  const [selectedPrompt, setSelectedPrompt] = useState(0);

  const demoPrompts = [
    {
      title: "Algorithms & Complexity",
      question: "Can you help me understand Dynamic Programming for the Knapsack problem step-by-step?",
      aiResponse: "Let's break this down intuitively! Instead of calculating every combination, we ask: At item i with weight w, what's the maximum value if we either take it or leave it? Let's write out the recurrence relation together.",
      tag: "Computer Science",
      speed: "0.24s reasoning",
    },
    {
      title: "Biochemistry & Metabolism",
      question: "Why is ATP synthesis coupled to the proton gradient in cellular respiration?",
      aiResponse: "Think of the mitochondrial membrane like a hydro-electric dam. As protons accumulate in the intermembrane space, they want to flow back down their concentration gradient through ATP synthase, spinning the molecular rotor to generate ATP!",
      tag: "Biomedical",
      speed: "0.19s reasoning",
    },
    {
      title: "Microeconomics",
      question: "How do price elasticity and deadweight loss interact under a luxury tax?",
      aiResponse: "When demand is highly elastic (as with luxury goods), consumers easily switch to substitutes. Hence, the tax causes a large reduction in quantity traded, generating substantial deadweight loss relative to tax revenue.",
      tag: "Economics",
      speed: "0.22s reasoning",
    }
  ];

  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-100 flex flex-col selection:bg-cyan-500/30 selection:text-cyan-200">
      <Navbar />

      {/* Hero Background Glows */}
      <div className="relative pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden">
        {/* Glow Spheres */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-indigo-600/20 via-cyan-500/20 to-transparent rounded-full blur-3xl pointer-events-none -z-10" />
        <div className="absolute top-1/3 left-1/4 w-[350px] h-[350px] bg-indigo-500/15 rounded-full blur-3xl pointer-events-none -z-10" />
        <div className="absolute top-1/2 right-1/4 w-[400px] h-[400px] bg-cyan-400/15 rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          {/* Top Pill */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-950/80 border border-indigo-500/30 text-indigo-300 text-xs sm:text-sm font-medium mb-8 backdrop-blur-md shadow-inner shadow-indigo-500/10 animate-fade-in">
            <span className="flex h-2 w-2 rounded-full bg-cyan-400 animate-ping" />
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span>Synexora Intelligence Engine v2.0 • MERN Stack Live</span>
          </div>

          {/* Main Title */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight max-w-5xl mx-auto leading-[1.1] mb-6">
            Supercharge Your Mind.{' '}
            <span className="text-gradient block mt-1">Master Every Subject.</span>
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-xl text-slate-300 max-w-3xl mx-auto font-normal leading-relaxed mb-10">
            The next-generation AI operating system built for students. Consolidate notes, conquer complex concepts with Socratic intelligence, and balance high academic GPA with optimal wellness.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Link
              to="/register"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 text-white font-bold text-base shadow-xl shadow-indigo-600/30 hover:shadow-cyan-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-2 group"
            >
              <span>Get Started Free</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              to="/login"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-slate-900/80 border border-slate-700/80 text-slate-200 font-semibold text-base hover:bg-slate-800 hover:border-slate-600 hover:text-white transition-all duration-200 flex items-center justify-center gap-2"
            >
              <span>Student Sign In</span>
            </Link>
          </div>

          {/* Hero Feature Badges */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto pt-4 text-xs font-semibold text-slate-300">
            <div className="glass-panel rounded-xl py-3 px-4 flex items-center justify-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-cyan-400" />
              <span>JWT & bcrypt Security</span>
            </div>
            <div className="glass-panel rounded-xl py-3 px-4 flex items-center justify-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-cyan-400" />
              <span>Socratic AI Dialogue</span>
            </div>
            <div className="glass-panel rounded-xl py-3 px-4 flex items-center justify-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-cyan-400" />
              <span>Adaptive Workload OS</span>
            </div>
            <div className="glass-panel rounded-xl py-3 px-4 flex items-center justify-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-cyan-400" />
              <span>Real-time GPA Forecast</span>
            </div>
          </div>
        </div>

        {/* Hero Interactive Terminal Mockup */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-16">
          <div className="relative rounded-3xl p-[1px] bg-gradient-to-b from-indigo-500/40 via-cyan-500/20 to-transparent shadow-2xl shadow-indigo-950/60">
            <div className="rounded-3xl bg-[#0f172a]/95 backdrop-blur-2xl p-6 sm:p-8 border border-indigo-500/20 overflow-hidden">
              {/* Header Bar */}
              <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                    <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                    <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                  </div>
                  <span className="text-xs font-mono text-slate-400 ml-2 flex items-center gap-1.5">
                    <Cpu className="w-3.5 h-3.5 text-cyan-400" /> synexora-workspace://v2.0/socratic-core
                  </span>
                </div>

                {/* Switcher Tabs */}
                <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-900 border border-slate-800">
                  <button
                    onClick={() => setActiveTab('socratic')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      activeTab === 'socratic'
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Socratic Lab
                  </button>
                  <button
                    onClick={() => setActiveTab('schedule')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      activeTab === 'schedule'
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Adaptive Planner
                  </button>
                  <button
                    onClick={() => setActiveTab('analytics')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      activeTab === 'analytics'
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Cognitive Index
                  </button>
                </div>
              </div>

              {/* Tab Content */}
              {activeTab === 'socratic' && (
                <div className="pt-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* Left Column: Sample topics */}
                  <div className="lg:col-span-4 space-y-3">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                      Active Inquiries
                    </p>
                    {demoPrompts.map((p, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedPrompt(idx)}
                        className={`w-full text-left p-3.5 rounded-xl border transition-all text-xs ${
                          selectedPrompt === idx
                            ? 'bg-indigo-950/60 border-cyan-400/60 shadow-md shadow-indigo-900/40 text-white'
                            : 'bg-slate-900/50 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="font-bold text-slate-200">{p.title}</span>
                          <span className="px-2 py-0.5 rounded text-[10px] bg-slate-800 text-cyan-300 font-mono">
                            {p.tag}
                          </span>
                        </div>
                        <p className="line-clamp-2 text-slate-400 text-[11px] leading-relaxed">
                          {p.question}
                        </p>
                      </button>
                    ))}
                  </div>

                  {/* Right Column: AI Socratic Reasoning Box */}
                  <div className="lg:col-span-8 bg-[#0b0f19]/90 rounded-2xl border border-indigo-500/20 p-5 flex flex-col justify-between">
                    <div className="space-y-4">
                      {/* User Bubble */}
                      <div className="flex items-start gap-3">
                        <div className="w-7 h-7 rounded-lg bg-indigo-600/80 flex items-center justify-center font-bold text-xs text-white shrink-0">
                          U
                        </div>
                        <div className="bg-indigo-950/50 border border-indigo-500/20 p-3.5 rounded-2xl rounded-tl-none text-xs text-slate-200 leading-relaxed max-w-xl">
                          {demoPrompts[selectedPrompt].question}
                        </div>
                      </div>

                      {/* AI Reasoning Response */}
                      <div className="flex items-start gap-3">
                        <div className="w-7 h-7 rounded-lg bg-gradient-to-r from-cyan-500 to-indigo-500 flex items-center justify-center text-white shrink-0 shadow-md shadow-cyan-500/20">
                          <Bot className="w-4 h-4" />
                        </div>
                        <div className="bg-slate-900/90 border border-cyan-500/30 p-4 rounded-2xl rounded-tl-none text-xs text-slate-100 leading-relaxed shadow-lg shadow-cyan-950/20 max-w-xl">
                          <div className="flex items-center gap-2 mb-2 pb-2 border-b border-slate-800 text-[10px] text-cyan-300 font-mono">
                            <Sparkles className="w-3 h-3 text-cyan-400" />
                            <span>Socratic Model Reasoning Active</span>
                            <span className="ml-auto text-slate-500">
                              {demoPrompts[selectedPrompt].speed}
                            </span>
                          </div>
                          <p className="text-slate-200">
                            {demoPrompts[selectedPrompt].aiResponse}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                      <span className="flex items-center gap-1.5">
                        <Flame className="w-3.5 h-3.5 text-amber-400" /> Socratic Mastery Score: 94%
                      </span>
                      <Link
                        to="/register"
                        className="text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1"
                      >
                        Try with your notes <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'schedule' && (
                <div className="pt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 rounded-2xl bg-[#0b0f19] border border-indigo-500/20">
                    <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">Morning Block (09:00 - 11:30)</span>
                    <h4 className="font-semibold text-white mt-1 text-sm">Deep Work: Distributed Systems</h4>
                    <p className="text-xs text-slate-400 mt-2">Optimal cognitive energy window detected. High difficulty problem sets scheduled.</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-[#0b0f19] border border-indigo-500/20">
                    <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">Afternoon Block (14:00 - 15:30)</span>
                    <h4 className="font-semibold text-white mt-1 text-sm">Active Recall: Organic Chemistry</h4>
                    <p className="text-xs text-slate-400 mt-2">Spaced repetition deck auto-synthesized from lecture recordings.</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-[#0b0f19] border border-indigo-500/20">
                    <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Evening Block (19:00 - 20:00)</span>
                    <h4 className="font-semibold text-white mt-1 text-sm">Review & Life Balance</h4>
                    <p className="text-xs text-slate-400 mt-2">Low cognitive load. 20-min meditation + weekly exam timeline alignment.</p>
                  </div>
                </div>
              )}

              {activeTab === 'analytics' && (
                <div className="pt-6 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                  <div className="p-4 rounded-2xl bg-[#0b0f19] border border-indigo-500/20">
                    <p className="text-2xl font-black text-white">3.92</p>
                    <p className="text-xs text-slate-400 mt-1">Projected Semester GPA</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-[#0b0f19] border border-indigo-500/20">
                    <p className="text-2xl font-black text-cyan-400">14 Days</p>
                    <p className="text-xs text-slate-400 mt-1">Continuous Study Streak</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-[#0b0f19] border border-indigo-500/20">
                    <p className="text-2xl font-black text-indigo-400">89%</p>
                    <p className="text-xs text-slate-400 mt-1">Concept Retention Rate</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-[#0b0f19] border border-indigo-500/20">
                    <p className="text-2xl font-black text-emerald-400">+1.4 hrs</p>
                    <p className="text-xs text-slate-400 mt-1">Daily Free Time Regained</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Feature Section */}
      <section id="features" className="py-24 relative border-t border-indigo-950/60 bg-[#080c14]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="px-3.5 py-1 rounded-full text-xs font-semibold bg-indigo-950 border border-indigo-500/30 text-cyan-400 uppercase tracking-widest">
              Core Capabilities
            </span>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-white mt-4 tracking-tight">
              An Entire Academic Operating System in One Place
            </h2>
            <p className="text-slate-400 text-base sm:text-lg mt-4">
              Stop juggling ten disconnected productivity apps. Synexora unifies your learning workflow under an autonomous, intelligent layer.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="glass-panel glass-panel-hover rounded-3xl p-8 flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-cyan-400 mb-6">
                  <Brain className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Socratic AI Tutor</h3>
                <p className="text-sm text-slate-400 leading-relaxed">
                  Never get stuck again. Our AI asks guiding questions and draws out first-principles reasoning so you truly understand the concepts.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center text-xs text-indigo-300 font-medium">
                <span>Natural conversational learning</span>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="glass-panel glass-panel-hover rounded-3xl p-8 flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 border border-cyan-400/30 flex items-center justify-center text-cyan-400 mb-6">
                  <Clock className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Adaptive Workload Engine</h3>
                <p className="text-sm text-slate-400 leading-relaxed">
                  Real-time cognitive scheduling that recalibrates deadlines, exam dates, and energy levels to eliminate cramming and burnout.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center text-xs text-cyan-300 font-medium">
                <span>Burnout prevention algorithm</span>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="glass-panel glass-panel-hover rounded-3xl p-8 flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-400 mb-6">
                  <Target className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Deep Focus & Flow State</h3>
                <p className="text-sm text-slate-400 leading-relaxed">
                  Integrated Pomodoro timers, distraction blockers, and binaural beats curated to keep you locked in during grueling revision sessions.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center text-xs text-emerald-300 font-medium">
                <span>Scientifically proven intervals</span>
              </div>
            </div>

            {/* Feature 4 */}
            <div className="glass-panel glass-panel-hover rounded-3xl p-8 flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-400 mb-6">
                  <Layers className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Auto Flashcards & Notes</h3>
                <p className="text-sm text-slate-400 leading-relaxed">
                  Drop your course PDFs, lecture slides, or voice recordings. Synexora extracts key concepts, formulas, and spaced repetition cards instantly.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center text-xs text-indigo-300 font-medium">
                <span>Instant Spaced Repetition (SRS)</span>
              </div>
            </div>

            {/* Feature 5 */}
            <div className="glass-panel glass-panel-hover rounded-3xl p-8 flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-cyan-600/20 border border-cyan-500/30 flex items-center justify-center text-cyan-300 mb-6">
                  <TrendingUp className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Predictive GPA Intelligence</h3>
                <p className="text-sm text-slate-400 leading-relaxed">
                  Track course weightings, test scores, and simulate "what-if" scenarios to know exactly what grade you need on final exams to hit your target.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center text-xs text-cyan-300 font-medium">
                <span>Scenario simulations & tracking</span>
              </div>
            </div>

            {/* Feature 6 */}
            <div className="glass-panel glass-panel-hover rounded-3xl p-8 flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-rose-500/20 border border-rose-400/30 flex items-center justify-center text-rose-400 mb-6">
                  <Compass className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Student Life Equilibrium</h3>
                <p className="text-sm text-slate-400 leading-relaxed">
                  Academic excellence shouldn't destroy your sleep, fitness, or social connections. Sync habit trackers and sleep scores seamlessly.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center text-xs text-rose-300 font-medium">
                <span>Holistic wellness synchronization</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Security & Authentication Pillar */}
      <section className="py-20 bg-[#0b0f19] border-t border-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="glass-panel rounded-3xl p-8 sm:p-12 border border-indigo-500/20 relative overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 text-xs font-medium mb-4">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Enterprise Student Privacy</span>
                </div>
                <h3 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight mb-4">
                  Built on Enterprise MERN Architecture
                </h3>
                <p className="text-slate-300 text-sm sm:text-base leading-relaxed mb-6">
                  Your academic notes, study metrics, and personal records are safeguarded with salted bcrypt password hashing, stateless JSON Web Tokens, and secure MongoDB schemas.
                </p>
                <div className="space-y-3 text-xs sm:text-sm text-slate-300">
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                    <span>Stateless JWT Authentication with Bearer verification</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                    <span>Bcryptjs 10-round salted password encryption</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                    <span>Input validation & sanitization via express-validator</span>
                  </div>
                </div>
              </div>

              <div className="bg-[#070a11] rounded-2xl p-6 border border-slate-800 font-mono text-xs text-slate-300 space-y-2">
                <div className="text-slate-500">// Auth Pipeline Security Check</div>
                <div className="text-indigo-400">POST /api/auth/register</div>
                <div className="text-emerald-400">✓ Name & Email regex validated</div>
                <div className="text-emerald-400">✓ Password hashed: $2a$10$wK4...</div>
                <div className="text-emerald-400">✓ MongoDB User Record saved</div>
                <div className="text-cyan-400">✓ Signed JWT Token: eyJhbGciOiJIUzI1Ni...</div>
                <div className="text-indigo-300">✓ 201 Created: Authenticated session established</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-indigo-950/20 to-transparent pointer-events-none" />
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight mb-6">
            Ready to Unlock Your Academic Potential?
          </h2>
          <p className="text-base sm:text-xl text-slate-300 max-w-2xl mx-auto mb-10">
            Create your free Synexora account in less than 30 seconds and experience the future of AI-powered learning.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/register"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 text-white font-bold text-base shadow-xl shadow-indigo-500/25 hover:shadow-cyan-500/35 hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
            >
              <span>Create Free Account</span>
              <Sparkles className="w-5 h-5 text-cyan-200" />
            </Link>
            <Link
              to="/login"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-slate-900 border border-slate-800 text-slate-300 font-semibold hover:text-white hover:bg-slate-800 transition-all"
            >
              Sign In to Existing Account
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};
