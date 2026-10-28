const {test} = require('node:test');
const assert = require('node:assert/strict');
const {simulatorOpenArgs} = require('../scripts/xcode-simulator-compat.cjs');
const legacy = '/Applications/Xcode.app/Contents/Developer/Applications/Simulator.app';
const modern = '/Applications/Xcode.app/Contents/Applications/Simulator.app';
const hub = '/Applications/Xcode.app/Contents/Applications/DeviceHub.app';
const args = [legacy, '--args', '-CurrentDeviceUDID', 'test-device'];

test('existing Simulator keeps device selection arguments', () => {
  assert.equal(simulatorOpenArgs('open', args, app => app === legacy), args);
});
test('relocated Simulator keeps device selection arguments', () => {
  assert.deepEqual(simulatorOpenArgs('open', args, app => app === modern), [modern, ...args.slice(1)]);
});
test('Xcode 27 opens DeviceHub without unsupported Simulator UI arguments', () => {
  assert.deepEqual(simulatorOpenArgs('/usr/bin/open', args, app => app === hub), [hub]);
});
test('missing installation preserves original launch failure', () => {
  assert.equal(simulatorOpenArgs('open', args, () => false), args);
});
test('other subprocesses and open targets are untouched', () => {
  assert.equal(simulatorOpenArgs('xcrun', args, () => false), args);
  const browser = ['https://example.com'];
  assert.equal(simulatorOpenArgs('open', browser, () => true), browser);
});
