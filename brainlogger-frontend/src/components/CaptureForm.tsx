import { useState, type KeyboardEvent } from 'react';
import { EntryType, type CreateLogReq } from '../types';
import { TypePicker } from './TypePicker';

interface CaptureFormProps {
    onSubmit: (entry: CreateLogReq) => Promise<void>;
}

export const CaptureForm = ({ onSubmit }: CaptureFormProps) => {
    const [content, setContent] = useState('');
    const [type, setType] = useState<EntryType>(EntryType.Note);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async () => {
        if (!content.trim() || isSubmitting) return;

        setIsSubmitting(true);
        try {
            await onSubmit({ content, type, userId: 1 });
            setContent('');
            // Reset type to note? Or keep selection? Spec says "defaults to note (lowest friction)" meaning on load, but sticky selection is often better. Let's stick to sticking for now or reset. Spec implies frictionless.
            // Let's reset to Note as per "Type defaults to note" line in spec.
            setType(EntryType.Note);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
        if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
            handleSubmit();
        }
    };

    return (
        <div className="card fade-in">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
                <TypePicker value={type} onChange={setType} />

                <div style={{ position: 'relative' }}>
                    <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="What's on your mind? (Cmd+Enter to save)"
                        rows={3}
                        style={{
                            width: '100%',
                            padding: 'var(--space-md)',
                            borderRadius: 'var(--radius-sm)',
                            border: '1px solid transparent',
                            backgroundColor: 'rgba(0,0,0,0.03)',
                            fontSize: '1.1rem',
                            resize: 'none',
                            outline: 'none',
                            color: 'var(--color-text-main)'
                        }}
                    />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <button
                        onClick={handleSubmit}
                        disabled={!content.trim() || isSubmitting}
                        style={{
                            padding: 'var(--space-sm) var(--space-lg)',
                            borderRadius: 'var(--radius-sm)',
                            backgroundColor: 'var(--color-text-main)',
                            color: 'var(--color-bg-card)',
                            fontWeight: 600,
                            opacity: (!content.trim() || isSubmitting) ? 0.5 : 1,
                            cursor: 'pointer'
                        }}
                    >
                        {isSubmitting ? 'Saving...' : 'Capture'}
                    </button>
                </div>
            </div>
        </div>
    );
};
