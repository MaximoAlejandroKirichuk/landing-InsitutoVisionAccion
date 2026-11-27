# Instituto Visión en Acción

Sitio del Instituto Visión en Acción, hecho con Astro 7. Netlify publica `main` automáticamente.

## Páginas

| URL | Qué es | Archivo |
| --- | --- | --- |
| `/` | Home institucional: a qué se dedica el instituto, una tarjeta por propuesta y quién está detrás | `src/pages/index.astro` |
| `/metodo-via/` | Landing del Método VIA con el quiz Mapa Inicial VIA | `src/pages/metodo-via.astro` |
| `/formacion/` y cada curso nuevo | Landing de venta de cada curso, generada desde la plantilla | `src/content/cursos/*.yaml` + `src/pages/[curso].astro` |

Las landings (cursos y Método VIA) no tienen menú: están pensadas para recibir el tráfico de una campaña
(Meta Ads, etc.) y tienen una sola acción, "Reservar mi lugar", que abre el formulario y después ofrece WhatsApp.

## Cómo sumar un curso nuevo

1. Copiá `src/content/cursos/_plantilla.yaml` en la misma carpeta y renombralo. **El nombre del archivo es la URL**:
   `taller-tarot.yaml` → `https://<sitio>/taller-tarot/`. Minúsculas, sin acentos, guiones en vez de espacios.
2. Completá los textos. Cada sección marcada `(opcional)` se puede borrar entera y la página no la muestra.
   Las fotos van en `public/images/` y se escriben como `/images/archivo.jpg`. Solo fotos reales, nada de IA ni stock.
3. `npm run build` (o `npm run dev`) avisa si falta un campo obligatorio, con el nombre del campo.
4. Subí el cambio a `main`. Netlify publica la página y la tarjeta aparece sola en la home
   (salvo que pongas `mostrarEnHome: false`, útil para una landing que solo usan los anuncios).

Para despublicar un curso sin borrarlo: `publicado: false`.

## A quién le hablamos

Todos los textos le hablan a una sola mujer, **Lorena**: alrededor de 54 años, hijos adultos y muchas veces nietos.
Ve que sus hijos repiten sus errores y que se fueron alejando, y reconoce en eso el mismo rechazo que sintió con su mamá.
Decide cambiar ella primero para cortar la cadena, y busca entender de dónde viene lo que se repite
(constelaciones, biodescodificación, hipnosis, vidas pasadas).

- Usá sus frases, en primera persona: «Mi hija me busca… y yo le pongo excusas», «Me juré que con mis hijos iba a ser distinto».
- No la señales ("¿Tus hijos te aíslan?"): Meta suele rechazar esos anuncios.
- No prometas que los hijos vuelvan ni que la relación se arregle. No inventes testimonios.
- Decí que es pago. Una sola idea y una sola acción por página.
- El campo `gancho` de cada curso va con **la misma frase del anuncio** que lleva a esa página: así, quien llega desde el Reel
  reconoce enseguida que está en el lugar correcto.

## Convenciones de las landings por curso

Cada curso es **un YAML** (`src/content/cursos/<slug>.yaml`) y, si tiene animación, **un componente**
(`src/components/animaciones/<Nombre>.astro`). Nada más: la plantilla `[curso].astro` es común a todos.

### Animación del hero (`animacion:`)

- En el YAML: `animacion: tarot` (o `coaching-ontologico`). Se busca en `src/components/animaciones/` el archivo
  cuyo nombre coincide **sin importar mayúsculas ni guiones**: `tarot` → `Tarot.astro`,
  `coaching-ontologico` → `CoachingOntologico.astro`. Si no existe, el build falla con el nombre del curso.
- Reemplaza a `hero.imagen` y al emblema. Va en la columna derecha del hero, en un contenedor `.hero-animacion`
  de hasta 30rem de ancho (21rem en celular), sobre el fondo violeta del hero. El componente no recibe props.
- **Estilos y scripts siempre `is:inline`** (`<style is:inline>`, `<script is:inline>`) y con clases prefijadas
  con el nombre de la animación (`.tarot-...`). Así cada página carga solo su animación: un `<style>` normal
  se sumaría al CSS de todas las landings.
- Estilo: bienestar, calma, elegante, paleta violeta y dorado del sitio (`--plum`, `--gold`, `--paper`). Nada "tech".
  Solo `transform` y `opacity` animados; todo quieto con `prefers-reduced-motion: reduce` (la pose quieta tiene
  que verse terminada). Sin librerías externas ni imágenes pesadas.

### Bloque "Cómo es estudiar en el Instituto" (`instituto:`)

Aparece solo en todas las landings, antes de la oferta, con tres tarjetas: **Qué recibís**, **Encuentros en vivo**
y **Membresía** (textos por defecto en `src/data/instituto.ts`: membresía $20.000 / USD 20 por mes, lunes y jueves
19 h, catálogo de clases y comunidad, sin certificado). Para cambiar los textos de un curso:

