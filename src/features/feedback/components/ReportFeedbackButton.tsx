import { useState } from 'react';
import { Icon } from '../../../components/ui/Icon';
import { ReportFeedbackModal } from './ReportFeedbackModal';
import { cn } from '../../../lib/utils';

interface ReportFeedbackButtonProps {
    screen: string;
    content: string;
    sessionId?: string;
    className?: string;
}

export function ReportFeedbackButton({ screen, content, sessionId, className }: ReportFeedbackButtonProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
        <>
            <button
                onClick={() => setIsModalOpen(true)}
                className={cn(
                    "inline-flex items-center justify-center p-1.5 rounded-lg text-neutral-400 hover:text-warning hover:bg-warning-light transition-all",
                    className
                )}
                title="Reportar erro no conteúdo"
            >
                <Icon name="outlined_flag" size={18} />
            </button>

            <ReportFeedbackModal
                open={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                context={{ screen, content, sessionId }}
            />
        </>
    );
}
