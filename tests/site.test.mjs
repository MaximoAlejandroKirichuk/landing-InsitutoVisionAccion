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
  const links = [...html.matchAll(/href="(https:\/\/wa\.me\/[^"]+)"/g)].map((match) => match[1]);
  assert.ok(links.length >= 2);
  assert.equal(new Set(links).size, 1);
  const url = new URL(links[0]);
  assert.equal(url.pathname, '/5491138105350');
  assert.match(url.searchParams.get('text'), /arancel.*inscripción/);
  assert.match(html, /no reemplaza la atención médica ni psicológica/);
});