```yaml
instituto:
  recibis: [Un PDF de 92 páginas, Una sesión de claridad de 20 minutos]
  encuentros: Sin encuentros en vivo: lo hacés a tu ritmo.
  membresia: true      # false = sin la tarjeta de membresía
```

`instituto: false` oculta el bloque entero (por ejemplo, en la landing de la propia membresía si se prefiere).

### Precio

Si el curso tiene precio publicado va en `oferta.precios`. Si no lo tiene, dejá `oferta` sin `precios` y la página
dice sola: "Es una propuesta paga. Te pasamos el arancel y las formas de pago por WhatsApp."

### WhatsApp

Números oficiales en `src/data/contacto.ts`: **11 6677-0206** (todos los botones) y **11 5646-7222**
(se muestran los dos en el pie). El 11 2696-7602 ya no es del instituto.

### Tono

- Propuestas emocionales/holísticas (constelaciones, memoria celular, hipnosis, mindfulness, tarot, membresía,
  talleres holísticos, ebooks holísticos): le hablamos a **Lorena** (ver "A quién le hablamos").
- Propuestas profesionales (coaching ontológico, coaching de vida, vivir del coaching, liderazgo ejecutivo,
  gestión del tiempo): tono profesional, a quien quiere formarse, ejercer o liderar. Mismas reglas: sin promesas
  de resultados, sin testimonios inventados, decir que es pago.
- `mostrarEnHome: false` en las landings pensadas solo para anuncios.

## Campañas (Meta Ads) y la planilla de leads

- Cada anuncio apunta a la URL de su curso con UTMs, por ejemplo
  `https://<sitio>/taller-tarot/?utm_source=facebook&utm_medium=paid&utm_campaign=taller-tarot-marzo`.
- El sitio guarda `utm_source`, `utm_medium`, `utm_campaign`, `utm_content` y `utm_term` durante la visita
  y los manda junto con el formulario (también desde el quiz del Método VIA).
- En la planilla, la columna `funnel_slug` dice de qué curso vino el lead (el nombre del archivo, o el valor de
  `planilla:` en el YAML; la formación usa `formacion-bio-coaching` para no romper filtros existentes) y las
  columnas R–V guardan los UTM.
- **Una sola vez:** agregá los encabezados `utm_source	utm_medium	utm_campaign	utm_content	utm_term` en R1:V1 de
  la hoja "Leads" (o actualizá `HEADERS` del Apps Script con el snippet de abajo). Las filas viejas no cambian.

## Desarrollo

```bash
npm install
npm run dev        # http://localhost:4321
npm run test       # tests unitarios (vitest)
npm run test:site  # build + tests sobre el HTML generado
npm run check      # astro check (tipos y contenido)
```

Requiere Node >= 22.23.4.

## Key files

- `src/content.config.ts` — schema of the course template (every field of the YAML files)
- `src/pages/[curso].astro` — course landing template
- `src/components/LeadModal.astro` — course lead form (posts to `/api/formation-leads` with the course slug and UTMs)
- `src/components/OrientationFunnel.astro` — orchestrates the Método VIA quiz on the client
- `src/lib/utm.ts` — captures campaign params on landing pages
- `src/lib/funnelState.ts`, `src/lib/quizData.ts`, `src/lib/validation.ts` — quiz state, questions and validation

## Environment

To point the frontend at another deployed API endpoint, define:

```bash
PUBLIC_FUNNEL_API_URL=https://your-deployed-app.com/api/funnel-submissions
```

### Google Apps Script webhook (submission persistence)

Submissions are persisted by posting a sanitized row to a Google Apps Script Web App.
The Apps Script handler appends the row to a Google Sheet.

**Server-side env vars:**

```bash
GOOGLE_APPS_SCRIPT_URL=https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec
GOOGLE_APPS_SCRIPT_SECRET=your-shared-secret
```

- `GOOGLE_APPS_SCRIPT_URL` (**required**) — the Web App deployment URL.
- `GOOGLE_APPS_SCRIPT_SECRET` (recommended) — shared secret sent inside the
  JSON body as the `secret` field. The Apps Script validates it before appending.
  Apps Script cannot read custom HTTP headers, so the body field is authoritative.

If `PUBLIC_FUNNEL_API_URL` is missing, the app posts to the local
`/api/funnel-submissions` endpoint.

### Google Apps Script — ready-to-copy `doPost(e)` snippet

1. Open `https://script.google.com`
2. Create a new project
3. Replace the default `Code.gs` with the snippet below
4. Deploy as a **Web App** (`Deploy` → `New deployment` → type: `Web App`)
   - Execute as: **Me**
   - Who has access: **Anyone** (the server validates the secret)
5. Copy the deployment URL and set it as `GOOGLE_APPS_SCRIPT_URL`

#### Expected Sheet columns

Set up your "Leads" sheet with these exact header columns (order matters).

Answer columns (q1_area, q2_current_situation, q3_previous_experience,
q4_preferred_modality, q5_desired_outcome) store **human-readable option
labels** (e.g. "Desarrollo personal y propósito", "Online."), not internal
option IDs. The free-text columns q1_other and q3_other contain the
user-entered value.

