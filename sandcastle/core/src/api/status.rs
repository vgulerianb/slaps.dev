use axum::extract::State;
use axum::Json;
use std::sync::atomic::Ordering;
use std::sync::Arc;

use crate::models::{Capacity, QueueStatus, SandboxesStatus, StatusResponse};
use crate::state::AppState;

pub async fn cluster_status(State(st): State<Arc<AppState>>) -> Json<StatusResponse> {
    let running = st.sandboxes.read().await.len();
    let max = st.config.max_concurrent_sandboxes;
    let available = max.saturating_sub(running);
    let depth = st.pending_waiters.load(Ordering::SeqCst);
    let est = (depth as u64).saturating_mul(1500);
    let rec = ((depth as u32) / 2 + 1).min(max as u32).max(1);

    Json(StatusResponse {
        capacity: Capacity {
            max_concurrent: max,
            active: running,
            available_slots: available,
        },
        sandboxes: SandboxesStatus { running },
        queue: QueueStatus {
            depth,
            estimated_wait_ms: est,
        },
        wasm_mode_available: false,
        recommended_warm_pods: rec,
        autoscaler_note: "queue-depth hint for warm pool sizing",
    })
}
