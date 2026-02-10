/**
 * MCP Gateway - Model Context Protocol Bridge
 *
 * Exposes Particle System capabilities via MCP:
 * - Tools: spawn_particle, transform_particle, translate_text, lookup_fluin
 * - Resources: particle state, persona registry, seed corpus
 * - Transport: Streamable HTTP (default), stdio fallback
 */

const express = require('express');
const { v4: uuidv4 } = require('uuid');

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3002;
const PARTICLE_RUNTIME_URL = process.env.PARTICLE_RUNTIME_URL || 'http://localhost:3000';
const ECHO_PERSONA_URL = process.env.ECHO_PERSONA_URL || 'http://localhost:3001';
const MCP_TRANSPORT = process.env.MCP_TRANSPORT || 'streamable-http';

// MCP Tool definitions
const MCP_TOOLS = [
  {
    name: 'spawn_particle',
    description: 'Spawn a new particle in the L1 Gate runtime',
    inputSchema: {
      type: 'object',
      properties: {
        seedId: { type: 'string', description: 'Seed corpus reference ID' },
        metadata: { type: 'object', description: 'Additional particle metadata' },
      },
    },
  },
  {
    name: 'transform_particle',
    description: 'Transform a particle to a different layer (L0-L4)',
    inputSchema: {
      type: 'object',
      properties: {
        particleId: { type: 'string', description: 'Target particle ID' },
        targetLayer: {
          type: 'string',
          enum: ['L0_seed', 'L1_gate', 'L2_flow', 'L3_echo', 'L4_world'],
        },
      },
      required: ['particleId', 'targetLayer'],
    },
  },
  {
    name: 'translate_text',
    description: 'Translate text using EchoPersona (human ↔ particle)',
    inputSchema: {
      type: 'object',
      properties: {
        text: { type: 'string' },
        direction: { type: 'string', enum: ['to-particle', 'to-human'] },
        personaId: { type: 'string' },
      },
      required: ['text', 'direction'],
    },
  },
  {
    name: 'lookup_fluin',
    description: 'Look up a particle key in the Fluin reverse-mapping dictionary',
    inputSchema: {
      type: 'object',
      properties: {
        particleKey: { type: 'string', description: 'Particle key to look up' },
      },
      required: ['particleKey'],
    },
  },
];

// --- Health Check ---
app.get('/health', (_req, res) => {
  res.json({
    status: 'healthy',
    service: 'mcp-gateway',
    version: '1.0.0',
    transport: MCP_TRANSPORT,
    toolCount: MCP_TOOLS.length,
  });
});

// --- MCP: List Tools ---
app.get('/mcp/tools', (_req, res) => {
  res.json({ tools: MCP_TOOLS });
});

// --- MCP: Call Tool ---
app.post('/mcp/tools/call', async (req, res) => {
  const { name, arguments: args } = req.body;
  const tool = MCP_TOOLS.find((t) => t.name === name);
  if (!tool) return res.status(404).json({ error: `Unknown tool: ${name}` });

  try {
    let result;
    switch (name) {
      case 'spawn_particle':
        result = { message: `Particle spawned (proxy to ${PARTICLE_RUNTIME_URL})`, args };
        break;
      case 'transform_particle':
        result = { message: `Transform request for ${args.particleId} -> ${args.targetLayer}`, args };
        break;
      case 'translate_text':
        result = { message: `Translation via EchoPersona (${ECHO_PERSONA_URL})`, args };
        break;
      case 'lookup_fluin':
        result = { message: `Fluin lookup for key: ${args.particleKey}`, args };
        break;
      default:
        result = { error: 'Not implemented' };
    }

    res.json({
      content: [{ type: 'text', text: JSON.stringify(result) }],
      isError: false,
    });
  } catch (err) {
    res.json({
      content: [{ type: 'text', text: `Error: ${err.message}` }],
      isError: true,
    });
  }
});

// --- MCP: List Resources ---
app.get('/mcp/resources', (_req, res) => {
  res.json({
    resources: [
      {
        uri: 'particle://runtime/state',
        name: 'Particle Runtime State',
        mimeType: 'application/json',
      },
      {
        uri: 'particle://persona/registry',
        name: 'EchoPersona Registry',
        mimeType: 'application/json',
      },
      {
        uri: 'particle://fluin/dictionary',
        name: 'Fluin Particle Dictionary',
        mimeType: 'application/json',
      },
    ],
  });
});

// --- MCP: SSE Stream (Streamable HTTP transport) ---
app.get('/mcp/sse', (req, res) => {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
  });

  res.write(`data: ${JSON.stringify({ type: 'connection', status: 'established' })}\n\n`);

  const heartbeat = setInterval(() => {
    res.write(`data: ${JSON.stringify({ type: 'heartbeat', at: new Date().toISOString() })}\n\n`);
  }, 30000);

  req.on('close', () => {
    clearInterval(heartbeat);
  });
});

app.listen(PORT, () => {
  console.log(`[mcp-gateway] MCP Gateway running on port ${PORT}`);
  console.log(`[mcp-gateway] Transport: ${MCP_TRANSPORT}`);
  console.log(`[mcp-gateway] Tools: ${MCP_TOOLS.map((t) => t.name).join(', ')}`);
});

module.exports = app;
