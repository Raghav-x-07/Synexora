export interface FeatureStoryItem {
  id: string;
  tag: string;
  title: string;
  headline: string;
  description: string;
  bullets: string[];
  mockupType: "knowledge" | "reasoning" | "action";
  metric: string;
  metricLabel: string;
}

export const featureStoryData: FeatureStoryItem[] = [
  {
    id: "knowledge-work",
    tag: "Knowledge Work",
    title: "AI teammate that works like you do",
    headline: "Search, summarize, reason, organize and act across your entire academic universe.",
    description:
      "Synexora connects your lecture slides, handwritten notes, textbooks, code repositories, and syllabus requirements into one instantly queryable intelligence hub.",
    bullets: [
      "Deep semantic search across multi-format course materials",
      "Grounded Socratic explanations with page-level citations",
      "Instant synthesis of revision cheat-sheets and flashcards",
    ],
    mockupType: "knowledge",
    metric: "10x",
    metricLabel: "Faster comprehension of complex academic material",
  },
  {
    id: "context-reasoning",
    tag: "Contextual Intelligence",
    title: "AI that understands your learning context",
    headline: "Deconstructs conceptual bottlenecks and adapts in real-time.",
    description:
      "Unlike generic chatbots that guess blindly, Synexora maintains awareness of your upcoming exam dates, past diagnostic results, and verified learning style.",
    bullets: [
      "Dynamic difficulty scaling from beginner to master level",
      "Proactive identification of misconception patterns",
      "Step-by-step diagnostic breakdown without giving away answers",
    ],
    mockupType: "reasoning",
    metric: "94%",
    metricLabel: "Improvement in retention & diagnostic test accuracy",
  },
  {
    id: "proactive-action",
    tag: "Autonomous Execution",
    title: "AI that turns deadlines into focused action",
    headline: "Converts academic commitments into frictionless study schedules.",
    description:
      "Mention a project due on Friday, and Synexora automatically synthesizes milestone deadlines, reserves calendar blocks, and sends contextual reminders.",
    bullets: [
      "Automated study block scheduling around existing commitments",
      "Context-rich reminders that include pending practice tasks",
      "Direct synchronization with your academic calendar",
    ],
    mockupType: "action",
    metric: "100%",
    metricLabel: "On-time project submissions and exam readiness",
  },
];

export interface FeatureCard {
  id: string;
  tag: string;
  title: string;
  subtitle: string;
  description: string;
  theme: "dark" | "light" | "lime";
  span: "col-span-1" | "col-span-2" | "col-span-3";
  details: string[];
}

export const featureCardsData: FeatureCard[] = [
  {
    id: "card-understand",
    tag: "01 / Context",
    title: "Understand",
    subtitle: "Contextual workspace ingestion",
    description:
      "Understands your academic curriculum, syllabus goals, past test scores, and preferred learning pacing across every subject.",
    theme: "dark",
    span: "col-span-2",
    details: ["Multi-course indexation", "Syllabus parsing", "Cross-subject linking"],
  },
  {
    id: "card-think",
    tag: "02 / Reasoning",
    title: "Think",
    subtitle: "Socratic problem deconstruction",
    description:
      "Breaks down complex problems into digestible mental models, challenging you with targeted hints rather than spoon-feeding answers.",
    theme: "light",
    span: "col-span-1",
    details: ["Socratic inquiry", "Step-by-step hints", "LaTeX math breakdown"],
  },
  {
    id: "card-act",
    tag: "03 / Productivity",
    title: "Act",
    subtitle: "Turn decisions into execution",
    description:
      "Converts goals and upcoming exams into structured study plans, actionable task lists, and calendar appointments automatically.",
    theme: "light",
    span: "col-span-1",
    details: ["Smart study schedules", "Calendar sync", "Milestone tracking"],
  },
  {
    id: "card-remember",
    tag: "04 / Sovereignty",
    title: "Remember",
    subtitle: "Controlled, permission-based memory",
    description:
      "Identifies critical academic facts and asks for explicit student permission before persisting anything to your private memory ledger.",
    theme: "lime",
    span: "col-span-2",
    details: ["Zero secret storage", "Save/Edit/Ignore controls", "Transparent memory ledger"],
  },
];
