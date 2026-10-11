import { spawn } from 'child_process';
import process from 'process';

console.log('⚡ Starting Touchless Physics Lab Development Environment...');
console.log('📡 Starting Express AI Server on port 5000...');
console.log('🌐 Starting Vite Client Server on port 5173...\n');

// 1. Start Express AI Backend on port 5000
const backend = spawn('node', ['server/index.js'], {
  stdio: 'inherit',
  shell: true,
  env: { ...process.env, PORT: '5000' }
});

// 2. Start Vite Frontend
const frontend = spawn('npx', ['vite'], {
  stdio: 'inherit',
  shell: true
});

const cleanup = () => {
  try {
    backend.kill();
  } catch (err) {
    if (err.code !== 'ESRCH') {
      console.warn('Notice: Error terminating backend process:', err.message);
    }
  }
  try {
    frontend.kill();
  } catch (err) {
    if (err.code !== 'ESRCH') {
      console.warn('Notice: Error terminating frontend process:', err.message);
    }
  }
  process.exit();
};

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
process.on('exit', cleanup);
