export interface UseCaseItem {
  id: string;
  badge: string;
  title: string;
  headline: string;
  description: string;
  points: string[];
  ctaText: string;
  statNumber: string;
  statLabel: string;
  accent: "dark" | "light";
}

export const useCasesData: UseCaseItem[] = [
  {
    id: "students",
    badge: "For Students",
    title: "Learn faster without losing academic context",
    headline: "Master complex courses with an AI that knows your syllabus and remembers your goals.",
    description:
      "Whether cramming for midterms, debugging algorithm assignments, or organizing notes across 5 courses, Synexora provides 24/7 Socratic guidance without hallucinated answers.",
    points: [
      "Upload lecture slides for instant grounded Q&A",
      "Adaptive quizzes that target your exact weak topics",
      "Intelligent study planning matched to your personal calendar",
    ],
    ctaText: "Start Learning with Synexora",
    statNumber: "3.8x",
    statLabel: "Average GPA improvement recorded",
    accent: "dark",
  },
  {
    id: "developers",
    badge: "For Developers & Engineers",
    title: "Turn dense technical docs into working mastery",
    headline: "Deconstruct system architectures, algorithms, and codebases with precision.",
    description:
      "Feed in RFCs, research papers, framework docs, or legacy repos. Synexora creates interactive mental models, step-by-step implementations, and diagnostic test cases.",
    points: [
      "Step-by-step code explanation and syntax diagnostics",
      "Interactive LaTeX math and architectural diagram breakdown",
      "Actionable milestone scheduling for major engineering milestones",
    ],
    ctaText: "Explore Technical Mode",
    statNumber: "65%",
    statLabel: "Reduction in debugging and context-switching time",
    accent: "light",
  },
  {
    id: "teams",
    badge: "For Study Groups & Academic Teams",
    title: "Keep collaborative projects moving without friction",
    headline: "Unified research knowledge base and synchronized milestones.",
    description:
      "Share verified study notes, coordinate milestone deliverables, and ensure every group member stays aligned on project timelines and conceptual requirements.",
    points: [
      "Shared document collections with group permission controls",
      "Consolidated task assignments and deadline alerts",
      "Group quiz generation for peer exam prep",
    ],
    ctaText: "Create a Team Workspace",
    statNumber: "100%",
    statLabel: "Milestone completion rate on collaborative projects",
    accent: "dark",
  },
];
