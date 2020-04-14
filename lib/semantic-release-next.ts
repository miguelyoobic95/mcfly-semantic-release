import chalk from 'chalk';
import * as yargs from 'yargs';

yargs.option('files', {type: 'array', desc: 'Files where the version should be bumped'});

console.log(chalk.green('Welcome to semantic release next, we are here to help you release your app!'));