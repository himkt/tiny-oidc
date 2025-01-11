import { AccessToken } from "./access_token"; // 追加
import { AuthCode } from "./auth_code";
import { User } from "./user";

export type Context = {
  users: User[];
  authCodes: AuthCode[];
  accessTokens: AccessToken[]; // 追加
};
