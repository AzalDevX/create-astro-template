#!/usr/bin/env node
import { program } from 'commander';
import { create } from '../src/commands/create.js';
import gradient from 'gradient-string';
import figlet from 'figlet';

// Mostrar título animado
console.log(
  gradient.pastel.multiline(
    figlet.textSync('Astro Template', {
      font: 'ANSI Shadow',
    })
  )
);

program
  .version('1.0.0')
  .description('CLI para crear proyectos Astro con integración GitHub')
  .option('-n, --name <name>', 'nombre del repositorio')
  .option('-p, --private', 'crear repositorio privado')
  .action(create);

program.parse(process.argv);