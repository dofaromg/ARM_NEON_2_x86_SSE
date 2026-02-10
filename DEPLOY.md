# Mr.Liou Particle System - Deployment Guide

## Architecture Overview

```
                    +------------------+
                    |  Particle Chat   |  :3003
                    |      v42         |
                    +--------+---------+
                             |
              +--------------+--------------+
              |              |              |
     +--------+---+  +------+------+  +----+--------+
     |  MCP       |  | EchoPersona |  |  Particle   |
     |  Gateway   |  | Translation |  |  Runtime    |
     |  :3002     |  |  :3001      |  |  L1 Gate    |
     +--------+---+  +------+------+  |  :3000      |
              |              |         +----+--------+
              +--------------+--------------+
                             |
                    +--------+---------+
                    |   ClickHouse     |
                    |  mrliou_particles|
                    |  :8123 / :9000   |
                    +------------------+
```

## Layer Model (L0 - L4)

| Layer | Name | Components |
|-------|------|------------|
| L0 | Seed | SeedCorpus, SeedOrigin.Persona.Core |
| L1 | Gate | ParticleRuntime, L1 Gate spawn/lifecycle |
| L2 | Flow | FlowAgent, SystemFusion.FusionSync, MCP Gateway |
| L3 | Echo | EchoPersona, MemoryMerge.Adapter |
| L4 | World | ParticleEarthNav, SemanticGlobeViewer |

## Quick Start (Local)

```bash
# 1. Copy environment config
cp .env.example .env

# 2. Start all services
docker-compose up -d

# 3. Verify health
curl http://localhost:3000/health   # Particle Runtime
curl http://localhost:3001/health   # EchoPersona
curl http://localhost:3002/health   # MCP Gateway
curl http://localhost:3003/health   # Particle Chat
```

## Deploy to AWS ECR

### Prerequisites
- AWS CLI configured with appropriate permissions
- Docker installed
- ECR repository access (see `deploy/aws/ecr-policy.json`)

### Manual Deploy
```bash
export AWS_ACCOUNT_ID=your-account-id
export AWS_REGION=ap-northeast-1
./deploy/deploy.sh staging    # or: production
```

### CI/CD (GitHub Actions)
Push to `main` triggers automatic build and deploy. See `.github/workflows/deploy-ecr.yml`.

Required GitHub Secrets:
- `AWS_ROLE_ARN` - IAM role for ECR access

## Services

### Particle Runtime (L1 Gate) - Port 3000
- `POST /particles/spawn` - Spawn new particle
- `GET /particles/:id` - Get particle state
- `POST /particles/:id/transform` - Transform layer
- `POST /particles/:id/restore` - Restore particle
- `GET /fluin/lookup/:key` - Fluin dictionary lookup

### EchoPersona - Port 3001
- `POST /persona/register` - Register persona
- `POST /translate/to-particle` - Human to particle
- `POST /translate/to-human` - Particle to human
- `POST /persona/:id/sync` - Sync persona state

### MCP Gateway - Port 3002
- `GET /mcp/tools` - List MCP tools
- `POST /mcp/tools/call` - Call MCP tool
- `GET /mcp/resources` - List MCP resources
- `GET /mcp/sse` - SSE stream (Streamable HTTP)

### Particle Chat v42 - Port 3003
- `POST /chat/session` - Create chat session
- `POST /chat/session/:id/message` - Send message
- `GET /chat/session/:id` - Get session history
- `GET /system/info` - System information

## Plugin Ecosystem

| Plugin | Description |
|--------|-------------|
| SourceRealityMap.flpkg | Source reality mapping |
| RoleMatch.Recommender.Core.flpkg | Role matching |
| UniversalMediaModules.v1.flpkg | Media processing |
| Seal.v1.flpkg | Signature sealing |
| MemoryMerge.Adapter.flpkg | Memory merge adapter |
| ParticleEarthNav.NewWorld.flpkg | Earth navigation |
