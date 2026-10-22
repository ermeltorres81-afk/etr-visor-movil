const { test } = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');

// Ejecuta el script de producción, sin arrancar la interfaz ni activar licencias.
// DOM y FileReader son dobles mínimos: no simulan layout ni un navegador Android.
const html = readFileSync(path.join(__dirname, '../index.html'), 'utf8');
const script = html.match(/<script>([\s\S]*?)<\/script>/)[1];
function node() {
  const children = new Map();
  return {
    style: {}, classList: { add() {} }, appendChild() {},
    addEventListener(type, fn) { this[type] = fn; },
    querySelector(selector) {
      if (!children.has(selector)) children.set(selector, node());
      return children.get(selector);
    },
  };
}
function harness() {
  const storage = new Map();
  let reads = 0;
  class Reader {
    readAsText(file) {
      reads++;
      if (file.error) return this.onerror();
      this.result = file.text;
      this.onload();
    }
  }
  const ctx = vm.createContext({
    console, FileReader: Reader,
    document: { getElementById: node }, window: { addEventListener() {} },
    localStorage: {
      getItem: key => storage.get(key) ?? null,
      setItem: (key, value) => storage.set(key, value),
    },
  });
  // Solo omite el arranque final; todas las funciones probadas son las originales.
  const startup = script.lastIndexOf('\ncargarProyectosGuardados();');
  assert.ok(startup > 0, 'Debe existir el arranque de producción');
  vm.runInContext(script.slice(0, startup), ctx);
  ctx.makeNode = node;
  vm.runInContext('el = makeNode; render = () => {}; DATA.proyectos = [];', ctx);
  const run = code => vm.runInContext(code, ctx);
  return {
    run, storage, get reads() { return reads; },
    import(text, extra = {}) {
      ctx.file = { text, size: Buffer.byteLength(text), ...extra };
      run('renderProjects().querySelector("#fileImport").change({target:{files:[file]}})');
      return JSON.parse(run('JSON.stringify(avisoImport)'));
    },
    projects: () => JSON.parse(run('JSON.stringify(DATA.proyectos)')),
  };
}
function fixture() {
  return {
    cod: 'PRUEBA-01', nombre: 'Obra Ñandú < & > "doble" \'simple\' 🏗️', cliente: 'Peña & Hijos',
    total: 1250.50, avance: 12.5,
    datos: { nota: '<img src=x onerror=alert(1)>\nAgua potable – Pasaje', pctIndirectos: 18.25 },
    rubros: [{ item: '1', cod: 'R-01', desc: 'Tubería Ø ½”', unidad: 'm³', cant: 0.002, pu: 1.2345,
      crono: [25.5, 74.5], apu: { grupos: [{ nombre: 'Materiales', subtotal: 0.0002,
        items: [{ nm: 'Piola & estaca', unid: 'm', cant: 0.0001, precio: 0.25, rend: 0.002, subtotal: 0.000025 }] }],
        costoDirecto: 0.000025, costoIndirecto: 0.0000045, precioOferta: 0.0000295 } }],
    cronoPeriodos: ['MES 1', 'MES 2'],
    recursos: { Materiales: [{ nm: 'Cobre <especial>', unid: 'kg', precio: 0.002, cantPeriodo: [0.0001, 0.0002] }] },
  };
}
function rejected(h, text, message, extra) {
  const before = h.projects();
  const stored = [...h.storage];
  const result = h.import(text, extra);
  assert.equal(result.ok, false);
  assert.match(result.texto, message);
  assert.deepEqual(h.projects(), before);
  assert.deepEqual([...h.storage], stored);
}
test('archivo de cero bytes: mensaje claro y sin lectura ni cambios', () => {
  const h = harness();
  rejected(h, '', /archivo está vacío.*Vuelve a exportarlo/);
  assert.equal(h.reads, 0);
});
test('solo espacios o BOM: se identifica como vacío', () => {
  for (const text of [' \n\t', '\uFEFF  \n']) rejected(harness(), text, /archivo está vacío/);
});
test('JSON incorrecto: explica daño y pide exportar de nuevo', () => {
  for (const text of ['{', '{"cod":}', '<html>error</html>']) {
    rejected(harness(), text, /dañado.*Vuelve a exportarlo/);
  }
});
test('JSON válido con formato ajeno: no se agrega ni se guarda', () => {
  for (const value of [null, [], 42, {}, { cod: 'X', nombre: 'X', rubros: {} }]) {
    rejected(harness(), JSON.stringify(value), /forma de un proyecto de ETR APUS PRO/);
  }
});
test('repetido (también con espacios en código): no duplica memoria ni almacenamiento', () => {
  const h = harness();
  const p = fixture();
  assert.equal(h.import(JSON.stringify(p)).ok, true);
  p.cod = ' PRUEBA-01 ';
  rejected(h, JSON.stringify(p), /Ya tenías cargado PRUEBA-01.*no se volvió a sumar/);
  assert.equal(h.projects().length, 1);
  h.run('cargarProyectosGuardados()');
  assert.equal(h.projects().length, 1);
});
test('más de 8 MiB reales: rechaza antes de FileReader; el límite exacto se acepta', () => {
  const text = JSON.stringify(fixture());
  const limit = 8 * 1024 * 1024;
  const h = harness();
  rejected(h, text + ' '.repeat(limit + 1 - Buffer.byteLength(text)), /demasiado grande.*8 MB/);
  assert.equal(h.reads, 0);
  assert.equal(h.import(text + ' '.repeat(limit - Buffer.byteLength(text))).ok, true);
  assert.equal(h.reads, 1);
});
test('caracteres especiales y decimales: conserva datos y persiste tras recarga', () => {
  const h = harness();
  const p = fixture();
  assert.equal(h.import('\uFEFF' + JSON.stringify(p)).ok, true);
  const actual = h.projects()[0];
  assert.equal(actual.nombre, p.nombre);
  assert.equal(actual.datos.nota, p.datos.nota);
  assert.deepEqual(actual.rubros, p.rubros);
  assert.deepEqual(actual.recursos, p.recursos);
  assert.equal(actual.total, 1250.5);
  assert.equal(actual.datos.pctIndirectos, 18.25);
  assert.deepEqual(JSON.parse(h.storage.get('etr_proyectos_importados')), [p]);
  h.run('DATA.proyectos = []; cargarProyectosGuardados()');
  assert.deepEqual(h.projects(), [actual]);
  assert.equal(h.run('fmtNum(0.002)'), '0,002');
  assert.equal(h.run('fmtNum(0.0001)'), '0,0001');
  assert.equal(h.run('fmtN(1250.5, 2, 2)'), '1.250,50');
  assert.equal(h.run('esc(`< & > " \'`)'), '&lt; &amp; &gt; &quot; &#39;');
});
test('error de lectura y falta de espacio tienen mensajes diferenciados', () => {
  const h = harness();
  rejected(h, '{}', /No se pudo abrir.*Inténtalo de nuevo/, { error: true });
  h.run('localStorage.setItem = () => { throw new Error("QuotaExceededError"); }');
  const result = h.import(JSON.stringify(fixture()));
  assert.equal(result.ok, false);
  assert.match(result.texto, /se agregó, pero no se pudo guardar.*importarlo otra vez/);
  assert.equal(h.projects().length, 1);
});
