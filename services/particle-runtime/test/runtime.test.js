const { describe, it } = require('node:test');
const assert = require('node:assert');

describe('Particle Runtime', () => {
  it('should define LAYERS correctly', () => {
    const LAYERS = ['L0_seed', 'L1_gate', 'L2_flow', 'L3_echo', 'L4_world'];
    assert.strictEqual(LAYERS.length, 5);
    assert.ok(LAYERS.includes('L1_gate'));
  });

  it('should create a valid particle structure', () => {
    const particle = {
      id: 'test-id',
      seedId: 'seed-001',
      layer: 'L1_gate',
      state: 'active',
      metadata: {},
      history: [{ event: 'spawn', layer: 'L1_gate', at: new Date().toISOString() }],
      createdAt: new Date().toISOString(),
    };

    assert.strictEqual(particle.layer, 'L1_gate');
    assert.strictEqual(particle.state, 'active');
    assert.strictEqual(particle.history.length, 1);
    assert.strictEqual(particle.history[0].event, 'spawn');
  });

  it('should transform particle layer', () => {
    const particle = { layer: 'L1_gate', history: [] };
    const previousLayer = particle.layer;
    particle.layer = 'L3_echo';
    particle.history.push({
      event: 'transform',
      from: previousLayer,
      to: 'L3_echo',
      at: new Date().toISOString(),
    });

    assert.strictEqual(particle.layer, 'L3_echo');
    assert.strictEqual(particle.history[0].from, 'L1_gate');
  });
});
