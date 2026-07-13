/**
 * VIA Orientation Funnel — Approved quiz data.
 * Behavioral rules:
 *   Q1 — multi-select with "Otro" free-text
 *   Q2 — single-select (deselects previous)
 *   Q3 — multi-select, max 3, with "Otro" free-text
 *   Q4 — single-select
 *   Q5 — multi-select
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
    type: 'multi',
    text: '¿Qué áreas de tu vida sentís que hoy necesitan un cambio?',
    options: [
      { id: 'pareja', text: 'Relaciones de pareja' },
      { id: 'familia', text: 'Vínculos familiares' },
      { id: 'trabajo', text: 'Trabajo y vocación' },
      { id: 'emocional', text: 'Gestión emocional' },
      { id: 'proposito', text: 'Propósito de vida' },
      { id: 'otro', text: 'Otro' },
    ],
    hasOther: true,
    otherPlaceholder: 'Contanos qué otra área…',
  },
  {
    id: 'q2',
    type: 'single',
    text: '¿En qué momento de tu proceso personal te encontrás?',
    options: [
      { id: 'confusion', text: 'Siento confusión y necesito claridad' },
      { id: 'identificando', text: 'Estoy empezando a entender lo que me pasa' },
      { id: 'profundizar', text: 'Quiero profundizar y ordenar mi proceso' },
      { id: 'accion', text: 'Quiero transformar esto en decisiones concretas' },
    ],
  },
  {
    id: 'q3',
    type: 'single',
    text: '¿Tuviste alguna experiencia previa con procesos de desarrollo personal?',
    options: [
      { id: 'coaching', text: 'Coaching' },
      { id: 'primera-experiencia', text: 'Es mi primera experiencia.' },
      { id: 'terapia', text: 'Terapia psicológica.' },
      { id: 'cursos', text: 'Cursos o talleres.' },
      { id: 'meditacion', text: 'Meditación / Mindfulness' },
      { id: 'otro', text: 'Otra.' },
    ],
    hasOther: true,
    otherPlaceholder: '¿Cuál?',
  },
  {
    id: 'q4',
    type: 'single',
    text: '¿Cómo preferís recibir acompañamiento?',
    options: [
      { id: 'presencial', text: 'Presencial.' },
      { id: 'virtual', text: 'Online.' },
      { id: 'ambos', text: 'Me es indiferente, puedo adaptarme.' },
    ],
  },
  {
    id: 'q5',
    type: 'single',
    text: 'Si este proceso fuera realmente valioso para vos... ¿Qué te gustaría que cambiara en tu vida?',
    options: [
      { id: 'claridad', text: 'Tener más claridad para decidir.' },
      { id: 'patrones', text: 'Dejar de repetir situaciones que me hacen mal.' },
      { id: 'emocional', text: 'Sentirme con más paz y estabilidad emocional.' },
      { id: 'proposito', text: 'Reconectar con mi propósito y dirección.' },
      { id: 'seguridad', text: 'Tomar decisiones con más consciencia y libertad.' },
    ],
  },
];
