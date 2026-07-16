import assert from 'node:assert/strict';
import { buildingById, buildingRegistry } from '../src/data/buildings.js';

assert.equal(new Set(buildingRegistry.map(({ id }) => id)).size, buildingRegistry.length, 'Building ids must be unique.');
assert.ok(buildingRegistry.some(({ status }) => status === 'Missing'), 'The registry must keep unplaced reference assets.');
for (const building of buildingRegistry) {
  assert.ok(building.id && building.name && building.category && building.status && building.reference, 'Registry entries must include their required metadata.');
  assert.ok(
    building.position === null || (building.position.length === 3 && building.rotation.length === 3),
    `${building.id} must have either complete placement data or no placement data.`,
  );
}
assert.deepEqual(buildingById['ntr-library'].position, [-25, 0, -40], 'Existing library placement must preserve the current scene.');
assert.deepEqual(buildingById.mhp.position, [-31.5, 0, -148], 'Existing MHP placement must preserve the current scene.');
assert.deepEqual(buildingById['ganesha-shrine'].position, [-10, 0, 17], 'Existing shrine placement must preserve the current scene.');
