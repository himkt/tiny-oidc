export class AuthCode {
  code: string;
  userId: number;
  clientId: string;
  expiresAt: Date;
  usedAt: Date | null = null;
  redirectUri: string;
  nonce: string | null = null; // 追加

  constructor(code: string, userId: number, clientId: string, expiresAt: Date, redirectUri: string, nonce: string | null = null) {
    this.code = code;
    this.userId = userId;
    this.clientId = clientId;
    this.expiresAt = expiresAt;
    this.redirectUri = redirectUri;
    this.nonce = nonce; // 追加
  }

  static build(userId: number, clientId: string, redirectUri: string, nonce: string | null = null) { // 変更
    const code = Math.random().toString(36).slice(-8);
    const oneMin = 1 * 60 * 1000;
    const expiresAt = new Date(Date.now() + oneMin);
    const authCode = new AuthCode(code, userId, clientId, expiresAt, redirectUri, nonce); // 変更
    return authCode;
  }

  // 既存レコードがあれば上書きし、なければ新規に保存する
  save(db: AuthCode[]) {
    if (db.some((ac) => ac.code === this.code)) {
      const index = db.findIndex((ac) => ac.code === this.code)
      db[index] = this;
    } else {
      db.push(this);
    }
  }
}
