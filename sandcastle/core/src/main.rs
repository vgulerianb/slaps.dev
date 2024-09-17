use sandcastle_core::api;
use sandcastle_core::config::Config;
use sandcastle_core::state::AppState;
use std::sync::Arc;

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    tracing_subscriber::fmt()
        .with_env_filter(tracing_subscriber::EnvFilter::from_default_env())
        .init();
    let config = Config::from_env();
    let state = Arc::new(AppState::new(config)?);
    let app = api::router(state.clone());
    let listener = tokio::net::TcpListener::bind(&state.config.bind).await?;
    tracing::info!("sandcastle listening on {}", state.config.bind);
    axum::serve(listener, app).await?;
    Ok(())
}
