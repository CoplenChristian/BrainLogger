import type { LogEntry } from '../types';

interface TaskListProps {
    tasks: LogEntry[];
    // onComplete: (id: number) => Promise<void>; // TODO: Implement completing
}

export const TaskList = ({ tasks }: TaskListProps) => {
    if (tasks.length === 0) return null;

    return (
        <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
            <h2 style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Open Tasks
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
                {tasks.map((task) => (
                    <div
                        key={task.id}
                        className="card"
                        style={{
                            padding: 'var(--space-md)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 'var(--space-md)',
                            cursor: 'pointer',
                        }}
                    >
                        <div
                            style={{
                                width: '20px',
                                height: '20px',
                                borderRadius: '50%',
                                border: '2px solid var(--color-task)',
                                flexShrink: 0
                            }}
                            title="Complete task"
                        />
                        <span style={{ flex: 1 }}>{task.content}</span>
                        <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                            {new Date(task.timestamp).toLocaleDateString(undefined, { month: 'numeric', day: 'numeric' })}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
};
