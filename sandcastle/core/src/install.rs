use crate::exec;
use crate::models::PackageConfig;
use std::collections::HashMap;
use std::path::Path;
use std::time::Duration;
use uuid::Uuid;

pub async fn install_packages(path: &Path, packages: &PackageConfig, max_duration: Duration) {
    if std::env::var("SANDCASTLE_SKIP_PACKAGE_INSTALL")
        .ok()
        .as_deref()
        == Some("1")
    {
        return;
    }
    let home = path.to_string_lossy().to_string();
    let mut env = HashMap::new();
    env.insert("HOME".to_string(), home);
    env.insert("NPM_CONFIG_CACHE".to_string(), path.join(".npm-cache").to_string_lossy().to_string());
    for p in &packages.pip {
        let cmd = format!("python3 -m pip install --user {}", shell_escape(p));
        let _ = exec::run_command(
            path,
            &env,
            &cmd,
            max_duration,
            None,
            Uuid::nil(),
        )
        .await;
    }
    for p in &packages.npm {
        let cmd = format!("npm install --prefix . {}", shell_escape(p));
        let _ = exec::run_command(path, &env, &cmd, max_duration, None, Uuid::nil()).await;
    }
}

fn shell_escape(s: &str) -> String {
    if s.chars().all(|c| c.is_ascii_alphanumeric() || c == '.' || c == '-' || c == '_') {
        return s.to_string();
    }
    format!("'{}'", s.replace('\'', "'\"'\"'"))
}
