import { Client } from './client'; // 追加
import { AccessToken } from './access_token';
import { AuthCode } from './auth_code';
import { User } from './user';

export type Context = {
  users: User[];
  authCodes: AuthCode[];
  accessTokens: AccessToken[];
  clients: Client[]; // 追加
};
