const path = require('path');
const fs = require('fs');
const config = require('./config');

const distDir = path.resolve(__dirname, './dist');
const templatePath = path.resolve(__dirname, './template.js');
const outputPath = path.resolve(distDir, 'worker.js');

if (!config || !config.host) {
  console.error('Configuraion error.');
  process.exit(-1);
}

if (!config.whitelist) {
  config.whitelist = [];
}

if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir);
}

if (!fs.existsSync(templatePath)) {
  console.error('Cannot find template.');
  process.exit(-1);
}

let template;
try {
  template = fs.readFileSync(templatePath, { encoding: 'utf-8' });
} catch (err) {
  console.error('Read template error: ', err);
  process.exit(-1);
}

const output = template.replace('${CF_HOST}', config.host).replace('${CF_WHITELIST}', JSON.stringify(config.whitelist));
fs.writeFileSync(outputPath, output, { encoding: 'utf-8' });

console.info('Worker generated.');
