// src/pages/WorkspacePage.jsx
import { useState, useEffect } from 'react';
import { Outlet, useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useTheme } from '../contexts/ThemeContext';
import { useToast } from '../contexts/ToastContext';
import Sidebar from '../components/Sidebar';
import { X } from 'lucide-react';

function WorkspacePage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [password, setPassword] = useState('');
  const [synchoData, setSynchoData] = useState(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
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
          const data = docSnap.data();
          setSynchoData(data);
          
          // Check if locked
          if (data.isLocked) {
            showToast('Syncho này đã bị khóa và không thể truy cập!', 'error');
            navigate('/');
            return;
          }

          // Check if password protected
          if (data.password) {
            // Check if already authenticated in this session
            const sessionKey = `syncho_auth_${synchoId}`;
            const isAuthenticated = sessionStorage.getItem(sessionKey);
            
            if (!isAuthenticated) {
              setShowPasswordModal(true);
              setIsChecking(false);
              return;
            }
          }
        } else {
          showToast('Không tìm thấy Syncho này!', 'error');
          navigate('/');
          return;
        }
        
        setIsChecking(false);
      } catch (error) {
        console.error('Error checking syncho status:', error);
        showToast('Có lỗi xảy ra khi kiểm tra Syncho!', 'error');
        navigate('/');
      }
    };

    if (synchoId) {
      checkSynchoStatus();
    }
  }, [synchoId, navigate, showToast]);

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    
    if (!password.trim()) {
      showToast('Vui lòng nhập mật khẩu!', 'warning');
      return;
    }

    setIsAuthenticating(true);

    try {
      if (password === synchoData.password) {
        // Save authentication in session storage
        const sessionKey = `syncho_auth_${synchoId}`;
        sessionStorage.setItem(sessionKey, 'true');
        
        setShowPasswordModal(false);
        setPassword('');
        showToast('Xác thực thành công!', 'success');
      } else {
        showToast('Mật khẩu không đúng!', 'error');
        setPassword('');
      }
    } catch (error) {
      console.error('Error authenticating:', error);
      showToast('Có lỗi xảy ra!', 'error');
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleCancelAuth = () => {
    navigate('/');
  };

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

  // Show password modal if authentication required
  if (showPasswordModal) {
    return (
      <div className={`min-h-screen ${theme.bg} ${theme.text} flex items-center justify-center p-4`}>
        <div className={`${theme.bgSecondary} rounded-2xl shadow-2xl max-w-md w-full p-8 border ${theme.border}`}>
          <div className="flex items-center justify-between mb-6">
            <h3 className={`text-2xl font-bold ${theme.text}`}>
              Nhập mật khẩu
            </h3>
            <button
              onClick={handleCancelAuth}
              className={`p-2 ${theme.bgTertiary} hover:bg-red-500/20 text-red-400 rounded-lg transition-colors`}
              title="Hủy"
            >
              <X size={20} />
            </button>
          </div>
          
          <p className={`${theme.textMuted} mb-6`}>
            Syncho <span className={`font-bold ${theme.text}`}>"{synchoId}"</span> yêu cầu mật khẩu để truy cập
          </p>
          
          <form onSubmit={handlePasswordSubmit}>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Nhập mật khẩu..."
              className={`w-full px-4 py-3 ${theme.bg} ${theme.text} border ${theme.border} focus:border-sky-500 rounded-xl outline-none mb-6 transition-colors`}
              disabled={isAuthenticating}
              autoFocus
            />
            
            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleCancelAuth}
                className={`flex-1 px-6 py-3 ${theme.bgTertiary} hover:opacity-80 ${theme.text} rounded-xl font-semibold transition-all duration-200`}
                disabled={isAuthenticating}
              >
                Hủy
              </button>
              <button
                type="submit"
                className={`flex-1 px-6 py-3 ${theme.accent} ${theme.accentHover} ${theme.accentButtonText} rounded-xl font-semibold transition-all duration-200 disabled:opacity-50`}
                disabled={isAuthenticating}
              >
                {isAuthenticating ? 'Đang xác thực...' : 'Truy cập'}
              </button>
            </div>
          </form>
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