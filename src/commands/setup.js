// src/commands/setup.js
import { execSync } from 'child_process';
import { Spinner } from '../utils/spinner.js';
import { logger } from '../utils/logger.js';
import { getOSCommands } from '../utils/os.js';
import inquirer from 'inquirer';
import path from 'path';
import fs from 'fs';

export async function setup(username, repoName) {
  const spinner = new Spinner();
  const osCommands = getOSCommands();

  try {
    // Verificar si el directorio ya existe
    if (fs.existsSync(repoName)) {
      const { shouldReplace } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'shouldReplace',
          message: `El directorio ${repoName} ya existe. ¿Deseas reemplazarlo?`,
          default: false,
        },
      ]);

      if (shouldReplace) {
        spinner.start('Eliminando directorio existente...');
        execSync(osCommands.removeDir(repoName));
        spinner.succeed('Directorio eliminado');
      } else {
        logger.error('Operación cancelada');
        process.exit(1);
      }
    }

    // Clonar template
    spinner.start('Clonando template...');
    execSync(
      `git clone https://github.com/AzalDevX/astro-template.git ${repoName}`
    );
    spinner.succeed('Template clonado');

    // Cambiar al directorio del proyecto
    process.chdir(repoName);

    // Configurar Git
    spinner.start('Configurando Git...');

    // Eliminar .git y reinicializar
    execSync(osCommands.removeDir('.git'));
    execSync('git init');

    // Configurar Git para manejar correctamente los finales de línea
    execSync('git config core.autocrlf true');

    // Actualizar package.json
    updatePackageJson(repoName);

    // Configurar git y hacer primer commit en main
    execSync('git add .');
    execSync('git commit -m "Initial commit"');

    // Crear y cambiar a la rama main
    execSync('git branch -M main');

    // Añadir remoto y push
    execSync(
      `git remote add origin https://github.com/${username}/${repoName}.git`
    );
    execSync('git push -u origin main --force');

    spinner.succeed('Repositorio configurado exitosamente');
  } catch (error) {
    spinner.fail('Error en la configuración');
    logger.error(error.message);
    throw error;
  }
}

function updatePackageJson(repoName) {
  const packagePath = path.join(process.cwd(), 'package.json');
  if (fs.existsSync(packagePath)) {
    const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
    pkg.name = repoName;
    pkg.version = '0.1.0';
    fs.writeFileSync(packagePath, JSON.stringify(pkg, null, 2));
  }
}
