use std::collections::HashMap;
use std::env;
use std::path::PathBuf;
use std::time::Duration;

#[derive(Clone, Debug)]
pub struct Config {
    pub data_dir: PathBuf,
    pub api_keys: Vec<String>,
    pub bind: String,
    pub max_concurrent_sandboxes: usize,
    pub default_command_timeout: Duration,
    pub worker_base_url: Option<String>,
    pub tenant_quotas: std::collections::HashMap<String, usize>,
}

impl Config {
    pub fn from_env() -> Self {
        let data_dir = env::var("SANDCASTLE_DATA_DIR")
            .map(PathBuf::from)
            .unwrap_or_else(|_| PathBuf::from("./data"));
        let keys = env::var("SANDCASTLE_API_KEYS").unwrap_or_else(|_| "dev".to_string());
        let api_keys: Vec<String> = keys.split(',').map(|s| s.trim().to_string()).collect();
        let max_concurrent_sandboxes = env::var("SANDCASTLE_MAX_CONCURRENT")
            .ok()
            .and_then(|s| s.parse().ok())
            .unwrap_or(16);
        let default_command_timeout_secs = env::var("SANDCASTLE_CMD_TIMEOUT_SECS")
            .ok()
            .and_then(|s| s.parse().ok())
            .unwrap_or(300u64);
        let worker_base_url = env::var("SANDCASTLE_WORKER_BASE").ok();
        let tenant_quotas = env::var("SANDCASTLE_TENANT_QUOTAS")
            .ok()
            .map(|s| {
                s.split(',')
                    .filter_map(|pair| {
                        let mut it = pair.split(':');
                        let k = it.next()?.trim().to_string();
                        let n: usize = it.next()?.trim().parse().ok()?;
                        Some((k, n))
                    })
                    .collect::<HashMap<_, _>>()
            })
            .unwrap_or_default();
        Self {
            data_dir,
            api_keys,
            bind: env::var("SANDCASTLE_BIND").unwrap_or_else(|_| "0.0.0.0:8787".to_string()),
            max_concurrent_sandboxes,
            default_command_timeout: Duration::from_secs(default_command_timeout_secs),
            worker_base_url,
            tenant_quotas,
        }
    }
}
