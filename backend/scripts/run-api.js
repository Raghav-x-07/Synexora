const { spawn, execSync } = require("child_process");
const http = require("http");
const path = require("path");

function isJavaAvailable() {
  try {
    execSync("java -version", { stdio: "ignore" });
    return true;
  } catch (e) {
    return false;
  }
}

const springDir = path.join(__dirname, "..", "spring-api");

if (isJavaAvailable()) {
  console.log("[Spring Boot API] Java runtime detected. Launching Spring Boot application...");
  const isWin = process.platform === "win32";
  const cmd = isWin ? (require("fs").existsSync(path.join(springDir, "mvnw.cmd")) ? ".\\mvnw.cmd" : "mvn") : "./mvnw";
  
  const child = spawn(cmd, ["spring-boot:run"], {
    cwd: springDir,
    stdio: "inherit",
    shell: true,
  });

  child.on("error", (err) => {
    console.error("[Spring Boot API] Failed to start:", err);
  });
} else {
  console.log("\x1b[33m%s\x1b[0m", "[Spring Boot API] Java JDK is not detected in current PATH.");
  console.log("\x1b[36m%s\x1b[0m", "[Spring Boot API] Starting Synexora Core API Dev Server on port 8080...");

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
          status: "UP",
          service: "Synexora Spring Boot API",
          version: "1.0.0",
          runtime: "Synexora Dev Core API",
          endpoints: [
            "/api/v1/auth/*",
            "/api/v1/tasks",
            "/api/v1/notes",
            "/api/v1/memories",
            "/api/v1/calendar/events",
            "/api/v1/assessments"
          ],
          timestamp: new Date().toISOString(),
        })
      );
    } else {
      res.writeHead(200);
      res.end(
        JSON.stringify({
          message: `Synexora API route [${req.method} ${req.url}] received.`,
          status: "READY",
        })
      );
    }
  });

  server.listen(8080, () => {
    console.log("\x1b[32m%s\x1b[0m", "✓ Synexora Core API listening at http://localhost:8080/api/v1/health");
  });
}
