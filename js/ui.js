// ui.js — pure render functions. No state, no data fetching.

export function renderOperativeGrid(ops, container, onSelect) {
  container.innerHTML = '';
  const grid = el('div', 'grid');

  if (!ops.length) {
    grid.appendChild(el('p', 'empty', 'no operations match'));
  } else {
    ops.forEach(op => grid.appendChild(_opCard(op, onSelect)));
  }

  container.appendChild(grid);
}

export function renderConditionalView(conditions, container, onSelect) {
  container.innerHTML = '';
  const categories = ['ground', 'connection', 'aperture'];

  categories.forEach(cat => {
    const section = el('div', 'section');
    section.appendChild(el('p', 'section-label', cat));

    const grid = el('div', 'grid');
    conditions
      .filter(c => c.category === cat)
      .forEach(c => grid.appendChild(_condCard(c, onSelect)));

    section.appendChild(grid);
    container.appendChild(section);
  });
}

export function renderOperativeDrawer(op, allConditions, container, onConditionSelect) {
  container.innerHTML = '';

  const related = allConditions.filter(c =>
    Array.isArray(c.related_operatives) && c.related_operatives.includes(op.id)
  );

  const relatedHTML = related.length
    ? `<p class="drawer-related-label">Related conditions</p>
       <div class="drawer-related">
         ${related.map(c => `
           <div class="related-item" data-id="${c.id}" tabindex="0" role="button">
             <span class="related-label">${c.label}</span>
             <span class="related-cat">${c.category}</span>
           </div>`).join('')}
       </div>`
    : '';

  container.innerHTML = `
    <button class="drawer-close" id="drawer-close">close</button>
    <div class="drawer-top">
      <span class="drawer-verb">${op.verb}</span>
      <span class="drawer-cat">${op.category}</span>
      <span class="drawer-tec" data-v="${op.tectonic_tendency}">${op.tectonic_tendency}</span>
    </div>
    <p class="drawer-desc">${op.description}</p>
    <p class="drawer-detail">${op.detail}</p>
    <div class="tags">${op.tags.map(t => `<span class="tag">${t}</span>`).join('')}</div>
    ${relatedHTML}
  `;

  if (related.length && onConditionSelect) {
    container.querySelectorAll('.related-item').forEach(item => {
      const cond = related.find(c => c.id === item.dataset.id);
      item.addEventListener('click', () => onConditionSelect(cond));
      item.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onConditionSelect(cond); }
      });
    });
  }
}

export function renderConditionDrawer(cond, allOps, container, onOpSelect) {
  container.innerHTML = '';

  const related = allOps.filter(op =>
    Array.isArray(cond.related_operatives) && cond.related_operatives.includes(op.id)
  );

  const relatedHTML = related.length
    ? `<p class="drawer-related-label">Related operatives</p>
       <div class="drawer-related">
         ${related.map(op => `
           <div class="related-item" data-id="${op.id}" tabindex="0" role="button">
             <span class="related-label">${op.verb}</span>
             <span class="related-cat">${op.category}</span>
           </div>`).join('')}
       </div>`
    : '';

  container.innerHTML = `
    <button class="drawer-close" id="drawer-close">close</button>
    <div class="drawer-top">
      <span class="drawer-verb">${cond.label}</span>
      <span class="drawer-cat">${cond.category}</span>
    </div>
    <p class="drawer-desc">${cond.description}</p>
    <p class="drawer-detail">${cond.detail}</p>
    <div class="tags">${cond.tags.map(t => `<span class="tag">${t}</span>`).join('')}</div>
    ${relatedHTML}
  `;

  if (related.length && onOpSelect) {
    container.querySelectorAll('.related-item').forEach(item => {
      const op = related.find(o => o.id === item.dataset.id);
      item.addEventListener('click', () => onOpSelect(op));
      item.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onOpSelect(op); }
      });
    });
  }
}

// ── private card constructors ─────────────────────────────────────────

function _opCard(op, onSelect) {
  const card = el('div', 'card');
  card.dataset.id = op.id;
  card.setAttribute('tabindex', '0');
  card.setAttribute('role', 'button');
  card.setAttribute('aria-label', `${op.verb}: ${op.description}`);

  card.innerHTML = `
    <div class="card-meta">
      <span class="card-cat">${op.category}</span>
      <span class="card-tec" data-v="${op.tectonic_tendency}">${op.tectonic_tendency}</span>
    </div>
    <span class="card-verb">${op.verb}</span>
    <p class="card-desc">${op.description}</p>
    <div class="tags">${op.tags.map(t => `<span class="tag">${t}</span>`).join('')}</div>
  `;

  _bindSelect(card, () => onSelect(op));
  return card;
}

function _condCard(cond, onSelect) {
  const card = el('div', 'card');
  card.dataset.id = cond.id;
  card.setAttribute('tabindex', '0');
  card.setAttribute('role', 'button');
  card.setAttribute('aria-label', `${cond.label}: ${cond.description}`);

  card.innerHTML = `
    <div class="card-meta">
      <span class="card-cat">${cond.category}</span>
    </div>
    <span class="card-verb">${cond.label}</span>
    <p class="card-desc">${cond.description}</p>
    <div class="tags">${cond.tags.map(t => `<span class="tag">${t}</span>`).join('')}</div>
  `;

  _bindSelect(card, () => onSelect(cond));
  return card;
}

function _bindSelect(el, fn) {
  el.addEventListener('click', fn);
  el.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fn(); }
  });
}

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}
