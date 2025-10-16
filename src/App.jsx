// src/App.jsx
import { Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './pages/HomePage';
import WorkspacePage from './pages/WorkspacePage';
import NotesPage from './pages/NotesPage';
import NoteEditorPage from './pages/NoteEditorPage';
import KanbanPage from './pages/KanbanPage';
import KanbanBoardPage from './pages/KanbanBoardPage';
import WhiteboardPage from './pages/WhiteboardPage';
import WhiteboardEditorPage from './pages/WhiteboardEditorPage';
import SettingsPage from './pages/SettingsPage';
import AdminPage from './pages/AdminPage';

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
          <Route path="whiteboard/:boardId" element={<WhiteboardEditorPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="admin" element={<AdminPage />} />
        </Route>
      </Routes>
    </div>
  );
}

export default App;