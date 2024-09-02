use crate::config::Config;
use crate::models::{CreateSandboxBody, ResourceLimits, Sandbox, SnapshotMeta};
use crate::package_cache::PackageLayerCache;
use anyhow::Context;
use chrono::Utc;
use std::collections::HashMap;
use std::path::PathBuf;
use std::sync::atomic::{AtomicUsize, Ordering};
use std::sync::Arc;
use tokio::sync::{OwnedSemaphorePermit, RwLock, Semaphore};
use uuid::Uuid;

pub struct AppState {
    pub config: Config,
    pub sandboxes: RwLock<HashMap<Uuid, Sandbox>>,
    pub slots: Arc<Semaphore>,
    pub pending_waiters: Arc<AtomicUsize>,
    pub permits: std::sync::Mutex<HashMap<Uuid, OwnedSemaphorePermit>>,
    pub snapshots: RwLock<HashMap<String, SnapshotMeta>>,
    pub package_cache: PackageLayerCache,
    pub seq: AtomicUsize,
}

impl AppState {
    pub fn new(config: Config) -> anyhow::Result<Self> {
        std::fs::create_dir_all(&config.data_dir).with_context(|| {
            format!(
                "create data dir {}",
                config.data_dir.display()
            )
        })?;
        std::fs::create_dir_all(config.data_dir.join("snapshots")).ok();
        let slots = Arc::new(Semaphore::new(config.max_concurrent_sandboxes));
        Ok(Self {
            config,
            sandboxes: RwLock::new(HashMap::new()),
            slots,
            pending_waiters: Arc::new(AtomicUsize::new(0)),
            permits: std::sync::Mutex::new(HashMap::new()),
            snapshots: RwLock::new(HashMap::new()),
            package_cache: PackageLayerCache::default(),
            seq: AtomicUsize::new(0),
        })
    }

    pub fn workspace_path(&self, id: Uuid) -> PathBuf {
        self.config.data_dir.join("sandboxes").join(id.to_string())
    }

    pub fn limits_from_body(body: &CreateSandboxBody) -> ResourceLimits {
        body.resources.clone().unwrap_or(ResourceLimits {
            memory_min: None,
            memory_max: None,
            cpu_min: None,
            cpu_max: None,
            disk_max: None,
        })
    }

    pub fn priority_from_queue(body: &CreateSandboxBody) -> u8 {
        let p = body
            .queue
            .as_ref()
            .and_then(|q| q.priority.as_deref())
            .unwrap_or("normal");
        match p {
            "critical" => 100,
            "high" => 80,
            "low" => 20,
            _ => 50,
        }
    }

    pub fn parse_duration(s: &str) -> Option<std::time::Duration> {
        let s = s.trim();
        if let Some(n) = s.strip_suffix("ms") {
            return n.trim().parse::<u64>().ok().map(std::time::Duration::from_millis);
        }
        if let Some(n) = s.strip_suffix('s') {
            return n.trim().parse::<u64>().ok().map(std::time::Duration::from_secs);
        }
        if let Some(n) = s.strip_suffix('m') {
            return n
                .trim()
                .parse::<u64>()
                .ok()
                .map(|m| std::time::Duration::from_secs(m * 60));
        }
        if let Some(n) = s.strip_suffix('h') {
            return n
                .trim()
                .parse::<u64>()
                .ok()
                .map(|h| std::time::Duration::from_secs(h * 3600));
        }
        s.parse::<u64>().ok().map(std::time::Duration::from_secs)
    }

    pub fn tenant_max(&self, tenant: Option<&str>) -> Option<usize> {
        tenant.and_then(|t| self.config.tenant_quotas.get(t).copied())
    }

    pub fn count_tenant(&self, sandboxes: &HashMap<Uuid, Sandbox>, tenant: Option<&str>) -> usize {
        let Some(t) = tenant else {
            return 0;
        };
        sandboxes
            .values()
            .filter(|s| s.tenant_id.as_deref() == Some(t))
            .count()
    }
}

pub fn bump_pending(p: &Arc<AtomicUsize>) {
    p.fetch_add(1, Ordering::SeqCst);
}

pub fn dec_pending(p: &Arc<AtomicUsize>) {
    p.fetch_sub(1, Ordering::SeqCst);
}
