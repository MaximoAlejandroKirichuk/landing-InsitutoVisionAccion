import { describe, expect, it } from 'vitest';
import { initState, recommendsFormation } from './funnelState';

function withAnswers(selected: Record<string, string[]>) {
  const { answers } = initState();
  for (const [id, values] of Object.entries(selected)) {
    answers[id] = { selected: values, otherText: '' };
  }
  return answers;
}

describe('recommendsFormation', () => {
  it('is false with no answers', () => {
    expect(recommendsFormation(initState().answers)).toBe(false);
  });

  it.each([
    ['wants to integrate new tools', { q2: ['integrar-recursos'] }],
    ['has done coaching before', { q3: ['coaching'] }],
    ['has done constellations', { q3: ['primera-experiencia', 'constelaciones'] }],
    ['has taken courses', { q3: ['cursos'] }],
    ['wants new tools', { q5: ['herramientas'] }],
  ])('is true when the person %s', (_label, selected) => {
    expect(recommendsFormation(withAnswers(selected))).toBe(true);
  });

  it('is false for answers about a personal process only', () => {
    expect(
      recommendsFormation(withAnswers({ q1: ['relaciones'], q2: ['comprender'], q3: ['primera-experiencia'], q5: ['claridad'] })),
    ).toBe(false);
  });
});
