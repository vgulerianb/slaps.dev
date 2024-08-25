# Sandcastle — Programmable Sandbox Infrastructure for AI Agents

> The runtime layer for AI coding agents. Fast, cheap, isolated execution environments with Python and Node.js out of the box.

---

## Table of Contents

1. [Vision](#vision)
2. [Architecture Overview](#architecture-overview)
3. [Core Components](#core-components)
4. [Execution Modes](#execution-modes)
5. [SDK Design (npm + pip)](#sdk-design)
6. [Resource Management & Limits](#resource-management--limits)
7. [Queue System](#queue-system)
8. [Package Management](#package-management)
9. [Filesystem Model](#filesystem-model)
10. [Network & Security](#network--security)
11. [Observability & Telemetry](#observability--telemetry)
12. [API Server](#api-server)
13. [Project Structure](#project-structure)
14. [MVP Scope (Phase 1)](#mvp-scope-phase-1)
15. [Phase 2](#phase-2)
16. [Phase 3](#phase-3)
17. [Tech Stack Summary](#tech-stack-summary)

---

## Vision

Sandcastle provides programmable, sandboxed execution environments designed for AI agents at scale.

The core insight: most agent tasks are small (run a script, process data, call an API). These should be nearly free and instant. Heavy tasks (ML training, large installs) should be seamlessly handled by scaling up — without the developer changing their code.

**Target users:**
- Companies building AI coding agents
- Platform teams building internal AI-powered developer tools
- AI SDK/framework authors who need safe execution for agent-generated code

**Out-of-the-box runtimes:**
- Python 3.12+
- Node.js 20+ / TypeScript
- Bash/Shell (always available)
- SQLite (built-in)

---

## Architecture Overview

```
                     ┌──────────────────────────────┐
                     │        Sandcastle API         │
                     │     (Rust, stateless, HTTP     │
                     │      + gRPC + WebSocket)      │
                     └─────┬────────┬────────┬───────┘
                           │        │        │
              ┌────────────┘        │        └────────────┐
              ▼                     ▼                     ▼
        ┌──────────┐        ┌────────────┐        ┌──────────────┐
        │ Mode 1   │        │  Mode 2    │        │   Mode 3     │
        │ In-Proc  │        │ Worker Pod │        │ Firecracker  │
        │ (WASM)   │        │            │        │   microVM    │
        │          │        │            │        │              │
        │ ~1ms     │        │ ~500ms     │        │ ~1-3s        │
        │ start    │        │ start      │        │ start        │
        └──────────┘        └────────────┘        └──────────────┘
              │                     │                     │
              └─────────┬───────────┘                     │
                        ▼                                 │
                 ┌─────────────┐                          │
                 │   Queue +   │◄─────────────────────────┘
                 │ Scheduler   │
                 └──────┬──────┘
                        │
                        ▼
                 ┌─────────────┐
                 │  Pod Pool   │
                 │  Manager    │
                 │ (warm pools,│
                 │ autoscaler) │
                 └─────────────┘
```

---

## Core Components

### 1. API Server (Rust)

The entry point for all SDK calls. Stateless, horizontally scalable.

**Responsibilities:**
- Authenticate and authorize requests
- Route to correct execution mode (WASM / Pod / VM)
- Manage sandbox lifecycle (create, exec, snapshot, destroy)
- Stream command output via WebSocket
- Serve queue status and resource telemetry
- Rate limiting per tenant

**Tech:** Rust, axum (HTTP), tonic (gRPC), tokio (async runtime)

### 2. WASM Runtime Host (Rust, embedded in API Server)

Handles Mode 1 (in-process) execution.

**Responsibilities:**
- Host Python (CPython WASM) and JS (QuickJS WASM) runtimes
- Manage per-sandbox memory limits via WASM linear memory caps
- Implement virtual filesystem in-process
- Enforce command timeouts via fuel/instruction budgets

**Tech:** Rust, wasmtime

### 3. Queue + Scheduler (Rust)

Sits between the API server and the pod pool.

**Responsibilities:**
- Accept sandbox creation requests when resources are exhausted
- Order by priority tier (critical > high > normal > low)
- Fair scheduling across tenants (weighted round-robin)
- Track queue depth, position, estimated wait time
- Drain queue as capacity becomes available
- Reject requests that exceed `maxWait` or tenant queue caps

**Tech:** Rust, in-memory priority queue backed by Redis for persistence/HA

### 4. Pod Pool Manager (Rust)

Manages warm pod pools and autoscaling for Mode 2.

**Responsibilities:**
- Maintain warm pools per stack (python-3.12, node-20, python-node, etc.)
- Pre-provision pods based on usage patterns
- Autoscale: scale up when queue depth > threshold, scale down when idle
- Handle pod lifecycle: create, assign to sandbox, reclaim on sandbox destroy
- Mount cached package layers onto pods

**Tech:** Rust, kube-rs (Kubernetes client)

### 5. Worker Pod Agent (Rust)

Small binary that runs inside each worker pod.

**Responsibilities:**
- Listen for commands from API server over gRPC stream
- Execute commands (spawn processes), capture stdout/stderr/exit code
- Report resource usage (memory peak, CPU time, disk usage)
- Enforce per-command timeouts
- Manage the overlay filesystem write layer

**Tech:** Rust, ~5MB static binary

### 6. Package Cache (shared infrastructure)

Content-addressable cache of pre-built package layers.

**Responsibilities:**
- Cache pip and npm package installations as filesystem layers
- Key: hash(runtime + package + version + platform)
- Mount as read-only into pods
- Auto-promote frequently agent-installed packages to cached layers

**Tech:** OCI-compatible layer storage (can use container registry as backend)

---

## Execution Modes

### Mode 1: In-Process WASM

**When selected:** Lightweight tasks, no heavy packages, memory < 256MB.

```
API Server process
├── WASM sandbox 1 (Python, 64MB)
├── WASM sandbox 2 (JS, 64MB)
├── WASM sandbox 3 (Python, 128MB)
└── ...hundreds concurrent
```

- ~1ms cold start
- 64-256MB memory cap
- Virtual filesystem (in-memory)
- No real package installs (pre-compiled WASM modules only)
- Cheapest tier

### Mode 2: Worker Pod

**When selected:** Needs real packages, more memory, or longer-running tasks.

```
Worker Pod (Kubernetes)
├── sandcastle-agent (Rust, gRPC listener)
├── Python 3.12 runtime
├── Node 20 runtime
├── Mounted package layers (read-only)
└── Ephemeral write layer (tmpfs)
```

- ~500ms cold start (from warm pool)
- Configurable resources (memory, CPU, disk)
- Real `pip install` / `npm install` supported
- Full Linux environment

### Mode 3: Firecracker microVM (Phase 3)

**When selected:** Untrusted code, GPU, custom binaries, compliance requirements.

- ~1-3s cold start
- Full VM isolation
- GPU passthrough possible
- Custom base images
- Most expensive tier

### Auto-Selection Logic

```
if no packages AND memory.max <= 256Mi     → Mode 1 (WASM)
if packages fit a cached layer             → Mode 1 with pre-mounted layer
if needs install OR memory.max > 256Mi     → Mode 2 (Worker Pod)
if needs GPU OR custom binary              → Mode 3 (Firecracker VM)
```

Users can also force a mode:

```python
sandbox = Sandcastle.create(mode="pod", ...)
```

---

## SDK Design

Two official SDKs shipping on day one: **npm** and **pip**.

Both SDKs are thin HTTP/WebSocket clients that talk to the Sandcastle API server. No heavy logic in the SDK — the server does the work.

### npm Package: `sandcastle-sdk`

```bash
npm install sandcastle-sdk
```

```typescript
import { Sandcastle } from "sandcastle-sdk";

// Initialize client
const client = new Sandcastle({
  apiKey: process.env.SANDCASTLE_API_KEY,
  baseUrl: "https://api.sandcastle.dev",  // or self-hosted
});

// Create a sandbox
const sandbox = await client.create({
  size: "small",                           // presets: small, medium, large
  // OR fine-grained:
  // resources: { memory: { min: "256Mi", max: "2Gi" }, cpu: { max: "2" } },
  packages: {
    pip: ["pandas", "requests"],
    npm: ["zod"],
  },
  env: { API_KEY: "..." },                // environment variables
  timeout: "30m",                          // sandbox TTL
  queue: { maxWait: "2m", priority: "normal" },
  onQueueStatus: (status) => {             // optional queue visibility
    console.log(`Position: ${status.position}, ETA: ${status.estimatedWait}`);
  },
});

// Execute commands
const result = await sandbox.exec("python3 -c 'import pandas; print(pandas.__version__)'");
console.log(result.stdout);     // "2.1.0\n"
console.log(result.exitCode);   // 0
console.log(result.resources);  // { memoryPeakMb: 48, cpuTimeMs: 320, wallTimeMs: 410, diskUsedMb: 0 }

// Execute with streaming output
const stream = sandbox.execStream("python3 train.py");
stream.on("stdout", (chunk) => process.stdout.write(chunk));
stream.on("stderr", (chunk) => process.stderr.write(chunk));
const finalResult = await stream.done();

// File operations
await sandbox.writeFile("/workspace/data.csv", "col1,col2\na,b\n");
const content = await sandbox.readFile("/workspace/data.csv");
const files = await sandbox.listFiles("/workspace/");

// Snapshot & fork
const snapshotId = await sandbox.snapshot("before-experiment");
const fork1 = await client.fork(snapshotId);
const fork2 = await client.fork(snapshotId);
// fork1 and fork2 start from identical state, diverge independently

// Resource usage
const usage = sandbox.usage();
// { memoryCurrentMb: 124, cpuTimeMs: 4500, diskUsedMb: 312, uptime: "4m12s" }

// Queue & capacity status
const status = await client.status();
// { capacity: { total: {...}, used: {...}, free: {...} }, queue: { depth: 3, estimatedWait: "15s" } }

// Cleanup
await sandbox.destroy();
```

#### TypeScript Types

```typescript
interface SandcastleConfig {
  apiKey: string;
  baseUrl?: string;          // default: https://api.sandcastle.dev
  timeout?: number;          // default client timeout in ms
}

interface CreateOptions {
  size?: "small" | "medium" | "large";
  mode?: "auto" | "wasm" | "pod" | "vm";
  resources?: ResourceConfig;
  packages?: PackageConfig;
  env?: Record<string, string>;
  timeout?: string;           // sandbox TTL: "30m", "1h", "24h"
  commandTimeout?: string;    // per-command max: "5m", "30m"
  queue?: QueueConfig;
  onQueueStatus?: (status: QueueStatus) => void;
}

interface ResourceConfig {
  memory?: { min?: string; max?: string };  // e.g. "256Mi", "2Gi"
  cpu?: { min?: string; max?: string };     // e.g. "0.5", "2"
  disk?: { max?: string };                  // e.g. "5Gi"
}

interface PackageConfig {
  pip?: string[];
  npm?: string[];
  allowAgentInstall?: boolean;   // allow runtime installs, default true
  maxInstallSize?: string;       // e.g. "500Mi"
}

interface QueueConfig {
  maxWait?: string;              // e.g. "5m"
  priority?: "critical" | "high" | "normal" | "low";
}

interface ExecResult {
  stdout: string;
  stderr: string;
  exitCode: number;
  resources: {
    memoryPeakMb: number;
    cpuTimeMs: number;
    wallTimeMs: number;
    diskUsedMb: number;
  };
}

interface QueueStatus {
  state: "queued" | "provisioning" | "ready";
  position?: number;
  estimatedWait?: string;
}
```

### pip Package: `sandcastle-sdk`

```bash
pip install sandcastle-sdk
```

```python
from sandcastle import Sandcastle

# Initialize client
client = Sandcastle(
    api_key=os.environ["SANDCASTLE_API_KEY"],
    base_url="https://api.sandcastle.dev",  # or self-hosted
)

# Create a sandbox
sandbox = await client.create(
    size="small",
    packages={
        "pip": ["pandas", "requests"],
        "npm": ["zod"],
    },
    env={"API_KEY": "..."},
    timeout="30m",
    queue={"max_wait": "2m", "priority": "normal"},
)

# Execute commands
result = await sandbox.exec("python3 -c 'import pandas; print(pandas.__version__)'")
print(result.stdout)      # "2.1.0\n"
print(result.exit_code)   # 0
print(result.resources)   # ResourceUsage(memory_peak_mb=48, cpu_time_ms=320, ...)

# Streaming output
async for chunk in sandbox.exec_stream("python3 train.py"):
    print(chunk.data, end="")

# File operations
await sandbox.write_file("/workspace/data.csv", "col1,col2\na,b\n")
content = await sandbox.read_file("/workspace/data.csv")
files = await sandbox.list_files("/workspace/")

# Snapshot & fork
snapshot_id = await sandbox.snapshot("before-experiment")
fork1 = await client.fork(snapshot_id)
fork2 = await client.fork(snapshot_id)

# Cleanup
await sandbox.destroy()

# Context manager support
async with await client.create(size="medium") as sandbox:
    result = await sandbox.exec("echo hello")
    # auto-destroyed on exit
```

#### Sync API (for simpler use cases)

```python
from sandcastle import SandcastleSync

client = SandcastleSync(api_key="...")
sandbox = client.create(size="small")
result = sandbox.exec("python3 -c 'print(1+1)'")
print(result.stdout)  # "2\n"
sandbox.destroy()
```

### SDK Parity

Both SDKs expose identical capabilities:

| Feature | npm (`sandcastle-sdk`) | pip (`sandcastle-sdk`) |
|---|---|---|
| Create sandbox | `client.create()` | `client.create()` |
| Execute command | `sandbox.exec()` | `sandbox.exec()` |
| Stream output | `sandbox.execStream()` | `sandbox.exec_stream()` |
| File read/write | `sandbox.readFile()` / `writeFile()` | `sandbox.read_file()` / `write_file()` |
| Snapshot & fork | `sandbox.snapshot()` / `client.fork()` | `sandbox.snapshot()` / `client.fork()` |
| Queue visibility | `onQueueStatus` callback | async iterator / callback |
| Resource usage | `sandbox.usage()` | `sandbox.usage()` |
| Cluster status | `client.status()` | `client.status()` |
| Destroy | `sandbox.destroy()` | `sandbox.destroy()` |
| Auto-cleanup | - | `async with` context manager |

---

## Resource Management & Limits

### Size Presets

| Size | Memory | CPU | Disk | Best for |
|---|---|---|---|---|
| `small` | 256Mi max | 0.5 | 1Gi | Script execution, text processing |
| `medium` | 1Gi max | 1 | 5Gi | Data processing, package installs |
| `large` | 4Gi max | 2 | 10Gi | ML inference, heavy computation |

### Custom Resources

```python
sandbox = await client.create(
    resources={
        "memory": {"min": "512Mi", "max": "3Gi"},
        "cpu": {"min": "0.5", "max": "1.5"},
        "disk": {"max": "8Gi"},
    },
    timeout="1h",
    command_timeout="15m",
)
```

### Limit Enforcement

| Resource | Enforcement | Behavior when exceeded |
|---|---|---|
| `memory.max` | Hard limit (OOM kill) | Process killed, `ExecResult.exit_code = 137`, clear error message |
| `cpu.max` | Throttle (not kill) | Process slows down, no error |
| `disk.max` | Write fails | `ENOSPC` error on write syscall |
| `command_timeout` | SIGKILL after deadline | `ExecResult.exit_code = 124`, timeout error |
| `timeout` (TTL) | Sandbox destroyed | Connection dropped, `SandboxExpiredError` |

### Resource Reporting

Every `exec()` call returns resource usage:

```python
result.resources
# {
#   "memory_peak_mb": 847,
#   "cpu_time_ms": 12400,
#   "wall_time_ms": 15230,
#   "disk_used_mb": 312,
# }
```

Sandbox-level usage:

```python
sandbox.usage()
# {
#   "memory_current_mb": 124,
#   "cpu_time_total_ms": 45000,
#   "disk_used_mb": 312,
#   "uptime_seconds": 252,
#   "commands_executed": 17,
# }
```

---

## Queue System

### When Queuing Happens

A sandbox creation request enters the queue when:
- Cluster has insufficient free resources for the requested size
- Tenant has hit `maxConcurrentSandboxes` limit
- A specific warm pool is exhausted and new pods need spinning up

### Priority Tiers

```
critical  → Preempts low-priority sandboxes if needed (enterprise only)
high      → Front of queue, no preemption
normal    → Default, FIFO within tier
low       → Back of queue, cheapest pricing
```

### Tenant Fairness

Per-tenant limits prevent noisy neighbors:

```
max_concurrent_sandboxes:  50     # hard cap on running sandboxes
max_queued_requests:       100    # reject beyond this
guaranteed_capacity:       10Gi   # reserved pool
burst_capacity:            50Gi   # can burst into shared pool
```

When multiple tenants are queued, the scheduler uses weighted round-robin — a tenant with 2 queued requests gets served before a tenant with 50, even if the 50 were queued first.

### Queue → Autoscaler Feedback Loop

```
Queue depth > threshold for > 30s  →  Scale up (add warm pods)
Queue empty for > 5m               →  Scale down (drain idle pods)
Specific stack queued often         →  Add more warm pods for that stack
```

### SDK Queue Behavior

```python
# Request blocks until sandbox is ready (or maxWait exceeded)
sandbox = await client.create(
    size="large",
    queue={"max_wait": "5m", "priority": "normal"},
)

# With status visibility
def on_status(status):
    print(f"Queue position: {status['position']}, ETA: {status['estimated_wait']}")

sandbox = await client.create(
    size="large",
    queue={"max_wait": "5m"},
    on_queue_status=on_status,
)
```

---

## Package Management

### Pre-declared packages (fast path)

```python
sandbox = await client.create(
    packages={
        "pip": ["pandas==2.1.0", "requests>=2.31"],
        "npm": ["zod@3.22", "cheerio"],
    },
)
```

- Platform resolves versions, builds a content-addressed package layer
- Cached globally — subsequent requests with the same combo mount instantly
- Mounted read-only into the sandbox

### Agent-initiated installs (runtime)

```bash
# Inside sandbox, agent runs:
pip install beautifulsoup4
npm install lodash
```

- Installs go to the ephemeral write layer
- Network scoped to registries only (`pypi.org`, `registry.npmjs.org`)
- No post-install scripts by default (`--ignore-scripts` for npm)
- Size-capped per sandbox (`maxInstallSize`)
- Fully logged in execution telemetry

### Package config

```python
packages={
    "pip": ["pandas"],
    "npm": ["zod"],
    "allow_agent_install": True,        # default: True
    "max_install_size": "500Mi",        # cap total install size
    "allowed_registries": [             # default: pypi.org + npmjs.org
        "pypi.org",
        "registry.npmjs.org",
        "my-private-registry.com",      # private registries supported
    ],
}
```

---

## Filesystem Model

### Layered Architecture

```
┌─────────────────────────────────────┐
│  Agent Write Layer (ephemeral)      │  ← tmpfs, gone when sandbox dies
├─────────────────────────────────────┤
│  Package Layer (cached, read-only)  │  ← content-addressed, shared across sandboxes
├─────────────────────────────────────┤
│  Base Image Layer (read-only)       │  ← python-3.12, node-20, common tools
└─────────────────────────────────────┘
```

### File Operations via SDK

```python
# Write
await sandbox.write_file("/workspace/input.csv", csv_content)

# Read
content = await sandbox.read_file("/workspace/output.json")

# List
files = await sandbox.list_files("/workspace/")
# [{"name": "input.csv", "size": 1024, "modified": "..."}, ...]

# Upload binary files
await sandbox.upload_file("/workspace/model.pkl", local_path="./model.pkl")

# Download
await sandbox.download_file("/workspace/results.tar.gz", local_path="./results.tar.gz")
```

### Snapshot & Fork

```python
# Capture full filesystem state
snapshot_id = await sandbox.snapshot("checkpoint-1")

# Create new sandboxes from snapshot (same filesystem, independent execution)
fork_a = await client.fork(snapshot_id)
fork_b = await client.fork(snapshot_id)

# Useful for: best-of-N agent strategies, A/B experiments, branching exploration
```

---

## Network & Security

### Network Policy

```python
sandbox = await client.create(
    network={
        "allowed_url_prefixes": [
            "https://api.github.com",
            "https://api.openai.com",
            {
                "url": "https://internal-api.company.com",
                "transform": [{"headers": {"Authorization": "Bearer <injected>"}}],
            },
        ],
        "allowed_methods": ["GET", "HEAD", "POST"],
    },
)
```

- No network access by default
- URL prefix allow-list with origin matching
- Header injection for credentials (secrets never enter sandbox)
- Redirect protection (redirects to non-allowed URLs blocked)
- HTTP method restrictions

### Security Boundaries

| Concern | Mitigation |
|---|---|
| Code execution | Sandbox isolation (WASM / container / VM) |
| Network exfiltration | URL allow-list, no egress by default |
| Resource exhaustion | Memory/CPU/disk limits, command timeouts |
| Supply chain (packages) | Registry allow-list, no post-install scripts by default |
| Sandbox escape | WASM memory isolation (Mode 1), kernel namespaces (Mode 2), VM boundary (Mode 3) |
| Noisy neighbor | Per-tenant resource quotas, fair scheduling |
| Data persistence | Ephemeral write layer, destroyed with sandbox |

---

## Observability & Telemetry

### Per-Command Telemetry

Every `exec()` call is logged with:
- Command string (sanitized)
- stdout / stderr
- Exit code
- Wall time, CPU time, memory peak
- Disk delta
- Network requests made (if any)

### Sandbox-Level Dashboard

```python
sandbox.usage()
# {
#   "id": "sb-abc123",
#   "created_at": "2026-03-20T10:00:00Z",
#   "uptime_seconds": 600,
#   "commands_executed": 42,
#   "memory_current_mb": 234,
#   "memory_peak_mb": 891,
#   "cpu_time_total_ms": 128000,
#   "disk_used_mb": 1200,
#   "packages_installed": ["pandas", "requests", "beautifulsoup4"],
#   "network_requests": 7,
# }
```

### Cluster-Level Status

```python
client.status()
# {
#   "capacity": {"total": {"memory": "64Gi"}, "used": {"memory": "58Gi"}, "free": {"memory": "6Gi"}},
#   "sandboxes": {"running": 142, "queued": 5},
#   "queue": {"depth": 5, "estimated_wait": "12s"},
#   "warm_pools": {
#     "python-node": {"ready": 8, "assigned": 42},
#     "python-3.12": {"ready": 3, "assigned": 18},
#   },
# }
```

### Execution Replay (Phase 2)

Full command history with inputs/outputs, replayable for debugging failed agent runs.

---

## API Server

### REST API

```
POST   /v1/sandboxes                    Create sandbox
GET    /v1/sandboxes/:id                Get sandbox status
DELETE /v1/sandboxes/:id                Destroy sandbox
POST   /v1/sandboxes/:id/exec          Execute command
WS     /v1/sandboxes/:id/exec/stream   Execute with streaming output
POST   /v1/sandboxes/:id/snapshot      Snapshot filesystem
POST   /v1/sandboxes/:id/fork          Fork from snapshot
PUT    /v1/sandboxes/:id/files/*path    Write file
GET    /v1/sandboxes/:id/files/*path    Read file
GET    /v1/sandboxes/:id/files          List files
GET    /v1/sandboxes/:id/usage          Resource usage
GET    /v1/status                       Cluster status & queue info
GET    /v1/health                       Health check
```

### Authentication

- API key in `Authorization: Bearer <key>` header
- API keys scoped to tenants with configurable permissions
- Rate limiting per key

---

## Project Structure

```
sandcastle/
├── PLAN.md                          # this file
│
├── core/                            # Rust — API server, runtime host, scheduler
│   ├── Cargo.toml
│   ├── src/
│   │   ├── main.rs                  # API server entrypoint
│   │   ├── api/                     # HTTP + WebSocket handlers
│   │   │   ├── mod.rs
│   │   │   ├── sandboxes.rs         # CRUD + exec endpoints
│   │   │   ├── files.rs             # File operations
│   │   │   ├── status.rs            # Cluster status
│   │   │   └── auth.rs              # API key auth middleware
│   │   ├── runtime/                 # Execution backends
│   │   │   ├── mod.rs
│   │   │   ├── wasm.rs              # Mode 1: in-process WASM
│   │   │   ├── pod.rs               # Mode 2: worker pod orchestration
│   │   │   └── vm.rs                # Mode 3: firecracker (phase 3)
│   │   ├── queue/                   # Queue + scheduler
│   │   │   ├── mod.rs
│   │   │   ├── priority.rs          # Priority queue implementation
│   │   │   ├── scheduler.rs         # Fair scheduling logic
│   │   │   └── autoscaler.rs        # Queue-driven autoscaling
│   │   ├── pool/                    # Pod pool manager
│   │   │   ├── mod.rs
│   │   │   ├── warm_pool.rs         # Warm pod management
│   │   │   └── lifecycle.rs         # Pod create/assign/reclaim
│   │   ├── fs/                      # Filesystem layers
│   │   │   ├── mod.rs
│   │   │   ├── memory.rs            # In-memory FS (WASM mode)
│   │   │   ├── overlay.rs           # Overlay FS (pod mode)
│   │   │   └── snapshot.rs          # Snapshot & fork
│   │   ├── packages/                # Package cache manager
│   │   │   ├── mod.rs
│   │   │   ├── cache.rs             # Content-addressed layer cache
│   │   │   ├── pip.rs               # pip resolution
│   │   │   └── npm.rs               # npm resolution
│   │   ├── telemetry/               # Observability
│   │   │   ├── mod.rs
│   │   │   └── metrics.rs
│   │   └── config.rs                # Server configuration
│   └── tests/
│
├── agent/                           # Rust — worker pod agent binary
│   ├── Cargo.toml
│   ├── src/
│   │   ├── main.rs                  # gRPC listener, command executor
│   │   ├── executor.rs              # Process spawning, output capture
│   │   └── resources.rs             # Resource usage reporting
│   └── Dockerfile                   # Minimal image for the agent binary
│
├── sdk-node/                        # TypeScript — npm SDK
│   ├── package.json
│   ├── tsconfig.json
│   ├── src/
│   │   ├── index.ts                 # Exports
│   │   ├── client.ts                # Sandcastle client
│   │   ├── sandbox.ts               # Sandbox instance
│   │   ├── types.ts                 # TypeScript types
│   │   └── errors.ts                # Error classes
│   └── tests/
│
├── sdk-python/                      # Python — pip SDK
│   ├── pyproject.toml
│   ├── src/
│   │   └── sandcastle/
│   │       ├── __init__.py
│   │       ├── client.py            # Sandcastle client (async)
│   │       ├── client_sync.py       # SandcastleSync (sync wrapper)
│   │       ├── sandbox.py           # Sandbox instance
│   │       ├── types.py             # Dataclasses / TypedDicts
│   │       └── errors.py            # Exception classes
│   └── tests/
│
├── images/                          # Docker — base images
│   ├── python-3.12/
│   │   └── Dockerfile
│   ├── node-20/
│   │   └── Dockerfile
│   └── python-node/                 # Default: both runtimes
│       └── Dockerfile
│
├── deploy/                          # Kubernetes manifests / Helm chart
│   ├── helm/
│   │   └── sandcastle/
│   │       ├── Chart.yaml
│   │       ├── values.yaml
│   │       └── templates/
│   └── docker-compose.yaml          # Local dev setup
│
└── docs/                            # Documentation
    ├── getting-started.md
    ├── sdk-reference.md
    ├── self-hosting.md
    └── security.md
```

---

## MVP Scope (Phase 1)

**Goal:** Working end-to-end flow. Create sandbox, execute Python/Node commands, get results. Ship npm + pip SDKs.

**Timeline estimate:** 8-10 weeks

### What's in MVP

- [ ] **API server** (Rust, axum)
  - [ ] `POST /v1/sandboxes` — create sandbox
  - [ ] `POST /v1/sandboxes/:id/exec` — execute command, return stdout/stderr/exitCode
  - [ ] `DELETE /v1/sandboxes/:id` — destroy sandbox
  - [ ] `GET /v1/health` — health check
  - [ ] API key authentication (simple, static keys for now)

- [ ] **Mode 2 only** (Worker Pods) — skip WASM for MVP
  - [ ] Single base image: `python-node` (Python 3.12 + Node 20 + Bash + SQLite)
  - [ ] Worker pod agent: accept commands over gRPC, spawn processes, return results
  - [ ] Pod pool: static warm pool (fixed size, no autoscaling yet)
  - [ ] Resource limits: memory.max, cpu.max, disk.max enforced via Kubernetes limits
  - [ ] Command timeout enforcement

- [ ] **Queue** (basic)
  - [ ] FIFO queue when pods exhausted
  - [ ] `maxWait` timeout
  - [ ] Queue position reporting

- [ ] **Package support**
  - [ ] Pre-declared pip/npm packages installed at sandbox creation
  - [ ] Agent-initiated `pip install` / `npm install` inside sandbox

- [ ] **SDK — npm** (`sandcastle-sdk`)
  - [ ] `client.create()`, `sandbox.exec()`, `sandbox.destroy()`
  - [ ] Resource usage in exec results
  - [ ] Queue status callback

- [ ] **SDK — Python** (`sandcastle-sdk`)
  - [ ] Async client: `client.create()`, `sandbox.exec()`, `sandbox.destroy()`
  - [ ] Sync wrapper: `SandcastleSync`
  - [ ] Context manager (`async with`)
  - [ ] Resource usage in exec results

- [ ] **Base image**
  - [ ] `sandcastle/python-node` Dockerfile
  - [ ] Python 3.12, Node 20, bash, sqlite3, common Unix tools (curl, git, jq)

- [ ] **Local dev setup**
  - [ ] docker-compose.yaml for running API server + worker pods locally
  - [ ] Integration tests

### What's NOT in MVP

- Mode 1 (WASM) — added in Phase 2
- Mode 3 (Firecracker) — Phase 3
- Streaming output (WebSocket) — Phase 2
- File operations via SDK — Phase 2
- Snapshot & fork — Phase 2
- Network allow-lists — Phase 2
- Autoscaling — Phase 2
- Priority tiers — Phase 2
- Tenant fairness / multi-tenancy — Phase 2
- Web dashboard — Phase 2
- Execution replay — Phase 2

---

## Phase 2

**Goal:** Production-ready platform. WASM mode, streaming, file ops, autoscaling, multi-tenancy.

**Timeline estimate:** 8-12 weeks after Phase 1

- [ ] **Mode 1 (WASM)** — in-process execution for lightweight tasks
- [ ] **Streaming output** — WebSocket-based `execStream()` / `exec_stream()`
- [ ] **File operations** — `readFile`, `writeFile`, `listFiles`, `uploadFile`, `downloadFile`
- [ ] **Snapshot & fork** — checkpoint filesystem, create sandboxes from snapshots
- [ ] **Network sandboxing** — URL allow-list, header injection, method restrictions
- [ ] **Auto-selection** — route to WASM or Pod based on requirements
- [ ] **Autoscaling** — queue-driven pod pool scaling
- [ ] **Priority tiers** — critical/high/normal/low
- [ ] **Tenant fairness** — per-tenant limits, weighted round-robin
- [ ] **Package layer caching** — content-addressed, shared read-only layers
- [ ] **Web dashboard** — Next.js app for observability
- [ ] **Execution replay** — replayable command history for debugging

---

## Phase 3

**Goal:** Enterprise features, maximum isolation, GPU support.

**Timeline estimate:** 8-12 weeks after Phase 2

- [ ] **Mode 3 (Firecracker)** — microVM isolation
- [ ] **GPU passthrough** — for ML inference workloads
- [ ] **Custom base images** — users bring their own
- [ ] **Private package registries** — beyond pypi/npm
- [ ] **Audit logs** — compliance-grade logging
- [ ] **SSO / RBAC** — enterprise auth
- [ ] **SLA guarantees** — guaranteed capacity tiers
- [ ] **On-premise deployment** — Helm chart for self-hosting
- [ ] **CLI tool** — `sandcastle create`, `sandcastle exec`, etc.

---

## Tech Stack Summary

| Component | Technology | Reason |
|---|---|---|
| API Server | Rust (axum, tonic, tokio) | Performance, WASM hosting, memory control |
| WASM Host | Rust (wasmtime) | Native integration, zero FFI overhead |
| Worker Agent | Rust | Tiny binary (~5MB), fast startup |
| Queue Backend | Redis | Persistence, pub/sub for queue events |
| Pod Orchestration | Kubernetes (kube-rs) | Industry standard, autoscaling primitives |
| npm SDK | TypeScript | Primary user ecosystem |
| pip SDK | Python (aiohttp, httpx) | Secondary user ecosystem, async-first |
| Base Images | Docker | Standard container format |
| Package Cache | OCI Registry | Content-addressed layers, standard tooling |
| Dashboard (Phase 2) | Next.js | Standard web stack |
| CI/CD | GitHub Actions | Standard, free for open source |
