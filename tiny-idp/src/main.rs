use axum::{
    http::StatusCode, response::IntoResponse, routing::{get, post}, Form, Json, Router
};
use serde::{Deserialize, Serialize};


#[derive(Deserialize)]
struct LoginParam {
    id: usize,
    password: String,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct User {
    id: usize,
    email: String,
    password: String,
    client_id: String,
}

#[derive(Serialize)]
struct UnauthorizedUser {
    error: String,
}

#[derive(Serialize)]
#[serde(untagged)]
enum LoginResponse {
    Success { user: User },
    Error { error: String }
}

async fn login(Form(params): Form<LoginParam>) -> impl IntoResponse {
    if params.id == 1 && params.password == "p@ssw0rd" {
        let user = User {
            id: params.id,
            email: "tiny-idp@asmsuechan.com".to_string(),
            password: params.password,
            client_id: "tiny-client".to_string(),
        };
        let response = LoginResponse::Success { user };
        return (StatusCode::ACCEPTED, Json(response));
    }
    let error = LoginResponse::Error {
        error: "unauthorized".to_string(),
    };
    (StatusCode::UNAUTHORIZED, Json(error))
}

#[tokio::main]
async fn main() {
    let app = Router::new()
        .route("/login", post(login))
        .route("/openid-connect/auth", get(|| async { {} }))
        .route("/openid-connect/token", post(|| async { {} }))
        .route("/openid-connect/introspect", post(|| async { {} }))
        .route("/openid-connect/jwks.json", get(|| async { {} }))
        .route("/openid-connect/.well-known/openid-configuration", get(|| async { {} }))
        ;

    let listener = tokio::net::TcpListener::bind("0.0.0.0:3000").await.unwrap();
    axum::serve(listener, app).await.unwrap();
}
