# worker-cors

Same as other projects, you can use this script to build a cors proxy by Cloudflare Worker.

## Usage

Clone this project.

```bash
git clone https://github.com/backrunner/worker-cors.git -b main --depth 1
```

Copy `config.tmpl.js` to `config.js`.

Modify the `config.js`:

```js
module.exports = {
  host: 'WORKERNAME.SUBDOMAIN.workers.dev', // host should be the same as your Cloudflare worker
  whitelist: ['http://localhost:8080']  // allow specific requset origin to access proxy
}
```

Then run this command:

```bash
npm run build
```

You will get a worker script in `./dist`, deploy it to Cloudflare Worker.

## License

MIT
