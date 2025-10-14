// src/App.jsx
import { Routes, Route, Navigate } from 'react-router-dom';
import { useTheme } from './contexts/ThemeContext';
import HomePage from './pages/HomePage';
import WorkspacePage from './pages/WorkspacePage';
import NotesPage from './pages/NotesPage';
import NoteEditorPage from './pages/NoteEditorPage';
import SettingsPage from './pages/SettingsPage';

// Placeholder components for other routes
function KanbanPage() {
  const { theme } = useTheme();
  return (
    <div className={`p-8 ${theme.bg} ${theme.text} min-h-screen`}>
      <h1 className="text-2xl font-bold mb-4">Kanban Board</h1>
      <p className={theme.textMuted}>Tính năng đang được phát triển...</p>
    </div>
  );
}

function WhiteboardPage() {
  const { theme } = useTheme();
  return (
    <div className={`p-8 ${theme.bg} ${theme.text} min-h-screen`}>
      <h1 className="text-2xl font-bold mb-4">Whiteboard</h1>
      <p className={theme.textMuted}>Tính năng đang được phát triển...</p>
    </div>
  );
}

function App() {
  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/s/:synchoId" element={<WorkspacePage />}>
          <Route index element={<Navigate to="notes" replace />} />
          <Route path="notes" element={<NotesPage />} />
          <Route path="notes/:noteId" element={<NoteEditorPage />} />
          <Route path="kanban" element={<KanbanPage />} />
          <Route path="whiteboard" element={<WhiteboardPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
      </Routes>
    </div>
  );
}

export default App;