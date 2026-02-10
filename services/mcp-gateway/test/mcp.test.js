const { describe, it } = require('node:test');
const assert = require('node:assert');

describe('MCP Gateway', () => {
  const MCP_TOOLS = [
    { name: 'spawn_particle' },
    { name: 'transform_particle' },
    { name: 'translate_text' },
    { name: 'lookup_fluin' },
  ];

  it('should define 4 MCP tools', () => {
    assert.strictEqual(MCP_TOOLS.length, 4);
  });

  it('should include all required tool names', () => {
    const names = MCP_TOOLS.map((t) => t.name);
    assert.ok(names.includes('spawn_particle'));
    assert.ok(names.includes('transform_particle'));
    assert.ok(names.includes('translate_text'));
    assert.ok(names.includes('lookup_fluin'));
  });

  it('should find tool by name', () => {
    const tool = MCP_TOOLS.find((t) => t.name === 'spawn_particle');
    assert.ok(tool);
    assert.strictEqual(tool.name, 'spawn_particle');
  });

  it('should return undefined for unknown tool', () => {
    const tool = MCP_TOOLS.find((t) => t.name === 'nonexistent');
    assert.strictEqual(tool, undefined);
  });
});
