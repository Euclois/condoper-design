/**
 * db.js — data access abstraction
 * All data reads go through this module. If the data layer is upgraded
 * to SQLite via sql.js WASM, only this file changes.
 */

const DATA_PATH = '/data/';

const _cache = {};

async function _load(filename) {
  if (_cache[filename]) return _cache[filename];
  const res = await fetch(`${DATA_PATH}${filename}`);
  if (!res.ok) throw new Error(`Failed to load ${filename}: ${res.status}`);
  _cache[filename] = await res.json();
  return _cache[filename];
}

export async function getOperations() {
  return _load('operations.json');
}

export async function getConditions() {
  return _load('conditions.json');
}

export async function getValues() {
  return _load('values.json');
}

export async function getOperationById(id) {
  const ops = await getOperations();
  return ops.find(op => op.id === id) ?? null;
}

export async function getOperationsByCategory(category) {
  const ops = await getOperations();
  return ops.filter(op => op.category === category);
}

export async function getOperationsByTectonic(tendency) {
  const ops = await getOperations();
  return ops.filter(op => op.tectonic_tendency === tendency);
}

export async function getConditionsByCategory(category) {
  const conds = await getConditions();
  return conds.filter(c => c.category === category);
}

export async function getConditionById(id) {
  const conds = await getConditions();
  return conds.find(c => c.id === id) ?? null;
}

export async function searchOperations(query) {
  const ops = await getOperations();
  const q = query.toLowerCase().trim();
  if (!q) return ops;
  return ops.filter(op =>
    op.verb.toLowerCase().includes(q) ||
    op.description.toLowerCase().includes(q) ||
    op.tags.some(t => t.toLowerCase().includes(q))
  );
}

export async function filterOperations({ category, tectonic, query } = {}) {
  let ops = await getOperations();
  if (category) ops = ops.filter(op => op.category === category);
  if (tectonic) ops = ops.filter(op => op.tectonic_tendency === tectonic);
  if (query) {
    const q = query.toLowerCase().trim();
    ops = ops.filter(op =>
      op.verb.toLowerCase().includes(q) ||
      op.description.toLowerCase().includes(q) ||
      op.tags.some(t => t.toLowerCase().includes(q))
    );
  }
  return ops;
}

export function clearCache() {
  Object.keys(_cache).forEach(k => delete _cache[k]);
}
