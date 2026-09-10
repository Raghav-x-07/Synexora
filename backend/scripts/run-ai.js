const { spawn, execSync } = require("child_process");
const http = require("http");
const path = require("path");
const fs = require("fs");

const aiDir = path.join(__dirname, "..", "ai-service");

function getFastAPICommand() {
  const venvPythonWin = path.join(aiDir, "venv", "Scripts", "python.exe");
  const venvPythonUnix = path.join(aiDir, "venv", "bin", "python");

  let py = null;
  if (fs.existsSync(venvPythonWin)) py = venvPythonWin;
  else if (fs.existsSync(venvPythonUnix)) py = venvPythonUnix;
  else {
    try {
      execSync("python --version", { stdio: "ignore" });
      py = "python";
    } catch (e) {
      try {
        execSync("python3 --version", { stdio: "ignore" });
        py = "python3";
      } catch (e2) {
        py = null;
      }
    }
  }

  if (!py) return null;

  try {
    execSync(`"${py}" -c "import fastapi, uvicorn"`, { stdio: "ignore" });
    return py;
  } catch (err) {
    return null;
  }
}

const pyCmd = getFastAPICommand();

if (pyCmd) {
  console.log(`\x1b[32m%s\x1b[0m`, `[FastAPI AI Engine] Python & FastAPI detected (${pyCmd}). Launching FastAPI AI Service on port 8000...`);
  
  const child = spawn(pyCmd, ["-m", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"], {
    cwd: aiDir,
    stdio: "inherit",
    shell: true,
  });

  child.on("error", (err) => {
    console.error("[FastAPI AI Engine] Failed to spawn uvicorn:", err);
  });
} else {
  console.log("\x1b[33m%s\x1b[0m", "[FastAPI AI Engine] Python 'fastapi' module not installed in current environment.");
  console.log("\x1b[36m%s\x1b[0m", "[FastAPI AI Engine] Starting Synexora AI Service Dev Server on port 8000...");

  let documentsStore = [
    {
      id: "doc-dbms-1",
      title: "DBMS_Normalization_Formulas_2026.pdf",
      subject: "Database Management Systems",
      size: "2.4 MB",
      chunks: 180,
      status: "Indexed",
      createdAt: "2026-09-08",
    },
    {
      id: "doc-ds-2",
      title: "CS301_Distributed_Systems_Consensus.pdf",
      subject: "Distributed Systems",
      size: "4.8 MB",
      chunks: 420,
      status: "Indexed",
      createdAt: "2026-09-07",
    },
    {
      id: "doc-algo-3",
      title: "Graph_Theory_Algorithm_Proofs.pdf",
      subject: "Algorithms",
      size: "3.1 MB",
      chunks: 310,
      status: "Indexed",
      createdAt: "2026-09-05",
    },
  ];

  const server = http.createServer((req, res) => {
    res.setHeader("Content-Type", "application/json");
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

    if (req.method === "OPTIONS") {
      res.writeHead(204);
      res.end();
      return;
    }

    let body = "";
    req.on("data", (chunk) => (body += chunk));
    req.on("end", () => {
      let parsed = {};
      try {
        if (body) parsed = JSON.parse(body);
      } catch (e) {}

      const url = req.url.split("?")[0];

      if (url === "/api/v1/health" || url === "/health" || url === "/") {
        res.writeHead(200);
        res.end(
          JSON.stringify({
            status: "healthy",
            service: "Synexora AI Engine",
            version: "1.0.0",
            orchestrator_status: "ready",
            active_agents: [
              "Socratic Learning Agent",
              "Controlled Memory Agent",
              "Personal Assistant Agent",
              "Assessment Agent",
              "RAG Agent"
            ],
            timestamp: new Date().toISOString(),
          })
        );
      } else if (url === "/api/v1/tutor/chat") {
        const msg = (parsed.message || "").toLowerCase();
        let responseText = "Let's explore this step-by-step. What do you understand to be the primary constraint or rule in this scenario?";
        let hints = [
          "Break down the problem into input, invariants, and edge cases.",
          "Consider what guard condition stops unnecessary repetition.",
        ];
        let drillQuestions = ["Can you state the core problem in your own words?"];
        let proposedMemories = [];
        let proposedTasks = [];

        if (msg.includes("bcnf") || msg.includes("3nf") || msg.includes("normalization")) {
          responseText = "Great database concept! In 3NF, functional dependency X → Y is permitted if X is a superkey OR Y is a prime attribute. Why do you think BCNF removes the second exception (Y is prime) entirely?";
          hints = [
            "Allowing Y to be prime attribute when X is not a superkey can still allow redundancy and update anomalies.",
            "BCNF ensures EVERY determinant is strictly a candidate/superkey.",
            "A relation in BCNF eliminates all functional dependency anomalies."
          ];
          drillQuestions = [
            "Can you think of a scenario with overlapping candidate keys that is in 3NF but not BCNF?",
            "What is the tradeoff between BCNF decomposition and dependency preservation?"
          ];
        } else if (msg.includes("recursion") || msg.includes("recursive")) {
          responseText = "Think of recursion like opening nested Russian dolls. What is the essential condition we must check before opening another doll so we don't open them forever?";
          hints = [
            "Think about what value of n should immediately return a result without making another recursive call.",
            "The base case prevents stack overflow.",
          ];
          drillQuestions = [
            "What is the base case for finding factorial of N?",
            "How many stack frames will be created for factorial(3)?",
          ];
        } else if (msg.includes("score") || msg.includes("got") || msg.includes("72") || msg.includes("due") || msg.includes("project")) {
          proposedMemories.push({
            id: `mem-${Date.now()}`,
            category: "PERFORMANCE",
            title: "DBMS Internal Assessment",
            value: "Score: 72/100 (Identified focus on indexing & normalization)",
            confidenceScore: 0.95,
            reasoning: "Detected performance metric mentioned by student.",
          });
          proposedTasks.push({
            id: `task-${Date.now()}`,
            title: "Submit DBMS Project & Review BCNF",
            priority: "HIGH",
            dueDate: new Date(Date.now() + 86400000 * 2).toISOString().split("T")[0],
            subjectTag: "DBMS",
            reasoning: "Suggested to strengthen score before the deadline.",
          });
          responseText = "I've noted your progress and deadline! Let's focus on turning those challenging areas into your strongest subjects. Would you like to review BCNF vs 3NF or trace indexing queries?";
        }

        res.writeHead(200);
        res.end(
          JSON.stringify({
            response_text: responseText,
            hints,
            drill_questions: drillQuestions,
            proposed_memories: proposedMemories,
            proposed_tasks: proposedTasks,
            mode: "SOCRATIC_GUIDANCE",
            timestamp: new Date().toISOString(),
          })
        );
      } else if (url === "/api/v1/tutor/code-trace") {
        res.writeHead(200);
        res.end(
          JSON.stringify({
            code: parsed.codeSnippet || "function factorial(n) {\n  if (n <= 1) return 1;\n  return n * factorial(n - 1);\n}",
            language: parsed.language || "javascript",
            total_steps: 4,
            trace_steps: [
              { step: 1, line: 1, explanation: "factorial(3) invoked on call stack.", variable_state: { n: 3 } },
              { step: 2, line: 3, explanation: "Guard (n <= 1) is false. Invoking factorial(2).", variable_state: { n: 2 } },
              { step: 3, line: 3, explanation: "Guard is false. Invoking factorial(1).", variable_state: { n: 1 } },
              { step: 4, line: 2, explanation: "Base condition reached! Returns 1. Unwinding stack: 3 * 2 * 1 = 6.", variable_state: { result: 6 } },
            ],
            complexity: { time: "O(N)", space: "O(N)" },
          })
        );
      } else if (url === "/api/v1/rag/documents") {
        res.writeHead(200);
        res.end(JSON.stringify({ status: "success", documents: documentsStore }));
      } else if (url === "/api/v1/rag/upload") {
        const newDoc = {
          id: `doc-${Date.now()}`,
          title: parsed.title || "Uploaded_Lecture_Notes.pdf",
          subject: parsed.subject || "General Academic",
          size: parsed.size || "1.8 MB",
          chunks: 54,
          status: "Indexed",
          createdAt: new Date().toISOString().split("T")[0],
        };
        documentsStore.unshift(newDoc);
        res.writeHead(201);
        res.end(JSON.stringify({ status: "indexed", document: newDoc }));
      } else if (url === "/api/v1/rag/query") {
        const lower = (parsed.query || "").toLowerCase();
        let answer = `According to your indexed course documents, the fundamental concept relates to core invariants, safety properties, and edge-case guarantees.`;
        let citations = [
          {
            doc_title: "DBMS_Normalization_Formulas_2026.pdf",
            page: 14,
            chunk_id: "c-101",
            topic: "BCNF vs 3NF Invariants",
            text: "Boyce-Codd Normal Form (BCNF) strictly requires that for every non-trivial functional dependency X -> Y, X must be a superkey of relation R.",
            relevance: 0.96,
          },
        ];

        if (lower.includes("bcnf") || lower.includes("3nf") || lower.includes("normalization")) {
          answer = `Based on your course materials, Boyce-Codd Normal Form (BCNF) is strictly stronger than 3NF. In 3NF, functional dependency X -> Y is allowed if X is a superkey OR Y is a prime attribute. BCNF eliminates this second exception, mandating that EVERY determinant X must be a candidate/superkey.`;
        } else if (lower.includes("raft") || lower.includes("consensus")) {
          answer = `According to your Distributed Systems notes, Raft achieves consensus through a single elected leader per term using randomized election timeouts (150ms - 300ms) to prevent split-vote deadlocks.`;
          citations = [
            {
              doc_title: "CS301_Distributed_Systems_Consensus.pdf",
              page: 27,
              chunk_id: "c-201",
              topic: "Raft Leader Election & Randomized Timeouts",
              text: "Raft Consensus Algorithm elects a single leader node per term. When a leader fails, follower nodes trigger an election timeout randomized between 150ms and 300ms.",
              relevance: 0.98,
            },
          ];
        }

        res.writeHead(200);
        res.end(
          JSON.stringify({
            query: parsed.query,
            answer,
            citations,
            confidence_score: 0.96,
            source_count: citations.length,
            timestamp: new Date().toISOString(),
          })
        );
      } else if (url === "/api/v1/rag/flashcards") {
        res.writeHead(200);
        res.end(
          JSON.stringify({
            status: "success",
            flashcards: [
              {
                id: "fc-1",
                subject: "DBMS",
                source: "DBMS_Normalization_Formulas_2026.pdf (Page 14)",
                front: "What is the key rule that distinguishes BCNF from 3NF?",
                back: "BCNF requires every determinant X to be a superkey for any non-trivial X -> Y, removing 3NF's allowance for Y to be a prime attribute.",
                difficulty: "MEDIUM",
              },
              {
                id: "fc-2",
                subject: "Distributed Systems",
                source: "CS301_Distributed_Systems_Consensus.pdf (Page 27)",
                front: "Why does Raft randomize election timeouts between 150ms and 300ms?",
                back: "To minimize the probability of split votes where multiple nodes become candidates simultaneously and split the vote evenly.",
                difficulty: "HARD",
              },
              {
                id: "fc-3",
                subject: "Algorithms",
                source: "Graph_Theory_Algorithm_Proofs.pdf (Page 9)",
                front: "What is the optimal time complexity of Dijkstra's algorithm with a Fibonacci Heap?",
                back: "O(E + V log V), because decrease-key operations run in amortized O(1) time.",
                difficulty: "EASY",
              },
            ],
          })
        );
      } else {
        res.writeHead(200);
        res.end(
          JSON.stringify({
            message: `Synexora AI endpoint [${req.method} ${url}] active.`,
            status: "READY",
          })
        );
      }
    });
  });

  server.listen(8000, () => {
    console.log("\x1b[32m%s\x1b[0m", "✓ Synexora AI Engine listening at http://localhost:8000/api/v1/health");
  });
}
