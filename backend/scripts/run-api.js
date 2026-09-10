const path = require("path");
const { spawn } = require("child_process");

const serverDir = path.join(__dirname, "..", "server");

console.log("\x1b[32m%s\x1b[0m", "[Synexora MERN API] Launching Express.js & MongoDB Core API on port 8080...");

const child = spawn("node", ["server.js"], {
  cwd: serverDir,
  stdio: "inherit",
  shell: true,
});

child.on("error", (err) => {
  console.error("[Synexora MERN API] Failed to start:", err);
});

child.on("exit", (code) => {
  if (code !== 0 && code !== null) {
    console.error(`[Synexora MERN API] Exited with code ${code}`);
  }
});
