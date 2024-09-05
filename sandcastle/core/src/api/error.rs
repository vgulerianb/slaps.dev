use axum::http::StatusCode;
use axum::response::{IntoResponse, Response};
use axum::Json;
use serde::Serialize;

#[derive(Serialize)]
pub struct ErrorBody {
    pub error: String,
}

pub struct ApiError(pub StatusCode, pub String);

impl IntoResponse for ApiError {
    fn into_response(self) -> Response {
        let body = Json(ErrorBody { error: self.1 });
        (self.0, body).into_response()
    }
}
