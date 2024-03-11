use axum::{
    response::IntoResponse, routing::{get, post}, Router
};

async fn login() -> impl IntoResponse {
    {}
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
