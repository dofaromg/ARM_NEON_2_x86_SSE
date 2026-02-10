#!/bin/bash
set -euo pipefail

# =============================================================================
# Mrliou Particle System - Container Entrypoint
# Manages: ParticleRuntime, EchoPersona, MCP Gateway, Particle Chat
# =============================================================================

SERVICE="${1:-all}"

log() {
    echo "[$(date -u '+%Y-%m-%dT%H:%M:%SZ')] [mrliou-particle] $*"
}

start_particle_runtime() {
    log "Starting Particle Runtime (L1 Gate)..."
    cd /app/services/particle-runtime
    node index.js &
    PARTICLE_PID=$!
    log "Particle Runtime started (PID: $PARTICLE_PID) on port 3000"
}

start_echo_persona() {
    log "Starting EchoPersona Translation Module..."
    cd /app/services/echo-persona
    node index.js &
    ECHO_PID=$!
    log "EchoPersona started (PID: $ECHO_PID) on port 3001"
}

start_mcp_gateway() {
    log "Starting MCP Gateway..."
    cd /app/services/mcp-gateway
    node index.js &
    MCP_PID=$!
    log "MCP Gateway started (PID: $MCP_PID) on port 3002"
}

start_particle_chat() {
    log "Starting Particle Chat v42..."
    cd /app/services/particle-chat
    node index.js &
    CHAT_PID=$!
    log "Particle Chat started (PID: $CHAT_PID) on port 3003"
}

shutdown() {
    log "Shutting down services..."
    kill "$PARTICLE_PID" "$ECHO_PID" "$MCP_PID" "$CHAT_PID" 2>/dev/null || true
    wait
    log "All services stopped."
    exit 0
}

trap shutdown SIGTERM SIGINT

case "$SERVICE" in
    all)
        start_particle_runtime
        start_echo_persona
        start_mcp_gateway
        start_particle_chat
        ;;
    particle-runtime) start_particle_runtime ;;
    echo-persona)     start_echo_persona ;;
    mcp-gateway)      start_mcp_gateway ;;
    particle-chat)    start_particle_chat ;;
    *)
        log "Unknown service: $SERVICE"
        log "Usage: entrypoint.sh {all|particle-runtime|echo-persona|mcp-gateway|particle-chat}"
        exit 1
        ;;
esac

log "All requested services are running."
wait
