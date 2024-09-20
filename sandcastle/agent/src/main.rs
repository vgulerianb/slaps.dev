use axum::extract::{Path, State};
use axum::routing::post;
use axum::{Json, Router};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::path::PathBuf;
use std::process::Stdio;
use std::sync::Arc;
use std::time::{Duration, Instant};
use tokio::process::Command;
use tokio::time::timeout;
use uuid::Uuid;

#[derive(Clone)]
struct Cfg {
    data_dir: PathBuf,
}

#[derive(Deserialize)]
struct ExecReq {
    command: String,
    #[serde(default)]
    env: HashMap<String, String>,
    timeout_secs: u64,
}

#[derive(Serialize)]
struct ExecRes {
    stdout: String,
    stderr: String,
    exit_code: i32,
    wall_time_ms: u64,
}

#[tokio::main]
async fn main() {
    tracing_subscriber::fmt()
        .with_env_filter(tracing_subscriber::EnvFilter::from_default_env())
        .init();
    let data_dir = std::env::var("SANDCASTLE_DATA_DIR")
        .map(PathBuf::from)
        .unwrap_or_else(|_| PathBuf::from("/data"));
    let _ = std::fs::create_dir_all(&data_dir);
    let cfg = Arc::new(Cfg { data_dir });
    let bind = std::env::var("SANDCASTLE_AGENT_BIND").unwrap_or_else(|_| "0.0.0.0:9797".to_string());
    let app = Router::new()
        .route("/v1/workspaces/:id/exec", post(exec_handler))
        .with_state(cfg);
    let listener = tokio::net::TcpListener::bind(&bind).await.unwrap();
    tracing::info!("sandcastle-agent on {}", bind);
    axum::serve(listener, app).await.unwrap();
}

async fn exec_handler(
    State(cfg): State<Arc<Cfg>>,
    Path(id): Path<Uuid>,
    Json(body): Json<ExecReq>,
) -> Json<ExecRes> {
    let start = Instant::now();
    let cwd = cfg.data_dir.join("sandboxes").join(id.to_string());
    let _ = std::fs::create_dir_all(&cwd);
    let mut cmd = Command::new("/bin/sh");
    cmd.arg("-c")
        .arg(&body.command)
        .current_dir(&cwd)
        .stdout(Stdio::piped())
        .stderr(Stdio::piped())
        .kill_on_drop(true);
    for (k, v) in &body.env {
        cmd.env(k, v);
    }
    let dur = Duration::from_secs(body.timeout_secs.max(1));
    let mut child = cmd.spawn().unwrap();
    let out = match timeout(dur, child.wait_with_output()).await {
        Ok(Ok(o)) => o,
        Ok(Err(_)) => {
            return Json(ExecRes {
                stdout: String::new(),
                stderr: "spawn error".into(),
                exit_code: -1,
                wall_time_ms: start.elapsed().as_millis() as u64,
            })
        }
        Err(_) => {
            return Json(ExecRes {
                stdout: String::new(),
                stderr: "timeout".into(),
                exit_code: 124,
                wall_time_ms: start.elapsed().as_millis() as u64,
            })
        }
    };
    Json(ExecRes {
        stdout: String::from_utf8_lossy(&out.stdout).to_string(),
        stderr: String::from_utf8_lossy(&out.stderr).to_string(),
        exit_code: out.status.code().unwrap_or(-1),
        wall_time_ms: start.elapsed().as_millis() as u64,
    })
}
