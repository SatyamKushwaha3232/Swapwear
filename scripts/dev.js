import { spawn } from "node:child_process";

const npmCommand = process.platform === "win32" ? "npm.cmd" : "npm";

function start(name, args, color) {
  const child = spawn(npmCommand, args, {
    cwd: process.cwd(),
    stdio: ["inherit", "pipe", "pipe"],
    shell: false,
  });

  child.stdout.on("data", (chunk) => {
    process.stdout.write(`${color}[${name}]\x1b[0m ${chunk}`);
  });

  child.stderr.on("data", (chunk) => {
    process.stderr.write(`${color}[${name}]\x1b[0m ${chunk}`);
  });

  child.on("exit", (code, signal) => {
    if (shuttingDown) return;
    console.error(`[${name}] stopped${signal ? ` by ${signal}` : ` with code ${code}`}`);
    shutdown(code || 1);
  });

  return child;
}

let shuttingDown = false;
const children = [
  start("backend", ["--prefix", "backend", "run", "dev"], "\x1b[35m"),
  start("frontend", ["--prefix", "frontend", "run", "dev"], "\x1b[36m"),
];

function shutdown(code = 0) {
  shuttingDown = true;
  for (const child of children) {
    if (!child.killed) child.kill("SIGINT");
  }
  setTimeout(() => process.exit(code), 300);
}

process.on("SIGINT", () => shutdown(0));
process.on("SIGTERM", () => shutdown(0));
