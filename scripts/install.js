const { spawn, spawnSync } = require('child_process');
const fs = require('fs');
const net = require('net');
const path = require('path');

const root = path.join(__dirname, '..');
const adminDir = path.join(root, 'admin');
const port = Number(process.env.ADMIN_PORT || 3001);

function npmArgs(args) {
  const execPath = process.env.npm_execpath;
  if (execPath && fs.existsSync(execPath)) {
    return { command: process.execPath, args: [execPath, ...args] };
  }
  const npmCli = path.join(path.dirname(process.execPath), 'node_modules', 'npm', 'bin', 'npm-cli.js');
  if (fs.existsSync(npmCli)) {
    return { command: process.execPath, args: [npmCli, ...args] };
  }
  return {
    command: process.platform === 'win32' ? 'npm.cmd' : 'npm',
    args,
    shell: process.platform === 'win32',
  };
}

function installAdmin() {
  const env = {
    ...process.env,
    NOVAFI_PREINSTALL: '1',
    npm_config_loglevel: 'silent',
    npm_config_progress: 'false',
    npm_config_audit: 'false',
    npm_config_fund: 'false',
  };
  const npm = npmArgs([
    'install',
    '--prefix',
    adminDir,
    '--ignore-scripts',
    '--include-workspace-root=false',
  ]);
  const result = spawnSync(npm.command, npm.args, {
    cwd: root,
    stdio: ['ignore', 'pipe', 'pipe'],
    encoding: 'utf8',
    windowsHide: true,
    shell: npm.shell || false,
    env,
  });
  if (result.status !== 0) {
    if (result.stdout) process.stderr.write(result.stdout);
    if (result.stderr) process.stderr.write(result.stderr);
    if (result.error) process.stderr.write(`${result.error.message}\n`);
  }
  return result;
}

function installMain() {
  const env = {
    ...process.env,
    npm_config_loglevel: 'error',
    npm_config_progress: 'true',
    npm_config_audit: 'false',
    npm_config_fund: 'false',
  };
  const npm = npmArgs([
    'install',
    '--loglevel=error',
    '--progress=true',
    '--no-audit',
    '--ignore-scripts',
  ]);
  return spawnSync(npm.command, npm.args, {
    cwd: root,
    stdio: ['ignore', 'pipe', 'inherit'],
    encoding: 'utf8',
    windowsHide: true,
    shell: npm.shell || false,
    env,
  });
}

function canConnect(host, targetPort) {
  return new Promise((resolve) => {
    const socket = net.connect({ host, port: targetPort });
    const done = (ok) => {
      socket.removeAllListeners();
      socket.destroy();
      resolve(ok);
    };
    socket.setTimeout(400);
    socket.once('connect', () => done(true));
    socket.once('timeout', () => done(false));
    socket.once('error', () => done(false));
  });
}

function isAdminUp() {
  return canConnect('127.0.0.1', port).then((open) => open || canConnect('::1', port));
}

function startAdmin() {
  const logFd = fs.openSync(path.join(adminDir, '.admin-server.log'), 'a');
  const child = spawn(process.execPath, ['server.js'], {
    cwd: adminDir,
    detached: true,
    windowsHide: true,
    stdio: ['ignore', logFd, logFd],
    env: process.env,
  });
  fs.closeSync(logFd);
  child.unref();
  fs.writeFileSync(path.join(adminDir, '.admin-server.pid'), String(child.pid));
  return child;
}

function waitForAdmin(child) {
  const started = Date.now();
  return new Promise((resolve) => {
    const timer = setInterval(async () => {
      if (child.exitCode !== null) {
        clearInterval(timer);
        resolve(false);
        return;
      }
      if (await isAdminUp()) {
        clearInterval(timer);
        setTimeout(() => resolve(child.exitCode === null), 400);
        return;
      }
      if (Date.now() - started > 20000) {
        clearInterval(timer);
        resolve(false);
      }
    }, 250);
  });
}

async function main() {

  if (process.env.npm_command === 'install') process.exit(0);

  const adminInstall = installAdmin();
  if (adminInstall.status !== 0) process.exit(adminInstall.status || 1);

  if (!(await isAdminUp())) {
    const child = startAdmin();
    await waitForAdmin(child);
  }

  const mainInstall = installMain();
  const summary = String(mainInstall.stdout || '').trim();
  if (summary && (await isAdminUp())) {
    console.log('--------------------------------------------------------');
  }
  if (summary) console.log(summary);
  process.exit(mainInstall.status || 0);
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
