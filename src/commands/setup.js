// src/commands/setup.js
import { execSync } from 'child_process';
import inquirer from 'inquirer';
import path from 'path';
import fs from 'fs';
import { getOSCommands } from '../utils/os.js';

export async function setup(username, repoName, ui) {
  const osCommands = getOSCommands();
  
  try {
    // Verificar si el directorio ya existe
    if (fs.existsSync(repoName)) {
      const { shouldReplace } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'shouldReplace',
          message: '🤔 Mmm... El directorio ya existe. ¿Quieres reemplazarlo?',
          default: false
        }
      ]);

      if (shouldReplace) {
        const spinner = ui.createSpinner('Eliminando directorio existente...').start();
        execSync(osCommands.removeDir(repoName));
        spinner.success({ text: '🗑️ ¡Directorio eliminado exitosamente!' });
      } else {
        ui.error('❌ Operación cancelada');
        process.exit(1);
      }
    }

    // Clonar template
    const cloneSpinner = ui.createSpinner('🚀 Clonando template mágico...').start();
    try {
      execSync(`git clone https://github.com/AzalDevX/astro-template.git ${repoName}`, {
        stdio: 'pipe'
      });
      cloneSpinner.success({ text: '✨ ¡Template clonado exitosamente!' });
    } catch (error) {
      cloneSpinner.error({ text: '❌ Error al clonar el template' });
      throw error;
    }

    // Cambiar al directorio del proyecto
    process.chdir(repoName);
    
    // Configurar Git
    const gitSpinner = ui.createSpinner('🔧 Configurando Git...').start();
    try {
      // Eliminar .git y reinicializar
      execSync(osCommands.removeDir('.git'));
      execSync('git init', { stdio: 'pipe' });
      
      // Configurar Git para manejar correctamente los finales de línea
      execSync('git config core.autocrlf true', { stdio: 'pipe' });
      
      // Actualizar package.json
      updatePackageJson(repoName);
      
      // Configurar git y hacer primer commit en main
      execSync('git add .', { stdio: 'pipe' });
      execSync('git commit -m "🎉 Initial commit"', { stdio: 'pipe' });
      
      // Crear y cambiar a la rama main
      execSync('git branch -M main', { stdio: 'pipe' });
      
      // Añadir remoto y push
      execSync(`git remote add origin https://github.com/${username}/${repoName}.git`, { stdio: 'pipe' });
      gitSpinner.success({ text: '✅ Git configurado exitosamente' });

      // Push al repositorio
      const pushSpinner = ui.createSpinner('🚀 Subiendo cambios a GitHub...').start();
      try {
        execSync('git push -u origin main --force', { stdio: 'pipe' });
        pushSpinner.success({ text: '🎉 ¡Cambios subidos exitosamente!' });
      } catch (error) {
        pushSpinner.error({ text: '❌ Error al subir los cambios' });
        throw error;
      }

      // Instalar dependencias
      const installSpinner = ui.createSpinner('📦 Instalando dependencias...').start();
      try {
        execSync('npm install', { stdio: 'pipe' });
        installSpinner.success({ text: '✅ Dependencias instaladas correctamente' });
      } catch (error) {
        installSpinner.error({ text: '❌ Error al instalar dependencias' });
        throw error;
      }

    } catch (error) {
      gitSpinner.error({ text: '❌ Error en la configuración de Git' });
      throw error;
    }

  } catch (error) {
    ui.error('❌ Error en la configuración');
    ui.error(error.message);
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