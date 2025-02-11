// src/utils/github.js
import { execSync } from 'child_process';
import { logger } from './logger.js';

export class GitHubClient {
  constructor() {
    this.checkGitHubCLI();
  }

  checkGitHubCLI() {
    try {
      const ghVersion = execSync('gh --version', { encoding: 'utf8' });
      logger.info(`GitHub CLI detectado: ${ghVersion.split('\n')[0]}`);
    } catch (error) {
      logger.error(
        'GitHub CLI (gh) no está instalado. Por favor, instálalo desde: https://cli.github.com/'
      );
      process.exit(1);
    }
  }

  async getUser() {
    try {
      const userData = execSync('gh api user', { encoding: 'utf8' });
      return JSON.parse(userData);
    } catch (error) {
      if (error.status === 1) {
        logger.error(
          'No has iniciado sesión en GitHub CLI. Ejecuta: gh auth login'
        );
        process.exit(1);
      }
      throw error;
    }
  }

  async createRepository(name, options = {}) {
    try {
      const visibility = options.private ? '--private' : '--public';
      const description = options.description
        ? `--description "${options.description}"`
        : '';

      execSync(
        `gh repo create ${name} ${visibility} ${description} --confirm`,
        {
          stdio: 'inherit',
        }
      );
      return true;
    } catch (error) {
      logger.error('Error creando repositorio');
      throw error;
    }
  }
}
