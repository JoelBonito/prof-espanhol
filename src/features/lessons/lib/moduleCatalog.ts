export interface LessonModule {
  id: string;
  level: string;
  title: string;
  topic: string;
  prerequisiteId: string | null;
  order: number;
}

const LEVEL_MODULES: Record<string, LessonModule[]> = {
  A1: [
    { id: 'a1-1', level: 'A1', title: 'Saudações e apresentação', topic: 'Saludos y presentaciones', prerequisiteId: null, order: 1 },
    { id: 'a1-2', level: 'A1', title: 'Voseo no cotidiano', topic: 'Voseo no cotidiano', prerequisiteId: 'a1-1', order: 2 },
    { id: 'a1-3', level: 'A1', title: 'Compras no mercado', topic: 'Compras y precios en Paraguay', prerequisiteId: 'a1-2', order: 3 },
    { id: 'a1-4', level: 'A1', title: 'Rotina diária', topic: 'Rutina diaria', prerequisiteId: 'a1-3', order: 4 },
    { id: 'a1-5', level: 'A1', title: 'Direções e transporte', topic: 'Direcciones y transporte', prerequisiteId: 'a1-4', order: 5 },
  ],
  A2: [
    { id: 'a2-1', level: 'A2', title: 'Passado recente', topic: 'Pretérito perfecto', prerequisiteId: null, order: 1 },
    { id: 'a2-2', level: 'A2', title: 'Planos futuros', topic: 'Futuro cercano', prerequisiteId: 'a2-1', order: 2 },
    { id: 'a2-3', level: 'A2', title: 'Expressar opiniões', topic: 'Opiniones y acuerdos', prerequisiteId: 'a2-2', order: 3 },
    { id: 'a2-4', level: 'A2', title: 'Situações de viagem', topic: 'Viajes y hoteles', prerequisiteId: 'a2-3', order: 4 },
    { id: 'a2-5', level: 'A2', title: 'Trabalho e estudo', topic: 'Trabajo y estudio', prerequisiteId: 'a2-4', order: 5 },
  ],
  B1: [
    { id: 'b1-1', level: 'B1', title: 'Narrativas longas', topic: 'Narrativas y conectores', prerequisiteId: null, order: 1 },
    { id: 'b1-2', level: 'B1', title: 'Subjuntivo básico', topic: 'Subjuntivo en deseos', prerequisiteId: 'b1-1', order: 2 },
    { id: 'b1-3', level: 'B1', title: 'Argumentação', topic: 'Argumentación y debate', prerequisiteId: 'b1-2', order: 3 },
    { id: 'b1-4', level: 'B1', title: 'Contexto profissional', topic: 'Reuniones de trabajo', prerequisiteId: 'b1-3', order: 4 },
    { id: 'b1-5', level: 'B1', title: 'Cultura paraguaia', topic: 'Historia y cultura paraguaya', prerequisiteId: 'b1-4', order: 5 },
  ],
};

export function getModulesByLevel(level: string): LessonModule[] {
  const normalizedLevel = level?.toUpperCase?.() ?? 'A1';
  return (LEVEL_MODULES[normalizedLevel] ?? LEVEL_MODULES.A1).slice();
}
