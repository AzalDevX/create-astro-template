// src/utils/github.js
import { execSync } from 'child_process';
import { logger } from './logger.js';

export class GitHubClient {
  constructor() {
    this.checkGitHubCLI();
  }

  checkGitHubCLI() {
    try {
      // Intentamos ejecutar gh con más información de debug
      const ghVersion = execSync('gh --version', { encoding: 'utf8' });
      logger.info(`GitHub CLI detectado: ${ghVersion.split('\n')[0]}`);
    } catch (error) {
      logger.error('Error al detectar GitHub CLI:');
      logger.error(error.message);

      // Verificar si gh está en el PATH
      logger.info('\nVerificando PATH...');
      try {
        const path = process.env.PATH;
        logger.info(`PATH actual: ${path}`);
      } catch (e) {
        logger.error('No se pudo leer el PATH');
      }

      logger.info('\nPor favor, sigue estos pasos:');
      logger.info('1. Verifica que GitHub CLI está instalado:');
      logger.info('   - Windows: winget install --id GitHub.cli');
      logger.info('   - O descarga desde: https://cli.github.com/');
      logger.info('2. Cierra y vuelve a abrir la terminal');
      logger.info('3. Verifica la instalación con: gh --version');
      logger.info('4. Si el problema persiste, añade manualmente al PATH:');
      logger.info('   C:\\Program Files\\GitHub CLI\\');

      process.exit(1);
    }
  }

  async getUser() {
    // Cambiamos getCurrentUser a getUser
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

  async createRepository(name, isPrivate = false) {
    try {
      const visibility = isPrivate ? '--private' : '--public';
      execSync(`gh repo create ${name} ${visibility} --confirm`, {
        stdio: 'inherit',
      });
      return true;
    } catch (error) {
      logger.error('Error creando repositorio');
      throw error;
    }
  }
}
