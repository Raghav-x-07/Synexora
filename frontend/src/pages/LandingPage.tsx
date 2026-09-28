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
  ChevronDown,
  Sparkles,
  CheckCircle2,
  Code2,
  Lock,
  Layers,
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

const skillsShowcase = [
  {
    id: 'java',
    title: 'Java Masterclass',
    description: 'Master Object-Oriented Programming, Collections, Multithreading, and JVM internals.',
    icon: Code2,
    difficulty: 'Intermediate',
    duration: '6 Weeks',
    progress: 78,
    badge: 'Popular',
    roadmap: [
      { name: 'Java Basics & Syntax', status: 'completed' },
      { name: 'OOP & Inheritance', status: 'completed' },
      { name: 'Collections & Generics', status: 'current' },
      { name: 'Multithreading & Concurrency', status: 'locked' },
      { name: 'Spring Boot & Microservices', status: 'locked' },
    ],
  },
  {
    id: 'ai-ml',
    title: 'Machine Learning & AI',
    description: 'Deconstruct neural architectures, loss functions, transformers, and prompt engineering.',
    icon: Brain,
    difficulty: 'Advanced',
    duration: '8 Weeks',
    progress: 45,
    badge: 'Trending',
    roadmap: [
      { name: 'Linear Algebra & Calculus', status: 'completed' },
      { name: 'Regression & Classification', status: 'completed' },
      { name: 'Deep Neural Networks', status: 'current' },
      { name: 'Transformers & LLMs', status: 'locked' },
      { name: 'Reinforcement Learning', status: 'locked' },
    ],
  },
  {
    id: 'dsa',
    title: 'Data Structures & Algorithms',
    description: 'Conquer graph theory, dynamic programming, trees, and algorithmic complexity.',
    icon: Layers,
    difficulty: 'Comprehensive',
    duration: '10 Weeks',
    progress: 90,
    badge: 'Essential',
    roadmap: [
      { name: 'Arrays, Stacks & Queues', status: 'completed' },
      { name: 'Linked Lists & Trees', status: 'completed' },
      { name: 'Graph Algorithms & BFS/DFS', status: 'completed' },
      { name: 'Dynamic Programming', status: 'current' },
      { name: 'Advanced System Design', status: 'locked' },
    ],
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
      'Generate conceptual diagrams and mind-maps on demand',
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
      'Synexora unites all study tools—intelligent Socratic tutoring, active-recall flashcards, semantic textbook search, and task tracking—into one seamless, distraction-free warm learning workspace.',
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
  const [selectedSkill, setSelectedSkill] = useState(0);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const currentFeature = interactiveFeatures[activeFeature];
  const activeSkillObj = skillsShowcase[selectedSkill];

  return (
    <div className="min-h-screen bg-[#FFFDF7] text-[#111111] flex flex-col selection:bg-[#F4C542] selection:text-[#111111]">
      <Navbar />

      {/* Hero Section */}
      <section id="hero" className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-28 px-4 sm:px-6 lg:px-8">
        {/* Warm Ambient Decorative Background Glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-gradient-to-tr from-[#FFF8E8] via-[#FFF3D1] to-[#FFFDF7] blur-3xl -z-10 pointer-events-none rounded-full" />
        <div className="absolute top-1/2 right-10 w-[350px] h-[350px] bg-[#FFF8E8] blur-3xl -z-10 pointer-events-none rounded-full" />

        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Column: Headlines & CTAs */}
            <div className="lg:col-span-6 text-left space-y-6">
              {/* Top Pill Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#FFF8E8] border border-[#E8E1D2] shadow-sm text-[#111111] text-xs font-bold hover:border-[#D6CCA8] transition-all cursor-default">
                <span className="w-2 h-2 rounded-full bg-[#F4C542] animate-pulse" />
                <span>Next-Gen AI Educational Platform</span>
                <Sparkles className="w-3.5 h-3.5 text-[#F4C542]" />
              </div>

              {/* Main Heading */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[#111111] tracking-tight leading-[1.12]">
                Learn Smarter. <br />
                <span className="text-[#111111] relative inline-block">
                  Build Better Skills.
                  <span className="absolute bottom-1.5 left-0 w-full h-3 bg-[#F4C542]/35 -z-10 rounded-full transform -rotate-1" />
                </span>
              </h1>

              {/* Subtitle */}
              <p className="text-base sm:text-lg text-[#3F3F3F] leading-relaxed font-normal max-w-xl">
                Synexora adapts to your learning pace with intelligent Socratic tutoring, automated skill roadmaps, active recall flashcards, and grounded textbook reasoning.
              </p>

              {/* Call to Actions */}
              <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5">
                <Link
                  to="/register"
                  className="btn-primary text-sm font-bold gap-2 group shadow-md text-center"
                >
                  <span>Start Learning</span>
                  <ArrowRight className="w-4 h-4 text-[#111111] group-hover:translate-x-0.5 transition-all" />
                </Link>
                <a
                  href="#skills"
                  className="btn-secondary text-sm font-semibold text-center"
                >
                  Explore Skills & Roadmaps
                </a>
              </div>

              {/* Trust Highlights */}
              <div className="pt-6 flex items-center gap-6 sm:gap-8 text-xs text-[#777777] font-semibold border-t border-[#E8E1D2]/80">
                <div className="flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-[#F4C542]" />
                  <span>Instant Setup</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Shield className="w-4 h-4 text-[#111111]" />
                  <span>Private & Grounded</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <GraduationCap className="w-4 h-4 text-[#111111]" />
                  <span>Campus Ready</span>
                </div>
              </div>
            </div>

            {/* Right Column: Hero Visual Showcase */}
            <div className="lg:col-span-6 relative">
              {/* Floating Badge Top Left */}
              <div className="hidden sm:flex absolute -top-4 -left-4 z-20 glass-badge rounded-2xl p-3.5 items-center gap-3 animate-float border border-[#E8E1D2] shadow-sm">
                <div className="w-9 h-9 rounded-xl bg-[#F4C542] text-[#111111] flex items-center justify-center font-bold">
                  <Brain className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <p className="text-xs font-bold text-[#111111]">Active Recall Engine</p>
                  <p className="text-[11px] text-[#777777] font-medium">99.4% Spaced Retention</p>
                </div>
              </div>

              {/* Floating Badge Bottom Right */}
              <div className="hidden sm:flex absolute -bottom-5 -right-3 z-20 glass-badge rounded-2xl p-3.5 items-center gap-3 animate-float-delayed border border-[#E8E1D2] shadow-sm">
                <div className="w-9 h-9 rounded-xl bg-[#111111] text-[#F4C542] flex items-center justify-center font-bold">
                  <Bot className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <p className="text-xs font-bold text-[#111111]">Socratic Tutor</p>
                  <p className="text-[11px] text-[#777777] font-medium">Step-by-step logic ready</p>
                </div>
              </div>

              {/* Hero Image Container */}
              <div className="rounded-3xl border border-[#E8E1D2] bg-[#FFFFFF] p-3 shadow-apple-lg">
                <div className="relative overflow-hidden rounded-2xl aspect-[16/10] bg-[#FFF8E8] group">
                  <img
                    src="/hero-preview.jpg"
                    alt="Synexora AI Learning Platform"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent pointer-events-none" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Skills & Learning Roadmaps Section */}
      <section id="skills" className="py-20 bg-[#FFF8E8]/40 border-t border-[#E8E1D2]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto text-center mb-14">
            <span className="text-xs font-bold uppercase tracking-wider text-[#111111] bg-[#FFF8E8] px-3.5 py-1 rounded-full border border-[#E8E1D2]">
              Curated Skill Pathways
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#111111] tracking-tight mt-3">
              Master Skills with Structured Roadmaps
            </h2>
            <p className="text-sm text-[#777777] mt-2 leading-relaxed">
              Step-by-step verified curriculum tailored to accelerate career milestones and deep domain mastery.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left: Skill Cards List */}
            <div className="lg:col-span-5 space-y-4">
              {skillsShowcase.map((skill, idx) => {
                const SkillIcon = skill.icon;
                const isSelected = selectedSkill === idx;
                return (
                  <div
                    key={skill.id}
                    onClick={() => setSelectedSkill(idx)}
                    className={`card-clean-interactive p-5 cursor-pointer transition-all duration-200 ${
                      isSelected
                        ? 'border-[#111111] bg-[#FFFFFF] shadow-md ring-1 ring-[#111111]'
                        : 'border-[#E8E1D2] bg-[#FFFDF7] hover:border-[#D6CCA8]'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold ${
                          isSelected ? 'bg-[#111111] text-[#F4C542]' : 'bg-[#FFF8E8] text-[#111111]'
                        }`}>
                          <SkillIcon className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="font-bold text-base text-[#111111]">{skill.title}</h3>
                          <div className="flex items-center gap-2 text-[11px] text-[#777777] font-medium mt-0.5">
                            <span>{skill.difficulty}</span>
                            <span>•</span>
                            <span>{skill.duration}</span>
                          </div>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full bg-[#FFF8E8] text-[#111111] border border-[#E8E1D2]">
                        {skill.badge}
                      </span>
                    </div>

                    <p className="text-xs text-[#777777] leading-relaxed mb-4">
                      {skill.description}
                    </p>

                    {/* Progress Bar */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-[11px] font-bold text-[#111111]">
                        <span>Progress</span>
                        <span>{skill.progress}%</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-[#F7F1E3] overflow-hidden">
                        <div
                          className="h-full bg-[#F4C542] rounded-full transition-all duration-500"
                          style={{ width: `${skill.progress}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Right: Active Skill Roadmap Timeline */}
            <div className="lg:col-span-7 bg-[#FFFFFF] border border-[#E8E1D2] rounded-3xl p-6 sm:p-8 shadow-sm">
              <div className="flex items-center justify-between border-b border-[#E8E1D2] pb-4 mb-6">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#777777]">Interactive Timeline</span>
                  <h3 className="text-xl font-extrabold text-[#111111] mt-0.5">
                    {activeSkillObj.title} Roadmap
                  </h3>
                </div>
                <Link
                  to="/register"
                  className="btn-primary text-xs font-bold px-4 py-2"
                >
                  Continue Learning
                </Link>
              </div>

              {/* Vertical Timeline */}
              <div className="space-y-6 relative before:absolute before:inset-0 before:left-5 before:w-0.5 before:bg-[#E8E1D2] pl-2">
                {activeSkillObj.roadmap.map((step, index) => {
                  const isCompleted = step.status === 'completed';
                  const isCurrent = step.status === 'current';
                  const isLocked = step.status === 'locked';

                  return (
                    <div key={index} className="flex items-center gap-4 relative z-10">
                      {/* Status Icon */}
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
                        isCompleted
                          ? 'bg-[#10B981] text-white shadow-sm'
                          : isCurrent
                          ? 'bg-[#F4C542] text-[#111111] ring-4 ring-[#FFF8E8] shadow-sm'
                          : 'bg-[#F7F1E3] text-[#9CA3AF] border border-[#E8E1D2]'
                      }`}>
                        {isCompleted && <CheckCircle2 className="w-4 h-4" />}
                        {isCurrent && <span className="w-2 h-2 rounded-full bg-[#111111]" />}
                        {isLocked && <Lock className="w-3.5 h-3.5" />}
                      </div>

                      {/* Content Card */}
                      <div className={`flex-1 p-3.5 rounded-2xl border transition-all ${
                        isCurrent
                          ? 'bg-[#FFF8E8]/70 border-[#F4C542] shadow-sm'
                          : isCompleted
                          ? 'bg-[#FFFFFF] border-[#E8E1D2]'
                          : 'bg-[#FFFDF7]/50 border-[#E8E1D2]/60 opacity-60'
                      }`}>
                        <div className="flex items-center justify-between">
                          <span className={`text-xs sm:text-sm font-bold ${isCurrent ? 'text-[#111111]' : 'text-[#3F3F3F]'}`}>
                            {step.name}
                          </span>
                          <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                            isCompleted
                              ? 'bg-emerald-50 text-emerald-700'
                              : isCurrent
                              ? 'bg-[#F4C542] text-[#111111]'
                              : 'bg-[#F7F1E3] text-[#777777]'
                          }`}>
                            {step.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Capabilities Section */}
      <section id="features" className="py-20 bg-[#FFFDF7] border-t border-[#E8E1D2]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto text-center mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-[#111111] bg-[#FFF8E8] px-3.5 py-1 rounded-full border border-[#E8E1D2]">
              AI Tutoring & Recall
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#111111] tracking-tight mt-3">
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
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold transition-all duration-200 shrink-0 ${
                    isActive
                      ? 'bg-[#111111] text-[#FFFFFF] shadow-sm'
                      : 'bg-[#FFF8E8] text-[#3F3F3F] hover:bg-[#F7F1E3] hover:text-[#111111] border border-[#E8E1D2]'
                  }`}
                >
                  <TabIcon className={`w-4 h-4 ${isActive ? 'text-[#F4C542]' : 'text-[#777777]'}`} />
                  <span>{feat.name}</span>
                </button>
              );
            })}
          </div>

          {/* Interactive Feature Showcase Panel */}
          <div className="bg-[#FFFFFF] border border-[#E8E1D2] rounded-3xl p-6 sm:p-10 shadow-sm flex flex-col lg:flex-row items-center justify-between gap-8 animate-fade-in">
            <div className="flex-1 space-y-4">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFF8E8] text-[#111111] text-xs font-bold border border-[#E8E1D2]">
                <Sparkles className="w-3.5 h-3.5 text-[#F4C542]" />
                <span>{currentFeature.badge}</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-[#111111] tracking-tight">
                {currentFeature.tagline}
              </h3>
              <ul className="space-y-3 pt-2">
                {currentFeature.bullets.map((bullet, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-xs sm:text-sm text-[#3F3F3F]">
                    <CheckCircle2 className="w-4 h-4 text-[#F4C542] mt-0.5 shrink-0" />
                    <span>{bullet}</span>
                  </li>
                ))}
              </ul>
              <div className="pt-3">
                <Link
                  to="/register"
                  className="btn-primary text-xs font-bold gap-2 shadow-sm"
                >
                  <span>Explore in Workspace</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Feature Visual */}
            <div className="w-full lg:w-96 flex justify-center">
              <div className="relative w-64 h-64 sm:w-72 sm:h-72 rounded-3xl bg-[#FFF8E8] border border-[#E8E1D2] p-3 shadow-sm flex items-center justify-center overflow-hidden group">
                <img
                  src="/ai-sphere.jpg"
                  alt="Synexora Knowledge Engine"
                  className="w-full h-full object-cover rounded-2xl transition-transform duration-500 group-hover:scale-105"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Platform Modules Suite */}
      <section id="modules" className="py-20 bg-[#FFF8E8]/30 border-t border-[#E8E1D2]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#111111] tracking-tight">
              Comprehensive Platform Suite
            </h2>
            <p className="text-sm text-[#777777] mt-2 leading-relaxed">
              Everything integrated into a single cohesive, warm workspace without distraction.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {coreModules.map((mod, index) => {
              const Icon = mod.icon;
              return (
                <div
                  key={index}
                  className="card-clean-interactive p-6 flex flex-col justify-between group bg-[#FFFFFF] border border-[#E8E1D2] rounded-3xl"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-10 h-10 rounded-2xl bg-[#FFF8E8] text-[#111111] flex items-center justify-center group-hover:bg-[#111111] group-hover:text-[#F4C542] transition-all duration-200">
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="text-[10px] font-bold text-[#777777] uppercase tracking-wider bg-[#FFFDF7] px-2.5 py-0.5 rounded-full border border-[#E8E1D2]">
                        {mod.tag}
                      </span>
                    </div>
                    <h3 className="font-bold text-base text-[#111111] mb-2">
                      {mod.title}
                    </h3>
                    <p className="text-xs text-[#777777] leading-relaxed">
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
      <section id="faq" className="py-20 bg-[#FFFDF7] border-t border-[#E8E1D2]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-[#111111] tracking-tight">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, i) => {
              const isOpen = openFaq === i;
              return (
                <div
                  key={i}
                  className="border border-[#E8E1D2] rounded-2xl overflow-hidden transition-all bg-[#FFFFFF]"
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : i)}
                    className="w-full flex items-center justify-between p-5 text-left text-sm font-bold text-[#111111] hover:bg-[#FFF8E8]/40 transition-colors"
                  >
                    <span>{faq.question}</span>
                    <ChevronDown
                      className={`w-4 h-4 text-[#777777] transition-transform duration-200 ${
                        isOpen ? 'rotate-180 text-[#111111]' : ''
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 text-xs sm:text-sm text-[#3F3F3F] leading-relaxed border-t border-[#E8E1D2] pt-3 animate-fade-in">
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
      <section className="py-20 bg-[#FFF8E8]/60 border-t border-[#E8E1D2]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-[#FFFFFF] border border-[#E8E1D2] rounded-3xl p-8 sm:p-12 shadow-sm">
            <h3 className="text-2xl sm:text-3xl font-extrabold text-[#111111] tracking-tight">
              Ready to experience smarter learning?
            </h3>
            <p className="mt-3 text-sm sm:text-base text-[#777777] max-w-xl mx-auto font-normal">
              Join students, faculty, and academic departments mastering complex concepts with Synexora.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                to="/register"
                className="w-full sm:w-auto btn-primary px-8 py-3.5 text-sm font-bold shadow-sm"
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
