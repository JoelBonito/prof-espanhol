/**
 * ClassNotes — Área de Anotações da Aula
 *
 * Exibe:
 * - Vocabulário-chave da lição
 * - Dicas de pronúncia
 * - Notas automáticas geradas pelo tutor
 *
 * Inspirado no design do Stitch (área "Class Notes" à direita).
 */

import { Icon } from '../../../components/ui/Icon';

export function ClassNotes() {
  const placeholderNotes = {
    vocabulary: [
      { word: '¡Hola!', translation: 'Olá!', type: 'greeting' },
      { word: '¿Cómo estás?', translation: 'Como você está?', type: 'question' },
      { word: 'Muchas gracias', translation: 'Muito obrigado', type: 'expression' },
    ],
    pronunciation: [
      { text: 'O "ll" em "Hola" soa como "i" em português', focus: 'll' },
      { text: 'O "j" tem som de "r" aspirado (ex: "jamón")', focus: 'j' },
    ],
  };

  return (
    <div className="flex flex-col h-full bg-white/[0.02] overflow-hidden">
      {/* Panel header (Stitch style) */}
      <div className="px-4 py-3 border-b border-white/5 flex justify-between items-center">
        <span className="text-xs font-bold uppercase tracking-widest text-text-muted">Class Notes</span>
        <Icon name="more_horiz" size={18} className="text-text-muted" />
      </div>

      {/* Scrollable Content Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">

        {/* Seção: Vocabulário */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Vocabulário</h3>
            <span className="text-[10px] text-primary-500/60 font-medium">3 novos itens</span>
          </div>

          <div className="space-y-2">
            {placeholderNotes.vocabulary.map((item, index) => (
              <div
                key={index}
                className="p-3 bg-primary-500/5 border-l-2 border-primary-500/50 rounded-r-xl"
              >
                <p className="text-sm font-bold text-white">
                  {item.word}
                </p>
                <p className="text-sm text-text-secondary mt-0.5">
                  {item.translation}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Seção: Pronúncia */}
        <section className="space-y-4">
          <h3 className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Dicas de Pronúncia</h3>

          <div className="space-y-2">
            {placeholderNotes.pronunciation.map((tip, index) => (
              <div
                key={index}
                className="p-3 bg-white/5 rounded-xl border border-white/10"
              >
                <p className="text-xs font-bold text-text-muted mb-1">Dica de Pronúncia</p>
                <p className="text-sm text-text-primary leading-relaxed">
                  {tip.text}
                </p>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Footer input */}
      <div className="p-4 border-t border-white/5">
        <div className="flex items-center bg-white/5 rounded-xl px-4 py-3 border border-white/10">
          <input
            type="text"
            placeholder="Pergunte à Elena..."
            className="bg-transparent border-none text-sm text-white flex-1 placeholder:text-text-muted focus:outline-none"
          />
          <Icon name="send" size={20} className="text-primary-500 cursor-pointer shrink-0" />
        </div>
      </div>
    </div>
  );
}
