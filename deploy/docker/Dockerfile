# =============================================================================
# Mrliou Particle System - Multi-stage Docker Build
# Target: AWS ECR Container Registry
# Components: ParticleRuntime L1 Gate, EchoPersona, MCP Gateway, Particle Chat
# =============================================================================

# --- Stage 1: Build NEON_2_SSE native library ---
FROM debian:bookworm-slim AS neon-builder

RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential cmake gcc g++ \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /build
COPY NEON_2_SSE.h CMakeLists.txt ./
COPY cmake/ cmake/

RUN mkdir -p _builds && cd _builds \
    && cmake .. -DCMAKE_INSTALL_PREFIX=/opt/neon2sse \
    && cmake --build . \
    && cmake --install .

# --- Stage 2: Particle Runtime base ---
FROM node:20-bookworm-slim AS runtime-base

RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 python3-pip gnupg2 curl ca-certificates \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy NEON_2_SSE headers for native addon compilation
COPY --from=neon-builder /opt/neon2sse/include/ /usr/local/include/

# --- Stage 3: Particle Chat v42 + EchoPersona ---
FROM runtime-base AS particle-system

# Install service dependencies
COPY services/particle-chat/package*.json ./services/particle-chat/
RUN cd services/particle-chat && npm ci --production 2>/dev/null || true

COPY services/echo-persona/package*.json ./services/echo-persona/
RUN cd services/echo-persona && npm ci --production 2>/dev/null || true

COPY services/mcp-gateway/package*.json ./services/mcp-gateway/
RUN cd services/mcp-gateway && npm ci --production 2>/dev/null || true

COPY services/particle-runtime/package*.json ./services/particle-runtime/
RUN cd services/particle-runtime && npm ci --production 2>/dev/null || true

# Copy all service source code
COPY services/ ./services/
COPY config/ ./config/

# GPG key setup for signature verification
RUN mkdir -p /app/.gnupg && chmod 700 /app/.gnupg

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
    CMD curl -f http://localhost:3000/health || exit 1

EXPOSE 3000 3001 3002 3003

# Default entrypoint
COPY deploy/docker/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh
ENTRYPOINT ["/entrypoint.sh"]
CMD ["all"]
