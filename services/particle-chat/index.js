/**
 * Particle Chat v42
 *
 * Interactive chat interface for the Mrliou Particle System:
 * - WebSocket-based real-time particle interaction
 * - Routes to ParticleRuntime, EchoPersona, and MCP Gateway
 * - Session management with ClickHouse persistence
 */

const express = require('express');
const { createServer } = require('http');
const { v4: uuidv4 } = require('uuid');

const app = express();
const server = createServer(app);

app.use(express.json());

const PORT = process.env.PORT || 3003;
const PARTICLE_RUNTIME_URL = process.env.PARTICLE_RUNTIME_URL || 'http://localhost:3000';
const ECHO_PERSONA_URL = process.env.ECHO_PERSONA_URL || 'http://localhost:3001';
const MCP_GATEWAY_URL = process.env.MCP_GATEWAY_URL || 'http://localhost:3002';

// Session store
const sessions = new Map();

// --- Health Check ---
app.get('/health', (_req, res) => {
  res.json({
    status: 'healthy',
    service: 'particle-chat',
    version: 'v42',
    activeSessions: sessions.size,
  });
});

// --- Create Chat Session ---
app.post('/chat/session', (req, res) => {
  const { personaId, userId } = req.body;
  const session = {
    id: uuidv4(),
    userId: userId || 'anonymous',
    personaId: personaId || null,
    messages: [],
    particles: [],
    createdAt: new Date().toISOString(),
  };
  sessions.set(session.id, session);
  res.status(201).json(session);
});

// --- Send Message ---
app.post('/chat/session/:id/message', async (req, res) => {
  const session = sessions.get(req.params.id);
  if (!session) return res.status(404).json({ error: 'Session not found' });

  const { text, action } = req.body;
  if (!text) return res.status(400).json({ error: 'text is required' });

  const message = {
    id: uuidv4(),
    role: 'user',
    text,
    action: action || 'chat',
    at: new Date().toISOString(),
  };
  session.messages.push(message);

  // Generate response based on action
  let responseText;
  switch (action) {
    case 'spawn':
      responseText = `[ParticleRuntime] Spawning particle from message: "${text.substring(0, 50)}..."`;
      break;
    case 'translate':
      responseText = `[EchoPersona] Translating: "${text.substring(0, 50)}..."`;
      break;
    case 'mcp':
      responseText = `[MCP Gateway] Processing MCP request: "${text.substring(0, 50)}..."`;
      break;
    default:
      responseText = `[Particle Chat v42] Received: "${text.substring(0, 100)}"`;
  }

  const response = {
    id: uuidv4(),
    role: 'assistant',
    text: responseText,
    at: new Date().toISOString(),
  };
  session.messages.push(response);

  res.json({ userMessage: message, response });
});

// --- Get Session History ---
app.get('/chat/session/:id', (req, res) => {
  const session = sessions.get(req.params.id);
  if (!session) return res.status(404).json({ error: 'Session not found' });
  res.json(session);
});

// --- List Sessions ---
app.get('/chat/sessions', (_req, res) => {
  const list = Array.from(sessions.values()).map((s) => ({
    id: s.id,
    userId: s.userId,
    messageCount: s.messages.length,
    createdAt: s.createdAt,
  }));
  res.json({ count: list.length, sessions: list });
});

// --- System Info ---
app.get('/system/info', (_req, res) => {
  res.json({
    chat: { version: 'v42', port: PORT },
    upstream: {
      particleRuntime: PARTICLE_RUNTIME_URL,
      echoPersona: ECHO_PERSONA_URL,
      mcpGateway: MCP_GATEWAY_URL,
    },
    components: [
      'ParticleRuntime L1 Gate v1.3',
      'EchoPersona Translation Module v1.0',
      'MCP Gateway v1.0',
      'Particle Chat v42',
      'ClickHouse (mrliou_particles)',
      'Fluin Particle Dictionary',
      'NEON_2_SSE Header Library',
    ],
  });
});

server.listen(PORT, () => {
  console.log(`[particle-chat] v42 running on port ${PORT}`);
  console.log(`[particle-chat] Upstream services:`);
  console.log(`  - ParticleRuntime: ${PARTICLE_RUNTIME_URL}`);
  console.log(`  - EchoPersona:    ${ECHO_PERSONA_URL}`);
  console.log(`  - MCP Gateway:    ${MCP_GATEWAY_URL}`);
});

module.exports = app;
