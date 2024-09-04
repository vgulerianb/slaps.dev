//! Phase 2 WASM mode placeholder — full wasmtime integration is future work.

use axum::Json;
use serde::Serialize;

#[derive(Serialize)]
pub struct WasmStatus {
    pub mode: &'static str,
    pub available: bool,
    pub note: &'static str,
}

pub async fn wasm_status() -> Json<WasmStatus> {
    Json(WasmStatus {
        mode: "wasm",
        available: false,
        note: "use mode=pod; wasmtime host planned for lightweight workloads",
    })
}
