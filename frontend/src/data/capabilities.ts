export interface CapabilityItem {
  id: string;
  title: string;
  category: string;
  description: string;
  iconName: string;
}

export const capabilitiesData: CapabilityItem[] = [
  {
    id: "cap-tutor",
    title: "AI Tutor",
    category: "Learning",
    description: "Step-by-step doubt resolution, conceptual breakdowns, and adaptive hints tailored to your pace.",
    iconName: "GraduationCap",
  },
  {
    id: "cap-memory",
    title: "Controlled Memory",
    category: "Intelligence",
    description: "Identifies scores, targets, and dates with explicit Save / Edit / Ignore user confirmation.",
    iconName: "BrainCircuit",
  },
  {
    id: "cap-rag",
    title: "Document Knowledge Base",
    category: "RAG Engine",
    description: "Upload lecture slides, textbooks, and notes for grounded semantic search with exact page citations.",
    iconName: "FileText",
  },
  {
    id: "cap-scheduling",
    title: "Smart Adaptive Scheduling",
    category: "Productivity",
    description: "Generates realistic study blocks based on pending deadlines, difficulty rating, and free calendar slots.",
    iconName: "Calendar",
  },
  {
    id: "cap-practice",
    title: "Practice & Diagnostic Engine",
    category: "Assessments",
    description: "Generates dynamic difficulty questions and analyzes mistake patterns to pinpoint conceptual gaps.",
    iconName: "Target",
  },
  {
    id: "cap-assistant",
    title: "Personal AI Assistant",
    category: "Productivity",
    description: "Extracts action items, sets contextual reminders, and orchestrates your daily academic agenda.",
    iconName: "Sparkles",
  },
  {
    id: "cap-diary",
    title: "AI Reflection Diary",
    category: "Growth",
    description: "Daily learning logs transformed into weekly mastery trends, focus scores, and consistency analytics.",
    iconName: "BookOpen",
  },
  {
    id: "cap-security",
    title: "Zero-Leakage Privacy",
    category: "Security",
    description: "Multi-tenant vector isolation, JWT authentication, and strict user consent for every stored data point.",
    iconName: "ShieldCheck",
  },
];
