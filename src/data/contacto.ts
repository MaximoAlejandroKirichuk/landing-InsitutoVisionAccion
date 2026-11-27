/**
 * Institute-wide contact data. Course content lives in src/content/cursos/*.yaml.
 * Official numbers (institutovisionenaccion.com, nov 2026): 11 6677-0206 (main, used by every button)
 * and 11 5646-7222 (Visiones Mágicas). 11 2696-7602 no longer belongs to the institute.
 */
export const WHATSAPP_NUMBER = '5491166770206';

/** Both official lines, shown wherever the site lists contact details. */
export const WHATSAPP_LINEAS = [
  { numero: '5491166770206', texto: '11 6677-0206' },
  { numero: '5491156467222', texto: '11 5646-7222' },
] as const;

export function whatsappUrl(message: string, numero: string = WHATSAPP_NUMBER): string {
  return `https://wa.me/${numero}?text=${encodeURIComponent(message)}`;
}
