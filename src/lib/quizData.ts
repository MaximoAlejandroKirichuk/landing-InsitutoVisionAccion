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
    text: '¿Qué áreas de tu vida sentís que necesitan un cambio?',
    options: [
      { id: 'personal', text: 'Desarrollo personal' },
      { id: 'profesional', text: 'Ámbito profesional' },
      { id: 'relaciones', text: 'Relaciones y vínculos' },
      { id: 'salud', text: 'Salud y bienestar' },
      { id: 'emocional', text: 'Manejo emocional' },
      { id: 'otro', text: 'Otro' },
    ],
    hasOther: true,
    otherPlaceholder: 'Contanos qué otra área…',
  },
  {
    id: 'q2',
    type: 'single',
    text: '¿En qué momento de tu proceso te encontrás?',
    options: [
      { id: 'explorando', text: 'Recién empiezo a explorar' },
      { id: 'identificando', text: 'Ya sé qué quiero cambiar' },
      { id: 'listo', text: 'Estoy listo/a para actuar' },
      { id: 'acompanamiento', text: 'Busco orientación profesional' },
    ],
  },
  {
    id: 'q3',
    type: 'multi',
    text: '¿Qué herramientas o enfoques has probado antes?',
    options: [
      { id: 'terapia', text: 'Terapia psicológica' },
      { id: 'coaching', text: 'Coaching' },
      { id: 'autoayuda', text: 'Libros de autoayuda' },
      { id: 'meditacion', text: 'Meditación / Mindfulness' },
      { id: 'cursos', text: 'Cursos / Talleres' },
      { id: 'yoga', text: 'Yoga / Trabajo corporal' },
      { id: 'otro', text: 'Otro' },
    ],
    maxSelections: 3,
    hasOther: true,
    otherPlaceholder: '¿Cuál?',
  },
  {
    id: 'q4',
    type: 'single',
    text: '¿Cómo preferirías recibir acompañamiento?',
    options: [
      { id: 'presencial', text: 'Presencial' },
      { id: 'virtual', text: 'Virtual' },
      { id: 'ambos', text: 'Ambas opciones' },
    ],
  },
  {
    id: 'q5',
    type: 'multi',
    text: '¿Qué esperás lograr con este proceso?',
    options: [
      { id: 'claridad', text: 'Tener más claridad' },
      { id: 'paz', text: 'Encontrar paz interior' },
      { id: 'proposito', text: 'Descubrir mi propósito' },
      { id: 'equilibrio', text: 'Lograr equilibrio' },
      { id: 'herramientas', text: 'Adquirir herramientas prácticas' },
      { id: 'bienestar', text: 'Mejorar mi bienestar general' },
    ],
  },
];
