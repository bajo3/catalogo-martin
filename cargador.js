/* =========================================================
   Panel de carga de productos (demo, sin base de datos)
   Los cambios se guardan en este dispositivo. Para publicarlos
   se descarga productos.js y se reemplaza el archivo de la web.
   ========================================================= */
(() => {
  'use strict';

  const C = window.Catalogo;
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const { esc, fmt, plano, CAT } = C;

  const NOMBRE_ENVASE = {
    gatillo: 'Gatillo (spray)', botella: 'Botella', bidon: 'Bidón', pote: 'Pote / lata',
    gotero: 'Frasco chico', aerosol: 'Aerosol', pano: 'Paño / microfibra', guante: 'Guante',
    cepillo: 'Cepillo / escoba', balde: 'Balde', pad: 'Pad de pulido', barra: 'Barra (clay)', esponja: 'Esponja',
  };

  const ov = $('#ovCarga'), f = $('#fProd');
  let lista = [], editando = -1, foto = '', pegados = [];

  const zonaDe = Object.fromEntries(ZONAS.map(z => [z.id, z]));
  $('#fCat').innerHTML = MUNDOS.map(m => `<optgroup label="${esc(m.nombre)}">${CATEGORIAS.filter(c => zonaDe[c.zona].mundo === m.id)
    .map(c => `<option value="${c.id}">${esc(c.nombre)}</option>`).join('')}</optgroup>`).join('');
  $('#fEnv').innerHTML = '<option value="">Automático</option>' +
    C.ENVASES.map(e => `<option value="${e}">${NOMBRE_ENVASE[e] || e}</option>`).join('');

  const dibujo = p => p.foto
    ? `<img src="${esc(p.foto)}" alt="">`
    : C.envaseSVG(p.envase || C.adivinarEnvase(p), (CAT[p.categoria] || CAT.accesorios).pref);
  const colorDe = p => /^#[0-9a-f]{3,8}$/i.test(p.color || '') ? p.color : (CAT[p.categoria] || CAT.accesorios).color;

  // "13.900", "$ 13900,50" -> número
  const aPrecio = v => Number(String(v ?? '').replace(/[^\d.,]/g, '').replace(/\./g, '').replace(',', '.')) || 0;

  /* ---------- pestañas ---------- */
  function pestana(id) {
    $$('.tabs button', ov).forEach(b => b.setAttribute('aria-selected', b.dataset.tab === id));
    $$('.tabp', ov).forEach(p => { p.hidden = p.dataset.panel !== id; });
    $('.hoja__scroll', ov).scrollTop = 0;
  }
  $('.tabs', ov).addEventListener('click', e => { const b = e.target.closest('[data-tab]'); if (b) pestana(b.dataset.tab); });

  /* ---------- estado general ---------- */
  function estado() {
    $('#cargaN').textContent = lista.length;
    $('#cargaEstado').innerHTML = C.hayCambios()
      ? `${lista.length} productos. <b>Hay cambios guardados solo en este dispositivo.</b> Para publicarlos, descargá productos.js y reemplazá el archivo de la web.`
      : `${lista.length} productos. Estás viendo el archivo original, sin cambios.`;
    $('#btnRestaurar').hidden = !C.hayCambios();
  }

  function guardar(aviso) {
    const ok = C.guardar(lista);
    lista = C.crudos();
    estado(); pintarLista();
    C.toast(ok ? aviso : 'Se aplicó, pero no se pudo guardar en este dispositivo (sin espacio). Descargá el archivo.');
  }

  // el producto nuevo queda al final de su categoría
  function insertar(p) {
    let pos = -1;
    lista.forEach((x, i) => { if (x.categoria === p.categoria) pos = i; });
    lista.splice(pos < 0 ? lista.length : pos + 1, 0, p);
  }

  /* ---------- formulario ---------- */
  function leerForm() {
    const d = new FormData(f);
    const p = { nombre: String(d.get('nombre')).trim(), categoria: d.get('categoria'), precio: aPrecio(d.get('precio')) };
    const tamano = String(d.get('tamano')).trim(), descripcion = String(d.get('descripcion')).trim(), uso = String(d.get('uso')).trim();
    const tags = String(d.get('tags')).split(',').map(t => t.trim()).filter(Boolean).slice(0, 3);
    if (tamano) p.tamano = tamano;
    if (d.get('envase')) p.envase = d.get('envase');
    if (descripcion) p.descripcion = descripcion;
    if (uso) p.uso = uso;
    if (tags.length) p.tags = tags;
    if (d.get('destacado')) p.destacado = true;
    const antes = aPrecio(d.get('precioAntes'));
    if (antes > p.precio) p.precioAntes = antes;
    if (d.get('sinStock')) p.sinStock = true;
    if (foto) p.foto = foto;
    return p;
  }

  function previa() {
    const p = leerForm(), caja = $('#fPrevia');
    if (editando >= 0 && lista[editando].color) p.color = lista[editando].color;
    caja.style.setProperty('--c', colorDe(p));
    caja.innerHTML = dibujo(p);
    $('#fFotoQuitar').hidden = !foto;
  }

  function limpiarForm() {
    f.reset(); foto = ''; editando = -1;
    $('#fFoto').value = '';
    $('#fModo').textContent = 'Producto nuevo';
    $('#fGuardar').textContent = 'Agregar al catálogo';
    $('#fCancelar').hidden = true;
    $('#fDuplicar').hidden = true;
    $('#fError').hidden = true;
    $$('.mal', f).forEach(el => el.classList.remove('mal'));
    previa();
  }

  function editar(i) {
    const p = lista[i]; if (!p) return;
    limpiarForm();
    editando = i; foto = p.foto || '';
    f.nombre.value = p.nombre || '';
    f.categoria.value = CAT[p.categoria] ? p.categoria : 'accesorios';
    f.precio.value = p.precio || '';
    f.tamano.value = p.tamano || '';
    f.envase.value = p.envase || '';
    f.descripcion.value = p.descripcion || '';
    f.uso.value = p.uso || '';
    f.tags.value = (p.tags || []).join(', ');
    f.destacado.checked = !!p.destacado;
    f.precioAntes.value = p.precioAntes || '';
    f.sinStock.checked = !!p.sinStock;
    $('#fModo').textContent = 'Editando producto';
    $('#fGuardar').textContent = 'Guardar cambios';
    $('#fCancelar').hidden = false;
    $('#fDuplicar').hidden = false;
    previa(); pestana('nuevo');
  }

  f.addEventListener('input', previa);
  f.addEventListener('change', previa);
  $('#fCancelar').addEventListener('click', limpiarForm);

  f.addEventListener('submit', e => {
    e.preventDefault();
    const p = leerForm(), err = $('#fError');
    f.nombre.classList.toggle('mal', !p.nombre);
    f.precio.classList.toggle('mal', !(p.precio > 0));
    if (!p.nombre || !(p.precio > 0)) {
      err.textContent = !p.nombre ? 'Falta el nombre del producto.' : 'Poné un precio mayor a cero, solo números.';
      err.hidden = false;
      (!p.nombre ? f.nombre : f.precio).focus();
      return;
    }
    // "Guardar como nuevo" deja el original como está y suma una copia con los cambios
    const comoNuevo = e.submitter && e.submitter.id === 'fDuplicar';
    if (editando >= 0 && lista[editando].color) p.color = lista[editando].color;
    if (editando >= 0 && !comoNuevo) {
      lista[editando] = p;
      guardar(`“${p.nombre}” actualizado`);
    } else {
      insertar(p);
      guardar(`“${p.nombre}” agregado al catálogo`);
    }
    limpiarForm();
  });

  /* ---------- foto: se achica y se guarda dentro del producto ---------- */
  $('#fFoto').addEventListener('change', e => {
    const archivo = e.target.files[0]; if (!archivo) return;
    const img = new Image(), url = URL.createObjectURL(archivo);
    img.onload = () => {
      const k = Math.min(1, 640 / Math.max(img.width, img.height));
      const cv = document.createElement('canvas');
      cv.width = Math.round(img.width * k); cv.height = Math.round(img.height * k);
      const ctx = cv.getContext('2d');
      ctx.drawImage(img, 0, 0, cv.width, cv.height);
      let dato = cv.toDataURL('image/webp', .82);
      if (!dato.startsWith('data:image/webp')) {
        ctx.globalCompositeOperation = 'destination-over';
        ctx.fillStyle = '#101216'; ctx.fillRect(0, 0, cv.width, cv.height);
        dato = cv.toDataURL('image/jpeg', .84);
      }
      foto = dato;
      URL.revokeObjectURL(url);
      previa();
    };
    img.onerror = () => { URL.revokeObjectURL(url); C.toast('No se pudo leer esa imagen.'); };
    img.src = url;
  });
  $('#fFotoQuitar').addEventListener('click', () => { foto = ''; $('#fFoto').value = ''; previa(); });

  /* ---------- pegar de Excel ---------- */
  function categoriaDe(txt) {
    const t = plano(txt).trim();
    if (!t) return 'accesorios';
    const c = CATEGORIAS.find(c => c.id === t || plano(c.nombre) === t)
      || CATEGORIAS.find(c => plano(c.nombre).startsWith(t) || t.startsWith(c.id) || plano(c.nombre).includes(t));
    return c ? c.id : 'accesorios';
  }

  const filasDe = txt => txt.split(/\r?\n/).map(l => l.trim() ? l.split(l.includes('\t') ? '\t' : ';').map(c => c.trim()) : null)
    .filter(Boolean)
    .filter((c, i) => !(i === 0 && /^nombre$/i.test(c[0]))); // sin la fila de títulos

  function leerPegado(txt) {
    return filasDe(txt)
      .map(([nombre, cat, precio, tamano, descripcion, antes]) => {
        const p = { nombre, categoria: categoriaDe(cat), precio: aPrecio(precio) };
        if (tamano) p.tamano = tamano;
        if (descripcion) p.descripcion = descripcion;
        if (aPrecio(antes) > p.precio) p.precioAntes = aPrecio(antes);
        return p;
      })
      .filter(p => p.nombre && p.precio > 0);
  }

  $('#xTexto').addEventListener('input', e => {
    pegados = leerPegado(e.target.value);
    const lineas = filasDe(e.target.value).length;
    $('#xAgregar').disabled = !pegados.length;
    $('#xAgregar').textContent = pegados.length ? `Agregar ${pegados.length} ${pegados.length === 1 ? 'producto' : 'productos'}` : 'Agregar productos';
    $('#xInfo').textContent = !lineas ? 'Todavía no pegaste nada.'
      : pegados.length ? `Listos: ${pegados.slice(0, 3).map(p => `${p.nombre} (${CAT[p.categoria].nombre}, ${fmt(p.precio)})`).join(' · ')}${pegados.length > 3 ? ` y ${pegados.length - 3} más` : ''}.`
        + (pegados.length < lineas ? ` Se saltean ${lineas - pegados.length} filas sin nombre o sin precio.` : '')
      : 'No se reconoce ninguna fila. Revisá que cada una tenga nombre y precio, separados por tabulación o punto y coma.';
  });

  $('#xAgregar').addEventListener('click', () => {
    if (!pegados.length) return;
    const n = pegados.length;
    pegados.forEach(insertar);
    pegados = [];
    $('#xTexto').value = ''; $('#xTexto').dispatchEvent(new Event('input'));
    guardar(`${n} ${n === 1 ? 'producto agregado' : 'productos agregados'}`);
    pestana('lista');
  });

  /* ---------- lista ---------- */
  function pintarLista() {
    const q = plano($('#lQ').value);
    const filas = lista.map((p, i) => ({ p, i })).filter(({ p }) => !q || plano(`${p.nombre} ${(CAT[p.categoria] || {}).nombre || ''}`).includes(q));
    $('#lLista').innerHTML = filas.length ? filas.map(({ p, i }) => `
      <li style="--c:${colorDe(p)}" data-i="${i}">
        ${dibujo(p)}
        <div><b>${esc(p.nombre)}</b><span>${esc((CAT[p.categoria] || CAT.accesorios).nombre)} · ${fmt(p.precio)}${p.destacado ? ' · Destacado' : ''}${p.precioAntes > p.precio ? ' · Oferta' : ''}${p.sinStock ? ' · Sin stock' : ''}</span></div>
        <button type="button" data-editar>Editar</button>
        <button type="button" class="borrar" data-borrar>Borrar</button>
      </li>`).join('') : '<li style="grid-template-columns:1fr"><span>No hay productos con ese nombre.</span></li>';
  }
  $('#lQ').addEventListener('input', pintarLista);

  $('#lLista').addEventListener('click', e => {
    const li = e.target.closest('li[data-i]'); if (!li) return;
    const i = Number(li.dataset.i);
    if (e.target.closest('[data-editar]')) return editar(i);
    const b = e.target.closest('[data-borrar]'); if (!b) return;
    // dos toques para borrar
    if (!b.classList.contains('seguro')) {
      $$('.seguro', ov).forEach(x => { x.classList.remove('seguro'); x.textContent = 'Borrar'; });
      b.classList.add('seguro'); b.textContent = '¿Seguro?';
      return;
    }
    const [p] = lista.splice(i, 1);
    if (editando === i) limpiarForm(); else if (editando > i) editando--;
    guardar(`“${p.nombre}” borrado`);
  });

  /* ---------- descargar productos.js ---------- */
  $('#btnExportar').addEventListener('click', () => {
    const cab = [
      '/* =========================================================',
      '   PRODUCTOS DEL CATÁLOGO',
      `   Archivo generado desde el panel de carga el ${new Date().toLocaleDateString('es-AR')}.`,
      '   Reemplazá con este archivo el productos.js de la web.',
      '   Obligatorio por producto: nombre, categoria y precio.',
      '   ========================================================= */',
    ].join('\n');
    const txt = `${cab}\nconst PRODUCTOS = [\n${lista.map(p => '  ' + JSON.stringify(p)).join(',\n')}\n];\n`;
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([txt], { type: 'text/javascript;charset=utf-8' }));
    a.download = 'productos.js';
    document.body.append(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
    C.toast('productos.js descargado');
  });

  /* ---------- descargar la lista para abrir en Excel ---------- */
  $('#btnCsv').addEventListener('click', () => {
    const celda = v => { const t = String(v ?? ''); return /[";\n]/.test(t) ? `"${t.replace(/"/g, '""')}"` : t; };
    const filas = [['Nombre', 'Categoría', 'Precio', 'Tamaño', 'Descripción', 'Precio anterior'],
      ...lista.map(p => [p.nombre, (CAT[p.categoria] || CAT.accesorios).nombre, p.precio, p.tamano, p.descripcion, p.precioAntes])];
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob(['﻿' + filas.map(f => f.map(celda).join(';')).join('\r\n')], { type: 'text/csv;charset=utf-8' }));
    a.download = 'productos.csv';
    document.body.append(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
    C.toast('productos.csv descargado');
  });

  $('#btnRestaurar').addEventListener('click', e => {
    const b = e.currentTarget;
    if (!b.classList.contains('seguro')) {
      b.classList.add('seguro'); b.textContent = '¿Descartar mis cambios?';
      setTimeout(() => { b.classList.remove('seguro'); b.textContent = 'Restaurar original'; }, 4000);
      return;
    }
    b.classList.remove('seguro'); b.textContent = 'Restaurar original';
    C.restaurar();
    lista = C.crudos();
    limpiarForm(); estado(); pintarLista();
    C.toast('Catálogo original restaurado');
  });

  /* ---------- abrir ---------- */
  function abrirPanel() {
    lista = C.crudos();
    limpiarForm(); estado(); pintarLista(); pestana('nuevo');
    C.abrir(ov);
  }
  // el panel no tiene botón a la vista: se entra agregando #cargar a la dirección
  function porDireccion() {
    if (location.hash !== '#cargar') return;
    history.replaceState(null, '', location.pathname + location.search);
    abrirPanel();
  }
  addEventListener('hashchange', porDireccion);
  porDireccion();
})();
