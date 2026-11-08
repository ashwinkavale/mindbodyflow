// Runs the site and the RTS Tracker dev servers together. Ctrl+C stops both.
import { spawn } from "node:child_process";

const TRACKER_PORT = "5173";
const shell = process.platform === "win32";

const run = (args, env = {}) =>
  spawn("npm", args, { stdio: "inherit", shell, env: { ...process.env, ...env } });

const children = [
  run(["run", "dev"], { NEXT_PUBLIC_TRACKER_URL: process.env.NEXT_PUBLIC_TRACKER_URL || `http://localhost:${TRACKER_PORT}` }),
  run(["--prefix", "rts-tracker", "run", "dev", "--", "--port", TRACKER_PORT, "--strictPort"]),
];

const stop = () => children.forEach((child) => child.kill());
children.forEach((child) => child.on("exit", stop));
process.on("SIGINT", stop);
process.on("SIGTERM", stop);
