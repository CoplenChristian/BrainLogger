import { useEffect, useState } from 'react';
import { api } from './api/client';
import { CaptureForm } from './components/CaptureForm';
import { TaskList } from './components/TaskList';
import type { CreateLogReq, LogEntry } from './types';

function App() {
  const [tasks, setTasks] = useState<LogEntry[]>([]);

  const fetchTasks = async () => {
    try {
      const data = await api.getOpenTasks();
      setTasks(data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleCapture = async (entry: CreateLogReq) => {
    await api.createLog(entry);
    if (entry.type === 'Task') {
      await fetchTasks();
    }
  };

  return (
    <div className="container">
      <header style={{ marginTop: 'var(--space-lg)', textAlign: 'center' }}>
        <h1 style={{ fontWeight: 800, fontSize: '2rem', letterSpacing: '-0.05em' }}>BrainLogger</h1>
      </header>

      <main style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xl)' }}>
        <CaptureForm onSubmit={handleCapture} />

        <TaskList tasks={tasks} />
      </main>
    </div>
  );
}

export default App;
