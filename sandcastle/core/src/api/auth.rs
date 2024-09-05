use axum::extract::Request;
use axum::middleware::Next;
use axum::response::Response;
use std::sync::Arc;

use crate::state::AppState;

pub async fn require_api_key(
    axum::extract::State(state): axum::extract::State<Arc<AppState>>,
    req: Request,
    next: Next,
) -> Result<Response, axum::http::StatusCode> {
    if state.config.api_keys.is_empty() || state.config.api_keys == vec!["".to_string()] {
        return Ok(next.run(req).await);
    }
    let auth = req
        .headers()
        .get(axum::http::header::AUTHORIZATION)
        .and_then(|v| v.to_str().ok())
        .ok_or(axum::http::StatusCode::UNAUTHORIZED)?;
    let token = auth
        .strip_prefix("Bearer ")
        .or_else(|| auth.strip_prefix("bearer "))
        .ok_or(axum::http::StatusCode::UNAUTHORIZED)?;
    if !state.config.api_keys.iter().any(|k| k == token) {
        return Err(axum::http::StatusCode::UNAUTHORIZED);
    }
    Ok(next.run(req).await)
}
