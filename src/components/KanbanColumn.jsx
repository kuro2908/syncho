// src/components/KanbanColumn.jsx
import { useState, useRef, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Plus, Trash2, GripVertical, Edit2, Check, X } from 'lucide-react';
import KanbanCard from './KanbanCard';

function KanbanColumn({ column, tasks, onAddTask, onDeleteColumn, onUpdateTitle, onDeleteTask, onUpdateTask, newTaskId }) {
  const { theme } = useTheme();
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState(column.title);
  const titleInputRef = useRef(null);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: column.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  useEffect(() => {
    if (isEditingTitle && titleInputRef.current) {
      titleInputRef.current.focus();
      titleInputRef.current.select();
    }
  }, [isEditingTitle]);

  const handleSaveTitle = () => {
    if (editedTitle.trim()) {
      onUpdateTitle(editedTitle.trim());
    }
    setIsEditingTitle(false);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`${theme.bgSecondary} rounded-xl p-5 w-80 flex-shrink-0 flex flex-col h-full shadow-lg border-2 ${theme.border} transition-all duration-300 hover:shadow-xl relative z-10`}
    >
      {/* Column Header */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2 flex-1">
            <button
              {...attributes}
              {...listeners}
              className={`cursor-grab active:cursor-grabbing ${theme.textMuted} hover:${theme.text} transition-all duration-200 hover:scale-110`}
            >
              <GripVertical size={20} />
            </button>
            
            {isEditingTitle ? (
              <div className="flex items-center gap-2 flex-1">
                <input
                  ref={titleInputRef}
                  type="text"
                  value={editedTitle}
                  onChange={(e) => setEditedTitle(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSaveTitle();
                    if (e.key === 'Escape') {
                      setEditedTitle(column.title);
                      setIsEditingTitle(false);
                    }
                  }}
                  className={`flex-1 font-bold ${theme.text} ${theme.bgTertiary} border-2 ${theme.border} focus:border-sky-500 rounded px-2 py-1 outline-none text-sm`}
                />
                <button
                  onClick={handleSaveTitle}
                  className={`p-1 ${theme.accent} text-white rounded hover:opacity-80`}
                >
                  <Check size={16} />
                </button>
                <button
                  onClick={() => {
                    setEditedTitle(column.title);
                    setIsEditingTitle(false);
                  }}
                  className={`p-1 ${theme.bgTertiary} ${theme.text} rounded hover:opacity-80`}
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 flex-1 group">
                <h3 className={`font-bold ${theme.text} text-sm uppercase tracking-wider`}>
                  {column.title}
                </h3>
                <button
                  onClick={() => setIsEditingTitle(true)}
                  className={`p-1 ${theme.bgTertiary} ${theme.textMuted} rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200 hover:${theme.accentText} hover:scale-110`}
                >
                  <Edit2 size={14} />
                </button>
              </div>
            )}
          </div>

          <button
            onClick={onDeleteColumn}
            className={`p-1.5 ${theme.bgTertiary} hover:bg-red-500/20 text-red-400 rounded-lg transition-all duration-200 hover:scale-110`}
            title="Xóa cột"
          >
            <Trash2 size={16} />
          </button>
        </div>

        <div className={`flex items-center justify-between ${theme.textMuted} text-xs`}>
          <div className={`px-2 py-1 ${theme.bgTertiary} rounded-full`}>
            <span className="font-medium">{tasks.length} thẻ</span>
          </div>
        </div>
      </div>

      {/* Tasks List */}
      <div className="flex-1 overflow-y-auto space-y-3 mb-4 min-h-[100px] px-1 custom-scrollbar relative z-0">
        <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
          {tasks.map((task) => (
            <KanbanCard
              key={task.id}
              task={task}
              onDelete={() => onDeleteTask(task.id)}
              onUpdate={(updates) => onUpdateTask(task.id, updates)}
              autoEdit={task.id === newTaskId}
            />
          ))}
        </SortableContext>
      </div>

      {/* Add Task Button */}
      <button
        onClick={onAddTask}
        className={`w-full flex items-center justify-center gap-2 ${theme.bgTertiary} hover:${theme.accent} ${theme.textMuted} hover:text-white px-4 py-2.5 rounded-xl transition-all duration-300 text-sm font-semibold hover:scale-[1.02] hover:shadow-md`}
      >
        <Plus size={18} />
        <span>Thêm thẻ</span>
      </button>
    </div>
  );
}

export default KanbanColumn;
