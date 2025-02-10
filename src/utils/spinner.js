import ora from 'ora';
import chalk from 'chalk';

export class Spinner {
  constructor() {
    this.spinner = ora();
  }

  start(text) {
    this.spinner.start(chalk.blue(text));
  }

  succeed(text) {
    this.spinner.succeed(chalk.green(text));
  }

  fail(text) {
    this.spinner.fail(chalk.red(text));
  }
}