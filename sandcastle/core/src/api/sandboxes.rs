use axum::extract::{Path, State};
use axum::http::StatusCode;
use axum::Json;
use chrono::Utc;
use flate2::read::GzDecoder;
use flate2::write::GzEncoder;
use flate2::Compression;
use std::sync::Arc;
use std::time::Duration;
use tokio::time::timeout;
use uuid::Uuid;

use crate::api::error::ApiError;
use crate::exec;
use crate::install;
use crate::models::{
    CreateSandboxBody, ExecBody, ExecRecord, ExecResultResponse, ForkBody, Sandbox,
    SandboxResponse, SnapshotBody, SnapshotMeta, UsageResponse,
};
use crate::state::{dec_pending, bump_pending, AppState};

pub async fn list(State(st): State<Arc<AppState>>) -> Json<Vec<SandboxResponse>> {
    let map = st.sandboxes.read().await;
    let v: Vec<SandboxResponse> = map
        .values()
        .map(|s| SandboxResponse {
            id: s.id,
            state: "ready".into(),
            created_at: s.created_at,
            queue_position: None,
            estimated_wait_ms: None,
        })
        .collect();
    Json(v)
}

pub async fn get(
    State(st): State<Arc<AppState>>,
    Path(id): Path<Uuid>,
) -> Result<Json<SandboxResponse>, ApiError> {
    let map = st.sandboxes.read().await;
    let s = map
        .get(&id)
        .ok_or_else(|| ApiError(StatusCode::NOT_FOUND, "sandbox not found".into()))?;
    Ok(Json(SandboxResponse {
        id: s.id,
        state: "ready".into(),
        created_at: s.created_at,
        queue_position: None,
        estimated_wait_ms: None,
    }))
}

pub async fn create(
    State(st): State<Arc<AppState>>,
    Json(body): Json<CreateSandboxBody>,
) -> Result<Json<SandboxResponse>, ApiError> {
    let max_wait = body
        .queue
        .as_ref()
        .and_then(|q| q.max_wait.as_deref())
        .and_then(AppState::parse_duration)
        .unwrap_or(Duration::from_secs(300));

    if let Some(tenant) = body.tenant_id.as_deref() {
        if let Some(max_t) = st.tenant_max(Some(tenant)) {
            let map = st.sandboxes.read().await;
            if st.count_tenant(&map, Some(tenant)) >= max_t {
                return Err(ApiError(
                    StatusCode::TOO_MANY_REQUESTS,
                    "tenant sandbox limit reached".into(),
                ));
            }
        }
    }

    let depth_before = st.pending_waiters.load(std::sync::atomic::Ordering::SeqCst);
    bump_pending(&st.pending_waiters);
    let permit = match timeout(max_wait, st.slots.clone().acquire_owned()).await {
        Ok(Ok(p)) => p,
        Ok(Err(_)) => {
            dec_pending(&st.pending_waiters);
            return Err(ApiError(
                StatusCode::SERVICE_UNAVAILABLE,
                "queue closed".into(),
            ));
        }
        Err(_) => {
            dec_pending(&st.pending_waiters);
            return Err(ApiError(
                StatusCode::GATEWAY_TIMEOUT,
                "max_wait exceeded waiting for capacity".into(),
            ));
        }
    };
    dec_pending(&st.pending_waiters);

    let id = Uuid::new_v4();
    let path = st.workspace_path(id);
    std::fs::create_dir_all(&path).map_err(|e| {
        ApiError(
            StatusCode::INTERNAL_SERVER_ERROR,
            format!("mkdir: {e}"),
        )
    })?;

    if let Some(snap) = body.from_snapshot.as_deref() {
        let snap_path = st
            .config
            .data_dir
            .join("snapshots")
            .join(format!("{snap}.tar.gz"));
        extract_tar_gz(&snap_path, &path).map_err(|e| {
            ApiError(
                StatusCode::BAD_REQUEST,
                format!("snapshot extract: {e}"),
            )
        })?;
    }

    let mut env = body.env.clone().unwrap_or_default();
    env.entry("PYTHONUNBUFFERED".to_string())
        .or_insert("1".into());

    if let Some(pkgs) = body.packages.as_ref() {
        let key = crate::package_cache::PackageLayerCache::key(pkgs);
        st.package_cache
            .note_resolved(&key, "resolved-local")
            .await;
        install::install_packages(&path, pkgs, Duration::from_secs(600)).await;
    }

    let sb = Sandbox {
        id,
        path: path.clone(),
        created_at: Utc::now(),
        env,
        resource_limits: AppState::limits_from_body(&body),
        exec_history: vec![],
        memory_peak_mb: 0,
        priority: AppState::priority_from_queue(&body),
        tenant_id: body.tenant_id.clone(),
    };
    let created_at = sb.created_at;

    st.permits.lock().unwrap().insert(id, permit);
    st.sandboxes.write().await.insert(id, sb);

    let est_ms = if depth_before > 0 {
        Some((depth_before as u64).saturating_mul(1500))
    } else {
        None
    };

    Ok(Json(SandboxResponse {
        id,
        state: "ready".into(),
        created_at,
        queue_position: None,
        estimated_wait_ms: est_ms,
    }))
}

