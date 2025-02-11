// src/commands/create.js
import inquirer from 'inquirer';
import { GitHubClient } from '../utils/github.js';
import { AnimatedUI } from '../utils/animations.js';
import { setup } from './setup.js';
import {
  checkGitHubDesktop,
  openInGitHubDesktop,
} from '../utils/github-desktop.js';
import path from 'path';

export async function create(options) {
  const ui = new AnimatedUI();
  await ui.showWelcome();

  try {
    // Inicializar cliente de GitHub
    const github = new GitHubClient();

    // Verificar usuario actual
    const spinner = ui
      .createSpinner('Verificando usuario de GitHub...')
      .start();
    const user = await github.getUser();
    spinner.success({ text: `¡Bienvenido, ${user.login}! 🚀` });

    // Preguntar detalles del repositorio
    const answers = await inquirer.prompt([
      {
        type: 'input',
        name: 'repoName',
        message: '¿Qué nombre quieres para tu repositorio?',
        validate: (input) => {
          if (!input) return 'El nombre es requerido';
          if (!/^[a-zA-Z0-9-_]+$/.test(input)) {
            return 'El nombre solo puede contener letras, números, guiones y guiones bajos';
          }
          return true;
        },
      },
      {
        type: 'input',
        name: 'description',
        message: '📝 Descripción del repositorio (opcional):',
        default: 'Proyecto creado con create-astro-template de AzalDevX',
      },
      {
        type: 'list',
        name: 'visibility',
        message: '🔒 ¿Quieres que el repositorio sea público o privado?',
        choices: [
          { name: '🌎 Público - Visible para todos', value: 'public' },
          { name: '🔐 Privado - Solo visible para ti', value: 'private' },
        ],
        default: 'public',
      },
    ]);

    // Crear repositorio
    const createSpinner = ui
      .createSpinner('🚀 Creando repositorio mágico...')
      .start();
    await github.createRepository(answers.repoName, {
      private: answers.visibility === 'private',
      description: answers.description,
    });
    createSpinner.success({ text: '✨ ¡Repositorio creado exitosamente!' });

    // Clonar y configurar
    await setup(user.login, answers.repoName, ui);

    // Mostrar mensaje de éxito
    ui.rainbow('\n🎉 ¡Proyecto creado exitosamente! 🎉');
    ui.info(
      `\nGitHub Repository: https://github.com/${user.login}/${answers.repoName}`
    );

    // Verificar GitHub Desktop
    const hasGitHubDesktop = checkGitHubDesktop();
    if (hasGitHubDesktop) {
      const { openDesktop } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'openDesktop',
          message: '🖥️ ¿Quieres abrir el repositorio en GitHub Desktop?',
          default: true,
        },
      ]);

      if (openDesktop) {
        const repoPath = path.resolve(process.cwd(), answers.repoName);
        await new Promise((resolve) => setTimeout(resolve, 1000));

        const opened = openInGitHubDesktop(repoPath);
        if (opened) {
          ui.success('🚀 ¡Abriendo GitHub Desktop!');
        } else {
          ui.error(
            '❌ No se pudo abrir GitHub Desktop. Por favor, ábrelo manualmente.'
          );
          ui.info(`📂 Ruta del repositorio: ${repoPath}`);
        }
      }
    }
  } catch (error) {
    ui.error('❌ Error en el proceso');
    ui.error(error.message);
    process.exit(1);
  }
}
