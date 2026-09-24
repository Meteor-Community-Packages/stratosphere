import { test } from 'node:test';
import assert from 'node:assert/strict';
import { versionMagnitude } from '../imports/api/versionMagnitude.js';

test('versionMagnitude pads and orders versions like Troposphere', () => {
  assert.equal(versionMagnitude('1.2.3'), '0001.0002.0003$');
  assert.equal(versionMagnitude('1.2.3-rc.1'), '0001.0002.0003!rc.!!!!!!!!!!!!0001$');
  assert.equal(versionMagnitude('1.02.3'), null);
  assert.equal(versionMagnitude('not a version'), null);

  const byMagnitude = ['1.10.0', '1.2.3_1', '1.2.3', '1.2', '1.2.3-beta1']
    .sort((a, b) => (versionMagnitude(a) < versionMagnitude(b) ? -1 : 1));
  assert.deepEqual(byMagnitude, ['1.2', '1.2.3-beta1', '1.2.3', '1.2.3_1', '1.10.0']);
});
