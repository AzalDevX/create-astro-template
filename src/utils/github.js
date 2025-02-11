// src/utils/github.js
import { execSync, spawn } from 'child_process';
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
        'GitHub CLI (gh) no está instalado. Por favor, instálalo desde: https://cli.github.com/ o visita https://lalo.lol/create-astro-template.'
      );
      process.exit(1);
    }
  }

  async getUser() {
    try {
      const userData = execSync('gh api user', { encoding: 'utf8' });
      return JSON.parse(userData);
    } catch (error) {
      // Si no está autenticado, ejecutar login
      if (error.message.includes('gh auth login')) {
        logger.info('🔑 Iniciando autenticación con GitHub...');

        try {
          // Ejecutar el login de forma interactiva
          execSync('gh auth login --web', {
            stdio: 'inherit', // Esto es crucial para la interactividad
            encoding: 'utf8',
          });

          // Intentar obtener los datos del usuario nuevamente después del login
          logger.info('🔄 Verificando autenticación...');
          const newUserData = execSync('gh api user', { encoding: 'utf8' });
          return JSON.parse(newUserData);
        } catch (loginError) {
          logger.error('❌ Error durante la autenticación');
          logger.error(loginError.message);
          process.exit(1);
        }
      }

      logger.error('❌ Error inesperado');
      logger.error(error.message);
      process.exit(1);
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
