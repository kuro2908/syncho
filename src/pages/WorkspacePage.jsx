// src/pages/WorkspacePage.jsx
import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import Sidebar from '../components/Sidebar';

function WorkspacePage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { theme } = useTheme();

  return (
    <div className={`min-h-screen ${theme.bg} ${theme.text} flex relative`}>
      <Sidebar isOpen={isSidebarOpen} onToggle={() => setIsSidebarOpen(!isSidebarOpen)} />
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
}

export default WorkspacePage;