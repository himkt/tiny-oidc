import { Context } from "../models/context";
import { ServerResponse } from "http";
import { AccessToken } from "../models/access_token";
import { AuthCode } from "../models/auth_code";
import { Client } from "../models/client";
import { JwtService } from "../services/jwt_service";

type ResponseData = {
  id_token: string;
  access_token: string;
  token_type: string;
  expires_in: number;
};

type RequestParams = {
  grantType: string | null;
  code: string | null;
  redirectUri: string | null;
  clientId: string | null;
  clientSecret: string | null; // 追加
};
type TokenError =
  | 'invalid_request'
  | 'invalid_client'
  | 'invalid_grant'
  | 'unauthorized_client'
  | 'unsupported_grant_type'
  | 'invalid_scope';
type ErrorResponse = {
  error: TokenError;
  error_description?: string;
  error_uri?: string;
};
const validate = (requestParams: RequestParams, authCode?: AuthCode, client?: Client): TokenError | null => { // authCodeを追加
  if (!requestParams.clientId || !requestParams.code || !requestParams.grantType || !requestParams.redirectUri) {
    return 'invalid_request';
  }
  if (requestParams.grantType !== 'authorization_code') {
    return 'unsupported_grant_type';
  }
  // https://openid-foundation-japan.github.io/rfc6749.ja.html#code-authz-resp
  if (!authCode || authCode.usedAt || authCode.redirectUri !== requestParams.redirectUri) {
    return 'invalid_grant';
  }
  if (!client || client.clientSecret !== requestParams.clientSecret) {
    return 'invalid_client';
  }
  return null;
};

export const postToken = (db: Context, params: URLSearchParams, res: ServerResponse) => {
  const clientId = params.get('client_id');
  const code = params.get('code');

  const grantType = params.get('grant_type');
  const redirectUri = params.get('redirect_uri');
  const clientSecret = params.get('client_secret');

  const client = db.clients.find((c) => c.clientId === clientId);
  const requestParams: RequestParams = { grantType, code, redirectUri, clientId, clientSecret };

  // NOTE: 未使用の認可コードを見つけてくる
  const authCode = db.authCodes.find((ac) => {
    return ac.code === code && ac.clientId === clientId && ac.expiresAt > new Date();
  });
  const validateError = validate(requestParams, authCode, client); // clientを追加
  if (validateError) {
    res.writeHead(400, {
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
      Pragma: "no-cache",
    });
    const response: ErrorResponse = { error: validateError };
    res.end(JSON.stringify(response));
    return;
  }

  // NOTE: 一度使用した認可コードには使用済み日時を入れる
  // 後ほど使用済みであればエラーにするようバリデーションを追加する
  authCode!.usedAt = new Date();
  authCode!.save(db.authCodes);

  const accessToken = AccessToken.build(authCode!.userId); // 追加
  accessToken.save(db.accessTokens); // 追加

  res.writeHead(200, {
    'Content-Type': 'application/json',
    'Cache-Control': 'no-store',
    Pragma: 'no-cache'
  });
  const jwtService = new JwtService(); // 追加
  const jwt = jwtService.generate('http://localhost:3000', 'tiny-client', authCode!.nonce!);
  const data: ResponseData = {
    id_token: jwt, // 変更
    access_token: accessToken.token, // 追加
    token_type: 'Bearer',
    expires_in: 86400
  };
  res.end(JSON.stringify(data));
};
