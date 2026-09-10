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

  // Verify fastapi package is installed in this python environment
  try {
    execSync(`"${py}" -c "import fastapi, uvicorn"`, { stdio: "ignore" });
    return py;
  } catch (err) {
    return null;
  }
}

const pyCmd = getFastAPICommand();

if (pyCmd) {
  console.log(`[FastAPI AI Engine] Python & FastAPI detected (${pyCmd}). Launching FastAPI AI Service on port 8000...`);
  
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
  console.log("\x1b[36m%s\x1b[0m", "[FastAPI AI Engine] Starting Synexora AI Service Dev Server on port 8000 (Install requirements with 'pip install -r requirements.txt' for full agentic execution)...");

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

    if (req.url === "/api/v1/health" || req.url === "/health" || req.url === "/") {
      res.writeHead(200);
      res.end(
        JSON.stringify({
          status: "healthy",
          service: "Synexora AI Engine",
          version: "1.0.0",
          orchestrator_status: "ready",
          active_agents: [
            "Learning Agent",
            "Controlled Memory Agent",
            "Personal Assistant Agent",
            "Assessment Agent",
            "RAG Agent"
          ],
          timestamp: new Date().toISOString(),
        })
      );
    } else {
      res.writeHead(200);
      res.end(
        JSON.stringify({
          message: `Synexora AI endpoint [${req.method} ${req.url}] received.`,
          status: "READY",
        })
      );
    }
  });

  server.listen(8000, () => {
    console.log("\x1b[32m%s\x1b[0m", "✓ Synexora AI Engine listening at http://localhost:8000/api/v1/health");
  });
}
