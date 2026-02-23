import type { PronunciationPhrase } from '../types';

export const pronunciationPhrases: PronunciationPhrase[] = [
  {
    id: 'pron-01',
    level: 'A1',
    text: 'El perro corre por la mañana.',
    targetPhonemes: ['rr', 'ñ'],
    tip: 'Preste atenção ao som forte do "rr" e ao "ñ" em mañana.',
  },
  {
    id: 'pron-02',
    level: 'A1',
    text: 'Los zapatos están debajo de la cama.',
    targetPhonemes: ['z', 'j'],
    tip: 'O "z" em espanhol latino soa como "s". O "j" é um som gutural.',
  },
  {
    id: 'pron-03',
    level: 'A2',
    text: 'La lluvia de ayer mojó todas las calles.',
    targetPhonemes: ['ll', 'j'],
    tip: 'O "ll" pode soar como "y" ou "sh" dependendo da região.',
  },
  {
    id: 'pron-04',
    level: 'B1',
    text: 'El jefe dijo que trabajaríamos juntos mañana.',
    targetPhonemes: ['j', 'rr', 'ñ'],
    tip: 'Foque no "j" gutural e na vibração do "r" em trabajaríamos.',
  },
  {
    id: 'pron-05',
    level: 'B2',
    text: 'La investigación requiere una mejor organización y desarrollo.',
    targetPhonemes: ['rr', 'z', 'll'],
    tip: 'Mantenha a fluidez natural e a entonação correta.',
  },
];
