import type { CreateLogReq, LogEntry } from "../types";

const API_BASE = '/api'; // Vite proxy handles this in dev

export const api = {
    async createLog(entry: CreateLogReq): Promise<LogEntry> {
        const res = await fetch(`${API_BASE}/log`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(entry)
        });
        if (!res.ok) throw new Error('Failed to create log');
        return res.json();
    },

    async getOpenTasks(): Promise<LogEntry[]> {
        const res = await fetch(`${API_BASE}/tasks`);
        if (!res.ok) throw new Error('Failed to fetch tasks');
        return res.json();
    }
};
