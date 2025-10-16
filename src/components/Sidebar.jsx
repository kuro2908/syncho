// src/components/Sidebar.jsx
import { NavLink, useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useTheme } from '../contexts/ThemeContext';
import { 
  StickyNote, 
  LayoutGrid,
  Presentation,
  Settings,
  Shield,
  X,
  Menu
} from 'lucide-react';

function Sidebar({ isOpen, onToggle }) {
  const { synchoId } = useParams();
  const { theme } = useTheme();
  const [isAdmin, setIsAdmin] = useState(false);

  const navItems = [
    { to: `notes`, icon: <StickyNote size={20} />, label: 'Ghi chú' },
    { to: `kanban`, icon: <LayoutGrid size={20} />, label: 'Kanban' },
    { to: `whiteboard`, icon: <Presentation size={20} />, label: 'Bảng trắng' }
  ];

  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        const docRef = doc(db, 'storages', synchoId);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          setIsAdmin(docSnap.data().isAdmin || false);
        }
      } catch (error) {
        console.error('Error checking admin status:', error);
      }
    };

    if (synchoId) {
      checkAdminStatus();
    }
  }, [synchoId]);

  return (
    <>
      {/* Toggle Button - Visible on mobile when closed, hidden on desktop */}
      {!isOpen && (
        <button
          onClick={onToggle}
          className={`fixed bottom-6 left-6 z-[9999] lg:hidden p-4 ${theme.bgSecondary} hover:${theme.bgTertiary} ${theme.text} rounded-full shadow-2xl transition-all duration-300 hover:scale-110`}
          aria-label="Toggle sidebar"
        >
          <Menu size={24} />
        </button>
      )}

      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9998] lg:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:sticky top-0 left-0 z-[9999] lg:z-10 h-screen
          w-72 ${theme.bgSecondary} border-r ${theme.border} 
          flex flex-col
          transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Header */}
        <div className={`p-4 border-b ${theme.border} flex items-center justify-between`}>
          <h2 className={`text-lg font-semibold ${theme.text} truncate`}>{synchoId}</h2>
          {/* Close button - only visible on mobile when open */}
          <button
            onClick={onToggle}
            className={`lg:hidden p-2 hover:${theme.bgTertiary} rounded-lg transition-colors`}
            aria-label="Close sidebar"
          >
            <X size={20} />
          </button>
        </div>
        
        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-2">
          <ul className="space-y-1">
            {navItems.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={`/s/${synchoId}/${item.to}`}
                  onClick={() => {
                    // Close sidebar on mobile after navigation
                    if (window.innerWidth < 1024) {
                      onToggle();
                    }
                  }}
                  className={({ isActive }) => 
                    `flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                      isActive 
                        ? `${theme.bgTertiary} ${theme.text} shadow-lg` 
                        : `${theme.textSecondary} hover:${theme.bgTertiary} hover:${theme.text}`
                    }`
                  }
                >
                  <span className="mr-3">{item.icon}</span>
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* Settings & Admin */}
        <div className={`p-4 border-t ${theme.border} space-y-2`}>
          {/* Admin Panel - Only visible for admin Synchos */}
          {isAdmin && (
            <NavLink
              to={`/s/${synchoId}/admin`}
              onClick={() => {
                // Close sidebar on mobile after navigation
                if (window.innerWidth < 1024) {
                  onToggle();
                }
              }}
              className={({ isActive }) => 
                `flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive 
                    ? `bg-purple-500/20 text-purple-400 shadow-lg` 
                    : `text-purple-400/70 hover:bg-purple-500/10 hover:text-purple-400`
                }`
              }
            >
              <Shield size={20} className="mr-3" />
              <span className="flex-1">Quản lý</span>
              <span className="text-xs bg-purple-500/20 px-2 py-1 rounded-full">Admin</span>
            </NavLink>
          )}
          
          <NavLink
            to={`/s/${synchoId}/settings`}
            onClick={() => {
              // Close sidebar on mobile after navigation
              if (window.innerWidth < 1024) {
                onToggle();
              }
            }}
            className={({ isActive }) => 
              `flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                isActive 
                  ? `${theme.bgTertiary} ${theme.text} shadow-lg` 
                  : `${theme.textSecondary} hover:${theme.bgTertiary} hover:${theme.text}`
              }`
            }
          >
            <Settings size={20} className="mr-3" />
            Cài đặt
          </NavLink>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;