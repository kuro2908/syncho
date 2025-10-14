// src/pages/NotesPage.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { collection, query, where, onSnapshot, orderBy, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { Plus } from 'lucide-react';

function NotesPage() {
  const { synchoId } = useParams();
  const navigate = useNavigate();
  const [notes, setNotes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

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

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-slate-800 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-40 bg-slate-800 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Tất cả Ghi chú</h1>
      
      {notes.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-slate-400 mb-4">Chưa có ghi chú nào</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {notes.map((note) => (
            <Link 
              key={note.id}
              to={`/s/${synchoId}/notes/${note.id}`}
              className="block"
            >
              <div className="bg-slate-800 rounded-lg p-4 hover:bg-slate-700/50 transition-colors h-40 overflow-hidden">
                <h3 className="font-medium text-white mb-2 line-clamp-1">
                  {note.title || 'Không có tiêu đề'}
                </h3>
                <p className="text-sm text-slate-300 line-clamp-4">
                  {note.content || 'Không có nội dung'}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Floating Action Button */}
      <button
        onClick={handleCreateNewNote}
        className="fixed bottom-6 right-6 bg-sky-600 hover:bg-sky-700 text-white rounded-full p-4 shadow-lg transition-colors focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 focus:ring-offset-slate-900"
        aria-label="Tạo ghi chú mới"
      >
        <Plus size={24} />
      </button>
    </div>
  );
}

export default NotesPage;