import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

const page = (path) => readFileSync(new URL(`../dist/${path}`, import.meta.url), 'utf8');

test('institutional home introduces the institute and leads to the training page', () => {
  const html = page('index.html');
  assert.match(html, /lang="es-AR"/);
  assert.match(html, /Instituto Visión en Acción/);
  assert.match(html, /Quién está detrás/);
  assert.match(html, /<a\b[^>]*href="\/formacion\/"[^>]*>Conocer la formación/);
  assert.match(html, /id="orientacion"/);
  assert.match(html, /id="funnel-root"/);
  assert.equal((html.match(/<h1\b/g) || []).length, 1);
});

test('training page connects the overview, curriculum and FAQs to one inquiry path', () => {
  const html = page('formacion/index.html');
  assert.match(html, /<h1>Bio Coaching<br\s*\/?>Sistémico Integral<\/h1>/);
  for (const id of ['para-quien', 'programa', 'cursada', 'preguntas']) {
    assert.match(html, new RegExp(`id="${id}"`));
  }
  const links = [...html.matchAll(/href="(https:\/\/wa\.me\/[^"]+)"/g)].map((match) => new URL(match[1].replaceAll("&amp;", "&")));
  // Every WhatsApp link goes to the same number.
  assert.deepEqual([...new Set(links.map((url) => url.pathname))], ["/5491138105350"]);
  // The general inquiry (price and enrolment) is repeated along the page.
  const general = links.filter((url) => /arancel.*inscripción/.test(url.searchParams.get("text")));
  assert.ok(general.length >= 2);

  assert.match(html, /no reemplaza la atención médica ni psicológica/);
});

test('each training topic card opens its own modal with a topic inquiry', () => {
  for (const [path, prefix] of [['index.html', 'home-enfoque'], ['formacion/index.html', 'enfoque']]) {
    const html = page(path);
    const openers = [...html.matchAll(/data-modal-open="([^"]+)"/g)]
      .map((match) => match[1])
      .filter((id) => id.startsWith(`${prefix}-`));
    assert.equal(openers.length, 5, path);
    for (const id of openers) {
      const dialog = html.match(new RegExp(`<dialog[^>]*id="${id}"[\\s\\S]*?</dialog>`));
      assert.ok(dialog, `missing dialog ${id}`);
      assert.match(dialog[0], /href="https:\/\/wa\.me\/5491138105350\?text=[^"]*temario/);
    }
  }
});

test('training page repeats one "reserve" action that opens the lead form, with WhatsApp as fallback', () => {
  const html = page('formacion/index.html');
  const reserve = [...html.matchAll(/<a\b[^>]*data-modal-open="reservar"[^>]*>([^<]*)<\/a>/g)];
  assert.ok(reserve.length >= 4, `expected the reserve action along the page, got ${reserve.length}`);
  for (const [tag, label] of reserve) {
    assert.equal(label.trim(), 'Reservar mi lugar');
    assert.match(tag, /href="https:\/\/wa\.me\/5491138105350\?text=/);
  }
  const dialog = html.match(/<dialog[^>]*id="reservar"[\s\S]*?<\/dialog>/);
  assert.ok(dialog);
  for (const name of ['fullName', 'whatsapp', 'email', 'consent']) {
    assert.match(dialog[0], new RegExp(`name="${name}"`));
  }
  for (const id of ['oferta', 'testimonios', 'docentes', 'incluye']) {
    assert.match(html, new RegExp(`id="${id}"`));
  }
});
