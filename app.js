/* =========================================================
   Catálogo — lógica de la página
   ========================================================= */
(() => {
  'use strict';

  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const CAT = Object.fromEntries(CATEGORIAS.map(c => [c.id, c]));
  const ZON = Object.fromEntries(ZONAS.map(z => [z.id, z]));
  const MUN = Object.fromEntries(MUNDOS.map(m => [m.id, m]));
  const mundoDe = p => ZON[CAT[p.categoria].zona].mundo;
  const fmt = n => '$' + new Intl.NumberFormat('es-AR').format(Math.round(n));
  const plano = s => String(s ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  const esc = s => String(s ?? '').replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]));
  const pocoMovimiento = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- guardado local (no hay base de datos) ---------- */
  const K_PROD = 'martin.productos';
  const K_KIT = 'martin.kit';
  const leer = (k, def) => { try { return JSON.parse(localStorage.getItem(k)) ?? def; } catch { return def; } };
  const escribir = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch { return false; } };

  const estado = { mundo: MUNDOS[0].id, zona: 'todo', cat: 'todo', q: '', orden: 'rel', kit: leer(K_KIT, {}) };
  let crudos = leer(K_PROD, null);
  let hayCambios = Array.isArray(crudos);
  if (!hayCambios) crudos = PRODUCTOS;
  let P = [];

  /* =========================================================
     DIBUJOS DE ENVASES (SVG)
     ========================================================= */
  const sombra = (rx = 34) => `<ellipse class="e-s" cx="60" cy="152" rx="${rx}" ry="5"/>`;
  const cuerpo = d => `<path class="e-c" d="${d}"/><path fill="url(#sh)" d="${d}"/>`;
  const etiqueta = (x, y, w, h, cod) =>
    `<rect class="e-l" x="${x}" y="${y}" width="${w}" height="${h}" rx="3"/>` +
    `<path class="e-c" d="M${x} ${y + h - 9}h${w}v6a3 3 0 0 1-3 3h${-(w - 6)}a3 3 0 0 1-3-3z"/>` +
    `<path class="e-r" d="M${x + 6} ${y + 8}h${w - 12}"/>` +
    `<text class="e-t" x="${x + w / 2}" y="${y + (h - 9) / 2 + 7}">${cod}</text>`;

  const ENVASES = {
    gatillo: c => sombra() +
      `<path class="e-k" d="M34 24h40a10 10 0 0 1 10 10v8H48v-6H34z"/><path class="e-k" d="M48 42h11l-9 21h-6z"/><rect class="e-k" x="56" y="42" width="24" height="12" rx="2"/>` +
      cuerpo('M56 54h24c0 12 14 14 14 30v54a12 12 0 0 1-12 12H38a12 12 0 0 1-12-12V84c0-16 30-14 30-30z') +
      etiqueta(34, 92, 52, 42, c),
    botella: c => sombra() +
      `<rect class="e-k" x="46" y="16" width="28" height="24" rx="4"/><path class="e-o" d="M46 28h28v3H46z"/>` +
      cuerpo('M50 40h20v6c2 10 22 12 22 30v62a12 12 0 0 1-12 12H40a12 12 0 0 1-12-12V76c0-18 20-20 22-30z') +
      etiqueta(34, 88, 52, 44, c),
    bidon: c => sombra(40) +
      `<rect class="e-k" x="30" y="18" width="26" height="18" rx="3"/>` +
      cuerpo('M22 48a12 12 0 0 1 12-12h36l28 24v78a12 12 0 0 1-12 12H34a12 12 0 0 1-12-12z') +
      `<path class="e-o" d="M64 47h7l15 13v8H64z"/>` +
      etiqueta(30, 84, 60, 48, c),
    pote: c => sombra(42) +
      cuerpo('M20 88h80v48a12 12 0 0 1-12 12H32a12 12 0 0 1-12-12z') +
      `<rect class="e-k" x="15" y="68" width="90" height="22" rx="6"/><path class="e-b" d="M21 72h78v3H21z"/>` +
      etiqueta(32, 100, 56, 34, c),
    gotero: c => sombra(26) +
      `<rect class="e-k" x="46" y="34" width="28" height="36" rx="4"/><path class="e-b" d="M51 40v24M57 40v24M63 40v24M69 40v24" stroke="rgba(255,255,255,.14)" stroke-width="2"/>` +
      cuerpo('M44 68h32a8 8 0 0 1 8 8v64a10 10 0 0 1-10 10H46a10 10 0 0 1-10-10V76a8 8 0 0 1 8-8z') +
      etiqueta(40, 92, 40, 42, c),
    aerosol: c => sombra(26) +
      `<rect class="e-l" x="53" y="18" width="14" height="12" rx="3"/><path class="e-k" d="M40 48c0-13 8-18 20-18s20 5 20 18z"/>` +
      cuerpo('M38 46h44v96a8 8 0 0 1-8 8H46a8 8 0 0 1-8-8z') +
      `<rect class="e-g" x="38" y="46" width="44" height="5"/>` +
      etiqueta(43, 76, 34, 54, c),
    pano: () => sombra(44) +
      cuerpo('M26 104h68a10 10 0 0 1 10 10v8a10 10 0 0 1-10 10H26a10 10 0 0 1-10-10v-8a10 10 0 0 1 10-10z') +
      `<path class="e-o" d="M26 104h68a10 10 0 0 1 10 10v8a10 10 0 0 1-10 10H26a10 10 0 0 1-10-10v-8a10 10 0 0 1 10-10z"/>` +
      cuerpo('M30 80h60a10 10 0 0 1 10 10v6a10 10 0 0 1-10 10H30a10 10 0 0 1-10-10v-6a10 10 0 0 1 10-10z') +
      `<path class="e-o" opacity=".5" d="M30 80h60a10 10 0 0 1 10 10v6a10 10 0 0 1-10 10H30a10 10 0 0 1-10-10v-6a10 10 0 0 1 10-10z"/>` +
      cuerpo('M34 56h52a10 10 0 0 1 10 10v6a10 10 0 0 1-10 10H34a10 10 0 0 1-10-10v-6a10 10 0 0 1 10-10z') +
      `<path d="M30 69h60M26 93h68M22 118h76" fill="none" stroke="rgba(0,0,0,.28)" stroke-width="1.5" stroke-dasharray="3 4"/>` +
      `<rect class="e-l" x="80" y="60" width="11" height="8" rx="1.5"/>`,
    guante: () => sombra(30) +
      `<rect class="e-k" x="40" y="116" width="40" height="32" rx="5"/><path class="e-b" d="M40 124h40v3H40zM40 134h40v3H40z" opacity=".4"/>` +
      cuerpo('M28 62a32 32 0 0 1 64 0v48a10 10 0 0 1-10 10H38a10 10 0 0 1-10-10z') +
      [[44, 50], [60, 44], [76, 50], [38, 68], [54, 64], [70, 66], [84, 72], [44, 86], [60, 82], [76, 88], [38, 104], [54, 102], [70, 106]]
        .map(([x, y]) => `<circle class="e-b" cx="${x}" cy="${y}" r="7"/>`).join(''),
    cepillo: () => sombra(26) +
      `<rect class="e-k" x="52" y="84" width="16" height="64" rx="8"/><rect class="e-g" x="49" y="76" width="22" height="11" rx="2"/>` +
      cuerpo('M60 12c16 0 28 16 28 36S76 80 60 80S32 68 32 48s12-36 28-36z') +
      `<path d="M60 16v60M46 20l6 56M74 20l-6 56M36 34l12 40M84 34L72 74" fill="none" stroke="rgba(0,0,0,.24)" stroke-width="2" stroke-linecap="round"/>`,
    balde: c => sombra(40) +
      `<path d="M24 58C24 8 96 8 96 58" fill="none" stroke="#cfd3d8" stroke-width="3.5"/>` +
      cuerpo('M20 58h80l-8 82a10 10 0 0 1-10 9H38a10 10 0 0 1-10-9z') +
      `<rect class="e-k" x="15" y="52" width="90" height="11" rx="5.5"/>` +
      etiqueta(38, 84, 44, 38, c),
    pad: () => sombra(46) +
      cuerpo('M14 84v20c0 14 20 24 46 24s46-10 46-24V84z') +
      `<path class="e-o" d="M14 84v20c0 14 20 24 46 24s46-10 46-24V84z"/>` +
      `<ellipse class="e-c" cx="60" cy="84" rx="46" ry="22"/>` +
      `<ellipse cx="60" cy="84" rx="34" ry="15.5" fill="none" stroke="rgba(0,0,0,.2)" stroke-width="4" stroke-dasharray="3 6"/>` +
      `<ellipse cx="60" cy="84" rx="19" ry="8.5" fill="none" stroke="rgba(0,0,0,.2)" stroke-width="4" stroke-dasharray="3 6"/>` +
      `<ellipse class="e-k" cx="60" cy="84" rx="6" ry="3"/>`,
    esponja: () => sombra(42) +
      cuerpo('M22 92a8 8 0 0 1 8-8h60a8 8 0 0 1 8 8v32H22z') +
      `<path fill="#2f8f57" d="M22 122h76v10a8 8 0 0 1-8 8H30a8 8 0 0 1-8-8z"/><path class="e-o" d="M22 122h76v4H22z"/>` +
      [[36, 98], [52, 106], [70, 96], [84, 108], [44, 114], [64, 112]].map(([x, y]) => `<circle class="e-o" cx="${x}" cy="${y}" r="3.5"/>`).join(''),
    barra: () => sombra(42) +
      `<path class="e-c" d="M22 96l20-24h58L80 96z"/><path class="e-b" d="M22 96l20-24h58L80 96z"/>` +
      cuerpo('M22 96h58v26a6 6 0 0 1-6 6H28a6 6 0 0 1-6-6z') +
      `<path class="e-c" d="M80 96l20-24v26l-20 28z"/><path class="e-o" d="M80 96l20-24v26l-20 28z"/>`,
  };

  function envaseSVG(tipo, cod = '') {
    const dib = ENVASES[tipo] || ENVASES.gatillo;
    return `<svg viewBox="0 0 120 160" aria-hidden="true" focusable="false">${dib(esc(cod))}</svg>`;
  }

  function adivinarEnvase(p) {
    const t = plano(`${p.nombre} ${p.tamano || ''}`);
    if (/esponja/.test(t)) return 'esponja';
    if (/microfibra|pano|toalla|trapo|rejilla/.test(t) && !/guante/.test(t)) return 'pano';
    if (/guante|manopla/.test(t)) return 'guante';
    if (/cepillo|pincel|escob/.test(t)) return 'cepillo';
    if (/balde/.test(t)) return 'balde';
    if (/\bpad\b|bonete/.test(t)) return 'pad';
    if (/clay bar|barra/.test(t)) return 'barra';
    if (/aerosol|espuma activa/.test(t)) return 'aerosol';
    if (/bidon|\b(4|5|10|20) ?l(ts?|itros)?\b/.test(t)) return 'bidon';
    if (/pasta|\bgel\b|\bpote\b|\d ?g\b/.test(t)) return 'pote';
    if (/\b(30|50|100|120) ?ml\b/.test(t)) return 'gotero';
    if (/shampoo|compuesto|pulidor|lustre|snow foam/.test(t)) return 'botella';
    return 'gatillo';
  }

  /* =========================================================
     DATOS
     ========================================================= */
  function normalizar(lista) {
    const cuenta = {}, usados = {};
    return lista.filter(p => p && p.nombre).map(p => {
      const categoria = CAT[p.categoria] ? p.categoria : 'accesorios';
      const c = CAT[categoria];
      cuenta[categoria] = (cuenta[categoria] || 0) + 1;
      let id = plano(`${p.nombre} ${p.tamano || ''}`).replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'producto';
      usados[id] = (usados[id] || 0) + 1;
      if (usados[id] > 1) id += '-' + usados[id];
      return {
        ...p,
        id,
        categoria,
        precio: Number(p.precio) || 0,
        tamano: p.tamano || '',
        tags: Array.isArray(p.tags) ? p.tags.slice(0, 3) : [],
        cod: `${c.pref}-${String(cuenta[categoria]).padStart(2, '0')}`,
        envase: ENVASES[p.envase] ? p.envase : adivinarEnvase(p),
        color: /^#[0-9a-f]{3,8}$/i.test(p.color || '') ? p.color : c.color,
      };
    });
  }
  const porId = id => P.find(p => p.id === id);
  const visual = p => p.foto
    ? `<img src="${esc(p.foto)}" alt="" loading="lazy" decoding="async">`
    : envaseSVG(p.envase, p.cod);

  /* =========================================================
     ZONAS, FILTROS Y GRILLA
     ========================================================= */
  const enZona = z => z === 'todo'
    ? P.filter(p => mundoDe(p) === estado.mundo)
    : P.filter(p => CAT[p.categoria].zona === z);
  // "todo" es la vista completa del mundo elegido
  const zonaInfo = id => {
    const m = MUN[estado.mundo];
    return id === 'todo' ? { id, nombre: m.titulo, frase: m.frase, color: m.color } : ZON[id];
  };

  function pintarZonas() {
    const zonas = [zonaInfo('todo'), ...ZONAS.filter(z => z.mundo === estado.mundo)];
    $('#zonas').innerHTML = zonas.map(z =>
      `<button class="pil" type="button" data-zona="${z.id}" style="--pc:${z.color}" aria-pressed="${estado.zona === z.id}">${esc(z.nombre)} <i>${enZona(z.id).length}</i></button>`
    ).join('');
  }

  function elegirZona(id, { mover = false } = {}) {
    if (!ZON[id] || ZON[id].mundo !== estado.mundo) id = 'todo';
    estado.zona = id; estado.cat = 'todo';
    const z = zonaInfo(id), auto = $('#auto');
    auto.dataset.zona = id;
    $$('[data-z]', auto).forEach(g => g.classList.toggle('activa', g.dataset.z === id));
    document.documentElement.style.setProperty('--zc', z.color);
    $('#zonaNombre').textContent = z.nombre;
    $('#zonaFrase').textContent = z.frase;
    $$('.punto').forEach(b => b.setAttribute('aria-pressed', b.dataset.zona === id));
    const caja = $('#zonas');
    $$('.pil', caja).forEach(b => {
      const on = b.dataset.zona === id;
      b.setAttribute('aria-pressed', on);
      // centra la píldora sin mover la página
      if (on) caja.scrollTo({ left: b.offsetLeft - caja.offsetLeft - (caja.clientWidth - b.offsetWidth) / 2, behavior: 'smooth' });
    });
    pintarChips(); pintarGrilla();
    if (mover) $('#catalogo').scrollIntoView({ behavior: 'smooth' });
  }

  function elegirMundo(id) {
    if (!MUN[id]) id = MUNDOS[0].id;
    estado.mundo = id;
    const m = MUN[id];
    $('#auto').dataset.mundo = id;
    $$('[data-lienzo]').forEach(l => { l.hidden = l.dataset.lienzo !== id; });
    $('#autoRotulo').textContent = m.rotulo;
    $$('[data-ir-mundo]').forEach(b => {
      b.setAttribute('aria-pressed', b.dataset.irMundo === id);
      const n = $('i', b); if (n) n.textContent = P.filter(p => mundoDe(p) === b.dataset.irMundo).length;
    });
    pintarZonas();
    elegirZona('todo');
  }

  function pintarChips() {
    const cats = CATEGORIAS.filter(c => (estado.zona === 'todo' ? ZON[c.zona].mundo === estado.mundo : c.zona === estado.zona) && P.some(p => p.categoria === c.id));
    const caja = $('#chips');
    if (cats.length < 2) { caja.innerHTML = ''; return; }
    const etapas = estado.zona === 'carroceria';
    caja.innerHTML =
      `<button class="chip" type="button" data-cat="todo" aria-pressed="${estado.cat === 'todo'}">${etapas ? 'Las 4 etapas' : 'Todo'}</button>` +
      cats.map((c, i) =>
        `<button class="chip" type="button" data-cat="${c.id}" style="--cc:${c.color}" aria-pressed="${estado.cat === c.id}">${etapas ? `<b>${i + 1}</b>` : ''}${esc(c.nombre)}</button>`
      ).join('');
  }

  function filtrar() {
    let l;
    if (estado.q) {
      const q = plano(estado.q).split(/\s+/).filter(Boolean);
      l = P.filter(p => {
        const t = plano(`${p.nombre} ${p.descripcion || ''} ${p.tags.join(' ')} ${CAT[p.categoria].nombre} ${ZON[CAT[p.categoria].zona].nombre} ${p.cod}`);
        return q.every(x => t.includes(x));
      });
    } else {
      l = enZona(estado.zona);
      if (estado.cat !== 'todo') l = l.filter(p => p.categoria === estado.cat);
    }
    l = l.slice();
    if (estado.orden === 'menor') l.sort((a, b) => a.precio - b.precio);
    if (estado.orden === 'mayor') l.sort((a, b) => b.precio - a.precio);
    if (estado.orden === 'az') l.sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'));
    return l;
  }

  function tarjeta(p, i) {
    const n = estado.kit[p.id] || 0;
    return `<article class="card${p.destacado ? ' card--dest' : ''}" style="--c:${p.color};--i:${Math.min(i, 14)}" data-id="${esc(p.id)}">
      <button class="card__abrir" type="button" aria-label="Ver ${esc(p.nombre)}, ${fmt(p.precio)}">
        <span class="card__cod">${p.cod}</span>
        <span class="card__img">${visual(p)}</span>
        <span class="card__txt">
          <span class="card__cat">${esc(CAT[p.categoria].nombre)}</span>
          <span class="card__nom">${esc(p.nombre)}</span>
          <span class="card__tam">${esc(p.tamano)}</span>
          <span class="card__desc">${esc(p.descripcion || '')}</span>
          <span class="card__precio">${fmt(p.precio)}</span>
        </span>
      </button>
      ${p.destacado ? '<span class="card__sello">Destacado</span>' : ''}
      <button class="card__mas${n ? ' on' : ''}" type="button" data-sumar aria-label="Agregar ${esc(p.nombre)} al kit">${n || '+'}</button>
    </article>`;
  }

  function pintarGrilla() {
    const l = filtrar(), grid = $('#grid');
    const z = zonaInfo(estado.zona);
    $('#catTitulo').textContent = estado.q ? 'Resultados' : estado.cat !== 'todo' ? CAT[estado.cat].nombre : z.nombre;
    $('#catCuenta').textContent = estado.q
      ? `${l.length} ${l.length === 1 ? 'coincidencia' : 'coincidencias'} para “${estado.q}”`
      : `${l.length} ${l.length === 1 ? 'producto' : 'productos'}`;
    $('#chips').style.display = estado.q ? 'none' : '';
    grid.innerHTML = l.length
      ? l.map(tarjeta).join('')
      : `<div class="vacio"><b>Nada por acá</b><p>No encontramos productos con esa búsqueda.</p><button class="btn btn--linea" type="button" data-limpiar>Ver todo el catálogo</button></div>`;
  }

  /* =========================================================
     KIT
     ========================================================= */
  const kitItems = () => Object.entries(estado.kit).map(([id, n]) => ({ p: porId(id), n })).filter(x => x.p && x.n > 0);
  const kitTotal = () => kitItems().reduce((s, x) => s + x.p.precio * x.n, 0);
  const kitCant = () => kitItems().reduce((s, x) => s + x.n, 0);

  function cambiarKit(id, delta) {
    const n = Math.max(0, Math.min(99, (estado.kit[id] || 0) + delta));
    if (n) estado.kit[id] = n; else delete estado.kit[id];
    escribir(K_KIT, estado.kit);
    pintarKit();
    const b = $(`.card[data-id="${CSS.escape(id)}"] .card__mas`);
    if (b) { b.textContent = n || '+'; b.classList.toggle('on', n > 0); }
  }

  function mensajeWA() {
    const filas = kitItems().map(({ p, n }) => `• ${n} × ${p.nombre}${p.tamano ? ` (${p.tamano})` : ''} — ${fmt(p.precio * n)}`);
    return `¡Hola! Quiero pedir este kit del catálogo:\n\n${filas.join('\n')}\n\nTotal estimado: ${fmt(kitTotal())}`;
  }
  const linkWA = txt => `https://wa.me/${String(TIENDA.whatsapp).replace(/\D/g, '')}?text=${encodeURIComponent(txt)}`;

  function pintarKit() {
    const items = kitItems(), cant = kitCant(), total = kitTotal();
    $('#kitN').textContent = cant;
    $('#kitbarN').textContent = cant;
    $('#kitbarP').textContent = fmt(total);
    $('#kitbar').classList.toggle('visible', cant > 0);
    $('#kitbar').setAttribute('aria-label', `Abrir mi kit: ${cant} productos, ${fmt(total)}`);

    $('#kitCuerpo').innerHTML = items.length
      ? `<ul class="kit__lista">${items.map(({ p, n }) => `
          <li class="kit__item" style="--c:${p.color}" data-id="${esc(p.id)}">
            ${visual(p)}
            <div><b>${esc(p.nombre)}</b><span>${esc(p.tamano)}${p.tamano ? ' · ' : ''}${fmt(p.precio * n)}</span></div>
            <div class="cant">
              <button type="button" data-kit="-1" aria-label="Quitar uno de ${esc(p.nombre)}">−</button>
              <output>${n}</output>
              <button type="button" data-kit="1" aria-label="Sumar uno de ${esc(p.nombre)}">+</button>
            </div>
          </li>`).join('')}</ul>`
      : `<div class="kit__vacio"><b>Tu kit está vacío</b><p>Tocá el + en cualquier producto para empezar a armarlo.</p></div>`;

    $('#kitPie').innerHTML = items.length
      ? `<div class="compra__precio"><small>Total estimado · ${cant} ${cant === 1 ? 'producto' : 'productos'}</small><b>${fmt(total)}</b></div>
         <button class="btn btn--txt" type="button" data-vaciar>Vaciar</button>
         <a class="btn btn--ac" href="${esc(linkWA(mensajeWA()))}" target="_blank" rel="noopener">Pedir por WhatsApp</a>`
      : `<button class="btn btn--linea" type="button" data-cerrar style="flex:1">Seguir mirando</button>`;
  }

  function latir(el) { el.classList.remove('late'); void el.offsetWidth; el.classList.add('late'); }

  function volar(desde, color) {
    latir($('#kitbar')); latir($('#btnKit'));
    if (pocoMovimiento || !desde) return;
    const a = desde.getBoundingClientRect(), b = $('#kitbarN').getBoundingClientRect();
    const dx = b.left + b.width / 2 - (a.left + a.width / 2);
    const dy = Math.min(innerHeight - 40, b.top + b.height / 2) - (a.top + a.height / 2);
    const g = document.createElement('i');
    g.className = 'gota';
    g.style.cssText = `left:${a.left + a.width / 2 - 9}px;top:${a.top + a.height / 2 - 9}px;background:${color};color:${color}`;
    document.body.append(g);
    g.animate([
      { transform: 'translate(0,0) scale(1)' },
      { transform: `translate(${dx * .45}px,${Math.min(dy * .2, 0) - 70}px) scale(1.3)`, offset: .4 },
      { transform: `translate(${dx}px,${dy}px) scale(.4)`, opacity: .5 },
    ], { duration: 640, easing: 'cubic-bezier(.3,.5,.4,1)' }).onfinish = () => g.remove();
  }

  let tToast;
  function toast(txt) {
    const t = $('#toast');
    t.textContent = txt; t.classList.add('ver');
    clearTimeout(tToast); tToast = setTimeout(() => t.classList.remove('ver'), 2200);
  }

  /* =========================================================
     HOJAS (ficha, kit, panel)
     ========================================================= */
  let hojaAbierta = null, focoAntes = null;

  function abrir(ov) {
    if (hojaAbierta === ov) return;
    if (hojaAbierta) { hojaAbierta.classList.remove('abierta'); hojaAbierta.setAttribute('aria-hidden', 'true'); }
    else { focoAntes = document.activeElement; history.pushState({ hoja: true }, ''); }
    hojaAbierta = ov;
    ov.classList.add('abierta'); ov.setAttribute('aria-hidden', 'false');
    document.body.classList.add('fijo');
    const sc = $('.hoja__scroll', ov); if (sc) sc.scrollTop = 0;
    setTimeout(() => $('.x', ov)?.focus({ preventScroll: true }), 60);
  }

  function cerrar(desdeAtras = false) {
    if (!hojaAbierta) return;
    const hoja = $('.hoja', hojaAbierta);
    hoja.style.transform = '';
    hojaAbierta.classList.remove('abierta'); hojaAbierta.setAttribute('aria-hidden', 'true');
    hojaAbierta = null;
    document.body.classList.remove('fijo');
    focoAntes?.focus?.({ preventScroll: true });
    if (!desdeAtras && history.state?.hoja) { atrasPropio++; history.back(); }
  }
  // el "atrás" del celular cierra la hoja; el que disparamos nosotros se ignora
  let atrasPropio = 0;
  addEventListener('popstate', () => { if (atrasPropio) atrasPropio--; else cerrar(true); });
  addEventListener('keydown', e => { if (e.key === 'Escape') cerrar(); });

  // arrastrar hacia abajo para cerrar (celular)
  function arrastrable(ov) {
    const hoja = $('.hoja', ov), asa = $('[data-agarre]', ov);
    if (!asa) return;
    let y0 = null, dy = 0;
    asa.addEventListener('pointerdown', e => { y0 = e.clientY; dy = 0; hoja.classList.add('arrastra'); asa.setPointerCapture(e.pointerId); });
    asa.addEventListener('pointermove', e => {
      if (y0 === null) return;
      dy = Math.max(0, e.clientY - y0);
      hoja.style.transform = `translateY(${dy}px)`;
    });
    const soltar = () => {
      if (y0 === null) return;
      y0 = null; hoja.classList.remove('arrastra'); hoja.style.transform = '';
      if (dy > 90) cerrar();
    };
    asa.addEventListener('pointerup', soltar);
    asa.addEventListener('pointercancel', soltar);
  }

  /* ---------- ficha de producto ---------- */
  let fichaId = null, fichaCant = 1;

  function relacionados(p) {
    const c = CAT[p.categoria];
    const hermanas = CATEGORIAS.filter(x => x.zona === c.zona);
    const sig = hermanas[hermanas.indexOf(c) + 1];
    let pool = sig ? P.filter(x => x.categoria === sig.id) : [];
    let titulo = sig ? `Seguí con: ${sig.nombre}` : 'Va bien con';
    if (pool.length < 2) { pool = P.filter(x => x.categoria === MUN[mundoDe(p)].accesorios && x.id !== p.id); titulo = 'Va bien con'; }
    if (pool.length < 2) pool = P.filter(x => x.categoria === p.categoria && x.id !== p.id);
    return { titulo, items: pool.slice().sort((a, b) => !!b.destacado - !!a.destacado).slice(0, 5) };
  }

  function pintarCompra() {
    const p = porId(fichaId); if (!p) return;
    const enKit = estado.kit[p.id] || 0;
    $('#prodCompra').innerHTML = `
      <div class="compra__precio"><small>${enKit ? `Ya tenés ${enKit} en el kit` : esc(p.tamano) || 'Precio'}</small><b>${fmt(p.precio * fichaCant)}</b></div>
      <div class="cant">
        <button type="button" data-cant="-1" aria-label="Menos">−</button>
        <output aria-live="polite">${fichaCant}</output>
        <button type="button" data-cant="1" aria-label="Más">+</button>
      </div>
      <button class="btn btn--ac" type="button" data-agregar>Agregar</button>`;
  }

  function abrirProducto(id) {
    const p = porId(id); if (!p) return;
    const c = CAT[p.categoria], z = ZON[c.zona];
    const hermanas = CATEGORIAS.filter(x => x.zona === c.zona);
    const paso = hermanas.indexOf(c);
    const rel = relacionados(p);
    fichaId = id; fichaCant = 1;
    const ov = $('#ovProd');
    $('.hoja', ov).style.setProperty('--c', p.color);
    $('#prodCuerpo').innerHTML = `
      <div class="prod__escena">
        <span class="prod__agua" aria-hidden="true">${p.cod}</span>
        <div class="prod__img">${visual(p)}</div>
      </div>
      <div class="prod__info">
        <p class="prod__ruta">${esc(z.nombre)}${z.nombre !== c.nombre ? ' · ' + esc(c.nombre) : ''}</p>
        <h2 id="prodTit">${esc(p.nombre)}</h2>
        <p class="prod__tam">${esc(p.tamano)}${p.tamano ? ' · ' : ''}Cód. ${p.cod}</p>
        ${hermanas.length > 1 ? `<ol class="pasos" aria-label="Etapa ${paso + 1} de ${hermanas.length}">${hermanas.map((h, i) =>
          `<li class="${i < paso ? 'hecho' : i === paso ? 'actual' : ''}">${i + 1}. ${esc(h.nombre)}</li>`).join('')}</ol>` : ''}
        ${p.descripcion ? `<p class="prod__desc">${esc(p.descripcion)}</p>` : ''}
        ${p.tags.length ? `<ul class="tags">${p.tags.map(t => `<li>${esc(t)}</li>`).join('')}</ul>` : ''}
        ${p.uso ? `<div class="uso"><b>Cómo se usa</b><p>${esc(p.uso)}</p></div>` : ''}
        ${rel.items.length ? `<div class="rel"><h3>${esc(rel.titulo)}</h3><div class="rel__fila">${rel.items.map(r =>
          `<button class="mini" type="button" data-ver="${esc(r.id)}" style="--c:${r.color}">${visual(r)}<b>${esc(r.nombre)}</b><span>${fmt(r.precio)}</span></button>`).join('')}</div></div>` : ''}
      </div>`;
    pintarCompra();
    abrir(ov);
    $('#prodCuerpo').scrollTop = 0;
    const info = $('.prod__info', ov); if (info) info.scrollTop = 0;
  }

  /* =========================================================
     EVENTOS
     ========================================================= */
  function eventos() {
    // mundo: auto u hogar (botones del encabezado y del mapa)
    document.addEventListener('click', e => {
      const b = e.target.closest('[data-ir-mundo]'); if (!b) return;
      if (estado.q) { estado.q = ''; $('#q').value = ''; }
      elegirMundo(b.dataset.irMundo);
      // desde el inicio lleva al mapa; más abajo se queda donde está
      if (scrollY < $('#mapa').offsetTop - innerHeight / 2) $('#mapa').scrollIntoView({ behavior: 'smooth' });
    });

    // zonas: puntos del auto o de la casa y píldoras
    $('#auto').addEventListener('click', e => {
      const b = e.target.closest('.punto'); if (!b) return;
      elegirZona(estado.zona === b.dataset.zona ? 'todo' : b.dataset.zona);
    });
    $('#zonas').addEventListener('click', e => { const b = e.target.closest('.pil'); if (b) elegirZona(b.dataset.zona); });

    // etapas
    $('#chips').addEventListener('click', e => {
      const b = e.target.closest('.chip'); if (!b) return;
      estado.cat = b.dataset.cat;
      $$('#chips .chip').forEach(c => c.setAttribute('aria-pressed', c === b));
      pintarGrilla();
    });

    // búsqueda y orden
    let tq;
    $('#q').addEventListener('input', e => {
      clearTimeout(tq);
      tq = setTimeout(() => { estado.q = e.target.value.trim(); pintarGrilla(); }, 140);
    });
    $('#q').addEventListener('keydown', e => { if (e.key === 'Enter') e.target.blur(); });
    $('#orden').addEventListener('change', e => { estado.orden = e.target.value; pintarGrilla(); });

    // grilla
    $('#grid').addEventListener('click', e => {
      if (e.target.closest('[data-limpiar]')) {
        estado.q = ''; $('#q').value = ''; elegirZona('todo'); return;
      }
      const card = e.target.closest('.card'); if (!card) return;
      const id = card.dataset.id;
      const mas = e.target.closest('[data-sumar]');
      if (mas) {
        cambiarKit(id, 1);
        volar(mas, porId(id).color);
        toast(`${porId(id).nombre} sumado al kit`);
      } else abrirProducto(id);
    });

    // ficha
    $('#ovProd').addEventListener('click', e => {
      const ver = e.target.closest('[data-ver]');
      if (ver) return abrirProducto(ver.dataset.ver);
      const c = e.target.closest('[data-cant]');
      if (c) { fichaCant = Math.max(1, Math.min(99, fichaCant + Number(c.dataset.cant))); return pintarCompra(); }
      const ag = e.target.closest('[data-agregar]');
      if (ag) {
        const p = porId(fichaId);
        cambiarKit(fichaId, fichaCant);
        volar(ag, p.color);
        toast(`${fichaCant} × ${p.nombre} en tu kit`);
        cerrar();
      }
    });

    // kit
    const abrirKit = () => { pintarKit(); abrir($('#ovKit')); };
    ['#btnKit', '#btnKit2', '#kitbar'].forEach(s => $(s).addEventListener('click', abrirKit));
    $('#ovKit').addEventListener('click', e => {
      const k = e.target.closest('[data-kit]');
      if (k) return cambiarKit(k.closest('[data-id]').dataset.id, Number(k.dataset.kit));
      if (e.target.closest('[data-vaciar]')) { estado.kit = {}; escribir(K_KIT, estado.kit); pintarKit(); pintarGrilla(); }
    });

    // cerrar hojas
    document.addEventListener('click', e => { if (e.target.closest('[data-cerrar]')) cerrar(); });
    $$('.ov').forEach(arrastrable);

    // aparecer al hacer scroll
    const io = new IntersectionObserver(es => es.forEach(x => { if (x.isIntersecting) { x.target.classList.add('in'); io.unobserve(x.target); } }), { threshold: .15 });
    $$('.rev').forEach(el => io.observe(el));
  }

  /* =========================================================
     ARRANQUE
     ========================================================= */
  function recargar() {
    P = normalizar(crudos);
    Object.keys(estado.kit).forEach(id => { if (!porId(id)) delete estado.kit[id]; });
    $('#heroTotal').textContent = P.length;
    const zona = estado.zona;
    elegirMundo(estado.mundo);
    elegirZona(zona);
    pintarKit();
  }

  function marca() {
    $$('[data-tienda]').forEach(el => { const v = TIENDA[el.dataset.tienda]; if (v) el.textContent = v; });
    document.title = `${TIENDA.nombre} ${TIENDA.bajada} — Catálogo de limpieza para el auto y el hogar`;
    $('#waDirecto').href = linkWA('¡Hola! Vi el catálogo y quiero hacer una consulta.');
    $('#heroEnv').innerHTML = envaseSVG('botella', 'LV-02') + envaseSVG('gatillo', 'BA-03') + envaseSVG('bidon', 'CO-01');
  }

  // lo que usa el panel de carga (cargador.js)
  window.Catalogo = {
    CAT, ENVASES: Object.keys(ENVASES), esc, fmt, plano, envaseSVG, adivinarEnvase, abrir, cerrar, toast,
    crudos: () => crudos.map(p => ({ ...p })),
    hayCambios: () => hayCambios,
    guardar(lista) {
      crudos = lista; hayCambios = true;
      const ok = escribir(K_PROD, lista);
      recargar();
      return ok;
    },
    restaurar() {
      try { localStorage.removeItem(K_PROD); } catch { /* sin almacenamiento */ }
      crudos = PRODUCTOS; hayCambios = false;
      recargar();
    },
  };

  marca();
  eventos();
  recargar();
})();
