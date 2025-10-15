// src/pages/WorkspacePage.jsx
import { useState, useEffect } from 'react';
import { Outlet, useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useTheme } from '../contexts/ThemeContext';
import { useToast } from '../contexts/ToastContext';
import Sidebar from '../components/Sidebar';

function WorkspacePage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const { theme } = useTheme();
  const { synchoId } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();

  useEffect(() => {
    const checkSynchoStatus = async () => {
      try {
        const docRef = doc(db, 'storages', synchoId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const synchoData = docSnap.data();
          
          if (synchoData.isLocked) {
            showToast('Syncho này đã bị khóa và không thể truy cập!', 'error');
            navigate('/');
            return;
          }
        }
        
        setIsChecking(false);
      } catch (error) {
        console.error('Error checking syncho status:', error);
        setIsChecking(false);
      }
    };

    if (synchoId) {
      checkSynchoStatus();
    }
  }, [synchoId, navigate, showToast]);

  if (isChecking) {
    return (
      <div className={`min-h-screen ${theme.bg} ${theme.text} flex items-center justify-center`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500 mx-auto mb-4"></div>
          <p className={theme.textMuted}>Đang kiểm tra...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`h-screen ${theme.bg} ${theme.text} flex overflow-hidden`}>
      <Sidebar isOpen={isSidebarOpen} onToggle={() => setIsSidebarOpen(!isSidebarOpen)} />
      <main className="flex-1 overflow-hidden">
        <Outlet />
      </main>
    </div>
  );
}

export default WorkspacePage;