pub async fn destroy(
    State(st): State<Arc<AppState>>,
    Path(id): Path<Uuid>,
) -> Result<StatusCode, ApiError> {
    let path = {
        let mut map = st.sandboxes.write().await;
        map.remove(&id)
            .ok_or_else(|| ApiError(StatusCode::NOT_FOUND, "sandbox not found".into()))?
            .path
    };
    st.permits.lock().unwrap().remove(&id);
    let _ = tokio::fs::remove_dir_all(&path).await;
    Ok(StatusCode::NO_CONTENT)
}

pub async fn exec_cmd(
    State(st): State<Arc<AppState>>,
    Path(id): Path<Uuid>,
    Json(body): Json<ExecBody>,
) -> Result<Json<ExecResultResponse>, ApiError> {
    let cmd_timeout = body
        .timeout_secs
        .map(Duration::from_secs)
        .unwrap_or(st.config.default_command_timeout);
    let (path, env) = {
        let map = st.sandboxes.read().await;
        let sb = map
            .get(&id)
            .ok_or_else(|| ApiError(StatusCode::NOT_FOUND, "sandbox not found".into()))?;
        (sb.path.clone(), sb.env.clone())
    };
    let res = exec::run_command(
        &path,
        &env,
        &body.command,
        cmd_timeout,
        st.config.worker_base_url.as_deref(),
        id,
    )
    .await
    .map_err(|e| ApiError(StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;

    let wall = res.resources.wall_time_ms;
    {
        let mut map = st.sandboxes.write().await;
        if let Some(sb) = map.get_mut(&id) {
            sb.exec_history.push(ExecRecord {
                command: body.command.clone(),
                stdout: res.stdout.clone(),
                stderr: res.stderr.clone(),
                exit_code: res.exit_code,
                wall_time_ms: wall,
                at: Utc::now(),
            });
        }
    }

    Ok(Json(res))
}

pub async fn usage(
    State(st): State<Arc<AppState>>,
    Path(id): Path<Uuid>,
) -> Result<Json<UsageResponse>, ApiError> {
    let map = st.sandboxes.read().await;
    let sb = map
        .get(&id)
        .ok_or_else(|| ApiError(StatusCode::NOT_FOUND, "sandbox not found".into()))?;
    let disk = crate::exec::dir_size_mb_public(&sb.path).unwrap_or(0);
    Ok(Json(UsageResponse {
        id: sb.id,
        uptime_seconds: (Utc::now() - sb.created_at).num_seconds(),
        commands_executed: sb.exec_history.len(),
        memory_peak_mb: sb.memory_peak_mb,
        disk_used_mb: disk,
    }))
}

pub async fn replay(
    State(st): State<Arc<AppState>>,
    Path(id): Path<Uuid>,
) -> Result<Json<Vec<ExecRecord>>, ApiError> {
    let map = st.sandboxes.read().await;
    let sb = map
        .get(&id)
        .ok_or_else(|| ApiError(StatusCode::NOT_FOUND, "sandbox not found".into()))?;
    Ok(Json(sb.exec_history.clone()))
}

pub async fn snapshot(
    State(st): State<Arc<AppState>>,
    Path(id): Path<Uuid>,
    Json(body): Json<SnapshotBody>,
) -> Result<Json<serde_json::Value>, ApiError> {
    let path = {
        let map = st.sandboxes.read().await;
        let sb = map
            .get(&id)
            .ok_or_else(|| ApiError(StatusCode::NOT_FOUND, "sandbox not found".into()))?;
        sb.path.clone()
    };
    let label = body
        .label
        .unwrap_or_else(|| format!("snap-{}", Uuid::new_v4().to_string().split('-').next().unwrap()));
    let snap_path = st
        .config
        .data_dir
        .join("snapshots")
        .join(format!("{label}.tar.gz"));
    tar_dir(&path, &snap_path).map_err(|e| {
        ApiError(
            StatusCode::INTERNAL_SERVER_ERROR,
            format!("snapshot: {e}"),
        )
    })?;
    let meta = SnapshotMeta {
        id: label.clone(),
        sandbox_id: id,
        path: snap_path.clone(),
        created_at: Utc::now(),
    };
    st.snapshots.write().await.insert(label.clone(), meta);
    Ok(Json(serde_json::json!({ "snapshotId": label })))
}

pub async fn fork_from_snapshot(
    State(st): State<Arc<AppState>>,
    Json(body): Json<ForkBody>,
) -> Result<Json<SandboxResponse>, ApiError> {
    let max_wait = Duration::from_secs(300);
    bump_pending(&st.pending_waiters);
    let permit = match timeout(max_wait, st.slots.clone().acquire_owned()).await {
        Ok(Ok(p)) => p,
        Ok(Err(_)) => {
            dec_pending(&st.pending_waiters);
            return Err(ApiError(
                StatusCode::SERVICE_UNAVAILABLE,
                "queue closed".into(),
            ));
        }
        Err(_) => {
            dec_pending(&st.pending_waiters);
            return Err(ApiError(
                StatusCode::GATEWAY_TIMEOUT,
                "max_wait exceeded waiting for capacity".into(),
            ));
        }
    };
    dec_pending(&st.pending_waiters);

    let id = Uuid::new_v4();
    let path = st.workspace_path(id);
    std::fs::create_dir_all(&path).map_err(|e| {
        ApiError(
            StatusCode::INTERNAL_SERVER_ERROR,
            format!("mkdir: {e}"),
        )
    })?;
    let snap_path = st
        .config
        .data_dir
        .join("snapshots")
        .join(format!("{}.tar.gz", body.snapshot_id));
    extract_tar_gz(&snap_path, &path).map_err(|e| {
        ApiError(
            StatusCode::BAD_REQUEST,
            format!("snapshot extract: {e}"),
        )
    })?;

    let sb = Sandbox {
        id,
        path,
        created_at: Utc::now(),
        env: [("PYTHONUNBUFFERED".to_string(), "1".into())].into(),
        resource_limits: crate::models::ResourceLimits {
            memory_min: None,
            memory_max: None,
            cpu_min: None,
            cpu_max: None,
            disk_max: None,
        },
        exec_history: vec![],
        memory_peak_mb: 0,
        priority: 50,
        tenant_id: None,
    };
    st.permits.lock().unwrap().insert(id, permit);
    st.sandboxes.write().await.insert(id, sb);

    Ok(Json(SandboxResponse {
        id,
        state: "ready".into(),
        created_at: Utc::now(),
        queue_position: None,
        estimated_wait_ms: None,
    }))
}

fn tar_dir(src: &std::path::Path, dst: &std::path::Path) -> anyhow::Result<()> {
    if let Some(p) = dst.parent() {
        std::fs::create_dir_all(p)?;
    }
    let f = std::fs::File::create(dst)?;
    let gz = GzEncoder::new(f, Compression::default());
    let mut ar = tar::Builder::new(gz);
    ar.append_dir_all(".", src)?;
    ar.finish()?;
    Ok(())
}

fn extract_tar_gz(archive: &std::path::Path, dest: &std::path::Path) -> anyhow::Result<()> {
    let f = std::fs::File::open(archive)?;
    let gz = GzDecoder::new(f);
    let mut ar = tar::Archive::new(gz);
    ar.unpack(dest)?;
    Ok(())
}
