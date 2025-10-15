// src/pages/NotesPage.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { collection, query, where, onSnapshot, orderBy, addDoc, serverTimestamp, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';
import { useTheme } from '../contexts/ThemeContext';
import { Plus, Trash2 } from 'lucide-react';

function NotesPage() {
  const { synchoId } = useParams();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const [notes, setNotes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Helper function to strip HTML tags and get plain text
  const stripHtml = (html) => {
    if (!html) return '';
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  };

  useEffect(() => {
    if (!synchoId) return;

    const notesRef = collection(db, 'storages', synchoId, 'items');
    const q = query(
      notesRef,
      where('type', '==', 'note')
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const notesData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        // Sort manually by createdAt
        notesData.sort((a, b) => {
          const timeA = a.createdAt?.toMillis?.() || 0;
          const timeB = b.createdAt?.toMillis?.() || 0;
          return timeB - timeA; // Descending order
        });
        
        console.log('Notes loaded:', notesData); // Debug log
        setNotes(notesData);
        setIsLoading(false);
      },
      (error) => {
        console.error('Error fetching notes:', error);
        console.error('Error details:', error.message); // More detailed error
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [synchoId]);

  const handleCreateNewNote = async () => {
    try {
      const notesRef = collection(db, 'storages', synchoId, 'items');
      const newNote = {
        type: "note",
        title: "Ghi chú không có tiêu đề",
        content: "",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        tags: []
      };
      
      const docRef = await addDoc(notesRef, newNote);
      navigate(`/s/${synchoId}/notes/${docRef.id}`);
    } catch (error) {
      console.error('Error creating new note:', error);
    }
  };

  const handleDeleteNote = async (e, noteId) => {
    e.preventDefault(); // Prevent navigation to note editor
    e.stopPropagation(); // Stop event bubbling
    
    if (window.confirm('Bạn có chắc chắn muốn xóa ghi chú này?')) {
      try {
        const noteRef = doc(db, 'storages', synchoId, 'items', noteId);
        await deleteDoc(noteRef);
      } catch (error) {
        console.error('Error deleting note:', error);
      }
    }
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
      <h1 className={`text-2xl font-bold mb-6 ${theme.text}`}>Tất cả Ghi chú</h1>
      
      {notes.length === 0 ? (
        <div className="text-center py-12">
          <p className={`${theme.textMuted} mb-4`}>Chưa có ghi chú nào</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {notes.map((note) => (
            <Link 
              key={note.id}
              to={`/s/${synchoId}/notes/${note.id}`}
              className="block group relative"
            >
              <div className={`${theme.bgSecondary} rounded-lg p-4 hover:${theme.bgTertiary} transition-colors h-40 overflow-hidden`}>
                <h3 className={`font-medium ${theme.text} mb-2 line-clamp-1 pr-8`}>
                  {note.title || 'Không có tiêu đề'}
                </h3>
                <p className={`text-sm ${theme.textSecondary} line-clamp-4`} style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                  {stripHtml(note.content) || 'Không có nội dung'}
                </p>
                
                {/* Delete Button */}
                <button
                  onClick={(e) => handleDeleteNote(e, note.id)}
                  className={`absolute top-3 right-3 p-2 ${theme.bgTertiary} hover:bg-red-500/20 text-red-400 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200 hover:scale-110`}
                  title="Xóa ghi chú"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Floating Action Button */}
      <button
        onClick={handleCreateNewNote}
        className={`fixed bottom-6 right-6 ${theme.accent} ${theme.accentHover} text-white rounded-full p-4 shadow-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2`}
        aria-label="Tạo ghi chú mới"
      >
        <Plus size={24} />
      </button>
    </div>
  );
}

export default NotesPage;