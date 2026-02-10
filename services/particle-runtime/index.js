/**
 * Mrliou Particle Runtime - L1 Gate
 *
 * Core engine for particle lifecycle management:
 * - Particle spawn (from SeedCorpus)
 * - Transform (L0 -> L4 layer transitions)
 * - Decay and restore operations
 * - Fluin dictionary reverse-mapping integration
 */

const express = require('express');
const { v4: uuidv4 } = require('uuid');

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;
const LOG_LEVEL = process.env.LOG_LEVEL || 'info';

// In-memory particle store (replaced by ClickHouse in production)
const particles = new Map();

const LAYERS = ['L0_seed', 'L1_gate', 'L2_flow', 'L3_echo', 'L4_world'];

// --- Health Check ---
app.get('/health', (_req, res) => {
  res.json({
    status: 'healthy',
    service: 'particle-runtime',
    version: '1.3.0',
    uptime: process.uptime(),
    particleCount: particles.size,
  });
});

// --- Spawn Particle ---
app.post('/particles/spawn', (req, res) => {
  const { seedId, metadata } = req.body;
  const particle = {
    id: uuidv4(),
    seedId: seedId || 'anonymous',
    layer: 'L1_gate',
    state: 'active',
    metadata: metadata || {},
    history: [{ event: 'spawn', layer: 'L1_gate', at: new Date().toISOString() }],
    createdAt: new Date().toISOString(),
  };
  particles.set(particle.id, particle);
  res.status(201).json(particle);
});

// --- Get Particle ---
app.get('/particles/:id', (req, res) => {
  const particle = particles.get(req.params.id);
  if (!particle) return res.status(404).json({ error: 'Particle not found' });
  res.json(particle);
});

// --- Transform Particle (Layer Transition) ---
app.post('/particles/:id/transform', (req, res) => {
  const particle = particles.get(req.params.id);
  if (!particle) return res.status(404).json({ error: 'Particle not found' });

  const { targetLayer } = req.body;
  if (!LAYERS.includes(targetLayer)) {
    return res.status(400).json({ error: `Invalid layer. Must be one of: ${LAYERS.join(', ')}` });
  }

  const previousLayer = particle.layer;
  particle.layer = targetLayer;
  particle.history.push({
    event: 'transform',
    from: previousLayer,
    to: targetLayer,
    at: new Date().toISOString(),
  });

  res.json(particle);
});

// --- Restore Particle ---
app.post('/particles/:id/restore', (req, res) => {
  const particle = particles.get(req.params.id);
  if (!particle) return res.status(404).json({ error: 'Particle not found' });

  particle.state = 'active';
  particle.layer = 'L0_seed';
  particle.history.push({
    event: 'restore',
    layer: 'L0_seed',
    at: new Date().toISOString(),
  });

  res.json(particle);
});

// --- List All Particles ---
app.get('/particles', (_req, res) => {
  const list = Array.from(particles.values());
  res.json({ count: list.length, particles: list });
});

// --- Fluin Dictionary Lookup (反推映射) ---
app.get('/fluin/lookup/:key', (req, res) => {
  // Placeholder: integrate with ClickHouse fluin_dictionary table
  res.json({
    particleKey: req.params.key,
    reverseMap: null,
    message: 'Fluin dictionary - connect ClickHouse for full reverse mapping',
  });
});

app.listen(PORT, () => {
  console.log(`[particle-runtime] L1 Gate running on port ${PORT} (log: ${LOG_LEVEL})`);
});

module.exports = app;
