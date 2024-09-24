export interface SandcastleConfig {
  apiKey: string;
  baseUrl?: string;
  fetchImpl?: typeof fetch;
}

export interface ResourceLimits {
  memoryMin?: string;
  memoryMax?: string;
  cpuMin?: string;
  cpuMax?: string;
  diskMax?: string;
}

export interface PackageConfig {
  pip?: string[];
  npm?: string[];
  allowAgentInstall?: boolean;
  maxInstallSize?: string;
}

export interface QueueConfig {
  maxWait?: string;
  priority?: "critical" | "high" | "normal" | "low";
}

export interface CreateOptions {
  size?: "small" | "medium" | "large";
  mode?: string;
  resources?: ResourceLimits;
  packages?: PackageConfig;
  env?: Record<string, string>;
  timeout?: string;
  commandTimeout?: string;
  queue?: QueueConfig;
  tenantId?: string;
  fromSnapshot?: string;
  onQueueStatus?: (s: QueueStatus) => void;
}

export interface QueueStatus {
  state: string;
  position?: number;
  estimatedWait?: string;
}

export interface SandboxResponse {
  id: string;
  state: string;
  createdAt: string;
  queuePosition?: number;
  estimatedWaitMs?: number;
}

export interface ExecResources {
  memoryPeakMb: number;
  cpuTimeMs: number;
  wallTimeMs: number;
  diskUsedMb: number;
}

export interface ExecResult {
  stdout: string;
  stderr: string;
  exitCode: number;
  resources: ExecResources;
}

export interface UsageResponse {
  id: string;
  uptimeSeconds: number;
  commandsExecuted: number;
  memoryPeakMb: number;
  diskUsedMb: number;
}
