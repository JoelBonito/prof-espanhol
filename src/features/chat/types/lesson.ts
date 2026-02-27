/**
 * Lesson Types — Aula Estruturada do Tutor AI
 *
 * Define os tipos para o sistema de lições pedagógicas:
 * - Tipos de lição (vocabulário, diálogo)
 * - Fases da aula (state machine)
 * - Correções e feedback
 */

// ============================================================================
// LESSON TYPES
// ============================================================================

/**
 * Tipo de lição
 */
export type LessonType = 'vocabulary' | 'dialogue';

/**
 * Fases da aula (state machine)
 */
export type LessonPhase =
  | 'loading'                    // Carregando lição
  | 'tutor-reading'              // Tutor lê a lição
  | 'student-reading'            // Aluno lê em voz alta
  | 'correcting-pronunciation'   // Tutor corrige pronúncia
  | 'translating'                // Aluno traduz
  | 'correcting-translation'     // Tutor corrige tradução
  | 'complete';                  // Lição concluída

/**
 * Lição de vocabulário (texto + imagem opcional)
 */
export interface VocabularyLesson {
  type: 'vocabulary';
  text: string;                  // Texto em espanhol
  imageUrl?: string;             // URL da imagem ilustrativa (opcional)
  translation: string;           // Tradução em português
}

/**
 * Lição de diálogo (conversação entre duas pessoas)
 */
export interface DialogueLesson {
  type: 'dialogue';
  lines: Array<{
    speaker: 'A' | 'B';          // Personagem A ou B
    text: string;                // Texto em espanhol
    translation: string;         // Tradução em português
  }>;
  context: string;               // Contexto do diálogo (ex: "Em um restaurante")
}

/**
 * União de todos os tipos de lição
 */
export type Lesson = VocabularyLesson | DialogueLesson;

// ============================================================================
// CORRECTION TYPES
// ============================================================================

/**
 * Status de correção de uma palavra
 */
export type CorrectionStatus = 'correct' | 'error';

/**
 * Correção de pronúncia de uma palavra
 */
export interface Correction {
  word: string;                  // Palavra original
  spoken: string;                // Como o aluno falou
  correct: string;               // Pronúncia correta
  status: CorrectionStatus;      // Correto ou erro
}

// ============================================================================
// LESSON STATE
// ============================================================================

/**
 * Estado completo de uma lição em andamento
 */
export interface LessonState {
  id: string;                    // ID da lição (ex: "lesson-001")
  phase: LessonPhase;            // Fase atual da aula
  lesson: Lesson | null;         // Dados da lição
  corrections: Correction[];     // Correções de pronúncia
  transcript: string;            // Transcrição do que o aluno falou
  score?: {
    pronunciation: number;       // Score de pronúncia (0-100)
    translation: number;         // Score de tradução (0-100)
    overall: number;             // Score geral (média)
  };
}

// ============================================================================
// BOARD DATA (parsed from Gemini Live)
// ============================================================================

/**
 * Dados do quadro digital (extraídos do BOARD_JSON do tutor)
 */
export interface BoardData {
  type: LessonType;
  // Para type: 'vocabulary'
  text?: string;
  imageUrl?: string;
  translation?: string;
  // Para type: 'dialogue'
  lines?: Array<{
    speaker: 'A' | 'B';
    text: string;
    translation: string;
  }>;
  context?: string;
}

/**
 * Dados de correção (extraídos do CORRECTION_JSON do tutor)
 */
export interface CorrectionData {
  transcript: string;            // O que o aluno falou (completo)
  corrections: Correction[];     // Lista de correções palavra por palavra
}

// ============================================================================
// PHASE METADATA (para UI)
// ============================================================================

/**
 * Metadados de uma fase (para exibir ícones, texto, progresso)
 */
export interface PhaseMetadata {
  phase: LessonPhase;
  icon: string;                  // Emoji ou ícone
  label: string;                 // Texto explicativo
  progress: number;              // 1-6 (para barra de progresso)
}

/**
 * Mapa de metadados de todas as fases
 */
export const PHASE_METADATA: Record<LessonPhase, PhaseMetadata> = {
  'loading': {
    phase: 'loading',
    icon: '⏳',
    label: 'Carregando lição...',
    progress: 0,
  },
  'tutor-reading': {
    phase: 'tutor-reading',
    icon: '🎧',
    label: 'Ouça o tutor',
    progress: 1,
  },
  'student-reading': {
    phase: 'student-reading',
    icon: '📖',
    label: 'Agora é sua vez de ler',
    progress: 2,
  },
  'correcting-pronunciation': {
    phase: 'correcting-pronunciation',
    icon: '✅',
    label: 'Correção de pronúncia',
    progress: 3,
  },
  'translating': {
    phase: 'translating',
    icon: '✍️',
    label: 'Traduza para português',
    progress: 4,
  },
  'correcting-translation': {
    phase: 'correcting-translation',
    icon: '🎯',
    label: 'Correção de tradução',
    progress: 5,
  },
  'complete': {
    phase: 'complete',
    icon: '🎉',
    label: 'Lição concluída!',
    progress: 6,
  },
};
