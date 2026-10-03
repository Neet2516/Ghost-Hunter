import http from 'node:http';
import net from 'node:net';
import { execSync } from 'node:child_process';

interface ServiceCheck {
  name: string;
  expectedPort: number | string;
  status: 'ONLINE' | 'OFFLINE' | 'WARNING';
  details: string;
}

function checkPort(port: number, timeout = 1000): Promise<boolean> {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    socket.setTimeout(timeout);
    socket.once('connect', () => {
      socket.destroy();
      resolve(true);
    });
    socket.once('timeout', () => {
      socket.destroy();
      resolve(false);
    });
    socket.once('error', () => {
      resolve(false);
    });
    socket.connect(port, '127.0.0.1');
  });
}

async function fetchJson(url: string, timeout = 1500): Promise<any> {
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(timeout) });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

async function main() {
  console.log('\n======================================================');
  console.log('       GHOST-HUNTER SYSTEM SERVICES STATUS           ');
  console.log('======================================================\n');

  const checks: ServiceCheck[] = [];

  // 1. Next.js Web Frontend
  const web3000 = await checkPort(3000);
  const web3006 = await checkPort(3006);
  if (web3000 || web3006) {
    const port = web3000 ? 3000 : 3006;
    checks.push({
      name: 'Web UI (Next.js)',
      expectedPort: port,
      status: 'ONLINE',
      details: `Listening at http://localhost:${port}`,
    });
  } else {
    checks.push({
      name: 'Web UI (Next.js)',
      expectedPort: 3000,
      status: 'OFFLINE',
      details: 'Start with: pnpm --filter @ghost-hunter/web dev',
    });
  }

  // 2. Fastify API Server
  const apiHealth = await fetchJson('http://localhost:3001/api/health');
  if (apiHealth) {
    checks.push({
      name: 'API Server (Fastify)',
      expectedPort: 3001,
      status: 'ONLINE',
      details: `Queue: ${apiHealth.taskQueue} · http://localhost:3001`,
    });
  } else {
    checks.push({
      name: 'API Server (Fastify)',
      expectedPort: 3001,
      status: 'OFFLINE',
      details: 'Start with: pnpm --filter @ghost-hunter/api dev',
    });
  }

  // 3. Temporal Server
  const temporalGrpc = await checkPort(7233);
  const temporalUi = await checkPort(8233);
  if (temporalGrpc) {
    checks.push({
      name: 'Temporal Server',
      expectedPort: '7233 / 8233',
      status: 'ONLINE',
      details: `gRPC port 7233 OK · Web UI at http://localhost:8233`,
    });
  } else {
    checks.push({
      name: 'Temporal Server',
      expectedPort: '7233 / 8233',
      status: 'OFFLINE',
      details: 'Start with: pnpm temporal (or temporal server start-dev)',
    });
  }

  // 4. Temporal Worker
  let workerRunning = false;
  try {
    const ps = execSync('ps aux', { encoding: 'utf-8' });
    workerRunning = ps.includes('apps/worker/src/worker.ts') || ps.includes('worker.ts');
  } catch {
    workerRunning = false;
  }
  if (workerRunning) {
    checks.push({
      name: 'Temporal Worker',
      expectedPort: 'N/A (Task Client)',
      status: 'ONLINE',
      details: 'Polling task queue "ghost-hunter"',
    });
  } else {
    checks.push({
      name: 'Temporal Worker',
      expectedPort: 'N/A (Task Client)',
      status: 'OFFLINE',
      details: 'Start with: pnpm --filter @ghost-hunter/worker dev',
    });
  }

  // 5. Ollama AI Engine
  const targetModel = process.env.OLLAMA_MODEL || 'gemma3:4b';
  const ollamaTags = await fetchJson('http://localhost:11434/api/tags');
  if (ollamaTags) {
    const models = (ollamaTags.models || []).map((m: any) => m.name || '');
    const hasTarget = models.some((m: string) => m.toLowerCase().includes('gemma'));
    if (hasTarget) {
      checks.push({
        name: 'Ollama AI (Local)',
        expectedPort: 11434,
        status: 'ONLINE',
        details: `Model installed: ${models.join(', ')}`,
      });
    } else {
      checks.push({
        name: 'Ollama AI (Local)',
        expectedPort: 11434,
        status: 'WARNING',
        details: `Ollama is running but "${targetModel}" not found. Run: ollama pull ${targetModel}`,
      });
    }
  } else {
    checks.push({
      name: 'Ollama AI (Local)',
      expectedPort: 11434,
      status: 'OFFLINE',
      details: 'Offline (Fallback templates active). Run: ollama serve',
    });
  }

  // Render Table
  console.log('| Service | Port | Status | Details |');
  console.log('| :--- | :--- | :--- | :--- |');
  for (const c of checks) {
    const statusIcon = c.status === 'ONLINE' ? '🟢 ONLINE' : c.status === 'WARNING' ? '🟡 WARNING' : '🔴 OFFLINE';
    console.log(`| **${c.name}** | \`${c.expectedPort}\` | ${statusIcon} | ${c.details} |`);
  }
  console.log('\n======================================================\n');
}

main().catch(console.error);
