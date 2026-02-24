import { useDiagnosticStore } from '../stores/diagnosticStore';
import { GrammarSection } from '../features/diagnostic/GrammarSection';
import { ListeningSection } from '../features/diagnostic/ListeningSection';
import { PronunciationSection } from '../features/diagnostic/PronunciationSection';
import { DiagnosticResultView } from '../features/diagnostic/DiagnosticResultView';
import type {
  GrammarResult,
  ListeningResult,
  PronunciationResult,
} from '../features/diagnostic/types';

export default function DiagnosticPage() {
  const { grammarCompleted, listeningCompleted, pronunciationCompleted, diagnosticId } =
    useDiagnosticStore();

  // Each section persists its own results to Firestore and advances the store.
  // onComplete is required by the component API but page-level navigation
  // is driven by the store flags above — the result object is not needed here.
  if (!grammarCompleted) {
    return <GrammarSection onComplete={(_result: GrammarResult) => void 0} />;
  }

  if (!listeningCompleted) {
    return <ListeningSection onComplete={(_result: ListeningResult) => void 0} />;
  }

  if (!pronunciationCompleted) {
    return <PronunciationSection onComplete={(_result: PronunciationResult) => void 0} />;
  }

  // All 3 sections done — call CF and show result (Story 1.5)
  return <DiagnosticResultView diagnosticId={diagnosticId ?? ''} />;
}
