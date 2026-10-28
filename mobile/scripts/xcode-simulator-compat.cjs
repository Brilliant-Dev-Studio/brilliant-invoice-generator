const childProcess = require('node:child_process');
const {existsSync} = require('node:fs');
const path = require('node:path');

function simulatorOpenArgs(file, args, exists = existsSync) {
  const app = args?.[0];
  if ((file !== 'open' && file !== '/usr/bin/open') ||
      typeof app !== 'string' || !app.endsWith('/Applications/Simulator.app') || exists(app)) {
    return args;
  }
  const developer = path.dirname(path.dirname(app));
  const candidates = [
    path.join(path.dirname(developer), 'Applications', 'Simulator.app'),
    path.join(path.dirname(developer), 'Applications', 'DeviceHub.app'),
  ];
  const replacement = candidates.find(exists);
  if (!replacement) return args;
  // DeviceHub has its own UI arguments. simctl still selects/boots the device.
  return replacement.endsWith('/DeviceHub.app')
    ? [replacement]
    : [replacement, ...args.slice(1)];
}

// Scope the workaround to this CLI process; leave Xcode and node_modules intact.
const execFileSync = childProcess.execFileSync;
childProcess.execFileSync = function (file, args, options) {
  return execFileSync.call(this, file, simulatorOpenArgs(file, args), options);
};

module.exports = {simulatorOpenArgs};
