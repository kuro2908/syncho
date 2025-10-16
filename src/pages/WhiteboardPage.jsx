// src/pages/WhiteboardPage.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { collection, query, where, onSnapshot, addDoc, serverTimestamp, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';
import { useTheme } from '../contexts/ThemeContext';
import { useToast } from '../contexts/ToastContext';
import { Plus, Trash2, Presentation } from 'lucide-react';

function WhiteboardPage() {
  const { synchoId } = useParams();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { showToast } = useToast();
  const [boards, setBoards] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [boardToDelete, setBoardToDelete] = useState(null);

  useEffect(() => {
    if (!synchoId) return;

    const boardsRef = collection(db, 'storages', synchoId, 'items');
    const q = query(
      boardsRef,
      where('type', '==', 'whiteboard')
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const boardsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        // Sort by createdAt
        boardsData.sort((a, b) => {
          const timeA = a.createdAt?.toMillis?.() || 0;
          const timeB = b.createdAt?.toMillis?.() || 0;
          return timeB - timeA;
        });
        
        setBoards(boardsData);
        setIsLoading(false);
      },
      (error) => {
        console.error('Error fetching whiteboards:', error);
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [synchoId]);

  const handleCreateNewWhiteboard = async () => {
    try {
      const boardsRef = collection(db, 'storages', synchoId, 'items');
      
      const newBoard = {
        type: "whiteboard",
        title: "Bảng trắng không có tiêu đề",
        boardData: null,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      
      const docRef = await addDoc(boardsRef, newBoard);
      navigate(`/s/${synchoId}/whiteboard/${docRef.id}`);
    } catch (error) {
      console.error('Error creating new whiteboard:', error);
      showToast('Có lỗi xảy ra khi tạo bảng trắng!', 'error');
    }
  };

  const handleDeleteBoard = (e, board) => {
    e.preventDefault();
    e.stopPropagation();
    setBoardToDelete(board);
    setShowDeleteConfirm(true);
  };

  const confirmDeleteBoard = async () => {
    if (!boardToDelete) return;
    
    try {
      const boardRef = doc(db, 'storages', synchoId, 'items', boardToDelete.id);
      await deleteDoc(boardRef);
      showToast('Đã xóa bảng trắng thành công!', 'success');
      setShowDeleteConfirm(false);
      setBoardToDelete(null);
    } catch (error) {
      console.error('Error deleting whiteboard:', error);
      showToast('Có lỗi xảy ra khi xóa bảng trắng!', 'error');
    }
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(false);
    setBoardToDelete(null);
  };

  if (isLoading) {
    return (
      <div className={`p-8 ${theme.bg}`}>
        <div className="animate-pulse space-y-4">
          <div className={`h-8 ${theme.bgSecondary} rounded w-1/3`}></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className={`h-40 ${theme.bgSecondary} rounded-lg`}></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`p-8 ${theme.bg} h-full overflow-y-auto min-h-0`}>
      <h1 className={`text-3xl font-bold mb-8 ${theme.text} tracking-tight`}>Tất cả Bảng trắng</h1>
      
      {boards.length === 0 ? (
        <div className="text-center py-20">
          <div className={`inline-block p-6 ${theme.bgSecondary} rounded-full mb-6`}>
            <Presentation size={64} className={`${theme.accentText}`} />
          </div>
          <p className={`${theme.textSecondary} mb-6 text-lg`}>Chưa có bảng trắng nào</p>
          <button
            onClick={handleCreateNewWhiteboard}
            className={`${theme.accent} ${theme.accentHover} ${theme.accentButtonText} px-8 py-3.5 rounded-xl font-semibold transition-all duration-300 hover:scale-105 hover:shadow-xl`}
          >
            Tạo bảng đầu tiên
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {boards.map((board) => (
            <Link 
              key={board.id}
              to={`/s/${synchoId}/whiteboard/${board.id}`}
              className="block group relative"
            >
              <div className={`${theme.bgSecondary} rounded-xl p-6 hover:${theme.bgTertiary} transition-all duration-300 h-44 overflow-hidden border-2 ${theme.border} hover:border-sky-400 hover:shadow-xl hover:scale-[1.02] hover:-translate-y-1`}>
                <div className="flex items-start gap-3 mb-5">
                  <div className={`p-2 ${theme.bgTertiary} rounded-lg`}>
                    <Presentation size={20} className={theme.accentText} />
                  </div>
                  <h3 className={`font-bold ${theme.text} text-lg line-clamp-2 pr-8 flex-1`}>
                    {board.title || 'Bảng không có tiêu đề'}
                  </h3>
                </div>
                
                <div className={`flex gap-3 text-xs ${theme.textMuted}`}>
                  <div className={`flex items-center gap-2 px-3 py-1.5 ${theme.bgTertiary} rounded-full`}>
                    <div className={`w-2 h-2 rounded-full ${theme.accent}`}></div>
                    <span className="font-medium">
                      {board.createdAt?.toDate?.().toLocaleDateString('vi-VN') || 'Vừa tạo'}
                    </span>
                  </div>
                </div>
                
                {/* Delete Button */}
                <button
                  onClick={(e) => handleDeleteBoard(e, board)}
                  className={`absolute top-4 right-4 p-2 ${theme.bgTertiary} hover:bg-red-500/20 text-red-400 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110`}
                  title="Xóa bảng"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Floating Action Button */}
      {boards.length > 0 && (
        <button
          onClick={handleCreateNewWhiteboard}
          className={`fixed bottom-8 right-8 ${theme.accent} ${theme.accentHover} ${theme.accentButtonText} rounded-full p-5 shadow-2xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 hover:scale-110 hover:rotate-90`}
          aria-label="Tạo bảng trắng mới"
        >
          <Plus size={24} />
        </button>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && boardToDelete && (
        <div 
          className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200"
          onClick={cancelDelete}
        >
          <div 
            className={`${theme.bgSecondary} rounded-2xl shadow-2xl max-w-md w-full p-8 border ${theme.border} animate-in zoom-in-95 duration-200`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start gap-4 mb-6">
              <div className="p-3 bg-red-500/20 rounded-xl">
                <Trash2 size={28} className="text-red-400" />
              </div>
              <div>
                <h3 className={`text-2xl font-bold ${theme.text} mb-2`}>Xóa bảng trắng?</h3>
                <p className={`${theme.textMuted} text-sm`}>Hành động này không thể hoàn tác</p>
              </div>
            </div>
            
            <p className={`${theme.textSecondary} mb-8 leading-relaxed`}>
              Bạn có chắc chắn muốn xóa bảng{' '}
              <span className={`font-bold ${theme.text}`}>"{boardToDelete.title || 'Không có tiêu đề'}"</span>?
              <br />
              <span className="text-red-400 font-semibold">Tất cả nội dung vẽ trong bảng sẽ bị xóa.</span>
            </p>
            
            <div className="flex gap-3">
              <button
                onClick={cancelDelete}
                className={`flex-1 px-6 py-3 ${theme.bgTertiary} hover:opacity-80 ${theme.text} rounded-xl font-semibold transition-all duration-200 hover:scale-105`}
              >
                Hủy
              </button>
              <button
                onClick={confirmDeleteBoard}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white rounded-xl font-semibold transition-all duration-200 hover:scale-105 hover:shadow-lg hover:shadow-red-500/50"
              >
                Xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default WhiteboardPage;
