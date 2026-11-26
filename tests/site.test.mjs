import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

const page = (path) => readFileSync(new URL(`../dist/client/${path}`, import.meta.url), 'utf8');

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
    const openers = [...html.matchAll(/data-modal-open="([^"]+)"/g)].map((match) => match[1]);
    assert.equal(openers.length, 5, path);
    for (const id of openers) {
      assert.ok(id.startsWith(`${prefix}-`), id);
      const dialog = html.match(new RegExp(`<dialog[^>]*id="${id}"[\\s\\S]*?</dialog>`));
      assert.ok(dialog, `missing dialog ${id}`);
      assert.match(dialog[0], /href="https:\/\/wa\.me\/5491138105350\?text=[^"]*temario/);
    }
  }
});
