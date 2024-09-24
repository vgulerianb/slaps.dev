import { Sandbox } from "./sandbox.js";
import type {
  CreateOptions,
  SandboxResponse,
  SandcastleConfig,
} from "./types.js";
import { SandcastleError } from "./errors.js";

function toCreateBody(opts: CreateOptions): Record<string, unknown> {
  return {
    size: opts.size,
    mode: opts.mode,
    resources: opts.resources,
    packages: opts.packages,
    env: opts.env,
    timeout: opts.timeout,
    commandTimeout: opts.commandTimeout,
    queue: opts.queue,
    tenantId: opts.tenantId,
    fromSnapshot: opts.fromSnapshot,
  };
}

export class Sandcastle {
  constructor(private readonly cfg: SandcastleConfig) {}

  private url(path: string): string {
    const base = (this.cfg.baseUrl ?? "http://127.0.0.1:8787").replace(/\/$/, "");
    return `${base}${path}`;
  }

  private headers(): HeadersInit {
    const h: Record<string, string> = { "Content-Type": "application/json" };
    if (this.cfg.apiKey) h.Authorization = `Bearer ${this.cfg.apiKey}`;
    return h;
  }

  private async req<T>(method: string, path: string, body?: unknown): Promise<T> {
    const f = this.cfg.fetchImpl ?? fetch;
    const r = await f(this.url(path), {
      method,
      headers: this.headers(),
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    const text = await r.text();
    let json: unknown = null;
    try {
      json = text ? JSON.parse(text) : null;
    } catch {
      json = text;
    }
    if (!r.ok) {
      const msg =
        typeof json === "object" && json && "error" in json
          ? String((json as { error: string }).error)
          : r.statusText;
      throw new SandcastleError(msg, r.status, json);
    }
    return json as T;
  }

  async create(opts: CreateOptions = {}): Promise<Sandbox> {
    opts.onQueueStatus?.({ state: "provisioning" });
    const res = await this.req<SandboxResponse>(
      "POST",
      "/v1/sandboxes",
      toCreateBody(opts)
    );
    opts.onQueueStatus?.({ state: "ready" });
    return new Sandbox(this.cfg, res.id);
  }

  async fork(snapshotId: string): Promise<Sandbox> {
    const res = await this.req<SandboxResponse>(
      "POST",
      "/v1/sandboxes/from-snapshot",
      { snapshotId }
    );
    return new Sandbox(this.cfg, res.id);
  }

  async status(): Promise<unknown> {
    return this.req("GET", "/v1/status");
  }
}
