/**
 * EchoPersona Translation Module
 *
 * Bidirectional translation and persona mapping:
 * - Human-readable ↔ Particle representation translation
 * - Persona state synchronization
 * - SeedOrigin.Persona.Core integration
 */

const express = require('express');
const { v4: uuidv4 } = require('uuid');

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3001;
const PARTICLE_RUNTIME_URL = process.env.PARTICLE_RUNTIME_URL || 'http://localhost:3000';

// Persona registry
const personas = new Map();

// --- Health Check ---
app.get('/health', (_req, res) => {
  res.json({
    status: 'healthy',
    service: 'echo-persona',
    version: '1.0.0',
    personaCount: personas.size,
  });
});

// --- Register Persona ---
app.post('/persona/register', (req, res) => {
  const { name, translationMode, coreConfig } = req.body;
  const persona = {
    id: uuidv4(),
    name: name || 'anonymous',
    translationMode: translationMode || 'bidirectional',
    syncVersion: 1,
    stateHash: null,
    coreConfig: coreConfig || {},
    createdAt: new Date().toISOString(),
  };
  personas.set(persona.id, persona);
  res.status(201).json(persona);
});

// --- Translate: Human → Particle ---
app.post('/translate/to-particle', (req, res) => {
  const { text, personaId } = req.body;
  if (!text) return res.status(400).json({ error: 'text is required' });

  // Translation logic placeholder
  const particleRepresentation = {
    translationId: uuidv4(),
    personaId: personaId || null,
    input: text,
    particleForm: {
      tokens: text.split(/\s+/).length,
      layer: 'L2_flow',
      encoding: 'echo-v1',
    },
    translatedAt: new Date().toISOString(),
  };

  res.json(particleRepresentation);
});

// --- Translate: Particle → Human ---
app.post('/translate/to-human', (req, res) => {
  const { particleData, personaId } = req.body;
  if (!particleData) return res.status(400).json({ error: 'particleData is required' });

  const humanReadable = {
    translationId: uuidv4(),
    personaId: personaId || null,
    input: particleData,
    humanForm: {
      text: `[EchoPersona] Translated particle from layer ${particleData.layer || 'unknown'}`,
      confidence: 0.95,
    },
    translatedAt: new Date().toISOString(),
  };

  res.json(humanReadable);
});

// --- Sync Persona State ---
app.post('/persona/:id/sync', (req, res) => {
  const persona = personas.get(req.params.id);
  if (!persona) return res.status(404).json({ error: 'Persona not found' });

  persona.syncVersion += 1;
  persona.stateHash = `hash-${Date.now()}`;

  res.json({
    personaId: persona.id,
    syncVersion: persona.syncVersion,
    stateHash: persona.stateHash,
    syncedAt: new Date().toISOString(),
  });
});

// --- List Personas ---
app.get('/personas', (_req, res) => {
  const list = Array.from(personas.values());
  res.json({ count: list.length, personas: list });
});

app.listen(PORT, () => {
  console.log(`[echo-persona] Translation module running on port ${PORT}`);
  console.log(`[echo-persona] Particle Runtime: ${PARTICLE_RUNTIME_URL}`);
});

module.exports = app;
