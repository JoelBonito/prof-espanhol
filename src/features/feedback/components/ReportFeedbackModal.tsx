import { useState } from 'react';
import { Modal } from '../../../components/ui/Modal';
import { Button } from '../../../components/ui/Button';
import { Textarea } from '../../../components/ui/Textarea';
import { Icon } from '../../../components/ui/Icon';
import { db, auth } from '../../../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

interface ReportFeedbackModalProps {
    open: boolean;
    onClose: () => void;
    context: {
        screen: string;
        content: string;
        sessionId?: string;
    };
}

const ERROR_TYPES = [
    { id: 'grammar', label: 'Erro gramatical' },
    { id: 'translation', label: 'Tradução incorreta' },
    { id: 'phonetic', label: 'Correção fonética indevida' },
    { id: 'other', label: 'Outro' },
];

export function ReportFeedbackModal({ open, onClose, context }: ReportFeedbackModalProps) {
    const [type, setType] = useState('');
    const [description, setDescription] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const handleSubmit = async () => {
        if (!type) return;

        setIsSubmitting(true);
        try {
            const user = auth.currentUser;
            if (!user) throw new Error('Unauthenticated');

            await addDoc(collection(db, 'users', user.uid, 'reports'), {
                type,
                description,
                screen: context.screen,
                content: context.content,
                sessionId: context.sessionId || null,
                timestamp: serverTimestamp(),
                status: 'pending'
            });

            setIsSuccess(true);
            setTimeout(() => {
                setIsSuccess(false);
                setType('');
                setDescription('');
                onClose();
            }, 2000);
        } catch (error) {
            console.error('Error reporting feedback:', error);
            alert('Erro ao enviar feedback. Tente novamente.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Modal
            open={open}
            onClose={onClose}
            title={isSuccess ? "Obrigado!" : "Reportar Erro da IA"}
            footer={!isSuccess && (
                <>
                    <Button variant="ghost" onClick={onClose} disabled={isSubmitting}>Cancelar</Button>
                    <Button onClick={handleSubmit} disabled={!type || isSubmitting} isLoading={isSubmitting}>Enviar Report</Button>
                </>
            )}
        >
            {isSuccess ? (
                <div className="flex flex-col items-center py-6 text-center">
                    <div className="w-16 h-16 bg-success-light text-success rounded-full flex items-center justify-center mb-4">
                        <Icon name="check_circle" size={32} />
                    </div>
                    <p className="text-text-secondary">Obrigado pelo report! Vamos revisar o conteúdo para melhorar sua experiência.</p>
                </div>
            ) : (
                <div className="space-y-6">
                    <p className="text-sm text-text-muted">
                        Encontrou algo estranho na resposta da IA? Selecione o tipo de erro abaixo.
                    </p>

                    <div className="grid grid-cols-1 gap-3">
                        {ERROR_TYPES.map((t) => (
                            <button
                                key={t.id}
                                onClick={() => setType(t.id)}
                                className={`flex items-center justify-between p-4 rounded-xl border transition-all text-left ${type === t.id
                                        ? 'border-primary-500 bg-primary-500/10 text-primary-500 shadow-sm'
                                        : 'border-[var(--color-border-default)] hover:border-[var(--color-border-active)] text-text-secondary'
                                    }`}
                            >
                                <span className="font-medium text-sm">{t.label}</span>
                                {type === t.id && <Icon name="check_circle" size={20} className="text-primary-500" />}
                            </button>
                        ))}
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-text-muted uppercase tracking-wider">
                            Descrição Adicional (Opcional)
                        </label>
                        <Textarea
                            placeholder="Explique o que aconteceu..."
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="resize-none"
                            rows={3}
                        />
                    </div>

                    <div className="bg-app-bg p-3 rounded-lg border border-[var(--color-border-subtle)] italic">
                        <p className="text-[10px] text-text-muted">Conteúdo capturado: {context.content.substring(0, 100)}...</p>
                    </div>
                </div>
            )}
        </Modal>
    );
}
