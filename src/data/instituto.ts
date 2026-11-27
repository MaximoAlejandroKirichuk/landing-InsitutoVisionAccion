/**
 * Standard "Cómo es estudiar en el Instituto" block shown on every course landing
 * (membership, live meetings, what you receive). Source: the institute's Canva carousels (nov 2026).
 * A course can override the texts with `instituto:` in its YAML, or hide the block with `instituto: false`.
 */
export const MEMBRESIA = {
  precio: ['$20.000 por mes en Argentina', 'USD 20 por mes desde el exterior'],
  encuentros: 'Dos encuentros en vivo por semana con Fernanda: lunes y jueves a las 19 h (Argentina).',
  incluye: [
    'Los encuentros en vivo, donde consultás tus dudas',
    'El catálogo de clases del Instituto',
    'La comunidad Visión en Acción',
  ],
  nota: 'Pagás por mes y podés dejar cuando quieras. La membresía no incluye certificado.',
  href: '/membresia/',
} as const;

export const RECIBIS_POR_DEFECTO = [
  'Clases grabadas para mirar a tu ritmo, cuando puedas.',
  'Material de estudio para descargar.',
  'Consultas por WhatsApp o email durante la cursada.',
] as const;

export const ENCUENTROS_POR_DEFECTO =
  'Un encuentro en vivo grupal por mes con Fernanda, para practicar lo que aprendiste y consultar tus dudas.';

/** Shown in the offer section when a course has no published price yet. */
export const ARANCEL_POR_WHATSAPP = 'Es una propuesta paga. Te pasamos el arancel y las formas de pago por WhatsApp.';
