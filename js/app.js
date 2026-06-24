// app.js — entry point. Wires data, filters, UI, and DOM events.
import { getOperations, getConditions } from 'db';
import { apply as applyFilter, set as setFilter } from 'filter';
import {
  renderOperativeGrid,
  renderConditionalView,
  renderOperativeDrawer,
  renderConditionDrawer,
} from 'ui';

const $ = id => document.getElementById(id);

const mainEl   = $('main');
const toolbar  = $('toolbar');
const countEl  = $('count');
const searchEl = $('search');
const overlay  = $('overlay');
const drawer   = $('drawer');
const drawerBody = $('drawer-body');

let _ops   = [];
let _conds = [];
let _tab   = 'operative';

// ── bootstrap ────────────────────────────────────────────────────────

async function init() {
  [_ops, _conds] = await Promise.all([getOperations(), getConditions()]);
  _bindTabs();
  _bindFilters();
  _bindSearch();
  _bindDrawer();
  _render();
}

// ── tabs ─────────────────────────────────────────────────────────────

function _bindTabs() {
  document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      _tab = tab.dataset.tab;
      toolbar.hidden = _tab !== 'operative';
      _render();
    });
  });
}

// ── filters ───────────────────────────────────────────────────────────

function _bindFilters() {
  document.querySelectorAll('.chip[data-filter]').forEach(chip => {
    chip.addEventListener('click', () => {
      const key = chip.dataset.filter;
      document.querySelectorAll(`.chip[data-filter="${key}"]`)
        .forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      setFilter(key, chip.dataset.value);
      _render();
    });
  });
}

function _bindSearch() {
  searchEl.addEventListener('input', () => {
    setFilter('query', searchEl.value);
    _render();
  });
}

// ── render ────────────────────────────────────────────────────────────

function _render() {
  if (_tab === 'operative') {
    const filtered = applyFilter(_ops);
    countEl.textContent = `${filtered.length} / ${_ops.length}`;
    renderOperativeGrid(filtered, mainEl, op => _openOpDrawer(op));
  } else {
    countEl.textContent = '';
    renderConditionalView(_conds, mainEl, cond => _openCondDrawer(cond));
  }
}

// ── drawer ────────────────────────────────────────────────────────────

function _openOpDrawer(op) {
  renderOperativeDrawer(op, _conds, drawerBody, cond => {
    _closeDrawer();
    // switch to conditional tab and open condition drawer
    setTimeout(() => _openCondDrawer(cond), 220);
  });
  _showDrawer();
}

function _openCondDrawer(cond) {
  renderConditionDrawer(cond, _ops, drawerBody, op => {
    _closeDrawer();
    setTimeout(() => _openOpDrawer(op), 220);
  });
  _showDrawer();
}

function _showDrawer() {
  drawer.classList.add('open');
  overlay.classList.add('open');
  document.body.style.overflow = 'hidden';
  // focus the close button for keyboard users
  requestAnimationFrame(() => {
    const btn = drawerBody.querySelector('#drawer-close');
    if (btn) btn.focus();
  });
}

function _closeDrawer() {
  drawer.classList.remove('open');
  overlay.classList.remove('open');
  document.body.style.overflow = '';
}

function _bindDrawer() {
  overlay.addEventListener('click', _closeDrawer);
  drawer.addEventListener('click', e => {
    if (e.target.id === 'drawer-close') _closeDrawer();
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && drawer.classList.contains('open')) _closeDrawer();
  });
}

init();
