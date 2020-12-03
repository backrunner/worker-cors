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

let output = template.replace('${CF_HOST}', config.host).replace('${CF_WHITELIST}', JSON.stringify(config.whitelist));

if (config.useCache) {
  const cacheConfig = {
    cacheEverything: true,
    cacheKey: '${URL_PARAM}',
    cacheTtlByStatus: {
      "200-299": config.cacheTtl || 86400,
      "400-499": 3,
      "500-599": 0,
    },
  };
  output = output.replace('${CACHE_CONFIG}', `, ${JSON.stringify({ cf: cacheConfig }).replace('"${URL_PARAM}"', 'url')}`);
} else {
  output = output.replace('${CACHE_CONFIG}', '');
}

if (config.useBrowserCache) {
  output = output.replace('${BROWSER_CACHE_CONFIG}', `if (response.status === 200) res.headers.set('Cache-Control', 'max-age=${config.browserCacheTtl || 3600}');`);
} else {
  output = output.replace('\r\n  ${BROWSER_CACHE_CONFIG}', '');
}

fs.writeFileSync(outputPath, output, { encoding: 'utf-8' });

console.info('Worker generated.');
