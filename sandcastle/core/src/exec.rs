use crate::models::{ExecResources, ExecResultResponse};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::process::Stdio;
use std::time::{Duration, Instant};
use tokio::process::Command;
use tokio::time::timeout;
use uuid::Uuid;

#[derive(Debug, Serialize)]
struct WorkerExecReq {
    command: String,
    env: HashMap<String, String>,
    timeout_secs: u64,
}

#[derive(Debug, Deserialize)]
struct WorkerExecRes {
    stdout: String,
    stderr: String,
    exit_code: i32,
}

pub async fn run_command(
    cwd: &std::path::Path,
    env: &HashMap<String, String>,
    command: &str,
    cmd_timeout: Duration,
    worker_base: Option<&str>,
    sandbox_id: Uuid,
) -> anyhow::Result<ExecResultResponse> {
    let start = Instant::now();
    let (stdout, stderr, exit_code) = if let Some(base) = worker_base {
        let w = run_via_worker(base, sandbox_id, env, command, cmd_timeout).await?;
        (w.0, w.1, w.2)
    } else {
        run_local(cwd, env, command, cmd_timeout).await?
    };
    let wall_time_ms = start.elapsed().as_millis() as u64;
    let disk_used_mb = dir_size_mb(cwd).unwrap_or(0);
    Ok(ExecResultResponse {
        stdout,
        stderr,
        exit_code,
        resources: ExecResources {
            memory_peak_mb: 0,
            cpu_time_ms: 0,
            wall_time_ms,
            disk_used_mb,
        },
    })
}

async fn run_local(
    cwd: &std::path::Path,
    env: &HashMap<String, String>,
    command: &str,
    cmd_timeout: Duration,
) -> anyhow::Result<(String, String, i32)> {
    let mut cmd = Command::new("/bin/sh");
    cmd.arg("-c")
        .arg(command)
        .current_dir(cwd)
        .stdout(Stdio::piped())
        .stderr(Stdio::piped())
        .kill_on_drop(true);
    for (k, v) in env {
        cmd.env(k, v);
    }
    let mut child = cmd.spawn()?;
    match timeout(cmd_timeout, child.wait_with_output()).await {
        Ok(Ok(out)) => {
            let code = out.status.code().unwrap_or(-1);
            let stdout = String::from_utf8_lossy(&out.stdout).to_string();
            let stderr = String::from_utf8_lossy(&out.stderr).to_string();
            Ok((stdout, stderr, code))
        }
        Ok(Err(e)) => Err(e.into()),
        Err(_) => Ok((
            String::new(),
            "sandcastle: command timed out".to_string(),
            124,
        )),
    }
}

async fn run_via_worker(
    base: &str,
    sandbox_id: Uuid,
    env: &HashMap<String, String>,
    command: &str,
    cmd_timeout: Duration,
) -> anyhow::Result<(String, String, i32)> {
    let url = format!(
        "{}/v1/workspaces/{}/exec",
        base.trim_end_matches('/'),
        sandbox_id
    );
    let client = reqwest::Client::builder()
        .timeout(cmd_timeout + Duration::from_secs(5))
        .build()?;
    let body = WorkerExecReq {
        command: command.to_string(),
        env: env.clone(),
        timeout_secs: cmd_timeout.as_secs().max(1),
    };
    let r = client.post(&url).json(&body).send().await?;
    if !r.status().is_success() {
        let t = r.text().await.unwrap_or_default();
        anyhow::bail!("worker error: {}", t);
    }
    let w: WorkerExecRes = r.json().await?;
    Ok((w.stdout, w.stderr, w.exit_code))
}

pub fn dir_size_mb_public(path: &std::path::Path) -> Option<u64> {
    dir_size_mb(path)
}

fn dir_size_mb(path: &std::path::Path) -> Option<u64> {
    use walkdir::WalkDir;
    let mut total: u64 = 0;
    for e in WalkDir::new(path).into_iter().flatten() {
        if e.file_type().is_file() {
            total += e.metadata().ok()?.len();
        }
    }
    Some(total / (1024 * 1024))
}

pub async fn stream_command(
    cwd: &std::path::Path,
    env: &HashMap<String, String>,
    command: &str,
    cmd_timeout: Duration,
) -> anyhow::Result<(tokio::process::ChildStdout, tokio::process::ChildStderr, tokio::process::Child)> {
    let mut cmd = Command::new("/bin/sh");
    cmd.arg("-c")
        .arg(command)
        .current_dir(cwd)
        .stdout(Stdio::piped())
        .stderr(Stdio::piped())
        .kill_on_drop(true);
    for (k, v) in env {
        cmd.env(k, v);
    }
    let mut child = cmd.spawn()?;
    let stdout = child.stdout.take().ok_or_else(|| anyhow::anyhow!("no stdout"))?;
    let stderr = child.stderr.take().ok_or_else(|| anyhow::anyhow!("no stderr"))?;
    Ok((stdout, stderr, child))
}
