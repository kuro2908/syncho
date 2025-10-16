import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { useToast } from '../contexts/ToastContext';

function HomePage() {
  const [createId, setCreateId] = useState('');
  const [accessId, setAccessId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showLockedModal, setShowLockedModal] = useState(false);
  const [tempPassword, setTempPassword] = useState('');
  const [pendingSynchoId, setPendingSynchoId] = useState('');
  const navigate = useNavigate();
  const { showToast } = useToast();

  const handleCreateWorkspace = async (e) => {
    e.preventDefault();
    
    if (!createId.trim()) {
      showToast('Vui lòng nhập SynchoID!', 'warning');
      return;
    }

    setIsLoading(true);
    try {
      const docRef = doc(db, 'storages', createId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        showToast('SynchoID này đã tồn tại. Vui lòng chọn ID khác.', 'error');
        setIsLoading(false);
        return;
      }

      // Show password modal
      setPendingSynchoId(createId);
      setShowPasswordModal(true);
      setIsLoading(false);
    } catch (error) {
      console.error('Lỗi khi tạo Syncho:', error);
      showToast(`Đã xảy ra lỗi: ${error.message}`, 'error');
      setIsLoading(false);
    }
  };

  const handleConfirmCreate = async (password) => {
    setIsLoading(true);
    try {
      const synchoData = {
        id: pendingSynchoId,
        name: pendingSynchoId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };
      
      if (password) {
        synchoData.password = password;
      }
      
      const docRef = doc(db, 'storages', pendingSynchoId);
      await setDoc(docRef, synchoData);

      setShowPasswordModal(false);
      setTempPassword('');
      showToast('Tạo Syncho thành công!', 'success');
      navigate(`/s/${pendingSynchoId}`);
    } catch (error) {
      console.error('Lỗi khi tạo Syncho:', error);
      showToast(`Đã xảy ra lỗi: ${error.message}`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAccessWorkspace = async (e) => {
    e.preventDefault();
    
    if (!accessId.trim()) {
      showToast('Vui lòng nhập SynchoID!', 'warning');
      return;
    }

    setIsLoading(true);
    try {
      const docRef = doc(db, 'storages', accessId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const synchoData = docSnap.data();
        
        // Check if Syncho is locked
        if (synchoData.isLocked) {
          setShowLockedModal(true);
          setIsLoading(false);
          return;
        }
        
        // Navigate directly to workspace
        // Password check will be handled by WorkspacePage
        navigate(`/s/${accessId}`);
      } else {
        showToast('Không tìm thấy Syncho. Vui lòng kiểm tra lại SynchoID.', 'error');
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Lỗi khi truy cập Syncho:', error);
      showToast(`Đã xảy ra lỗi: ${error.message}`, 'error');
      setIsLoading(false);
    }
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white flex flex-col items-center justify-center p-4">
      <div className="text-center mb-12 animate-fade-in">
        <h1 className="text-5xl md:text-6xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-sky-400 to-teal-400">
          Syncho By Kuro
        </h1>
        <p className="text-slate-300 text-xl md:text-2xl font-light">
          Làm việc dễ dàng và hiệu quả
        </p>
      </div>

      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-8 animate-slide-up">
        {/* Create Workspace Form */}
        <div className="relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-sky-500 to-teal-500 rounded-2xl blur opacity-30 group-hover:opacity-60 transition duration-300 -z-10"></div>
          <form 
            onSubmit={handleCreateWorkspace}
            className="relative bg-slate-800/80 backdrop-blur-sm p-8 rounded-2xl shadow-2xl border border-slate-700/50 hover:border-slate-600/50 transition-all duration-300 h-full"
          >
            <div className="mb-6 flex items-center">
              <div className="p-2 rounded-lg bg-sky-500/10">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-sky-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold ml-3 bg-gradient-to-r from-sky-400 to-teal-400 bg-clip-text text-transparent">
                Tạo Syncho mới
              </h2>
            </div>
            <div className="space-y-6">
              <div>
                <label htmlFor="createId" className="block text-sm font-medium text-slate-300 mb-1">
                  Nhập tên Syncho
                </label>
                <div className="relative">
                  <input
                    id="createId"
                    type="text"
                    value={createId}
                    onChange={(e) => setCreateId(e.target.value)}
                    placeholder="Ví dụ: syncho-cua-toi"
                    className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-transparent placeholder-slate-500 transition-all duration-200"
                    disabled={isLoading}
                    required
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-sky-600 to-teal-600 hover:from-sky-500 hover:to-teal-500 text-white font-medium py-3 px-6 rounded-xl transition-all duration-200 transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:ring-offset-2 focus:ring-offset-slate-800 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Đang tạo...
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                    </svg>
                    <span>Tạo Syncho</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Access Workspace Form */}
        <div className="relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-teal-500 to-emerald-500 rounded-2xl blur opacity-30 group-hover:opacity-60 transition duration-300 -z-10"></div>
          <form 
            onSubmit={handleAccessWorkspace}
            className="relative bg-slate-800/80 backdrop-blur-sm p-8 rounded-2xl shadow-2xl border border-slate-700/50 hover:border-slate-600/50 transition-all duration-300 h-full"
          >
            <div className="mb-6 flex items-center">
              <div className="p-2 rounded-lg bg-teal-500/10">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold ml-3 bg-gradient-to-r from-teal-400 to-emerald-400 bg-clip-text text-transparent">
                Truy cập Syncho
              </h2>
            </div>
            <div className="space-y-6">
              <div>
                <label htmlFor="accessId" className="block text-sm font-medium text-slate-300 mb-1">
                  Nhập ID Syncho
                </label>
                <div className="relative">
                  <input
                    id="accessId"
                    type="text"
                    value={accessId}
                    onChange={(e) => setAccessId(e.target.value)}
                    placeholder="Dán ID Syncho vào đây"
                    className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-transparent placeholder-slate-500 transition-all duration-200"
                    disabled={isLoading}
                    required
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white font-medium py-3 px-6 rounded-xl transition-all duration-200 transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:ring-offset-2 focus:ring-offset-slate-800 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Đang kết nối...
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 1.414L10.586 9H7a1 1 0 100 2h3.586l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z" clipRule="evenodd" />
                    </svg>
                    <span>Truy cập ngay</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-16 text-center text-slate-500 text-sm">
        
        <p className="mt-1"> {new Date().getFullYear()} Syncho</p>
      </div>

      {/* Password Modal for Creating Syncho */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-slate-800 rounded-2xl shadow-2xl max-w-md w-full p-8 border border-slate-700 animate-in zoom-in-95 duration-200">
            <h3 className="text-2xl font-bold mb-2 bg-gradient-to-r from-sky-400 to-teal-400 bg-clip-text text-transparent">
              Bảo mật Syncho
            </h3>
            <p className="text-slate-300 mb-6">
              Bạn có muốn đặt mật khẩu cho Syncho này không?
            </p>
            
            <div className="space-y-4 mb-6">
              <input
                type="password"
                value={tempPassword}
                onChange={(e) => setTempPassword(e.target.value)}
                placeholder="Nhập mật khẩu (tùy chọn)"
                className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-transparent placeholder-slate-500"
                disabled={isLoading}
              />
              <p className="text-xs text-slate-400">
                Bỏ trống để tạo Syncho công khai
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowPasswordModal(false);
                  setTempPassword('');
                }}
                className="flex-1 px-4 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl transition-colors"
                disabled={isLoading}
              >
                Hủy
              </button>
              <button
                onClick={() => handleConfirmCreate(tempPassword)}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-sky-600 to-teal-600 hover:from-sky-500 hover:to-teal-500 text-white rounded-xl transition-all"
                disabled={isLoading}
              >
                {tempPassword ? 'Tạo với mật khẩu' : 'Tạo công khai'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Locked Syncho Modal */}
      {showLockedModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-slate-800 rounded-2xl shadow-2xl max-w-md w-full p-8 border border-red-500/50 animate-in zoom-in-95 duration-200">
            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              
              <h3 className="text-2xl font-bold mb-2 text-red-400">
                Syncho đã bị khóa
              </h3>
              <p className="text-slate-300 mb-6">
                Syncho này đã bị quản trị viên khóa và không thể truy cập.
              </p>
              
              <button
                onClick={() => setShowLockedModal(false)}
                className="w-full px-4 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl transition-colors font-semibold"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default HomePage;
