const ONE_DAY = 60 * 60 * 24; // 86400
export class AccessToken {
  token: string;
  expiresAt: number;
  userId: number;

  constructor(token: string, expiresAt: number, userId: number) {
    this.token = token;
    this.expiresAt = expiresAt;
    this.userId = userId;
  }

  static build(userId: number) {
    const token = Math.random().toString(36).slice(-8);
    const expiresIn = ONE_DAY * 1000;
    return new AccessToken(token, new Date().getTime() + expiresIn, userId);
  }

  save(db: AccessToken[]) {
    if (db.some((at) => at.userId === this.userId)) {
      const index = db.findIndex((at) => at.userId === this.userId);
      db[index] = this;
    } else {
      db.push(this);
    }
  }

  isValid() {
    return this.expiresAt > Date.now();
  }
}
