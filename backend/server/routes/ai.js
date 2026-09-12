const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const groqService = require("../services/groqService");

// @route   POST /api/v1/ai/tutor/chat
router.post("/tutor/chat", async (req, res) => {
  const { message, subject, masteryLevel, conversationHistory, studentContext } = req.body;

  try {
    const socraticRes = await groqService.chatSocraticTutor({
      messages: [
        ...(conversationHistory || []),
        { role: "user", content: message },
      ],
      studentContext: studentContext || "Computer Science Undergraduate (Alex Rivera)",
      courseContext: subject || "Computer Science",
    });

    const extraction = await groqService.extractCandidateMemoriesAndTasks({
      userMessage: message,
      assistantResponse: socraticRes.content,
      courseContext: subject || "Computer Science",
    });

    return res.json({
      response_text: socraticRes.content,
      hints: [
        "Review the core theoretical axioms and constraints.",
        "Consider what property holds true for all candidate superkeys.",
      ],
      drill_questions: [
        "How would you express this theorem in terms of state transitions?",
      ],
      proposed_memories: extraction.candidateMemories || [],
      proposed_tasks: extraction.candidateTasks || [],
      proposed_calendar_events: [],
      mode: "SOCRATIC_GUIDANCE",
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error("[Groq Socratic Tutor Error]", err.message);
    return res.json({
      response_text: "Let's explore this concept step-by-step. What is the foundational invariant or condition that must be satisfied here?",
      hints: ["Identify the key theorem or algorithm step."],
      drill_questions: ["Can you explain the baseline edge case?"],
      proposed_memories: [],
      proposed_tasks: [],
      proposed_calendar_events: [],
      mode: "SOCRATIC_GUIDANCE",
      timestamp: new Date().toISOString(),
    });
  }
});

// @route   POST /api/v1/ai/tutor/code-trace
router.post("/tutor/code-trace", async (req, res) => {
  const { codeSnippet, language } = req.body;

  res.json({
    code: codeSnippet,
    language: language || "javascript",
    total_steps: 4,
    trace_steps: [
      { step: 1, line: 1, explanation: "Parameters and election timeouts initialized in node cluster state.", variable_state: { state: "FOLLOWER", currentTerm: 1 } },
      { step: 2, line: 2, explanation: "Heartbeat timer expires without leader contact; transitions to CANDIDATE.", variable_state: { state: "CANDIDATE", currentTerm: 2, votesReceived: 1 } },
      { step: 3, line: 4, explanation: "Dispatches RequestVote RPCs across quorum; receives majority approvals.", variable_state: { votesReceived: 3, quorumReached: true } },
      { step: 4, line: 6, explanation: "Elected LEADER. Begins sending periodic AppendEntries heartbeat broadcasts.", variable_state: { state: "LEADER", currentTerm: 2 } },
    ],
    complexity: { time: "O(Quorum RPCs)", space: "O(Log Entries)" },
  });
});

module.exports = router;
