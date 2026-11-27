/** Shared training content used by the home and /formacion/. */

export const formationName = 'Consultorio del Bienestar';
export const WHATSAPP_NUMBER = '5491138105350';

export function whatsappUrl(message: string): string {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

export const inquiryMessage =
  `Hola, quisiera conocer el arancel y los pasos de inscripción para la formación ${formationName}.`;

export interface Topic {
  id: string;
  title: string;
  /** One plain-language line shown on the card, for readers new to the approach. */
  summary: string;
  description: string;
}

export const topics: Topic[] = [
  {
    id: 'coaching',
    summary: 'Preguntas y escucha para acompañar a otras personas.',
    title: 'Coaching sistémico e integral',
    description: 'Exploración de la escucha, las preguntas y los vínculos.',
  },
  {
    id: 'tarot',
    summary: 'Las cartas como apoyo para mirar vínculos e historias.',
    title: 'Constelaciones con Tarot',
    description: 'Uso simbólico de las cartas para reflexionar sobre vínculos e historias personales.',
  },
  {
    id: 'biodescodificacion',
    summary: 'Cómo tu historia familiar se refleja en lo que vivís.',
    title: 'Biodescodificación',
    description: 'Presentación del enfoque y actividades de reflexión sobre creencias e historia familiar.',
  },
  {
    id: 'hipnosis',
    summary: 'Estados de relajación profunda para explorar tu historia.',
    title: 'Hipnosis y terapias de vidas pasadas',
    description: 'Introducción a los enfoques que forman parte del recorrido.',
  },
  {
    id: 'pnl',
    summary: 'Cómo tus palabras y creencias guían lo que hacés.',
    title: 'Programación neurolingüística (PNL)',
    description: 'Exploración del lenguaje, las creencias y los patrones de comunicación.',
  },
];

export function topicInquiry(topic: Topic): string {
  return whatsappUrl(
    `Hola, quisiera conocer el temario del bloque de ${topic.title} de la formación ${formationName}.`,
  );
}
