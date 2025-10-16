// src/pages/WhiteboardEditorPage.jsx
import { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { Tldraw } from '@tldraw/tldraw';
import '@tldraw/tldraw/tldraw.css';
import { ArrowLeft } from 'lucide-react';

function WhiteboardEditorPage() {
  const { synchoId, boardId } = useParams();
  const navigate = useNavigate();
  const [snapshot, setSnapshot] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const saveTimeoutRef = useRef(null);

  // Load whiteboard data from Firestore
  useEffect(() => {
    if (!synchoId || !boardId) return;

    const boardRef = doc(db, 'storages', synchoId, 'items', boardId);
    const unsubscribe = onSnapshot(
      boardRef,
      (doc) => {
        if (doc.exists()) {
          const data = doc.data();
          // Only set snapshot if boardData exists
          if (data.boardData) {
            setSnapshot(data.boardData);
          }
          setIsLoading(false);
        } else {
          // Board doesn't exist, redirect back
          navigate(`/s/${synchoId}/whiteboard`, { replace: true });
        }
      },
      (error) => {
        console.error('Error fetching whiteboard:', error);
        navigate(`/s/${synchoId}/whiteboard`, { replace: true });
      }
    );

    return () => unsubscribe();
  }, [synchoId, boardId, navigate]);

  // Save whiteboard data to Firestore with debounce
  const handlePersist = useCallback(
    (snapshot) => {
      // Clear any existing timeout
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }

      // Set new timeout to save after 1 second of inactivity
      saveTimeoutRef.current = setTimeout(async () => {
        try {
          const boardRef = doc(db, 'storages', synchoId, 'items', boardId);
          await updateDoc(boardRef, {
            boardData: snapshot.document,
            updatedAt: new Date()
          });
          console.log('Whiteboard saved successfully');
        } catch (error) {
          console.error('Error saving whiteboard:', error);
        }
      }, 1000);
    },
    [synchoId, boardId]
  );

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  if (isLoading) {
    return (
      <div className="w-screen h-screen flex items-center justify-center bg-slate-900">
        <div className="text-white text-lg">Đang tải bảng trắng...</div>
      </div>
    );
  }

  return (
    <div className="w-screen h-screen relative">
      {/* Back Button */}
      <button
        onClick={() => navigate(`/s/${synchoId}/whiteboard`)}
        className="absolute top-4 left-4 z-[9999] flex items-center gap-2 bg-white hover:bg-gray-100 text-gray-800 px-4 py-2 rounded-lg shadow-lg transition-all duration-200 hover:scale-105 font-semibold"
      >
        <ArrowLeft size={20} />
        <span>Quay lại</span>
      </button>

      {/* Tldraw Canvas */}
      <Tldraw
        snapshot={snapshot}
        onMount={(editor) => {
          console.log('Tldraw editor mounted');
        }}
        persistenceKey={`whiteboard-${boardId}`}
        onPersist={handlePersist}
      />
    </div>
  );
}

export default WhiteboardEditorPage;
