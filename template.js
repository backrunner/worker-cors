const HOST = '${CF_HOST}';
const WHITELIST = ${CF_WHITELIST};

const URL_TESTER = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()!@:%_\+.~#?&\/\/=]*)/;

const getUrl = s => s.replace(`https://${HOST}/`, '');

const paramError = () => {
  const res = new Response('URL is not right.', {
    status: 400,
  });
  res.headers.set('Access-Control-Allow-Origin', '*');
  res.headers.append('Vary', 'Origin');
  return res;
}

const methodError = () => {
  const res = new Response('Method is not supported.', {
    status: 422,
  });
  res.headers.set('Access-Control-Allow-Origin', '*');
  res.headers.set('Vary', 'Origin');
  return res;
}

function handleOptions() {
  return new Response(null, {
    headers: {
      'Allow': 'GET, HEAD, POST, OPTIONS',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, HEAD, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

async function handleRequest(request) {
  const url = getUrl(request.url);
  if (!URL_TESTER.test(url)) {
    return paramError();
  }
  const ip = request.headers.get('CF-Connecting-IP');
  if (ip) {
    request.headers.set('X-Forwarded-For', ip);
    request.headers.set('X-Real-IP', ip);
  }
  request.headers.delete('Origin');
  request.headers.delete('Referer');
  const response = await fetch(request);
  res.headers.set('Access-Control-Allow-Origin', '*');
  res.headers.set('Vary', 'Origin');
  return response;
}

addEventListener('fetch', (event) => {
  const request = event.request;
  const origin = request.headers.get('Origin');
  if (!origin) {
    event.respondWith(new Response('Only support XMLHttpRequest.', {
      status: 400,
    }));
    return;
  }
  let pass = false;
  if (WHITELIST && Array.isArray(WHITELIST) && WHITELIST.length > 0) {
    for (const o of WHITELIST) {
      if (origin === o.replace(/\/$/, '')) {
        pass = true;
        break;
      }
    }
  }
  if (!pass) {
    event.respondWith(new Response('Origin is not in whitelist.', {
      status: 400,
    }));
  }
  switch (request.method) {
    case 'OPTIONS':
      event.respondWith(handleOptions());
      break;
    case 'GET':
    case 'POST':
    case 'HEAD':
      event.respondWith(handleRequest(request));
      break;
    default:
      event.respondWith(methodError());
      break;
  }
});
