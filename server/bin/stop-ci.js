#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const pidFile = path.resolve(__dirname, '..', '..', 'server.pid');

function stopPid(pid) {
  try {
    process.kill(pid);
    console.log(`Stopped process ${pid}`);
  } catch (err) {
    console.warn(`Failed to stop pid ${pid}: ${err.message}`);
  }
}

if (fs.existsSync(pidFile)) {
  const pid = parseInt(fs.readFileSync(pidFile, 'utf8').trim(), 10);
  if (!isNaN(pid)) {
    stopPid(pid);
  }
  try { fs.unlinkSync(pidFile); } catch (e) {}
} else {
  console.log('No pid file found, nothing to stop.');
}
