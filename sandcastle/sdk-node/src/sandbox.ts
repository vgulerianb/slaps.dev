import type { ExecResult, SandcastleConfig, UsageResponse } from "./types.js";
import { SandcastleError } from "./errors.js";

export class Sandbox {
  constructor(
    private readonly cfg: SandcastleConfig,
    public readonly id: string
  ) {}

  private url(path: string): string {
    const base = (this.cfg.baseUrl ?? "http://127.0.0.1:8787").replace(/\/$/, "");
    return `${base}${path}`;
  }

  private headers(): HeadersInit {
    const h: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (this.cfg.apiKey) h.Authorization = `Bearer ${this.cfg.apiKey}`;
    return h;
  }

  private authHeaders(): HeadersInit {
    const h: Record<string, string> = {};
    if (this.cfg.apiKey) h.Authorization = `Bearer ${this.cfg.apiKey}`;
    return h;
  }

  private async req<T>(
    method: string,
    path: string,
    body?: unknown
  ): Promise<T> {
    const f = this.cfg.fetchImpl ?? fetch;
    const r = await f(this.url(path), {
      method,
      headers: this.headers(),
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    if (r.status === 204) return undefined as T;
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

  async exec(command: string, timeoutSecs?: number): Promise<ExecResult> {
    return this.req<ExecResult>("POST", `/v1/sandboxes/${this.id}/exec`, {
      command,
      timeoutSecs,
    });
  }

  async execStream(
    command: string,
    timeoutSecs?: number
  ): Promise<WebSocket> {
    const base = (this.cfg.baseUrl ?? "http://127.0.0.1:8787").replace(
      /^http/,
      "ws"
    );
    const wsUrl = `${base}/v1/sandboxes/${this.id}/exec/stream`;
    const ws = new WebSocket(wsUrl);
    await new Promise<void>((resolve, reject) => {
      ws.onopen = () => resolve();
      ws.onerror = () => reject(new SandcastleError("websocket open failed"));
    });
    ws.send(JSON.stringify({ command, timeoutSecs }));
    return ws;
  }

  async writeFile(path: string, content: string | Uint8Array): Promise<void> {
    const base = (this.cfg.baseUrl ?? "http://127.0.0.1:8787").replace(/\/$/, "");
    const bodyInit: BodyInit =
      typeof content === "string" ? content : content;
    const f = this.cfg.fetchImpl ?? fetch;
    const r = await f(`${base}/v1/sandboxes/${this.id}/files/${path.replace(/^\//, "")}`, {
      method: "PUT",
      headers: this.authHeaders(),
      body: bodyInit,
    });
    if (!r.ok) {
      const t = await r.text();
      throw new SandcastleError(t || r.statusText, r.status);
    }
  }

  async readFile(path: string): Promise<string> {
    const base = (this.cfg.baseUrl ?? "http://127.0.0.1:8787").replace(/\/$/, "");
    const f = this.cfg.fetchImpl ?? fetch;
    const r = await f(`${base}/v1/sandboxes/${this.id}/files/${path.replace(/^\//, "")}`, {
      headers: this.authHeaders(),
    });
    if (!r.ok) throw new SandcastleError(await r.text(), r.status);
    return r.text();
  }

  async listFiles(dir = ""): Promise<{ name: string; isDir: boolean; size: number }[]> {
    const q = dir ? `?path=${encodeURIComponent(dir)}` : "";
    return this.req("GET", `/v1/sandboxes/${this.id}/files${q}`);
  }

  async usage(): Promise<UsageResponse> {
    return this.req("GET", `/v1/sandboxes/${this.id}/usage`);
  }

  async snapshot(label?: string): Promise<{ snapshotId: string }> {
    return this.req("POST", `/v1/sandboxes/${this.id}/snapshot`, { label });
  }

  async replay(): Promise<unknown[]> {
    return this.req("GET", `/v1/sandboxes/${this.id}/replay`);
  }

  async destroy(): Promise<void> {
    await this.req("DELETE", `/v1/sandboxes/${this.id}`);
  }
}
