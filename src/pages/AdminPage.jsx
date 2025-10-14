import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { collection, getDocs, doc, getDoc, deleteDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useTheme } from '../contexts/ThemeContext';
import { useToast } from '../contexts/ToastContext';
import { Shield, Trash2, Lock, Unlock, Crown, ArrowLeft, Search, AlertTriangle } from 'lucide-react';

function AdminPage() {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const { synchoId } = useParams();
  const { showToast } = useToast();
  const [synchos, setSynchos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedSyncho, setSelectedSyncho] = useState(null);

  useEffect(() => {
    checkAdminAccess();
    loadSynchos();
  }, []);

  const checkAdminAccess = async () => {
    try {
      const docRef = doc(db, 'storages', synchoId);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists() || !docSnap.data().isAdmin) {
        showToast('Bạn không có quyền truy cập trang này!', 'error');
        navigate(`/s/${synchoId}`);
      }
    } catch (error) {
      console.error('Error checking admin access:', error);
      navigate('/');
    }
  };

  const loadSynchos = async () => {
    setIsLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, 'storages'));
      const synchoList = [];
      
      querySnapshot.forEach((doc) => {
        synchoList.push({
          id: doc.id,
          ...doc.data()
        });
      });

      // Sort by creation date
      synchoList.sort((a, b) => {
        if (a.createdAt && b.createdAt) {
          return b.createdAt.toMillis() - a.createdAt.toMillis();
        }
        return 0;
      });

      setSynchos(synchoList);
    } catch (error) {
      console.error('Error loading synchos:', error);
      showToast('Không thể tải danh sách Syncho', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteSyncho = async (synchoId) => {
    try {
      await deleteDoc(doc(db, 'storages', synchoId));
      setSynchos(synchos.filter(s => s.id !== synchoId));
      setShowDeleteModal(false);
      setSelectedSyncho(null);
      showToast('Đã xóa Syncho thành công!', 'success');
    } catch (error) {
      console.error('Error deleting syncho:', error);
      showToast('Không thể xóa Syncho: ' + error.message, 'error');
    }
  };

  const handleToggleLock = async (synchoId, isCurrentlyLocked) => {
    try {
      const docRef = doc(db, 'storages', synchoId);
      
      await updateDoc(docRef, {
        isLocked: !isCurrentlyLocked
      });
      
      showToast(
        isCurrentlyLocked ? 'Đã mở khóa Syncho!' : 'Đã khóa Syncho!',
        'success'
      );
      loadSynchos();
    } catch (error) {
      console.error('Error toggling lock:', error);
      showToast('Không thể thay đổi trạng thái khóa: ' + error.message, 'error');
    }
  };

  const handleToggleAdmin = async (synchoId, isCurrentlyAdmin) => {
    try {
      const docRef = doc(db, 'storages', synchoId);
      
      await updateDoc(docRef, {
        isAdmin: !isCurrentlyAdmin
      });
      
      showToast(
        isCurrentlyAdmin ? 'Đã gỡ quyền quản lý!' : 'Đã nâng cấp thành Syncho Quản lý!',
        'success'
      );
      loadSynchos();
    } catch (error) {
      console.error('Error toggling admin:', error);
      showToast('Không thể thay đổi quyền quản lý: ' + error.message, 'error');
    }
  };

  const filteredSynchos = synchos.filter(syncho => 
    syncho.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    syncho.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    return new Date(timestamp.toMillis()).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className={`min-h-screen ${theme.bgPrimary} ${theme.text} p-6`}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className={`flex items-center gap-2 ${theme.textMuted} hover:${theme.text} transition-colors mb-4`}
          >
            <ArrowLeft size={20} />
            <span>Quay lại</span>
          </button>
          
          <div className="flex items-center gap-3 mb-2">
            <div className={`p-3 ${theme.bgSecondary} rounded-xl`}>
              <Shield size={32} className="text-purple-400" />
            </div>
            <div>
              <h1 className="text-4xl font-bold">Trang Quản Lý</h1>
              <p className={theme.textMuted}>Quản lý tất cả Syncho trong hệ thống</p>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className={`${theme.bgSecondary} rounded-xl p-4 mb-6 ${theme.border} border`}>
          <div className="relative">
            <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${theme.textMuted}`} size={20} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm Syncho theo ID hoặc tên..."
              className={`w-full pl-12 pr-4 py-3 ${theme.bgTertiary} ${theme.text} rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all`}
            />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className={`${theme.bgSecondary} rounded-xl p-4 ${theme.border} border`}>
            <p className={theme.textMuted}>Tổng Syncho</p>
            <p className="text-3xl font-bold">{synchos.length}</p>
          </div>
          <div className={`${theme.bgSecondary} rounded-xl p-4 ${theme.border} border`}>
            <p className={theme.textMuted}>Đã khóa</p>
            <p className="text-3xl font-bold text-red-400">
              {synchos.filter(s => s.isLocked).length}
            </p>
          </div>
          <div className={`${theme.bgSecondary} rounded-xl p-4 ${theme.border} border`}>
            <p className={theme.textMuted}>Có mật khẩu</p>
            <p className="text-3xl font-bold text-yellow-400">
              {synchos.filter(s => s.password).length}
            </p>
          </div>
          <div className={`${theme.bgSecondary} rounded-xl p-4 ${theme.border} border`}>
            <p className={theme.textMuted}>Quản lý</p>
            <p className="text-3xl font-bold text-purple-400">
              {synchos.filter(s => s.isAdmin).length}
            </p>
          </div>
        </div>

        {/* Syncho List */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto"></div>
            <p className={`${theme.textMuted} mt-4`}>Đang tải...</p>
          </div>
        ) : (
          <div className={`${theme.bgSecondary} rounded-xl ${theme.border} border overflow-hidden`}>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className={`${theme.bgTertiary}`}>
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold">ID</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Ngày tạo</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Trạng thái</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Quyền</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold">Hành động</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/50">
                  {filteredSynchos.map((syncho) => (
                    <tr key={syncho.id} className="hover:bg-slate-700/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{syncho.id}</span>
                          {syncho.isAdmin && (
                            <Crown size={16} className="text-purple-400" title="Syncho Quản lý" />
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-400">
                        {formatDate(syncho.createdAt)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1">
                          {syncho.isLocked ? (
                            <span className="inline-flex items-center gap-1 px-3 py-1 bg-red-500/20 text-red-400 rounded-full text-sm font-semibold w-fit">
                              <Lock size={14} />
                              Đã khóa
                            </span>
                          ) : syncho.password ? (
                            <span className="inline-flex items-center gap-1 px-3 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-sm w-fit">
                              Có mật khẩu
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm w-fit">
                              <Unlock size={14} />
                              Công khai
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {syncho.isAdmin ? (
                          <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-500/20 text-purple-400 rounded-full text-sm font-semibold">
                            <Shield size={14} />
                            Quản lý
                          </span>
                        ) : (
                          <span className="text-slate-500 text-sm">Thường</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          {/* Toggle Lock */}
                          <button
                            onClick={() => handleToggleLock(syncho.id, syncho.isLocked)}
                            className={`p-2 rounded-lg transition-colors ${
                              syncho.isLocked
                                ? 'bg-red-500/20 hover:bg-red-500/30 text-red-400' 
                                : 'bg-slate-600/50 hover:bg-slate-600 text-slate-400'
                            }`}
                            title={syncho.isLocked ? 'Mở khóa Syncho' : 'Khóa Syncho'}
                          >
                            {syncho.isLocked ? <Unlock size={18} /> : <Lock size={18} />}
                          </button>

                          {/* Toggle Admin */}
                          <button
                            onClick={() => handleToggleAdmin(syncho.id, syncho.isAdmin)}
                            className={`p-2 rounded-lg transition-colors ${
                              syncho.isAdmin
                                ? 'bg-purple-500/20 hover:bg-purple-500/30 text-purple-400'
                                : 'bg-slate-600/50 hover:bg-slate-600 text-slate-400'
                            }`}
                            title={syncho.isAdmin ? 'Gỡ quyền quản lý' : 'Nâng cấp quản lý'}
                          >
                            <Crown size={18} />
                          </button>

                          {/* Delete */}
                          <button
                            onClick={() => {
                              setSelectedSyncho(syncho);
                              setShowDeleteModal(true);
                            }}
                            className="p-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors"
                            title="Xóa Syncho"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredSynchos.length === 0 && (
              <div className="text-center py-12">
                <p className={theme.textMuted}>Không tìm thấy Syncho nào</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedSyncho && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className={`${theme.bgSecondary} rounded-2xl shadow-2xl max-w-md w-full p-8 border ${theme.border}`}>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-red-500/20 rounded-xl">
                <AlertTriangle size={24} className="text-red-400" />
              </div>
              <h3 className="text-2xl font-bold text-red-400">Xác nhận xóa</h3>
            </div>
            
            <p className={`${theme.text} mb-2`}>
              Bạn có chắc chắn muốn xóa Syncho này?
            </p>
            <p className="text-lg font-semibold text-purple-400 mb-6">
              ID: {selectedSyncho.id}
            </p>
            
            <p className={`text-sm ${theme.textMuted} mb-6`}>
              ⚠️ Hành động này không thể hoàn tác. Tất cả dữ liệu sẽ bị xóa vĩnh viễn.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedSyncho(null);
                }}
                className={`flex-1 px-4 py-3 ${theme.bgTertiary} hover:bg-slate-600 ${theme.text} rounded-xl transition-colors`}
              >
                Hủy
              </button>
              <button
                onClick={() => handleDeleteSyncho(selectedSyncho.id)}
                className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-500 text-white rounded-xl transition-colors font-semibold"
              >
                Xóa vĩnh viễn
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminPage;
