// src/utils/auth.js
import http from 'http';
import open from 'open';
import { Octokit } from '@octokit/rest';
import { logger } from './logger.js';
import destroyer from 'server-destroy';

export class GitHubAuth {
  constructor(options) {
    this.clientId = options.clientId;
    this.clientSecret = options.clientSecret;
    this.port = options.port || 3000;
  }

  async authorize() {
    const server = http.createServer();
    destroyer(server);

    return new Promise((resolve, reject) => {
      server.on('request', async (req, res) => {
        try {
          if (req.url.startsWith('/callback')) {
            const code = new URL(req.url, 'http://localhost').searchParams.get(
              'code'
            );
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end('¡Autenticación exitosa! Puedes cerrar esta ventana.');

            server.destroy();

            // Intercambiar el código por un token de acceso
            const tokenResponse = await fetch(
              'https://github.com/login/oauth/access_token',
              {
                method: 'POST',
                headers: {
                  Accept: 'application/json',
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  client_id: this.clientId,
                  client_secret: this.clientSecret,
                  code: code,
                }),
              }
            );

            const data = await tokenResponse.json();
            resolve(data.access_token);
          }
        } catch (error) {
          reject(error);
        }
      });

      server.listen(this.port, () => {
        const authUrl = `https://github.com/login/oauth/authorize?client_id=${this.clientId}&scope=repo`;
        open(authUrl);
        logger.info('Abriendo navegador para autenticación...');
      });
    });
  }
}
