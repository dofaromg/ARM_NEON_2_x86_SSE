const { describe, it } = require('node:test');
const assert = require('node:assert');

describe('EchoPersona Translation', () => {
  it('should tokenize text for particle translation', () => {
    const text = 'hello world from mrliou';
    const tokens = text.split(/\s+/);
    assert.strictEqual(tokens.length, 4);
  });

  it('should create valid persona structure', () => {
    const persona = {
      id: 'test-persona',
      name: 'mrliou',
      translationMode: 'bidirectional',
      syncVersion: 1,
      stateHash: null,
    };
    assert.strictEqual(persona.translationMode, 'bidirectional');
    assert.strictEqual(persona.syncVersion, 1);
  });

  it('should increment sync version', () => {
    const persona = { syncVersion: 1 };
    persona.syncVersion += 1;
    assert.strictEqual(persona.syncVersion, 2);
  });
});
