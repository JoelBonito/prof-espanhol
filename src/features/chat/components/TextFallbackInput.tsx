import { useState, useCallback } from 'react';
import { Icon } from '../../../components/ui/Icon';

interface TextFallbackInputProps {
  onSend: (text: string) => void;
}

export function TextFallbackInput({ onSend }: TextFallbackInputProps) {
  const [value, setValue] = useState('');

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (!value.trim()) return;
      onSend(value.trim());
      setValue('');
    },
    [value, onSend],
  );

  return (
    <div className="px-4 py-2 border-t border-white/10">
      <p className="text-xs text-warning mb-2">Modo texto (latência alta detectada)</p>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Escreva em espanhol..."
          className="flex-1 bg-chat-surface text-chat-text text-sm rounded-lg px-3 py-2.5 border border-white/10 placeholder:text-chat-muted focus:outline-none focus:ring-2 focus:ring-primary-500/50"
          autoFocus
        />
        <button
          type="submit"
          disabled={!value.trim()}
          className="w-10 h-10 rounded-lg bg-primary-500 text-white flex items-center justify-center disabled:opacity-40 active:scale-95 transition-all"
          aria-label="Enviar"
        >
          <Icon name="send" size={18} />
        </button>
      </form>
    </div>
  );
}
