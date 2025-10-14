// src/pages/NoteEditorPage.jsx
import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, onSnapshot, updateDoc, serverTimestamp, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { ArrowLeft, Save, Check, Trash2, Clock, Sparkles } from 'lucide-react';
import StyledInput from '../components/StyledInput';
import StyledTextarea from '../components/StyledTextarea';

function NoteEditorPage() {
  const { synchoId, noteId } = useParams();
  const navigate = useNavigate();
  const [note, setNote] = useState(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const titleInputRef = useRef(null);
  const contentTextareaRef = useRef(null);

  // Set up real-time listener for the note
  useEffect(() => {
    if (!synchoId || !noteId) return;

    const noteRef = doc(db, 'storages', synchoId, 'items', noteId);
    const unsubscribe = onSnapshot(
      noteRef,
      (doc) => {
        if (doc.exists()) {
          const noteData = { id: doc.id, ...doc.data() };
          setNote(noteData);
          setTitle(noteData.title || '');
          setContent(noteData.content || '');
        } else {
          // Note doesn't exist, redirect to notes list
          navigate(`/s/${synchoId}/notes`, { replace: true });
        }
      },
      (error) => {
        console.error('Error fetching note:', error);
        navigate(`/s/${synchoId}/notes`, { replace: true });
      }
    );

    return () => unsubscribe();
  }, [synchoId, noteId, navigate]);

  // Auto-save changes with debounce
  useEffect(() => {
    if (!note) return;

    // Don't save if values haven't changed
    if (title === note.title && content === note.content) return;
    
    const saveChanges = async () => {
      setIsSaving(true);
      try {
        const noteRef = doc(db, 'storages', synchoId, 'items', noteId);
        await updateDoc(noteRef, {
          title,
          content,
          updatedAt: serverTimestamp()
        });
        setLastSaved(new Date());
      } catch (error) {
        console.error('Error updating note:', error);
      } finally {
        setIsSaving(false);
      }
    };

    const timer = setTimeout(() => {
      saveChanges();
    }, 500);

    return () => clearTimeout(timer);
  }, [title, content, note, synchoId, noteId]);

  // Handle delete note
  const handleDeleteNote = async () => {
    try {
      const noteRef = doc(db, 'storages', synchoId, 'items', noteId);
      await deleteDoc(noteRef);
      navigate(`/s/${synchoId}/notes`, { replace: true });
    } catch (error) {
      console.error('Error deleting note:', error);
    }
  };

  // Format last saved time
  const formatLastSaved = () => {
    if (!lastSaved) return '';
    const now = new Date();
    const diff = Math.floor((now - lastSaved) / 1000);
    
    if (diff < 5) return 'vừa xong';
    if (diff < 60) return `${diff} giây trước`;
    if (diff < 3600) return `${Math.floor(diff / 60)} phút trước`;
    return lastSaved.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  };

  // Auto-focus title on mount
  useEffect(() => {
    if (note && titleInputRef.current) {
      titleInputRef.current.focus();
    }
  }, [note]);

  if (!note) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-8">
        <div className="max-w-4xl w-full mx-auto">
          <div className="animate-pulse space-y-8">
            <div className="h-16 bg-slate-800/50 rounded-lg w-2/3"></div>
            <div className="space-y-4">
              <div className="h-6 bg-slate-800/50 rounded w-full"></div>
              <div className="h-6 bg-slate-800/50 rounded w-5/6"></div>
              <div className="h-6 bg-slate-800/50 rounded w-4/5"></div>
              <div className="h-6 bg-slate-800/50 rounded w-3/4"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col">
      {/* Elegant Top Bar */}
      <div className="border-b border-slate-700/30 bg-slate-900/80 backdrop-blur-xl sticky top-0 z-10 shadow-lg">
        <div className="max-w-6xl mx-auto px-8 lg:px-16 py-6 flex items-center justify-between">
          {/* Back Button */}
          <button
            onClick={() => navigate(`/s/${synchoId}/notes`)}
            className="flex items-center gap-3 text-slate-400 hover:text-sky-400 transition-all duration-300 group -ml-2 px-4 py-2.5 rounded-xl hover:bg-slate-800/60"
          >
            <ArrowLeft size={22} className="group-hover:-translate-x-2 transition-transform duration-300" />
            <span className="font-semibold text-base">Ghi chú</span>
          </button>
          
          <div className="flex items-center gap-8">
            {/* Save Status with Animation */}
            <div className="flex items-center gap-3 px-4 py-2 rounded-full bg-slate-800/50">
              {isSaving ? (
                <>
                  <Save size={18} className="text-sky-400 animate-spin" />
                  <span className="text-sm text-slate-300 font-medium">Đang lưu...</span>
                </>
              ) : (
                <>
                  <Check size={18} className="text-emerald-400" />
                  <span className="text-sm text-emerald-400 font-medium">
                    {lastSaved ? `Đã lưu ${formatLastSaved()}` : 'Đã lưu'}
                  </span>
                </>
              )}
            </div>

            {/* Delete Button */}
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="p-3 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all duration-300 hover:scale-110"
              title="Xóa ghi chú"
            >
              <Trash2 size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Main Editor Area with Glass Effect */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-6xl mx-auto px-8 lg:px-16 py-16">
          {/* Decorative Header */}
          <div className="flex items-center gap-3 mb-12">
            <Sparkles size={28} className="text-sky-400" />
            <h2 className="text-2xl font-bold text-slate-300">Tạo ghi chú của bạn</h2>
          </div>

          {/* Title Input with Styled Component */}
          <div className="mb-16">
            <StyledInput
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Tiêu đề ghi chú..."
              className="title-input"
            />
          </div>
          
          {/* Metadata Bar with Enhanced Design */}
          <div className="flex flex-wrap items-center gap-6 text-sm text-slate-400 mb-12 pb-8 border-b border-slate-700/50">
            <div className="flex items-center gap-2 px-4 py-2 bg-slate-800/40 rounded-full">
              <Clock size={16} className="text-sky-400" />
              <span className="font-medium">
                {note?.updatedAt?.toDate?.().toLocaleDateString('vi-VN', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                }) || 'Vừa tạo'}
              </span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-slate-800/40 rounded-full">
              <span className="font-medium">{content.length} ký tự</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-slate-800/40 rounded-full">
              <span className="font-medium">{content.split(/\s+/).filter(w => w.length > 0).length} từ</span>
            </div>
          </div>
          
          {/* Content Textarea with Styled Component */}
          <div className="mb-16">
            <StyledTextarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Bắt đầu viết nội dung của bạn..."
              className="content-textarea"
            />
          </div>
        </div>
      </div>

      {/* Enhanced Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div 
          className="fixed inset-0 bg-black/70 backdrop-blur-xl flex items-center justify-center z-50 p-4 animate-in fade-in duration-300"
          onClick={() => setShowDeleteConfirm(false)}
        >
          <div 
            className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl shadow-2xl max-w-lg w-full p-10 border border-slate-700/50 animate-in zoom-in-95 duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start gap-5 mb-8">
              <div className="p-4 bg-red-500/20 rounded-2xl">
                <Trash2 size={32} className="text-red-400" />
              </div>
              <div>
                <h3 className="text-3xl font-bold text-white mb-3">Xóa ghi chú?</h3>
                <p className="text-slate-400 text-base">Hành động này không thể hoàn tác</p>
              </div>
            </div>
            
            <p className="text-slate-300 mb-10 leading-relaxed text-lg">
              Bạn có chắc chắn muốn xóa ghi chú{' '}
              <span className="font-bold text-white">"{title || 'Không có tiêu đề'}"</span>?
            </p>
            
            <div className="flex gap-4">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 px-6 py-4 bg-slate-700 hover:bg-slate-600 text-white rounded-2xl font-bold transition-all duration-300 hover:scale-105 hover:shadow-lg"
              >
                Hủy
              </button>
              <button
                onClick={handleDeleteNote}
                className="flex-1 px-6 py-4 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white rounded-2xl font-bold transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-red-500/50"
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

export default NoteEditorPage;
