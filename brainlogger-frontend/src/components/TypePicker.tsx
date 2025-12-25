import { EntryType } from '../types';

interface TypePickerProps {
    value: EntryType;
    onChange: (type: EntryType) => void;
}

export const TypePicker = ({ value, onChange }: TypePickerProps) => {
    const types = Object.values(EntryType);

    return (
        <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
            {types.map((type) => (
                <button
                    key={type}
                    onClick={() => onChange(type)}
                    style={{
                        flex: 1,
                        padding: 'var(--space-sm)',
                        borderRadius: 'var(--radius-sm)',
                        backgroundColor: value === type ? `var(--color-${type.toLowerCase()})` : 'transparent',
                        color: value === type ? 'white' : 'var(--color-text-muted)',
                        fontWeight: value === type ? 600 : 400,
                        border: value === type ? 'none' : '1px solid currentColor',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                    }}
                >
                    {type}
                </button>
            ))}
        </div>
    );
};
