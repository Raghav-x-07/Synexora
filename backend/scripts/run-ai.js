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
