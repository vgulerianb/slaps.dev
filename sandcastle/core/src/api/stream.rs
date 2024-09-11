use axum::extract::ws::{Message, WebSocket, WebSocketUpgrade};
use axum::extract::{Path, State};
use axum::response::IntoResponse;
use futures_util::SinkExt;
use std::sync::Arc;
use std::time::Duration;
use tokio::io::AsyncReadExt;
use tokio::sync::mpsc;
use uuid::Uuid;

use crate::exec;
use crate::state::AppState;

enum StreamEv {
    Out(String),
    Err(String),
    Exit(i32),
}

pub async fn exec_stream_ws(
    ws: WebSocketUpgrade,
    State(st): State<Arc<AppState>>,
    Path(id): Path<Uuid>,
) -> impl IntoResponse {
    ws.on_upgrade(move |socket| handle_exec_stream(socket, st, id))
}

async fn handle_exec_stream(mut socket: WebSocket, st: Arc<AppState>, id: Uuid) {
    let first = match socket.recv().await {
        Some(Ok(Message::Text(t))) => t,
        Some(Ok(Message::Binary(b))) => String::from_utf8_lossy(&b).to_string(),
        _ => {
            let _ = socket
                .send(Message::Text(
                    r#"{"type":"error","message":"expected JSON command"}"#.into(),
                ))
                .await;
            return;
        }
    };
    let body: crate::models::ExecBody = match serde_json::from_str(&first) {
        Ok(b) => b,
        Err(e) => {
            let _ = socket
                .send(Message::Text(
                    format!(r#"{{"type":"error","message":"{}"}}"#, e).into(),
                ))
                .await;
            return;
        }
    };

    let (path, env, cmd_timeout) = {
        let map = st.sandboxes.read().await;
        let sb = match map.get(&id) {
            Some(s) => s,
            None => {
                let _ = socket
                    .send(Message::Text(
                        r#"{"type":"error","message":"sandbox not found"}"#.into(),
                    ))
                    .await;
                return;
            }
        };
        (
            sb.path.clone(),
            sb.env.clone(),
            body
                .timeout_secs
                .map(Duration::from_secs)
                .unwrap_or(st.config.default_command_timeout),
        )
    };

    if st.config.worker_base_url.is_some() {
        let _ = socket
            .send(Message::Text(
                r#"{"type":"error","message":"streaming needs local mode without worker"}"#.into(),
            ))
            .await;
        return;
    }

    let (stdout, stderr, mut child) = match exec::stream_command(&path, &env, &body.command, cmd_timeout).await
    {
        Ok(x) => x,
        Err(e) => {
            let _ = socket
                .send(Message::Text(
                    format!(r#"{{"type":"error","message":"{}"}}"#, e).into(),
                ))
                .await;
            return;
        }
    };

    let (tx, mut rx) = mpsc::unbounded_channel::<StreamEv>();

    let tx_o = tx.clone();
    tokio::spawn(async move {
        let mut stdout = stdout;
        let mut buf = vec![0u8; 4096];
        loop {
            match stdout.read(&mut buf).await {
                Ok(0) => break,
                Ok(n) => {
                    let s = String::from_utf8_lossy(&buf[..n]).to_string();
                    if tx_o.send(StreamEv::Out(s)).is_err() {
                        break;
                    }
                }
                Err(_) => break,
            }
        }
    });

    let tx_e = tx.clone();
    tokio::spawn(async move {
        let mut stderr = stderr;
        let mut buf = vec![0u8; 4096];
        loop {
            match stderr.read(&mut buf).await {
                Ok(0) => break,
                Ok(n) => {
                    let s = String::from_utf8_lossy(&buf[..n]).to_string();
                    if tx_e.send(StreamEv::Err(s)).is_err() {
                        break;
                    }
                }
                Err(_) => break,
            }
        }
    });

    tokio::spawn(async move {
        let code = match tokio::time::timeout(cmd_timeout, child.wait()).await {
            Ok(Ok(s)) => s.code().unwrap_or(-1),
            Ok(Err(_)) => -1,
            Err(_) => {
                let _ = child.kill().await;
                124
            }
        };
        let _ = tx.send(StreamEv::Exit(code));
    });

    drop(tx);

    while let Some(ev) = rx.recv().await {
        let msg = match ev {
            StreamEv::Out(s) => format!(
                r#"{{"type":"stdout","data":{}}}"#,
                serde_json::to_string(&s).unwrap_or_default()
            ),
            StreamEv::Err(s) => format!(
                r#"{{"type":"stderr","data":{}}}"#,
                serde_json::to_string(&s).unwrap_or_default()
            ),
            StreamEv::Exit(c) => format!(r#"{{"type":"exit","code":{c}}}"#),
        };
        if socket.send(Message::Text(msg.into())).await.is_err() {
            break;
        }
    }
}
