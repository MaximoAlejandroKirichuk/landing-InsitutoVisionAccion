import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

const page = (path) => readFileSync(new URL(`../dist/${path}`, import.meta.url), 'utf8');

test('both pages use the institute logo in the header and browser tab', () => {
  for (const path of ['index.html', 'formacion/index.html']) {
    const html = page(path);
    assert.match(html, /<link rel="icon" href="\/favicon\.svg" type="image\/svg\+xml"/);
    assert.match(html, /<a class="brand"[^>]*>\s*<img class="brand-mark" src="\/favicon\.svg#svgView\(viewBox\(101,104,153,153\)\)"/);
    assert.doesNotMatch(html, /\/loto\.svg/);
  }
});

test('the formation hero introduces the integrated training and keeps the reservation and instructor paths', () => {
  const html = page('formacion/index.html');
  const hero = html.match(/<section class="site-hero hero-formation">[\s\S]*?<\/section>/)?.[0];
  assert.ok(hero);
  assert.match(hero, /Aprendé a integrar cinco enfoques de acompañamiento/);
  for (const detail of ['12 meses', 'Clases en vivo', 'Inicio en enero de 2027']) {
    assert.ok(hero.includes(detail), detail);
  }
  assert.match(hero, /data-modal-open="reservar"[^>]*>Reservar mi lugar<\/a>/);
  assert.match(hero, /href="#docentes">Conocer a los formadores<\/a>/);
  assert.match(hero, /class="formation-hero-art" aria-hidden="true">\s*<span class="formation-hero-sphere"><\/span>/);
  assert.match(hero, /class="formation-hero-sculpture" src="\/images\/formation-sculpture-base\.webp"[^>]*alt=""/);
  assert.match(hero, /srcset="\/images\/formation-sculpture-base-mobile\.webp 480w, \/images\/formation-sculpture-base\.webp 960w"/);
  assert.doesNotMatch(hero, /formation-paths\.svg/);
  assert.doesNotMatch(hero, /class="emblem"|favicon\.svg/);
});

test('institutional home introduces the institute and leads to the training page', () => {
  const html = page('index.html');
  assert.match(html, /lang="es-AR"/);
  assert.match(html, /Instituto Visión en Acción/);
  assert.match(html, /class="emblem"[^>]*>[\s\S]*?<img src="\/favicon\.svg#svgView\(viewBox\(28,92,310,215\)\)"/);
  assert.doesNotMatch(html, /formation-sculpture|formation-paths\.svg/);
  assert.match(html, /Quién está detrás/);
  assert.match(html, /Explorá la formación Consultorio del Bienestar/);
  assert.match(html, /<a\b[^>]*href="\/formacion\/"[^>]*>Conocer la formación/);
  assert.match(html, /id="orientacion"/);
  assert.match(html, /id="funnel-root"/);
  assert.equal((html.match(/<h1\b/g) || []).length, 1);
});

test('training page connects the overview, curriculum and FAQs to one inquiry path', () => {
  const html = page('formacion/index.html');
  assert.match(html, /<h1>Consultorio del Bienestar<\/h1>/);
  for (const id of ['para-quien', 'programa', 'cursada', 'preguntas']) {
    assert.match(html, new RegExp(`id="${id}"`));
  }
  const links = [...html.matchAll(/href="(https:\/\/wa\.me\/[^"]+)"/g)].map((match) => new URL(match[1].replaceAll("&amp;", "&")));
  // Every WhatsApp link goes to the same number.
  assert.deepEqual([...new Set(links.map((url) => url.pathname))], ["/5491138105350"]);
  // The general inquiry (price and enrolment) is repeated along the page.
  const general = links.filter((url) => /arancel.*inscripción/.test(url.searchParams.get("text")));
  assert.ok(general.length >= 2);
  assert.ok(general.every((url) => url.searchParams.get("text").includes('Consultorio del Bienestar')));

  assert.match(html, /no reemplaza la atención médica ni psicológica/);
});

test('the training schedule uses 20 hs everywhere it is displayed', () => {
  const html = page('formacion/index.html');
  assert.match(html, /<dt>Días y horario<\/dt><dd>Lunes y miércoles, 20 hs \(Argentina\)<\/dd>/);
  assert.equal((html.match(/20 hs/g) || []).length, 1);
});

test('the home page introduces the founder and the institute’s philosophy', () => {
  const html = page('index.html');
  assert.match(html, /Fernanda Rodríguez/);
  assert.match(html, /Acompañar no es decirle al otro qué camino debe tomar/);
  assert.match(html, /trabajar nuestras creencias, emociones y valores/);
});

