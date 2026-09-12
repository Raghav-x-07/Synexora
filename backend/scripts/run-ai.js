const { spawn, execSync } = require("child_process");
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
  console.error(
    "\x1b[31m%s\x1b[0m",
    "[FastAPI AI Engine] Error: Python virtual environment or 'fastapi'/'uvicorn' packages not found in backend/ai-service.\n" +
      "Please set up the virtual environment:\n" +
      "  cd backend/ai-service\n" +
      "  python -m venv venv\n" +
      "  .\\venv\\Scripts\\pip install -r requirements.txt\n"
  );
  process.exit(1);
}

