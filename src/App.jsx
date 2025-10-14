// src/App.jsx
import { Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './pages/HomePage';
import WorkspacePage from './pages/WorkspacePage';
import NotesPage from './pages/NotesPage';
import NoteEditorPage from './pages/NoteEditorPage';

// Placeholder components for other routes
function ImagesPage() {
  return <div className="p-8">Images Page</div>;
}

function DocsPage() {
  return <div className="p-8">Docs Page</div>;
}

function KanbanPage() {
  return <div className="p-8">Kanban Page</div>;
}

function WhiteboardPage() {
  return <div className="p-8">Whiteboard Page</div>;
}

function SettingsPage() {
  return <div className="p-8">Settings Page</div>;
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
          <Route path="images" element={<ImagesPage />} />
          <Route path="docs" element={<DocsPage />} />
          <Route path="kanban" element={<KanbanPage />} />
          <Route path="whiteboard" element={<WhiteboardPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
      </Routes>
    </div>
  );
}

export default App;