// filter.js — filter state and application
// State is module-level. All mutations go through set(); all reads through apply().

let _state = { category: '', tectonic: '', query: '' };

export function set(key, value) {
  _state[key] = value;
}

export function getState() {
  return { ..._state };
}

export function reset() {
  _state = { category: '', tectonic: '', query: '' };
}

export function apply(items) {
  let result = items;

  if (_state.category) {
    result = result.filter(op => op.category === _state.category);
  }

  if (_state.tectonic) {
    result = result.filter(op => op.tectonic_tendency === _state.tectonic);
  }

  if (_state.query) {
    const q = _state.query.toLowerCase().trim();
    result = result.filter(op =>
      op.verb.toLowerCase().includes(q) ||
      op.description.toLowerCase().includes(q) ||
      op.tags.some(t => t.toLowerCase().includes(q))
    );
  }

  return result;
}
