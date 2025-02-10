// src/commands/create.js
import inquirer from 'inquirer';
import { GitHubClient } from '../utils/github.js';
import { Spinner } from '../utils/spinner.js';
import { logger } from '../utils/logger.js';
import { setup } from './setup.js';

export async function create(options) {
  const spinner = new Spinner();

  try {
    // Inicializar cliente de GitHub
    const github = new GitHubClient();

    // Verificar usuario actual
    spinner.start('Verificando usuario de GitHub...');
    const user = await github.getUser(); // Cambiamos getCurrentUser a getUser
    spinner.succeed(`Usando cuenta de GitHub: ${user.login}`);

    // Obtener nombre del repositorio
    const repoName =
      options.name ||
      (
        await inquirer.prompt([
          {
            type: 'input',
            name: 'name',
            message: 'Nombre para el nuevo repositorio:',
            validate: (input) => input.length > 0,
          },
        ])
      ).name;

    // Crear repositorio
    spinner.start('Creando repositorio...');
    await github.createRepository(repoName, options.private);
    spinner.succeed('Repositorio creado exitosamente');

    // Clonar y configurar
    await setup(user.login, repoName);

    logger.success(`\n¡Proyecto creado exitosamente! 🚀`);
    logger.info(
      `GitHub Repository: https://github.com/${user.login}/${repoName}`
    );
  } catch (error) {
    spinner.fail('Error en el proceso');
    logger.error(error.message);
    process.exit(1);
  }
}
