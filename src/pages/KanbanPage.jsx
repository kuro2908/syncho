// src/pages/KanbanPage.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { collection, query, where, onSnapshot, addDoc, serverTimestamp, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';
import { useTheme } from '../contexts/ThemeContext';
import { Plus, Trash2, Columns3 } from 'lucide-react';

function KanbanPage() {
  const { synchoId } = useParams();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const [boards, setBoards] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!synchoId) return;

    const boardsRef = collection(db, 'storages', synchoId, 'items');
    const q = query(
      boardsRef,
      where('type', '==', 'kanban')
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
        console.error('Error fetching boards:', error);
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [synchoId]);

  const handleCreateNewBoard = async () => {
    try {
      const boardsRef = collection(db, 'storages', synchoId, 'items');
      
      // Create default board structure
      const newBoard = {
        type: "kanban",
        title: "Bảng Kanban mới",
        tasks: {},
        columns: {
          "column-1": {
            id: "column-1",
            title: "Cần làm",
            taskIds: []
          },
          "column-2": {
            id: "column-2",
            title: "Đang làm",
            taskIds: []
          },
          "column-3": {
            id: "column-3",
            title: "Hoàn thành",
            taskIds: []
          }
        },
        columnOrder: ["column-1", "column-2", "column-3"],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      
      const docRef = await addDoc(boardsRef, newBoard);
      navigate(`/s/${synchoId}/kanban/${docRef.id}`);
    } catch (error) {
      console.error('Error creating new board:', error);
    }
  };

  const handleDeleteBoard = async (e, boardId) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (window.confirm('Bạn có chắc chắn muốn xóa bảng Kanban này?')) {
      try {
        const boardRef = doc(db, 'storages', synchoId, 'items', boardId);
        await deleteDoc(boardRef);
      } catch (error) {
        console.error('Error deleting board:', error);
      }
    }
  };

  const getTaskCount = (board) => {
    return Object.keys(board.tasks || {}).length;
  };

  const getColumnCount = (board) => {
    return (board.columnOrder || []).length;
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
      <h1 className={`text-3xl font-bold mb-8 ${theme.text} tracking-tight`}>Tất cả Bảng Kanban</h1>
      
      {boards.length === 0 ? (
        <div className="text-center py-20">
          <div className={`inline-block p-6 ${theme.bgSecondary} rounded-full mb-6`}>
            <Columns3 size={64} className={`${theme.accentText}`} />
          </div>
          <p className={`${theme.textSecondary} mb-6 text-lg`}>Chưa có bảng Kanban nào</p>
          <button
            onClick={handleCreateNewBoard}
            className={`${theme.accent} ${theme.accentHover} text-white px-8 py-3.5 rounded-xl font-semibold transition-all duration-300 hover:scale-105 hover:shadow-xl`}
          >
            Tạo bảng đầu tiên
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {boards.map((board) => (
            <Link 
              key={board.id}
              to={`/s/${synchoId}/kanban/${board.id}`}
              className="block group relative"
            >
              <div className={`${theme.bgSecondary} rounded-xl p-6 hover:${theme.bgTertiary} transition-all duration-300 h-44 overflow-hidden border-2 ${theme.border} hover:border-sky-400 hover:shadow-xl hover:scale-[1.02] hover:-translate-y-1`}>
                <div className="flex items-start gap-3 mb-5">
                  <div className={`p-2 ${theme.bgTertiary} rounded-lg`}>
                    <Columns3 size={20} className={theme.accentText} />
                  </div>
                  <h3 className={`font-bold ${theme.text} text-lg line-clamp-2 pr-8 flex-1`}>
                    {board.title || 'Bảng không có tiêu đề'}
                  </h3>
                </div>
                
                <div className={`flex gap-3 text-xs ${theme.textMuted}`}>
                  <div className={`flex items-center gap-2 px-3 py-1.5 ${theme.bgTertiary} rounded-full`}>
                    <div className={`w-2 h-2 rounded-full ${theme.accent}`}></div>
                    <span className="font-medium">{getColumnCount(board)} cột</span>
                  </div>
                  <div className={`flex items-center gap-2 px-3 py-1.5 ${theme.bgTertiary} rounded-full`}>
                    <div className={`w-2 h-2 rounded-full bg-emerald-500`}></div>
                    <span className="font-medium">{getTaskCount(board)} thẻ</span>
                  </div>
                </div>
                
                {/* Delete Button */}
                <button
                  onClick={(e) => handleDeleteBoard(e, board.id)}
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
          onClick={handleCreateNewBoard}
          className={`fixed bottom-8 right-8 ${theme.accent} ${theme.accentHover} text-white rounded-full p-5 shadow-2xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 hover:scale-110 hover:rotate-90`}
          aria-label="Tạo bảng Kanban mới"
        >
          <Plus size={24} />
        </button>
      )}
    </div>
  );
}

export default KanbanPage;
