// src/pages/NoteEditorPage.jsx
import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, onSnapshot, updateDoc, serverTimestamp, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useTheme } from '../contexts/ThemeContext';
import { ArrowLeft, Save, Check, Trash2, Clock, Sparkles } from 'lucide-react';
import StyledInput from '../components/StyledInput';
import RichTextEditor from '../components/RichTextEditor';

function NoteEditorPage() {
  const { synchoId, noteId } = useParams();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const [note, setNote] = useState(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const titleInputRef = useRef(null);
  const contentTextareaRef = useRef(null);
  const containerRef = useRef(null);

  // Handle scroll to shrink header
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      setIsScrolled(container.scrollTop > 50);
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [note]);

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
      <div className={`min-h-screen ${theme.bg} flex items-center justify-center p-8`}>
        <div className="max-w-4xl w-full mx-auto">
          <div className="animate-pulse space-y-8">
            <div className={`h-16 ${theme.bgSecondary} rounded-lg w-2/3`}></div>
            <div className="space-y-4">
              <div className={`h-6 ${theme.bgSecondary} rounded w-full`}></div>
              <div className={`h-6 ${theme.bgSecondary} rounded w-5/6`}></div>
              <div className={`h-6 ${theme.bgSecondary} rounded w-4/5`}></div>
              <div className={`h-6 ${theme.bgSecondary} rounded w-3/4`}></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className={`h-full overflow-y-auto ${theme.bg}`} style={{ '--header-height': isScrolled ? '56px' : '72px' }}>
      {/* Elegant Top Bar - Shrinks on scroll */}
      <div className={`border-b ${theme.border} ${theme.bgSecondary} backdrop-blur-xl sticky top-0 z-50 shadow-lg transition-all duration-300 ${isScrolled ? 'py-2' : ''}`}>
        <div className={`max-w-6xl mx-auto px-4 md:px-8 lg:px-16 flex items-center justify-between transition-all duration-300 ${isScrolled ? 'py-2' : 'py-4 md:py-6'}`}>
          {/* Back Button */}
          <button
            onClick={() => navigate(`/s/${synchoId}/notes`)}
            className={`flex items-center gap-2 ${theme.textMuted} hover:${theme.accentText} transition-all duration-300 group -ml-2 px-3 py-2 rounded-xl hover:${theme.bgTertiary}`}
          >
            <ArrowLeft size={isScrolled ? 18 : 22} className="group-hover:-translate-x-2 transition-all duration-300" />
            {!isScrolled && <span className="font-semibold text-base">Ghi chú</span>}
          </button>
          
          <div className={`flex items-center transition-all duration-300 ${isScrolled ? 'gap-2' : 'gap-4'}`}>
            {/* Save Status with Animation */}
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${theme.bgTertiary} transition-all duration-300 ${isScrolled ? 'text-xs' : ''}`}>
              {isSaving ? (
                <>
                  <Save size={isScrolled ? 14 : 18} className={`${theme.accentText} animate-spin`} />
                  {!isScrolled && <span className={`text-sm ${theme.textSecondary} font-medium`}>Đang lưu...</span>}
                </>
              ) : (
                <>
                  <Check size={isScrolled ? 14 : 18} className="text-emerald-400" />
                  {!isScrolled && (
                    <span className="text-sm text-emerald-400 font-medium">
                      {lastSaved ? `Đã lưu ${formatLastSaved()}` : 'Đã lưu'}
                    </span>
                  )}
                </>
              )}
            </div>

            {/* Delete Button */}
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className={`${theme.textMuted} hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all duration-300 hover:scale-110 ${isScrolled ? 'p-2' : 'p-3'}`}
              title="Xóa ghi chú"
            >
              <Trash2 size={isScrolled ? 16 : 20} />
            </button>
          </div>
        </div>
      </div>

      {/* Main Editor Area */}
      <div className="max-w-6xl mx-auto px-4 md:px-8 lg:px-16 py-8 md:py-16">
          {/* Decorative Header */}
          <div className="flex items-center gap-3 mb-12">
            <Sparkles size={28} className={theme.accentText} />
            <h2 className={`text-2xl font-bold ${theme.textSecondary}`}>Tạo ghi chú của bạn</h2>
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
          <div className={`flex flex-wrap items-center gap-6 text-sm ${theme.textMuted} mb-12 pb-8 border-b ${theme.border}`}>
            <div className={`flex items-center gap-2 px-4 py-2 ${theme.bgTertiary} rounded-full`}>
              <Clock size={16} className={theme.accentText} />
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
            <div className={`flex items-center gap-2 px-4 py-2 ${theme.bgTertiary} rounded-full`}>
              <span className="font-medium">{content.length} ký tự</span>
            </div>
            <div className={`flex items-center gap-2 px-4 py-2 ${theme.bgTertiary} rounded-full`}>
              <span className="font-medium">{content.split(/\s+/).filter(w => w.length > 0).length} từ</span>
            </div>
          </div>
          
        {/* Rich Text Editor */}
        <div className="mb-16">
          <RichTextEditor
            value={content}
            onChange={setContent}
            placeholder="Bắt đầu viết nội dung của bạn..."
          />
        </div>
      </div>

      {/* Enhanced Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div 
          className="fixed inset-0 bg-black/70 backdrop-blur-xl flex items-center justify-center z-50 p-4 animate-in fade-in duration-300"
          onClick={() => setShowDeleteConfirm(false)}
        >
          <div 
            className={`${theme.bgSecondary} rounded-3xl shadow-2xl max-w-lg w-full p-10 border ${theme.border} animate-in zoom-in-95 duration-300`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start gap-5 mb-8">
              <div className="p-4 bg-red-500/20 rounded-2xl">
                <Trash2 size={32} className="text-red-400" />
              </div>
              <div>
                <h3 className={`text-3xl font-bold ${theme.text} mb-3`}>Xóa ghi chú?</h3>
                <p className={`${theme.textMuted} text-base`}>Hành động này không thể hoàn tác</p>
              </div>
            </div>
            
            <p className={`${theme.textSecondary} mb-10 leading-relaxed text-lg`}>
              Bạn có chắc chắn muốn xóa ghi chú{' '}
              <span className={`font-bold ${theme.text}`}>"{title || 'Không có tiêu đề'}"</span>?
            </p>
            
            <div className="flex gap-4">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className={`flex-1 px-6 py-4 ${theme.bgTertiary} hover:opacity-80 ${theme.text} rounded-2xl font-bold transition-all duration-300 hover:scale-105 hover:shadow-lg`}
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
