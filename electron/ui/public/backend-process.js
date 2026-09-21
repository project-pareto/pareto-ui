const { spawn, execFile } = require('child_process');

// Keep the packaged backend and its descendants in a group owned by this app.
// A single child.kill() leaves resource trackers and solver processes running.
function startBackend(executable, {
  log,
  platform = process.platform,
  spawnProcess = spawn,
  execFileProcess = execFile,
  signalProcess = process.kill.bind(process),
  graceMs = 3000,
} = {}) {
  const child = spawnProcess(executable, [], {
    detached: platform !== 'win32',
    windowsHide: true,
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  for (const [name, stream] of [['stdout', child.stdout], ['stderr', child.stderr]]) {
    stream.setEncoding('utf8');
    // Stream to the existing rotating logger; never retain the output history.
    stream.on('data', data => log(`${name}: ${data}`));
  }
  child.on('error', error => log(`Backend process error: ${error.message}`));
  child.on('exit', (code, signal) => log(`Backend exited (code=${code}, signal=${signal})`));
  log(`Backend started (pid=${child.pid})`);

  let stopping;
  function stop() {
    if (!stopping) stopping = stopTree();
    return stopping;
  }

  async function stopTree() {
    if (!child.pid) return; // spawn failed; there is no process to signal.
    if (platform === 'win32') {
      await new Promise((resolve, reject) => {
        execFileProcess('taskkill', ['/PID', String(child.pid), '/T', '/F'],
          { windowsHide: true, timeout: 5000 }, error => {
            if (error && child.exitCode === null) reject(error);
            else resolve();
          });
      });
      return;
    }

    function signalGroup(signal) {
      try {
        signalProcess(-child.pid, signal);
        return true;
      } catch (error) {
        if (error.code === 'ESRCH') return false;
        throw error;
      }
    }

    if (!signalGroup('SIGTERM')) return;
    await new Promise(resolve => setTimeout(resolve, graceMs));
    // The parent can exit before its descendants. Still signal the whole group.
    signalGroup('SIGKILL');
  }

  return { child, stop };
}

function stopBackendBeforeQuit(app, backend, log) {
  let finished = false;
  let stopping;
  app.on('before-quit', event => {
    if (finished) return;
    event.preventDefault();
    if (!stopping) {
      stopping = backend.stop()
        .catch(error => log(`Unable to stop backend processes: ${error.message}`))
        .finally(() => {
          finished = true;
          app.quit();
        });
    }
  });
}

module.exports = { startBackend, stopBackendBeforeQuit };
