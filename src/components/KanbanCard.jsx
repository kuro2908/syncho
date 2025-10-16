// src/components/KanbanCard.jsx
import { useState, useRef, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Trash2, Edit2, Check, X, User, Calendar, Clock } from 'lucide-react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import '../styles/datepicker-custom.css';

function KanbanCard({ task, onDelete, onUpdate, isDragging = false, autoEdit = false }) {
  const { theme, currentTheme } = useTheme();
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(task.content);
  const [editedAssignee, setEditedAssignee] = useState(task.assignee || '');
  const [editedDeadline, setEditedDeadline] = useState(task.deadline ? new Date(task.deadline) : null);
  const contentInputRef = useRef(null);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  useEffect(() => {
    if (isEditing && contentInputRef.current) {
      contentInputRef.current.focus();
      contentInputRef.current.select();
    }
  }, [isEditing]);

  // Auto-edit for new tasks
  useEffect(() => {
    if (autoEdit && !task.content) {
      setIsEditing(true);
    }
  }, [autoEdit, task.content]);

  const handleSave = () => {
    if (editedContent.trim()) {
      onUpdate({
        content: editedContent.trim(),
        assignee: editedAssignee.trim(),
        deadline: editedDeadline ? editedDeadline.toISOString() : null
      });
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedContent(task.content);
    setEditedAssignee(task.assignee || '');
    setEditedDeadline(task.deadline ? new Date(task.deadline) : null);
    setIsEditing(false);
  };

  // Check if deadline is overdue
  const isOverdue = () => {
    if (!task.deadline) return false;
    return new Date(task.deadline) < new Date();
  };

  // Format deadline for display
  const formatDeadline = (deadline) => {
    if (!deadline) return '';
    const date = new Date(deadline);
    const now = new Date();
    const diffTime = date - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'Quá hạn';
    if (diffDays === 0) return 'Hôm nay';
    if (diffDays === 1) return 'Ngày mai';
    return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  if (isDragging || isSortableDragging) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className={`${theme.bgTertiary} rounded-xl p-4 shadow-2xl border-2 border-sky-400 opacity-60 rotate-2 scale-105 transition-all duration-200`}
      >
        <div className="flex items-start gap-2">
          <GripVertical size={16} className={theme.textMuted} />
          <div className="flex-1">
            <p className={`${theme.text} text-sm mb-2`}>{task.content}</p>
            <div className="flex flex-wrap gap-2">
              {task.assignee && (
                <div className={`flex items-center gap-1 ${theme.textMuted} text-xs`}>
                  <User size={12} />
                  <span>{task.assignee}</span>
                </div>
              )}
              {task.deadline && (
                <div className={`flex items-center gap-1 ${isOverdue() ? 'text-red-400' : theme.textMuted} text-xs`}>
                  <Clock size={12} />
                  <span>{formatDeadline(task.deadline)}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isEditing) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className={`${theme.bgTertiary} rounded-xl p-4 shadow-lg border-2 border-sky-500 animate-in fade-in zoom-in-95 duration-200`}
      >
        <div className="space-y-2">
          <textarea
            ref={contentInputRef}
            value={editedContent}
            onChange={(e) => setEditedContent(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && e.ctrlKey) handleSave();
              if (e.key === 'Escape') handleCancel();
            }}
            className={`w-full ${theme.text} ${theme.bg} border ${theme.border} focus:border-sky-500 rounded px-2 py-1 outline-none text-sm resize-none`}
            rows={3}
          />
          
          <div className="flex items-center gap-2">
            <User size={14} className={theme.textMuted} />
            <input
              type="text"
              value={editedAssignee}
              onChange={(e) => setEditedAssignee(e.target.value)}
              placeholder="Người thực hiện..."
              className={`flex-1 ${theme.text} ${theme.bg} border ${theme.border} focus:border-sky-500 rounded px-2 py-1 outline-none text-xs`}
            />
          </div>

          <div className={`flex items-center gap-2 theme-${currentTheme}`}>
            <Calendar size={14} className={theme.textMuted} />
            <DatePicker
              selected={editedDeadline}
              onChange={(date) => setEditedDeadline(date)}
              dateFormat="dd/MM/yyyy"
              placeholderText="Chọn hạn..."
              isClearable
              wrapperClassName="flex-1"
              className={`w-full ${theme.text} ${theme.bg} border ${theme.border} focus:border-sky-500 rounded px-2 py-1 outline-none text-xs cursor-pointer`}
              calendarClassName={`theme-${currentTheme}`}
              minDate={new Date()}
            />
          </div>

          <div className="flex items-center gap-2 justify-end">
            <button
              onClick={handleSave}
              className={`px-3 py-1 ${theme.accent} ${theme.accentButtonText} rounded text-xs font-medium hover:opacity-80`}
            >
              Lưu
            </button>
            <button
              onClick={handleCancel}
              className={`px-3 py-1 ${theme.bgSecondary} ${theme.text} rounded text-xs font-medium hover:opacity-80`}
            >
              Hủy
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`${theme.bgTertiary} rounded-xl p-4 shadow-md hover:shadow-xl transition-all duration-300 group cursor-grab active:cursor-grabbing border-2 ${theme.border} hover:border-sky-400 hover:scale-[1.01] relative z-0`}
    >
      <div className="flex items-start gap-2">
        <GripVertical size={16} className={`${theme.textMuted} flex-shrink-0 mt-0.5`} />

        <div className="flex-1 min-w-0">
          <p className={`${theme.text} text-sm mb-2 break-words`}>
            {task.content}
          </p>
          
          <div className="flex flex-wrap gap-2">
            {task.assignee && (
              <div className={`flex items-center gap-1 ${theme.textMuted} text-xs`}>
                <User size={12} />
                <span className="truncate">{task.assignee}</span>
              </div>
            )}
            {task.deadline && (
              <div className={`flex items-center gap-1 ${isOverdue() ? 'text-red-400 font-semibold' : theme.textMuted} text-xs`}>
                <Clock size={12} />
                <span>{formatDeadline(task.deadline)}</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all duration-300 flex-shrink-0">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsEditing(true);
            }}
            className={`p-1.5 ${theme.bgSecondary} hover:${theme.accent} ${theme.textMuted} hover:${theme.accentButtonText} rounded-lg transition-all duration-200 cursor-pointer hover:scale-110`}
            title="Chỉnh sửa"
          >
            <Edit2 size={14} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className={`p-1.5 ${theme.bgSecondary} hover:bg-red-500/20 text-red-400 rounded-lg transition-all duration-200 cursor-pointer hover:scale-110`}
            title="Xóa"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default KanbanCard;
