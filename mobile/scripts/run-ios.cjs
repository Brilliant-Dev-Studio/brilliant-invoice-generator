const {spawnSync} = require('node:child_process');

const args = process.argv.slice(2);
const explicitDestination = args.some(arg =>
  ['--simulator', '--udid', '--device', '--list-devices', '--interactive'].some(
    flag => arg === flag || arg.startsWith(`${flag}=`),
  ),
);

// The CLI otherwise attempts connected physical iPhones as well as simulators.
if (!explicitDestination) {
  const result = spawnSync('xcrun', ['simctl', 'list', 'devices', 'available', '--json'], {encoding: 'utf8'});
  if (result.error || result.status !== 0) {
    console.error(result.stderr || result.error?.message || 'Cannot access iOS Simulators.');
    process.exit(1);
  }
  let devices;
  try {
    devices = Object.entries(JSON.parse(result.stdout).devices)
      .filter(([runtime]) => runtime.includes('.iOS-'))
      .flatMap(([, entries]) => entries)
      .filter(device => device.isAvailable);
  } catch {
    console.error('Could not read the iOS Simulator list. Check Xcode installation.');
    process.exit(1);
  }
  const selected = devices.find(device => device.state === 'Booted')
    || devices.find(device => device.name.startsWith('iPhone')) || devices[0];
  if (!selected) {
    console.error('Install an iOS Simulator runtime in Xcode Settings > Components.');
    process.exit(1);
  }
  console.log(`Using Simulator: ${selected.name}`);
  args.push('--udid', selected.udid);
}

const result = spawnSync(process.execPath, [
  '--require', require.resolve('./xcode-simulator-compat.cjs'),
  require.resolve('react-native/cli.js'), 'run-ios', ...args,
], {stdio: 'inherit'});
if (result.error) console.error(result.error.message);
process.exit(result.status ?? 1);