test('the next cohort shows the confirmed dates, prices and payment terms', () => {
  const html = page('formacion/index.html');
  const offer = html.match(/<section[^>]*id="oferta"[\s\S]*?<\/section>/)?.[0];
  assert.ok(offer);
  assert.match(offer, /Enero de 2027/);
  assert.match(offer, /Cupos limitados/);
  assert.match(offer, /Enero a abril[\s\S]*?ARS 60\.000[\s\S]*?USD 70/);
  assert.match(offer, /Mayo a agosto[\s\S]*?ARS 70\.000[\s\S]*?USD 80/);
  assert.match(offer, /Septiembre a diciembre[\s\S]*?ARS 80\.000[\s\S]*?USD 90/);
  assert.match(offer, /Matrícula bonificada/);
  assert.match(offer, /del 1 al 10 de cada mes/);
  assert.match(offer, /transferencia bancaria en Argentina y PayPal desde el exterior/);
});

test('the training page shows confirmed study and certificate details without placeholders', () => {
  const html = page('formacion/index.html');
  assert.match(html, /Fernanda Rodríguez/);
  assert.match(html, /Grabaciones disponibles por 30 días/);
  assert.match(html, /Podés empezar desde cero/);
  assert.match(html, /El Instituto Visión en Acción emite los certificados/);
  assert.match(html, /evaluaciones teóricas.*prácticas obligatorias/);
  assert.doesNotMatch(html, /<mark class="pending"|id="testimonios"/);
});

test('the instructor portrait appears alongside the bio, outside the header', () => {
  const html = page('formacion/index.html');
  const instructors = html.match(/<section[^>]*id="docentes"[\s\S]*?<\/section>/)?.[0];
  assert.ok(instructors);
  assert.match(instructors, /Quién dicta la formación[\s\S]*Fernanda Rodríguez/);
  assert.match(instructors, /<img\b[^>]*src="\/images\/instructor-portrait\.jpg"[^>]*alt="Retrato de la formadora"/);
  assert.doesNotMatch(html.match(/<header\b[\s\S]*?<\/header>/)?.[0] ?? '', /instructor-portrait/);
});

test('the holistic-area instructor has a separate profile with the supplied portrait', () => {
  const html = page('formacion/index.html');
  const instructors = html.match(/<section[^>]*id="docentes"[\s\S]*?<\/section>/)?.[0];
  const profile = instructors?.match(/<article[^>]*aria-labelledby="formador-holistico"[\s\S]*?<\/article>/)?.[0];
  assert.ok(profile);
  assert.match(profile, /<h3 id="formador-holistico">Daniel Alberto Rodríguez<\/h3>/);
  assert.match(profile, /Formador del área holística\. Su formación incluye tarot y oráculos, constelaciones familiares, biodescodificación, hipnosis y Reiki\./);
  assert.match(profile, /<img\b[^>]*src="\/images\/holistic-instructor-portrait\.jpg"[^>]*alt="Retrato de Daniel Alberto Rodríguez"/);
  assert.doesNotMatch(profile, /Fernanda Rodríguez/);
});

test('the training page explains that study materials are downloadable for future reference', () => {
  const html = page('formacion/index.html');
  assert.match(html, /Podés descargar el material de estudio y guardarlo para consultarlo cuando lo necesites\./);
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

test('only the training program renders the five topics as a compact index', () => {
  const html = page('formacion/index.html');
  const program = html.match(/<section\b[^>]*id="programa"[^>]*>[\s\S]*?<\/section>/)?.[0];
  assert.ok(program);
  assert.match(program, /<section class="band program-index"/);
  const list = program.match(/<ul\b[^>]*class="topic-grid"[^>]*>[\s\S]*?<\/ul>/)?.[0];
  assert.ok(list);
  assert.deepEqual(
    [...list.matchAll(/<button\b[^>]*data-modal-open="enfoque-([^"]+)"[^>]*aria-haspopup="dialog"/g)]
      .map((match) => match[1]),
    ['coaching', 'tarot', 'biodescodificacion', 'hipnosis', 'pnl'],
  );
  assert.doesNotMatch(page('index.html'), /class="[^"]*\bprogram-index\b/);
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
  for (const id of ['oferta', 'docentes', 'incluye']) {
    assert.match(html, new RegExp(`id="${id}"`));
  }
});
