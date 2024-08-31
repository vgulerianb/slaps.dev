use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use uuid::Uuid;

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ResourceLimits {
    #[serde(default)]
    pub memory_min: Option<String>,
    #[serde(default)]
    pub memory_max: Option<String>,
    #[serde(default)]
    pub cpu_min: Option<String>,
    #[serde(default)]
    pub cpu_max: Option<String>,
    #[serde(default)]
    pub disk_max: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct PackageConfig {
    #[serde(default)]
    pub pip: Vec<String>,
    #[serde(default)]
    pub npm: Vec<String>,
    #[serde(default)]
    pub allow_agent_install: Option<bool>,
    #[serde(default)]
    pub max_install_size: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct QueueConfig {
    #[serde(default)]
    pub max_wait: Option<String>,
    #[serde(default)]
    pub priority: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CreateSandboxBody {
    #[serde(default)]
    pub size: Option<String>,
    #[serde(default)]
    pub mode: Option<String>,
    #[serde(default)]
    pub resources: Option<ResourceLimits>,
    #[serde(default)]
    pub packages: Option<PackageConfig>,
    #[serde(default)]
    pub env: Option<HashMap<String, String>>,
    #[serde(default)]
    pub timeout: Option<String>,
    #[serde(default)]
    pub command_timeout: Option<String>,
    #[serde(default)]
    pub queue: Option<QueueConfig>,
    #[serde(default)]
    pub tenant_id: Option<String>,
    #[serde(default)]
    pub from_snapshot: Option<String>,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct SandboxResponse {
    pub id: Uuid,
    pub state: String,
    pub created_at: DateTime<Utc>,
    pub queue_position: Option<u32>,
    pub estimated_wait_ms: Option<u64>,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ExecBody {
    pub command: String,
    #[serde(default)]
    pub timeout_secs: Option<u64>,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ExecResultResponse {
    pub stdout: String,
    pub stderr: String,
    pub exit_code: i32,
    pub resources: ExecResources,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ExecResources {
    pub memory_peak_mb: u64,
    pub cpu_time_ms: u64,
    pub wall_time_ms: u64,
    pub disk_used_mb: u64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ExecRecord {
    pub command: String,
    pub stdout: String,
    pub stderr: String,
    pub exit_code: i32,
    pub wall_time_ms: u64,
    pub at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct UsageResponse {
    pub id: Uuid,
    pub uptime_seconds: i64,
    pub commands_executed: usize,
    pub memory_peak_mb: u64,
    pub disk_used_mb: u64,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct StatusResponse {
    pub capacity: Capacity,
    pub sandboxes: SandboxesStatus,
    pub queue: QueueStatus,
    pub wasm_mode_available: bool,
    pub recommended_warm_pods: u32,
    pub autoscaler_note: &'static str,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct Capacity {
    pub max_concurrent: usize,
    pub active: usize,
    pub available_slots: usize,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct SandboxesStatus {
    pub running: usize,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct QueueStatus {
    pub depth: usize,
    pub estimated_wait_ms: u64,
}

#[derive(Debug, Clone)]
pub struct Sandbox {
    pub id: Uuid,
    pub path: std::path::PathBuf,
    pub created_at: DateTime<Utc>,
    pub env: HashMap<String, String>,
    pub resource_limits: ResourceLimits,
    pub exec_history: Vec<ExecRecord>,
    pub memory_peak_mb: u64,
    pub priority: u8,
    pub tenant_id: Option<String>,
}

#[derive(Debug, Clone, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SnapshotBody {
    pub label: Option<String>,
}

#[derive(Debug, Clone, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ForkBody {
    pub snapshot_id: String,
}

#[derive(Debug, Clone, Serialize)]
pub struct SnapshotMeta {
    pub id: String,
    pub sandbox_id: Uuid,
    pub path: std::path::PathBuf,
    pub created_at: DateTime<Utc>,
}
