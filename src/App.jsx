// src/App.jsx
import { Routes, Route, Navigate } from 'react-router-dom';
import { useTheme } from './contexts/ThemeContext';
import HomePage from './pages/HomePage';
import WorkspacePage from './pages/WorkspacePage';
import NotesPage from './pages/NotesPage';
import NoteEditorPage from './pages/NoteEditorPage';
import KanbanPage from './pages/KanbanPage';
import KanbanBoardPage from './pages/KanbanBoardPage';
import SettingsPage from './pages/SettingsPage';
import AdminPage from './pages/AdminPage';

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
          <Route path="kanban/:boardId" element={<KanbanBoardPage />} />
          <Route path="whiteboard" element={<WhiteboardPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="admin" element={<AdminPage />} />
        </Route>
      </Routes>
    </div>
  );
}

export default App;