| Column | Header |
|--------|--------|
| A | `submission_id` |
| B | `submitted_at` |
| C | `academy_slug` |
| D | `funnel_slug` |
| E | `full_name` |
| F | `whatsapp` |
| G | `email` |
| H | `consent` |
| I | `user_agent` |
| J | `referrer` |
| K | `q1_area` |
| L | `q1_other` |
| M | `q2_current_situation` |
| N | `q3_previous_experience` |
| O | `q3_other` |
| P | `q4_preferred_modality` |
| Q | `q5_desired_outcome` |
| R | `utm_source` |
| S | `utm_medium` |
| T | `utm_campaign` |
| U | `utm_content` |
| V | `utm_term` |

**Ready-to-copy header row** (paste into row 1 of the "Leads" sheet):

```
submission_id	submitted_at	academy_slug	funnel_slug	full_name	whatsapp	email	consent	user_agent	referrer	q1_area	q1_other	q2_current_situation	q3_previous_experience	q3_other	q4_preferred_modality	q5_desired_outcome	utm_source	utm_medium	utm_campaign	utm_content	utm_term
```

The snippet below also auto-creates headers when the first row is empty, so you can start with a blank sheet.

```javascript
// Google Apps Script — doPost handler for funnel submissions.
// Deploy as a Web App (Execute as: Me, Access: Anyone).
// Requires a sheet named "Leads" in the active spreadsheet.
// Expected POST body (JSON):
// {
//   "submissionId": "uuid",
//   "row": ["cell1", "cell2", ...]
// }
//
// The row array has 22 cells in this fixed order:
//   submission_id, submitted_at, academy_slug, funnel_slug,
//   full_name, whatsapp, email, consent, user_agent, referrer,
//   q1_area, q1_other, q2_current_situation,
//   q3_previous_experience, q3_other, q4_preferred_modality,
//   q5_desired_outcome, utm_source, utm_medium, utm_campaign,
//   utm_content, utm_term

var EXPECTED_SECRET = 'your-shared-secret'; // Set your secret here.
var SHEET_NAME = 'Leads';

var HEADERS = [
  'submission_id',
  'submitted_at',
  'academy_slug',
  'funnel_slug',
  'full_name',
  'whatsapp',
  'email',
  'consent',
  'user_agent',
  'referrer',
  'q1_area',
  'q1_other',
  'q2_current_situation',
  'q3_previous_experience',
  'q3_other',
  'q4_preferred_modality',
  'q5_desired_outcome',
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_content',
  'utm_term',
];

function doPost(e) {
  var output = ContentService.createTextOutput();
  output.setMimeType(ContentService.MimeType.JSON);

  try {
    // Apps Script does not expose custom request headers in doPost,
    // so the shared secret must be validated from the JSON body.
    var payload = JSON.parse(e.postData.contents);
    var bodySecret = payload.secret || '';

    if (EXPECTED_SECRET && bodySecret !== EXPECTED_SECRET) {
      output.setContent(JSON.stringify({ success: false, error: 'Forbidden' }));
      return output;
    }

    var row = payload.row;
    if (!row || !Array.isArray(row)) {
      output.setContent(JSON.stringify({ success: false, error: 'Missing row' }));
      return output;
    }

    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
    if (!sheet) {
      output.setContent(JSON.stringify({ success: false, error: 'Sheet not found: ' + SHEET_NAME }));
      return output;
    }

    // Auto-create header row if the sheet is empty.
    if (sheet.getLastRow() === 0) {
      sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
    }

    sheet.appendRow(row);
    output.setContent(JSON.stringify({ success: true }));
  } catch (err) {
    output.setContent(JSON.stringify({ success: false, error: err.message }));
  }

  return output;
}
```

> [!NOTE]
> Apps Script Web Apps always return HTTP 200 (even when `doPost` throws
> or returns an error JSON). The server-side Node code parses the JSON
> response body and only treats the submission as successful when
> `{ success: true }`. Any `success: false` payload, missing field, or
> invalid JSON is treated as a persistence failure (logged server-side
> via the API route; the client receives a generic 500).

### Rate limiting

The API endpoint applies per-IP rate limiting (default: 5 requests per 10 min).
In development and single-instance deployments the Node adapter's `clientAddress`
(socket remote address) is used as the client identifier — this is the safest
default and requires no extra configuration.

When running behind a reverse proxy (nginx, Caddy, Traefik, etc.) that terminates
TLS and forwards requests, the socket address becomes the proxy's IP. In that
scenario set the environment variable:

```
TRUST_PROXY_HEADERS=true
```

This tells the rate limiter to read `x-forwarded-for` / `x-real-ip` **only**
when you are certain your proxy strips or overwrites those headers. Without this
opt-in, forwarded headers are ignored to prevent trivial IP spoofing.

> [!WARNING]
> Do NOT set `TRUST_PROXY_HEADERS=true` unless a trusted reverse proxy is
> guaranteed to be in front of the Node process. Without a proxy that sanitises
> these headers, any client can inject arbitrary IPs.

## Notes

- `openspec/` and `.atl/` contain planning/AI workflow artifacts, not runtime app code.
