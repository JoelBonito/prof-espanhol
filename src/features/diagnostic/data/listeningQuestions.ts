import type { ListeningItem } from '../types';

export const listeningItems: ListeningItem[] = [
  {
    id: 'li1',
    level: 'A1',
    audioText:
      '¡Hola! Me llamo Carolina. Soy enfermera y trabajo en un hospital grande en Asunción. Vivo aquí con mi familia desde hace cinco años.',
    question: '¿Cuál es la profesión de Carolina?',
    options: ['Doctora', 'Enfermera', 'Profesora', 'Secretaria'],
    correct: 'Enfermera',
    errorType: 'vocabulario',
  },
  {
    id: 'li2',
    level: 'A1',
    audioText:
      'Disculpe, ¿cuánto cuesta este libro? — Ese libro cuesta diez dólares. — ¿Tiene uno más barato? — Sí, este otro cuesta cinco dólares. — Me llevo ese, gracias.',
    question: '¿Cuánto cuesta el libro que compró el cliente?',
    options: ['Diez dólares', 'Ocho dólares', 'Cinco dólares', 'Tres dólares'],
    correct: 'Cinco dólares',
    errorType: 'contexto',
  },
  {
    id: 'li3',
    level: 'A2',
    audioText:
      'Perdón, ¿puede decirme cómo llegar al supermercado desde aquí? — Claro, siga todo recto dos cuadras, luego gire a la derecha en la calle Palma, y el supermercado está justo al lado del banco nacional.',
    question: '¿Dónde está el supermercado?',
    options: [
      'Al lado del banco',
      'Frente a la iglesia',
      'En la calle principal',
      'Detrás del parque',
    ],
    correct: 'Al lado del banco',
    errorType: 'velocidade',
  },
  {
    id: 'li4',
    level: 'B1',
    audioText:
      'Buenos días, doctor. Me duele mucho la cabeza y tengo fiebre desde ayer por la noche. Creo que también me duele un poco la garganta cuando trago. — Vamos a examinarte. ¿Tienes alguna alergia conocida a medicamentos?',
    question: '¿Qué síntomas menciona el paciente?',
    options: [
      'Fiebre y dolor de cabeza',
      'Solo fiebre alta',
      'Dolor de estómago',
      'Fiebre y vómitos',
    ],
    correct: 'Fiebre y dolor de cabeza',
    errorType: 'vocabulario',
  },
  {
    id: 'li5',
    level: 'B1',
    audioText:
      '¿Aló? Sí, llamo para hacer una reserva para esta noche en su restaurante. Somos cuatro personas en total. — Muy bien. ¿A qué hora les gustaría cenar? — A las ocho, si es posible. — Perfecto, les esperamos a las ocho. ¿Me puede dar su nombre?',
    question: '¿Para cuántas personas es la reserva?',
    options: ['Dos personas', 'Tres personas', 'Cuatro personas', 'Cinco personas'],
    correct: 'Cuatro personas',
    errorType: 'contexto',
  },
];
