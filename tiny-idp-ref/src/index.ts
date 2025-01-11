import http, { IncomingMessage, ServerResponse } from "http";
import url from 'url'
import { login } from './controllers/login_controller'
import { getAuth } from "./controllers/auth_controller";
import { User } from "./models/user";
import { AuthCode } from './models/auth_code';
import { postToken } from "./controllers/token_controller";
import { AccessToken } from "./models/access_token";

const users: User[] = [{ id: 1, email: 'himkt', password: 'p@ss', clientId: 'tiny-client' }];
const authCodes: AuthCode[] = [];
const accessTokens: AccessToken[] = []; // 追加
const db = {
  users,
  authCodes,
  accessTokens, // 追加
};

const server = http.createServer(
  (req: IncomingMessage, res: ServerResponse) => {
    console.log(`[${new Date()}] ${req.url}`);
    if (req.url === "/") {
      res.writeHead(200, { "Content-Type": "text/plain" });
      res.end("Hello tiny openid provider!");
    } else if (req.url?.split('?')[0] === '/login' && req.method === 'POST') {
      const query = url.parse(req.url, true).query;
      let body = '';
      req.on('data', (chunk) => {
        body += chunk;
      })
      req.on('end', () => {
        const params = new URLSearchParams(body);
        login(db, query, params, res);
      })
    } else if (req.url?.split('?')[0] === '/openid-connect/auth' && (req.method === 'GET' || req.method === 'POST')) {
      const query = url.parse(req.url, true).query;
      getAuth(db, query, res);
    } else if (req.url?.split('?')[0] === '/openid-connect/token' && req.method === 'POST') {
      let body = '';
      req.on('data', (chunk) => {
        body += chunk;
      });
      req.on('end', () => {
        const params = new URLSearchParams(body);
        postToken(db, params, res);
      });
    } else {
      res.writeHead(404, { "Content-Type": "text/plain" });
      res.end("Page not found");
    }
  }
);

server.listen(3000);
