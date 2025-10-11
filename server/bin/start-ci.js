#!/usr/bin/env node
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const indexPath = path.join(root, 'index.js');
const outLog = path.resolve(root, '..', 'server.log');
const pidFile = path.resolve(root, '..', 'server.pid');

// spawn a detached child so the parent can exit and the child keeps running
const out = fs.openSync(outLog, 'a');
const err = fs.openSync(outLog, 'a');

const child = spawn(process.execPath, [indexPath], {
  detached: true,
  stdio: ['ignore', out, err],
  cwd: root,
});

// write pid file next to repo root (.. / server.pid)
fs.writeFileSync(pidFile, String(child.pid), { encoding: 'utf8' });
console.log(`Started server (pid=${child.pid}), log: ${outLog}, pidfile: ${pidFile}`);

// detach and let child run independently
child.unref();

// exit parent process
process.exit(0);
