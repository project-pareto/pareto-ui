const { test } = require('node:test');
const assert = require('node:assert/strict');
const { EventEmitter } = require('node:events');
const { startBackend, stopBackendBeforeQuit } = require('../ui/public/backend-process');

function setup(overrides = {}) {
  const child = new EventEmitter();
  Object.assign(child, {pid: 1234, exitCode: null});
  for (const name of ['stdout', 'stderr']) {
    child[name] = new EventEmitter();
    child[name].setEncoding = () => {};
  }
  const launches = [], signals = [], logs = [], commands = [];
  const backend = startBackend('/packaged/main', {
    log: line => logs.push(line),
    platform: 'darwin',
    graceMs: 5,
    spawnProcess: (...args) => { launches.push(args); return child; },
    signalProcess: (...args) => signals.push(args),
    execFileProcess: (...args) => { commands.push(args.slice(0, 3)); args[3](null); },
    ...overrides,
  });
  return {child, backend, launches, signals, logs, commands};
}

test('packaged backend owns a process group and streams both output channels', async () => {
  const {child, backend, launches, signals, logs} = setup();
  assert.deepEqual(launches, [['/packaged/main', [], {
    detached: true, windowsHide: true, stdio: ['ignore', 'pipe', 'pipe'],
  }]]);
  child.stdout.emit('data', 'hello');
  child.stderr.emit('data', 'warning');
  assert.ok(logs.includes('stdout: hello'));
  assert.ok(logs.includes('stderr: warning'));
  await backend.stop();
  assert.deepEqual(signals, [[-1234, 'SIGTERM'], [-1234, 'SIGKILL']]);
});

test('shutdown still kills descendants after the backend parent exits', async () => {
  const {child, backend, signals} = setup();
  const stopping = backend.stop();
  child.exitCode = 0;
  child.emit('exit', 0, null);
  assert.equal(backend.stop(), stopping);
  await stopping;
  assert.deepEqual(signals, [[-1234, 'SIGTERM'], [-1234, 'SIGKILL']]);
});

test('already exited process groups do not cause shutdown errors', async () => {
  const {backend} = setup({signalProcess: () => {
    throw Object.assign(new Error('not found'), {code: 'ESRCH'});
  }});
  await backend.stop();
});

test('a failed spawn is logged and does not signal another process', async () => {
  const {child, backend, signals, logs} = setup();
  child.pid = undefined;
  child.emit('error', new Error('ENOENT'));
  await backend.stop();
  assert.deepEqual(signals, []);
  assert.ok(logs.some(line => line.includes('ENOENT')));
});

test('Windows shutdown waits for taskkill to terminate the process tree', async () => {
  let finish;
  const commands = [];
  const {backend, launches} = setup({
    platform: 'win32',
    execFileProcess: (...args) => { commands.push(args.slice(0, 3)); finish = args[3]; },
  });
  assert.equal(launches[0][2].detached, false);
  let stopped = false;
  const stopping = backend.stop().then(() => { stopped = true; });
  await Promise.resolve();
  assert.equal(stopped, false);
  assert.deepEqual(commands, [['taskkill', ['/PID', '1234', '/T', '/F'], {
    windowsHide: true, timeout: 5000,
  }]]);
  finish(null);
  await stopping;
  assert.equal(stopped, true);
});

test('Electron waits for cleanup once before completing quit', async () => {
  const app = new EventEmitter();
  let finish, stops = 0, quits = 0, prevented = 0;
  const cleanup = new Promise(resolve => { finish = resolve; });
  const backend = {stop: () => { stops++; return cleanup; }};
  app.quit = () => {
    quits++;
    app.emit('before-quit', {preventDefault: () => { prevented++; }});
  };
  stopBackendBeforeQuit(app, backend, () => {});
  app.emit('before-quit', {preventDefault: () => { prevented++; }});
  app.emit('before-quit', {preventDefault: () => { prevented++; }});
  assert.equal(stops, 1);
  assert.equal(quits, 0);
  finish();
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(quits, 1);
  assert.equal(prevented, 2);
});
