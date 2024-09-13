use axum::Json;
use serde_json::json;

/// Phase 2: document URL allow-list shape; enforcement belongs on worker / sidecar.
pub async fn network_preview() -> Json<serde_json::Value> {
    Json(json!({
        "allowedUrlPrefixes": [] as [String; 0],
        "allowedMethods": ["GET", "HEAD"],
        "note": "configure egress on worker or service mesh in production",
    }))
}
