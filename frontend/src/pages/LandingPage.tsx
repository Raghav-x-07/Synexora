import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import {
  Bot,
  FileText,
  StickyNote,
  CheckSquare,
  Calendar,
  Brain,
  Award,
  BarChart3,
  ArrowRight,
  Shield,
  Zap,
  GraduationCap,
  ChevronRight,
  ChevronDown,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';

const coreModules = [
  {
    title: 'Learning AI Tutor',
    description: 'Structured Socratic explanations, multi-step problem solving, and instant concept definitions.',
    icon: Bot,
    tag: 'AI Reasoning',
  },
  {
    title: 'Document Hub',
    description: 'Centralized textbook and syllabus library with automatic semantic search & indexing.',
    icon: FileText,
    tag: 'Workspace',
  },
  {
    title: 'Smart Notes',
    description: 'Distraction-free Markdown editor organized cleanly by academic course and topic tags.',
    icon: StickyNote,
    tag: 'Productivity',
  },
  {
    title: 'Task & Goal Tracker',
    description: 'Prioritized assignments, project milestones, and homework checklists with status tracking.',
    icon: CheckSquare,
    tag: 'Planning',
  },
  {
    title: 'Schedule & Deadlines',
    description: 'Interactive timeline for exams, project submission windows, and deep study blocks.',
    icon: Calendar,
    tag: 'Calendar',
  },
  {
    title: 'Active Memory Vault',
    description: 'Spaced repetition and active-recall storage to permanently master key formulas & theorems.',
    icon: Brain,
    tag: 'Recall',
  },
  {
    title: 'Diagnostic Quizzes',
    description: 'Adaptive diagnostic assessments that highlight knowledge gaps and measure mastery.',
    icon: Award,
    tag: 'Assessment',
  },
  {
    title: 'Progress Analytics',
    description: 'Actionable study telemetry, consistency metrics, and milestone achievements.',
    icon: BarChart3,
    tag: 'Analytics',
  },
];

const interactiveFeatures = [
  {
    id: 'ai-tutor',
    name: 'Socratic AI Tutor',
    icon: Bot,
    tagline: 'Deep concept definitions & step-by-step logic.',
    bullets: [
      'Deconstruct complex STEM equations and algorithms effortlessly',
      'Select between Socratic tutoring or concise revision modes',
      'Generate 8K conceptual diagrams and mind-maps on demand',
    ],
    badge: 'Real-time Reasoning',
  },
  {
    id: 'memory-vault',
    name: 'Active Memory Vault',
    icon: Brain,
    tagline: 'Spaced repetition tailored to your learning curves.',
    bullets: [
      'Automated Leitner-system spaced repetition flashcards',
      'Retain formulas, theorems, and definitions permanently',
      'Immediate confidence scoring and diagnostic recall ratings',
    ],
    badge: 'SuperMemo-2 Algorithm',
  },
  {
    id: 'doc-rag',
    name: 'Semantic Document Hub',
    icon: FileText,
    tagline: 'Grounded reasoning over your own textbooks.',
    bullets: [
      'Upload PDFs, lecture slides, notes, and research papers',
      'Search instantly across thousands of pages using vector similarity',
      'Direct citation references linking back to source textbook pages',
    ],
    badge: 'Grounded RAG Search',
  },
];

const faqs = [
  {
    question: 'How does Synexora accelerate student learning?',
    answer:
      'Synexora unites all study tools—intelligent Socratic tutoring, active-recall flashcards, semantic textbook search, and task tracking—into one seamless, distraction-free Apple-grade workspace.',
  },
  {
    question: 'Can campus institutions manage students and courses?',
    answer:
      'Yes! Synexora features an integrated Campus Portal for institution administrators to manage student enrollments, broadcast assignments, and track department analytics.',
  },
  {
    question: 'Can I use Synexora offline or with local AI models?',
    answer:
      'Yes, Synexora supports local model execution via Ollama (e.g., Qwen, Llama) as well as cloud-powered providers with instant failover.',
  },
];

export const LandingPage: React.FC = () => {
  const [activeFeature, setActiveFeature] = useState(0);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const currentFeature = interactiveFeatures[activeFeature];

  return (
    <div className="min-h-screen bg-[#fafbfc] text-slate-900 flex flex-col selection:bg-emerald-500 selection:text-white">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-16 pb-20 md:pt-24 md:pb-28 px-4 sm:px-6 lg:px-8">
        {/* Subtle Ambient Radial Glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-gradient-to-tr from-emerald-100/50 via-teal-50/40 to-indigo-100/40 blur-3xl -z-10 pointer-events-none rounded-full animate-pulse-glow" />
        <div className="absolute top-1/2 right-10 w-[400px] h-[400px] bg-emerald-100/30 blur-3xl -z-10 pointer-events-none rounded-full" />

        <div className="max-w-5xl mx-auto text-center">
          {/* Top Pill Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/90 border border-slate-200/90 shadow-apple-sm text-slate-700 text-xs font-semibold mb-8 hover:border-slate-300 transition-all cursor-default">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Next-Gen Academic & Learning Workspace</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          </div>

          {/* Heading */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.12]">
            A refined workspace for <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-600 bg-clip-text text-transparent">
              focused student learning.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="mt-6 text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed font-normal">
            Organize coursework, manage study schedules, take structured notes, and master complex concepts with integrated intelligent learning tools.
          </p>

          {/* Call to Actions */}
          <div className="mt-9 flex flex-col sm:flex-row items-center justify-center gap-3.5">
            <Link
              to="/register"
              className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-slate-900 text-white font-semibold text-sm hover:bg-slate-800 transition-all shadow-apple flex items-center justify-center gap-2 group hover:scale-[1.02] active:scale-[0.98]"
            >
              <span>Get Started Free</span>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
            </Link>
            <Link
              to="/login"
              className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-white border border-slate-200 text-slate-700 font-semibold text-sm hover:bg-slate-50 hover:border-slate-300 transition-all shadow-apple-sm text-center active:scale-[0.98]"
            >
              Sign In to Account
            </Link>
          </div>

          {/* Trust Highlights */}
          <div className="mt-12 flex items-center justify-center gap-6 sm:gap-12 text-xs text-slate-500 font-medium">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-emerald-600" />
              <span>Instant Setup</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-blue-600" />
              <span>Private & Secure</span>
            </div>
            <div className="flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-indigo-600" />
              <span>Campus Ready</span>
            </div>
          </div>
        </div>

        {/* Hero Interactive Showcase Image with Floating Badges */}
        <div className="mt-14 max-w-5xl mx-auto relative px-2 sm:px-4">
          {/* Floating Live Badge Top Left */}
          <div className="hidden lg:flex absolute -top-5 -left-4 z-20 glass-badge rounded-2xl p-3.5 items-center gap-3 animate-float">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <Brain className="w-5 h-5" />
            </div>
            <div className="text-left">
              <p className="text-xs font-bold text-slate-900">Active Recall Engine</p>
              <p className="text-[11px] text-emerald-600 font-medium">99.4% Spaced Retention</p>
            </div>
          </div>

          {/* Floating Live Badge Bottom Right */}
          <div className="hidden lg:flex absolute -bottom-6 -right-4 z-20 glass-badge rounded-2xl p-3.5 items-center gap-3 animate-float-delayed">
            <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold">
              <Bot className="w-5 h-5 text-emerald-400" />
            </div>
            <div className="text-left">
              <p className="text-xs font-bold text-slate-900">Socratic Reasoner</p>
              <p className="text-[11px] text-slate-500 font-medium">Step-by-step logic ready</p>
            </div>
          </div>

          {/* Hero Window Container */}
          <div className="rounded-2xl sm:rounded-3xl border border-slate-200/90 bg-white p-2 sm:p-3.5 shadow-apple-xl">
            {/* macOS Style Window Bar */}
            <div className="flex items-center justify-between px-3 py-2 border-b border-slate-100 mb-2">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-rose-400 inline-block" />
                <span className="w-3 h-3 rounded-full bg-amber-400 inline-block" />
                <span className="w-3 h-3 rounded-full bg-emerald-400 inline-block" />
              </div>
              <span className="text-[11px] font-semibold text-slate-400">Synexora Workspace • Machine Learning & CS</span>
              <div className="w-12" />
            </div>

            {/* Generated Hero Image */}
            <div className="relative overflow-hidden rounded-xl bg-slate-950 aspect-[16/9] shadow-inner group">
              <img
                src="/hero-preview.jpg"
                alt="Synexora Workspace Interface"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none" />
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Feature Deep Dive Section */}
      <section className="py-20 bg-white border-t border-slate-200/80">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto text-center mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200/60">
              Interactive Capabilities
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mt-3">
              Built with purpose. Engineered for clarity.
            </h2>
          </div>

          {/* Tab Switcher Pills */}
          <div className="flex items-center justify-center gap-2 mb-10 overflow-x-auto pb-2">
            {interactiveFeatures.map((feat, idx) => {
              const TabIcon = feat.icon;
              const isActive = activeFeature === idx;
              return (
                <button
                  key={feat.id}
                  onClick={() => setActiveFeature(idx)}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 shrink-0 ${
                    isActive
                      ? 'bg-slate-900 text-white shadow-apple-sm scale-105'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70 hover:text-slate-900'
                  }`}
                >
                  <TabIcon className={`w-4 h-4 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
                  <span>{feat.name}</span>
                </button>
              );
            })}
          </div>

          {/* Interactive Feature Showcase Panel */}
          <div className="bg-[#fafbfc] border border-slate-200/90 rounded-2xl p-6 sm:p-10 shadow-apple flex flex-col lg:flex-row items-center justify-between gap-8 animate-fade-in">
            <div className="flex-1 space-y-4">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
                <Sparkles className="w-3.5 h-3.5" />
                <span>{currentFeature.badge}</span>
              </div>
              <h3 className="text-2xl font-bold text-slate-900 tracking-tight">
                {currentFeature.tagline}
              </h3>
              <ul className="space-y-3 pt-2">
                {currentFeature.bullets.map((bullet, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-600">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                    <span>{bullet}</span>
                  </li>
                ))}
              </ul>
              <div className="pt-3">
                <Link
                  to="/register"
                  className="btn-primary text-xs font-semibold gap-2 shadow-apple"
                >
                  <span>Explore in Workspace</span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                </Link>
              </div>
            </div>

            {/* Feature Visual */}
            <div className="w-full lg:w-96 flex justify-center">
              <div className="relative w-64 h-64 sm:w-72 sm:h-72 rounded-2xl bg-white border border-slate-200/80 p-3 shadow-apple flex items-center justify-center overflow-hidden group">
                <img
                  src="/ai-sphere.jpg"
                  alt="Synexora Knowledge Engine"
                  className="w-full h-full object-cover rounded-xl transition-transform duration-500 group-hover:scale-105"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Modules Grid */}
      <section className="py-20 bg-[#fafbfc] border-t border-slate-200/80">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto text-center mb-14">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Comprehensive Platform Suite
            </h2>
            <p className="text-sm text-slate-500 mt-2 leading-relaxed">
              Everything integrated into a single cohesive experience without clutter.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            {coreModules.map((mod, index) => {
              const Icon = mod.icon;
              return (
                <div
                  key={index}
                  className="card-clean-interactive p-6 flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center group-hover:bg-slate-900 group-hover:text-white transition-all duration-200">
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider bg-slate-50 px-2.5 py-0.5 rounded-full border border-slate-150">
                        {mod.tag}
                      </span>
                    </div>
                    <h3 className="font-bold text-base text-slate-900 mb-2 group-hover:text-slate-950 transition-colors">
                      {mod.title}
                    </h3>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      {mod.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-white border-t border-slate-200/80">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, i) => {
              const isOpen = openFaq === i;
              return (
                <div
                  key={i}
                  className="border border-slate-200/80 rounded-xl overflow-hidden transition-all bg-white"
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : i)}
                    className="w-full flex items-center justify-between p-4 sm:p-5 text-left text-sm font-bold text-slate-900 hover:bg-slate-50 transition-colors"
                  >
                    <span>{faq.question}</span>
                    <ChevronDown
                      className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
                        isOpen ? 'rotate-180 text-slate-900' : ''
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-3 animate-fade-in">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Minimal Callout Banner */}
      <section className="py-16 bg-[#fafbfc] border-t border-slate-200/80">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-gradient-to-b from-white to-slate-50 border border-slate-200/90 rounded-2xl p-8 sm:p-12 shadow-apple">
            <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Ready to experience modern student learning?
            </h3>
            <p className="mt-3 text-sm sm:text-base text-slate-600 max-w-xl mx-auto font-normal">
              Join students and academic departments organizing coursework and achieving deep mastery.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                to="/register"
                className="w-full sm:w-auto btn-primary px-7 py-3.5 rounded-xl text-sm font-semibold shadow-apple hover:scale-[1.02] active:scale-[0.98]"
              >
                Create Free Student Account
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};
