mod auth;
mod error;
mod files;
mod health;
mod network;
mod sandboxes;
mod status;
mod stream;

use axum::middleware;
use axum::routing::{delete, get, post, put};
use axum::Router;
use std::sync::Arc;

use crate::state::AppState;
use crate::wasm_stub;

pub fn router(state: Arc<AppState>) -> Router {
    let inner = Router::new()
        .route("/sandboxes", get(sandboxes::list).post(sandboxes::create))
        .route(
            "/sandboxes/from-snapshot",
            post(sandboxes::fork_from_snapshot),
        )
        .route(
            "/sandboxes/:id",
            get(sandboxes::get).delete(sandboxes::destroy),
        )
        .route("/sandboxes/:id/exec", post(sandboxes::exec_cmd))
        .route(
            "/sandboxes/:id/exec/stream",
            get(stream::exec_stream_ws),
        )
        .route("/sandboxes/:id/usage", get(sandboxes::usage))
        .route("/sandboxes/:id/replay", get(sandboxes::replay))
        .route("/sandboxes/:id/snapshot", post(sandboxes::snapshot))
        .route("/sandboxes/:id/files", get(files::list_files))
        .route(
            "/sandboxes/:id/files/*rest",
            put(files::put_file).get(files::get_file),
        )
        .route("/status", get(status::cluster_status))
        .route("/network/preview", get(network::network_preview))
        .route("/wasm", get(wasm_stub::wasm_status))
        .layer(middleware::from_fn_with_state(
            state.clone(),
            auth::require_api_key,
        ));

    Router::new()
        .route("/v1/health", get(health::health))
        .nest("/v1", inner)
        .with_state(state)
}
