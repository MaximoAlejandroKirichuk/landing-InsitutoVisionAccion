import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

/**
 * Cursos: one YAML file per course in src/content/cursos/.
 * The file name is the page URL (formacion.yaml → /formacion/).
 * Files starting with "_" (like _plantilla.yaml) are ignored.
 * See README → "Cómo sumar un curso nuevo".
 */
const texto = z.string().trim().min(1);

const cursos = defineCollection({
  loader: glob({ pattern: '[^_]*.{yaml,yml}', base: './src/content/cursos' }),
  schema: z.object({
    nombre: texto,
    publicado: z.boolean().default(true),
    mostrarEnHome: z.boolean().default(true),
    orden: z.number().default(10),
    /** Value written to the funnel_slug column of the leads sheet. Defaults to the file name. */
    planilla: z.string().regex(/^[a-z0-9-]{1,60}$/).optional(),
    seo: z.object({ titulo: texto.optional(), descripcion: texto }),
    tarjeta: z.object({
      etiqueta: texto,
      resumen: texto,
      boton: texto.default('Conocer la propuesta'),
    }),
    whatsapp: z.object({ mensaje: texto }),
    hero: z.object({
      bajada: texto,
      datos: z.array(texto).default([]),
      boton: texto.default('Reservar mi lugar'),
      nota: texto.optional(),
      linkSecundario: z.object({ texto, href: texto }).optional(),
      imagen: z
        .object({ src: texto, srcMobile: texto.optional(), esfera: z.boolean().default(false) })
        .optional(),
    }),
    cursada: z.array(z.object({ etiqueta: texto, valor: texto })).default([]),
    paraQuien: z
      .object({ titulo: texto, items: z.array(texto).min(1), cierre: texto.optional() })
      .optional(),
    programa: z
      .object({
        titulo: texto,
        texto: texto.optional(),
        enfoques: z
          .array(
            z.object({
              id: z.string().regex(/^[a-z0-9-]+$/),
              titulo: texto,
              resumen: texto,
              descripcion: texto,
              icono: z.string().optional(),
            }),
          )
          .min(1),
      })
      .optional(),
    incluye: z
      .object({ titulo: texto, items: z.array(z.object({ titulo: texto, texto })).min(1) })
      .optional(),
    docentes: z
      .object({
        titulo: texto,
        personas: z
          .array(
            z.object({
              id: z.string().regex(/^[a-z0-9-]+$/),
              nombre: texto,
              bio: texto,
              foto: texto.optional(),
              alt: texto.optional(),
              ancho: z.number().optional(),
              alto: z.number().optional(),
              encuadre: z.string().optional(),
            }),
          )
          .min(1),
      })
      .optional(),
    oferta: z
      .object({
        titulo: texto.default('Próxima cursada'),
        destacado: texto.optional(),
        texto: texto.optional(),
        precios: z.array(z.object({ periodo: texto, valores: z.array(texto).min(1) })).default([]),
      })
      .optional(),
    preguntas: z.array(z.object({ pregunta: texto, respuesta: texto })).default([]),
    cierre: z.object({ titulo: texto, texto: texto.optional() }).optional(),
    reserva: z
      .object({
        titulo: texto.default('Reservá tu lugar en la próxima cursada'),
        texto: texto.default('Dejanos tus datos y te escribimos con la fecha de inicio, el arancel y los pasos de inscripción.'),
        gracias: texto.default('Te vamos a escribir para contarte la fecha de inicio y el arancel. Si querés, podés escribirnos ahora por WhatsApp.'),
      })
      .prefault({}),
  }),
});

export const collections = { cursos };
