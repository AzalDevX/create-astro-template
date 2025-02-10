// src/utils/animations.js
import chalk from 'chalk';
import gradient from 'gradient-string';
import figlet from 'figlet';
import { createSpinner } from 'nanospinner';

export class AnimatedUI {
  constructor() {
    this.gradient = gradient(['#FF4D4D', '#F9CB28', '#4DC4FF']);
    this.rainbow = gradient([
      '#FF0000',
      '#FF7F00',
      '#FFFF00',
      '#00FF00',
      '#0000FF',
      '#4B0082',
      '#8F00FF',
    ]);
  }

  async showWelcome() {
    console.clear();
    const text = await new Promise((resolve) => {
      figlet(
        'Astro Template',
        {
          font: 'ANSI Shadow',
          horizontalLayout: 'default',
          verticalLayout: 'default',
        },
        (err, data) => {
          resolve(data);
        }
      );
    });

    console.log(this.gradient.multiline(text));
    console.log('\n');
  }

  createSpinner(text) {
    return createSpinner(chalk.cyan(text), {
      color: 'cyan',
      frames: ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'],
      interval: 80,
    });
  }

  success(text) {
    console.log(chalk.green('✔ ') + this.gradient(text));
  }

  error(text) {
    console.log(chalk.red('✖ ') + text);
  }

  info(text) {
    console.log(chalk.blue('ℹ ') + text);
  }

  rainbow(text) {
    console.log(this.rainbow(text));
  }
}
