/** Shared content for the Bio Coaching Sistémico Integral training, used by the home and /formacion/. */

export const WHATSAPP_NUMBER = '5491138105350';

export function whatsappUrl(message: string): string {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

export const inquiryMessage =
  'Hola, quisiera conocer el arancel y los pasos de inscripción para la formación en Bio Coaching Sistémico Integral.';

export interface Topic {
  id: string;
  title: string;
  description: string;
}

export const topics: Topic[] = [
  {
    id: 'coaching',
    title: 'Coaching sistémico e integral',
    description: 'Exploración de la escucha, las preguntas y los vínculos.',
  },
  {
    id: 'tarot',
    title: 'Constelaciones con Tarot',
    description: 'Uso simbólico de las cartas para reflexionar sobre vínculos e historias personales.',
  },
  {
    id: 'biodescodificacion',
    title: 'Biodescodificación',
    description: 'Presentación del enfoque y actividades de reflexión sobre creencias e historia familiar.',
  },
  {
    id: 'hipnosis',
    title: 'Hipnosis y terapias de vidas pasadas',
    description: 'Introducción a los enfoques que forman parte del recorrido.',
  },
  {
    id: 'pnl',
    title: 'Programación neurolingüística (PNL)',
    description: 'Exploración del lenguaje, las creencias y los patrones de comunicación.',
  },
];

export function topicInquiry(topic: Topic): string {
  return whatsappUrl(
    `Hola, quisiera conocer el temario del bloque de ${topic.title} de la formación en Bio Coaching Sistémico Integral.`,
  );
}
