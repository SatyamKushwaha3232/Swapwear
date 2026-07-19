import { spawn } from "node:child_process";
import { createServer } from "node:net";

const isWindows = process.platform === "win32";
const npmExecPath = process.env.npm_execpath;
const npmCommand = npmExecPath ? process.execPath : isWindows ? "npm.cmd" : "npm";

function npmArgs(args) {
  return npmExecPath ? [npmExecPath, ...args] : args;
}

function checkPort(port) {
  return new Promise((resolve) => {
    const server = createServer();
    server.once("error", () => resolve(false));
    server.once("listening", () => {
      server.close(() => resolve(true));
    });
    server.listen(port, "127.0.0.1");
  });
}

function start(name, args, color) {
  const child = spawn(npmCommand, npmArgs(args), {
    cwd: process.cwd(),
    stdio: ["inherit", "pipe", "pipe"],
    shell: !npmExecPath && isWindows,
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

const requiredPorts = [
  { port: 5000, name: "backend API" },
  { port: 5173, name: "frontend dev server" },
];

const busyPorts = [];
for (const item of requiredPorts) {
  if (!(await checkPort(item.port))) busyPorts.push(item);
}

if (busyPorts.length) {
  console.error("SwapWear dev server cannot start because these ports are already busy:");
  for (const item of busyPorts) console.error(`- ${item.name}: ${item.port}`);
  console.error("");
  console.error("Close the old backend/frontend terminal, then run `npm run dev` again.");
  console.error("On Windows, you can also stop old node.exe processes from Task Manager.");
  process.exit(1);
}

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
