// router.js — minimal hash-based router
// Routes: #/ #/conditional #/op/:id #/condition/:id

const _handlers = new Map();

export function on(pattern, handler) {
  _handlers.set(pattern, handler);
}

export function navigate(path) {
  location.hash = path;
}

export function current() {
  return location.hash.slice(1) || '/';
}

export function start() {
  window.addEventListener('hashchange', _dispatch);
  _dispatch();
}

function _dispatch() {
  const path = location.hash.slice(1) || '/';
  for (const [pattern, handler] of _handlers) {
    const params = _match(pattern, path);
    if (params !== null) {
      handler(params);
      return;
    }
  }
}

function _match(pattern, path) {
  const pp = pattern.split('/');
  const hp = path.split('/');
  if (pp.length !== hp.length) return null;
  const params = {};
  for (let i = 0; i < pp.length; i++) {
    if (pp[i].startsWith(':')) {
      params[pp[i].slice(1)] = decodeURIComponent(hp[i]);
    } else if (pp[i] !== hp[i]) {
      return null;
    }
  }
  return params;
}
