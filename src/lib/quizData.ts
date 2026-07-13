/**
 * VIA Orientation Funnel — Approved quiz data.
 * Behavioral rules:
 *   Q1-Q5 — single-select
 *   Q1 and Q3 — allow "Otro/Otra" free-text
 * No scoring or category inference is performed.
 */

export type QuestionType = 'single' | 'multi';

export interface QuizOption {
  id: string;
  text: string;
}

export interface QuizQuestion {
  id: string;
  type: QuestionType;
  text: string;
  supportText?: string;
  options: QuizOption[];
  /** Maximum selections allowed (enforced for Q3). */
  maxSelections?: number;
  /** Whether selecting "Otro" shows a free-text input. */
  hasOther?: boolean;
  /** Placeholder label for the Otro free-text input. */
  otherPlaceholder?: string;
}

/** Map from quiz step number to question id. */
export const STEP_TO_QUESTION: Record<number, string> = {
  1: 'q1',
  2: 'q2',
  3: 'q3',
  4: 'q4',
  5: 'q5',
};

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 'q1',
    type: 'single',
    text: '¿Qué área de tu vida sentís que hoy necesita mayor atención?',
    supportText: 'Elegí la opción que hoy mejor describa el momento que estás viviendo.',
    options: [
      { id: 'relaciones', text: 'Relaciones y vínculos (pareja, familia, hijos, amistades).' },
      { id: 'trabajo', text: 'Trabajo, profesión o vocación.' },
      { id: 'bienestar-emocional', text: 'Bienestar emocional.' },
      { id: 'desarrollo-personal', text: 'Desarrollo personal y propósito.' },
      { id: 'economia', text: 'Economía y relación con el dinero.' },
      { id: 'salud', text: 'Salud y bienestar.' },
      { id: 'repeticiones', text: 'Siento que se repiten situaciones en mi vida.' },
      { id: 'otro', text: 'Otra.' },
    ],
    hasOther: true,
    otherPlaceholder: 'Contanos qué otra área hoy necesita atención.',
  },
  {
    id: 'q2',
    type: 'single',
    text: '¿Con cuál de estas situaciones te identificás más hoy?',
    supportText: 'No hay respuestas correctas. Elegí la que mejor describa tu momento actual.',
    options: [
      { id: 'comprender', text: 'Necesito comprender mejor lo que estoy viviendo.' },
      { id: 'ampliando-mirada', text: 'Estoy ampliando mi manera de mirar la situación.' },
      { id: 'integrar-recursos', text: 'Quiero integrar nuevos recursos y herramientas.' },
      { id: 'accion', text: 'Quiero pasar a la acción y generar cambios concretos.' },
    ],
  },
  {
    id: 'q3',
    type: 'single',
    text: '¿Tuviste alguna experiencia previa en procesos de desarrollo personal o bienestar integral?',
    supportText: 'Te invitamos a responder con sinceridad. Cada respuesta nos acompaña a comprender mejor tu recorrido.',
    options: [
      { id: 'primera-experiencia', text: 'Es mi primera experiencia.' },
      { id: 'coaching', text: 'Coaching.' },
      { id: 'constelaciones', text: 'Constelaciones familiares.' },
      { id: 'meditacion', text: 'Meditación / Mindfulness.' },
      { id: 'cursos', text: 'Cursos o talleres de desarrollo personal.' },
      { id: 'otro', text: 'Otro.' },
    ],
    hasOther: true,
    otherPlaceholder: 'Contanos cuál fue esa experiencia.',
  },
  {
    id: 'q4',
    type: 'single',
    text: '¿Cómo preferís recibir el acompañamiento?',
    supportText: 'Trabajamos principalmente de forma online para acompañar personas desde distintos lugares. Si vivís en Buenos Aires o alrededores, también podemos coordinar encuentros presenciales o a domicilio, según disponibilidad de nuestra agenda.',
    options: [
      { id: 'online', text: 'Online.' },
      { id: 'presencial', text: 'Presencial (Buenos Aires y alrededores).' },
      { id: 'flexible', text: 'Me adapto a cualquiera de las modalidades.' },
    ],
  },
  {
    id: 'q5',
    type: 'single',
    text: 'Si este proceso fuera realmente valioso para vos, ¿qué te gustaría lograr?',
    supportText: 'Elegí la opción que hoy mejor represente lo que buscás.',
    options: [
      { id: 'comprender', text: 'Comprender mejor lo que hoy estoy viviendo.' },
      { id: 'herramientas', text: 'Desarrollar nuevas herramientas para afrontar mis desafíos.' },
      { id: 'claridad', text: 'Recuperar claridad y confianza para tomar decisiones.' },
      { id: 'coherencia', text: 'Construir una vida más coherente con mis valores y propósito.' },
      { id: 'acciones', text: 'Transformar mis objetivos en acciones concretas.' },
    ],
  },
];
