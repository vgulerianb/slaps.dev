use axum::body::Bytes;
use axum::extract::{Path, Query, State};
use axum::http::StatusCode;
use axum::Json;
use serde::Serialize;
use std::sync::Arc;
use uuid::Uuid;

use crate::api::error::ApiError;
use crate::state::AppState;

#[derive(serde::Deserialize)]
pub struct ListQuery {
    #[serde(default)]
    pub path: String,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct FileEntry {
    pub name: String,
    pub is_dir: bool,
    pub size: u64,
}

fn safe_workspace_path(base: &std::path::Path, rel: &str) -> Result<std::path::PathBuf, ApiError> {
    let rel = rel.trim_start_matches('/');
    if rel.contains("..") {
        return Err(ApiError(
            StatusCode::BAD_REQUEST,
            "invalid path".into(),
        ));
    }
    let p = base.join(rel);
    if !p.starts_with(base) {
        return Err(ApiError(
            StatusCode::BAD_REQUEST,
            "path escapes sandbox".into(),
        ));
    }
    Ok(p)
}

pub async fn put_file(
    State(st): State<Arc<AppState>>,
    Path((id, rest)): Path<(Uuid, String)>,
    body: Bytes,
) -> Result<StatusCode, ApiError> {
    let base = {
        let map = st.sandboxes.read().await;
        let sb = map
            .get(&id)
            .ok_or_else(|| ApiError(StatusCode::NOT_FOUND, "sandbox not found".into()))?;
        sb.path.clone()
    };
    let target = safe_workspace_path(&base, &rest)?;
    if let Some(parent) = target.parent() {
        std::fs::create_dir_all(parent).map_err(|e| {
            ApiError(
                StatusCode::INTERNAL_SERVER_ERROR,
                e.to_string(),
            )
        })?;
    }
    std::fs::write(&target, &body[..]).map_err(|e| {
        ApiError(
            StatusCode::INTERNAL_SERVER_ERROR,
            e.to_string(),
        )
    })?;
    Ok(StatusCode::NO_CONTENT)
}

pub async fn get_file(
    State(st): State<Arc<AppState>>,
    Path((id, rest)): Path<(Uuid, String)>,
) -> Result<(axum::http::header::HeaderMap, Bytes), ApiError> {
    let base = {
        let map = st.sandboxes.read().await;
        let sb = map
            .get(&id)
            .ok_or_else(|| ApiError(StatusCode::NOT_FOUND, "sandbox not found".into()))?;
        sb.path.clone()
    };
    let target = safe_workspace_path(&base, &rest)?;
    let data = std::fs::read(&target).map_err(|e| {
        if e.kind() == std::io::ErrorKind::NotFound {
            ApiError(StatusCode::NOT_FOUND, "file not found".into())
        } else {
            ApiError(StatusCode::INTERNAL_SERVER_ERROR, e.to_string())
        }
    })?;
    Ok((axum::http::HeaderMap::new(), Bytes::from(data)))
}

pub async fn list_files(
    State(st): State<Arc<AppState>>,
    Path(id): Path<Uuid>,
    Query(q): Query<ListQuery>,
) -> Result<Json<Vec<FileEntry>>, ApiError> {
    let base = {
        let map = st.sandboxes.read().await;
        let sb = map
            .get(&id)
            .ok_or_else(|| ApiError(StatusCode::NOT_FOUND, "sandbox not found".into()))?;
        sb.path.clone()
    };
    let dir = safe_workspace_path(&base, if q.path.is_empty() { "." } else { &q.path })?;
    if !dir.is_dir() {
        return Err(ApiError(
            StatusCode::BAD_REQUEST,
            "not a directory".into(),
        ));
    }
    let mut out = vec![];
    for e in std::fs::read_dir(&dir).map_err(|e| {
        ApiError(
            StatusCode::INTERNAL_SERVER_ERROR,
            e.to_string(),
        )
    })? {
        let e = e.map_err(|e| {
            ApiError(
                StatusCode::INTERNAL_SERVER_ERROR,
                e.to_string(),
            )
        })?;
        let meta = e.metadata().ok();
        out.push(FileEntry {
            name: e.file_name().to_string_lossy().to_string(),
            is_dir: meta.as_ref().map(|m| m.is_dir()).unwrap_or(false),
            size: meta.as_ref().map(|m| if m.is_file() { m.len() } else { 0 }).unwrap_or(0),
        });
    }
    Ok(Json(out))
}
