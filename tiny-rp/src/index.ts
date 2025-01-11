// Derived from https://www.m3tech.blog/entry/2024/03/05/150000.
import express from "express";
import { Issuer } from "openid-client";

const app = express();
const port = 4000;

const issuer = new Issuer({
  issuer: "http://localhost:3000",
  authorization_endpoint: "http://localhost:3000/openid-connect/auth",
  token_endpoint: "http://localhost:3000/openid-connect/token",
  jwks_uri: "http://localhost:3000/openid-connect/jwks",
});
const { Client } = issuer;
const client = new Client({
  client_id: "tiny-client",
  client_secret: "hoge",
});

app.get("/", async (_, res) => {
  const authorizationUri = client.authorizationUrl({
    redirect_uri: "http://localhost:4000/oidc/callback",
    scope: "openid",
  });
  res.send(`<!DOCTYPE html>
<html>
<head>
    <title>tiny-rp</title>
</head>
<body>
    <div><h1>tiny-idp Login</h1></div>
    <div><a href="${authorizationUri}">Login</a></div>
</body>
</html>`);
});

app.get("/oidc/callback", async (req, res) => {
  // TODO: トークンを検証するコードは後で追加します
  const redirect_uri = "http://localhost:4000/oidc/callback";
  const code = String(req.query.code);
  const scope = String(req.query.scope);
  try {
    const tokenResponse = await fetch(
      "http://localhost:3000/openid-connect/token",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          code,
          // code: "invalid_code",
          redirect_uri, // TODO(himkt); なんでこれ必要なの？ -> 検証で使うからっぽい？
          scope,
          grant_type: "authorization_code",
          // grant_type: "invalid_grant", // authorization_codeから変更 -> ちゃんとエラーになる
          client_id: "tiny-client",
        }),
      }
    );
    const tokenSet = await tokenResponse.json();
    res.json({ tokenSet });
    return;
  } catch (error) {
    console.error("Access Token Error: ", error);
    res.status(500);
    res.json({ error: "Access Token Error" });
    return;
  }
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
