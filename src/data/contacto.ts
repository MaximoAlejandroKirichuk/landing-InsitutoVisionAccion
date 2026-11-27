/**
 * Institute-wide contact data. Course content lives in src/content/cursos/*.yaml.
 * WhatsApp number still pending confirmation (11 2696-7602 vs 11 3810-5350): not changed here.
 */
export const WHATSAPP_NUMBER = '5491138105350';

export function whatsappUrl(message: string): string {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}
