export const EntryType = {
    Task: 'Task',
    Idea: 'Idea',
    Note: 'Note',
    Wait: 'Wait'
} as const;

export type EntryType = typeof EntryType[keyof typeof EntryType];

export interface LogEntry {
    id: number;
    userId: number;
    timestamp: string;
    type: EntryType;
    content: string;
    completedAt?: string;
}

export interface CreateLogReq {
    type: EntryType;
    content: string;
    userId: number;
}
