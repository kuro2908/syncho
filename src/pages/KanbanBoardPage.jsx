// src/pages/KanbanBoardPage.jsx
import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, onSnapshot, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { useTheme } from '../contexts/ThemeContext';
import { useToast } from '../contexts/ToastContext';
import '../styles/kanban-custom.css';
import { 
  DndContext, 
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  horizontalListSortingStrategy,
} from '@dnd-kit/sortable';
import { ArrowLeft, Plus, Trash2, GripVertical, X, Edit2, Check } from 'lucide-react';
import KanbanColumn from '../components/KanbanColumn';
import KanbanCard from '../components/KanbanCard';

function KanbanBoardPage() {
  const { synchoId, boardId } = useParams();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { showToast } = useToast();
  const [boardData, setBoardData] = useState(null);
  const [activeId, setActiveId] = useState(null);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState('');
  const [newTaskId, setNewTaskId] = useState(null);
  const [showDeleteColumnConfirm, setShowDeleteColumnConfirm] = useState(false);
  const [columnToDelete, setColumnToDelete] = useState(null);
  const titleInputRef = useRef(null);
  const boardContentRef = useRef(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Fetch board data
  useEffect(() => {
    if (!synchoId || !boardId) return;

    const boardRef = doc(db, 'storages', synchoId, 'items', boardId);
    const unsubscribe = onSnapshot(
      boardRef,
      (doc) => {
        if (doc.exists()) {
          const data = { id: doc.id, ...doc.data() };
          setBoardData(data);
          setEditedTitle(data.title || '');
        } else {
          navigate(`/s/${synchoId}/kanban`, { replace: true });
        }
      },
      (error) => {
        console.error('Error fetching board:', error);
        navigate(`/s/${synchoId}/kanban`, { replace: true });
      }
    );

    return () => unsubscribe();
  }, [synchoId, boardId, navigate]);

  // Handle horizontal scroll with mouse wheel
  useEffect(() => {
    const boardContent = boardContentRef.current;
    if (!boardContent) return;

    const handleWheel = (e) => {
      // Only handle if scrolling vertically (deltaY) and there's horizontal scroll space
      if (e.deltaY !== 0 && boardContent.scrollWidth > boardContent.clientWidth) {
        e.preventDefault();
        boardContent.scrollLeft += e.deltaY;
      }
    };

    boardContent.addEventListener('wheel', handleWheel, { passive: false });
    return () => boardContent.removeEventListener('wheel', handleWheel);
  }, [boardData]);

  // Auto-focus title input when editing
  useEffect(() => {
    if (isEditingTitle && titleInputRef.current) {
      titleInputRef.current.focus();
      titleInputRef.current.select();
    }
  }, [isEditingTitle]);

  // Save board data to Firestore
  const saveBoardData = async (updatedData) => {
    try {
      const boardRef = doc(db, 'storages', synchoId, 'items', boardId);
      await updateDoc(boardRef, {
        ...updatedData,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error saving board:', error);
    }
  };

  // Handle drag start
  const handleDragStart = (event) => {
    setActiveId(event.active.id);
  };

  // Handle drag end
  const handleDragEnd = (event) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over || active.id === over.id) return;

    const activeId = active.id;
    const overId = over.id;

    // Check if dragging a column
    if (boardData.columnOrder.includes(activeId)) {
      const oldIndex = boardData.columnOrder.indexOf(activeId);
      const newIndex = boardData.columnOrder.indexOf(overId);

      if (oldIndex !== newIndex) {
        const newColumnOrder = arrayMove(boardData.columnOrder, oldIndex, newIndex);
        const updatedData = {
          ...boardData,
          columnOrder: newColumnOrder
        };
        setBoardData(updatedData);
        saveBoardData({ columnOrder: newColumnOrder });
      }
      return;
    }

    // Dragging a task
    const activeTask = boardData.tasks[activeId];
    if (!activeTask) return;

    // Find source and destination columns
    let sourceColumn = null;
    let destColumn = null;

    for (const colId of boardData.columnOrder) {
      const column = boardData.columns[colId];
      if (column.taskIds.includes(activeId)) {
        sourceColumn = column;
      }
      if (colId === overId || column.taskIds.includes(overId)) {
        destColumn = column;
      }
    }

    if (!sourceColumn || !destColumn) return;

    // Moving within the same column
    if (sourceColumn.id === destColumn.id) {
      const oldIndex = sourceColumn.taskIds.indexOf(activeId);
      const newIndex = sourceColumn.taskIds.indexOf(overId);

      if (oldIndex !== newIndex) {
        const newTaskIds = arrayMove(sourceColumn.taskIds, oldIndex, newIndex);
        const updatedColumns = {
          ...boardData.columns,
          [sourceColumn.id]: {
            ...sourceColumn,
            taskIds: newTaskIds
          }
        };
        const updatedData = {
          ...boardData,
          columns: updatedColumns
        };
        setBoardData(updatedData);
        saveBoardData({ columns: updatedColumns });
      }
    } else {
      // Moving to a different column
      const sourceTaskIds = sourceColumn.taskIds.filter(id => id !== activeId);
      
      let destTaskIds;
      if (destColumn.taskIds.includes(overId)) {
        const overIndex = destColumn.taskIds.indexOf(overId);
        destTaskIds = [...destColumn.taskIds];
        destTaskIds.splice(overIndex, 0, activeId);
      } else {
        destTaskIds = [...destColumn.taskIds, activeId];
      }

      const updatedColumns = {
        ...boardData.columns,
        [sourceColumn.id]: {
          ...sourceColumn,
          taskIds: sourceTaskIds
        },
        [destColumn.id]: {
          ...destColumn,
          taskIds: destTaskIds
        }
      };

      const updatedData = {
        ...boardData,
        columns: updatedColumns
      };
      setBoardData(updatedData);
      saveBoardData({ columns: updatedColumns });
    }
  };

  // Add new column
  const handleAddColumn = () => {
    const newColumnId = `column-${Date.now()}`;
    const newColumn = {
      id: newColumnId,
      title: "Cột mới",
      taskIds: []
    };

    const updatedData = {
      columns: {
        ...boardData.columns,
        [newColumnId]: newColumn
      },
      columnOrder: [...boardData.columnOrder, newColumnId]
    };

    setBoardData({
      ...boardData,
      ...updatedData
    });
    saveBoardData(updatedData);
  };

  // Delete column
  const handleDeleteColumn = (columnId) => {
    const column = boardData.columns[columnId];
    setColumnToDelete({ id: columnId, column });
    setShowDeleteColumnConfirm(true);
  };

  const confirmDeleteColumn = async () => {
    if (!columnToDelete) return;

    try {
      const { id: columnId, column } = columnToDelete;
      const updatedTasks = { ...boardData.tasks };
      
      // Delete all tasks in the column
      column.taskIds.forEach(taskId => {
        delete updatedTasks[taskId];
      });

      const updatedColumns = { ...boardData.columns };
      delete updatedColumns[columnId];

      const updatedColumnOrder = boardData.columnOrder.filter(id => id !== columnId);

      const updatedData = {
        tasks: updatedTasks,
        columns: updatedColumns,
        columnOrder: updatedColumnOrder
      };

      setBoardData({
        ...boardData,
        ...updatedData
      });
      await saveBoardData(updatedData);
      showToast('Đã xóa cột thành công!', 'success');
      setShowDeleteColumnConfirm(false);
      setColumnToDelete(null);
    } catch (error) {
      console.error('Error deleting column:', error);
      showToast('Có lỗi xảy ra khi xóa cột!', 'error');
    }
  };

  const cancelDeleteColumn = () => {
    setShowDeleteColumnConfirm(false);
    setColumnToDelete(null);
  };

  // Update column title
  const handleUpdateColumnTitle = (columnId, newTitle) => {
    const updatedColumns = {
      ...boardData.columns,
      [columnId]: {
        ...boardData.columns[columnId],
        title: newTitle
      }
    };

    setBoardData({
      ...boardData,
      columns: updatedColumns
    });
    saveBoardData({ columns: updatedColumns });
  };

  // Add new task
  const handleAddTask = (columnId) => {
    const taskId = `task-${Date.now()}`;
    const newTask = {
      id: taskId,
      content: "",
      assignee: "",
      deadline: null
    };

    const updatedTasks = {
      ...boardData.tasks,
      [taskId]: newTask
    };

    const updatedColumns = {
      ...boardData.columns,
      [columnId]: {
        ...boardData.columns[columnId],
        taskIds: [...boardData.columns[columnId].taskIds, taskId]
      }
    };

    const updatedData = {
      tasks: updatedTasks,
      columns: updatedColumns
    };

    setBoardData({
      ...boardData,
      ...updatedData
    });
    setNewTaskId(taskId);
    saveBoardData(updatedData);
  };

  // Delete task
  const handleDeleteTask = (taskId, columnId) => {
    const updatedTasks = { ...boardData.tasks };
    delete updatedTasks[taskId];

    const updatedColumns = {
      ...boardData.columns,
      [columnId]: {
        ...boardData.columns[columnId],
        taskIds: boardData.columns[columnId].taskIds.filter(id => id !== taskId)
      }
    };

    const updatedData = {
      tasks: updatedTasks,
      columns: updatedColumns
    };

    setBoardData({
      ...boardData,
      ...updatedData
    });
    saveBoardData(updatedData);
  };

  // Update task
  const handleUpdateTask = (taskId, updates) => {
    const updatedTasks = {
      ...boardData.tasks,
      [taskId]: {
        ...boardData.tasks[taskId],
        ...updates
      }
    };

    setBoardData({
      ...boardData,
      tasks: updatedTasks
    });
    saveBoardData({ tasks: updatedTasks });
    
    // Clear newTaskId after first update
    if (newTaskId === taskId) {
      setNewTaskId(null);
    }
  };

  // Handle title save
  const handleSaveTitle = () => {
    if (editedTitle.trim()) {
      saveBoardData({ title: editedTitle.trim() });
    }
    setIsEditingTitle(false);
  };

  if (!boardData) {
    return (
      <div className={`min-h-screen ${theme.bg} flex items-center justify-center p-8`}>
        <div className="animate-pulse space-y-4">
          <div className={`h-8 ${theme.bgSecondary} rounded w-64`}></div>
          <div className="flex gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className={`w-80 h-96 ${theme.bgSecondary} rounded-lg`}></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const activeTask = activeId && boardData.tasks[activeId] ? boardData.tasks[activeId] : null;

  return (
    <div className={`h-screen ${theme.bg} flex flex-col overflow-hidden`}>
      {/* Header */}
      <div className={`border-b ${theme.border} ${theme.bgSecondary} z-40 shadow-xl backdrop-blur-sm bg-opacity-95 flex-shrink-0`}>
        <div className="px-8 py-5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(`/s/${synchoId}/kanban`)}
              className={`${theme.textMuted} hover:${theme.accentText} transition-all duration-200 hover:scale-110 p-2 rounded-lg hover:${theme.bgTertiary}`}
            >
              <ArrowLeft size={24} />
            </button>
            
            {isEditingTitle ? (
              <div className="flex items-center gap-2">
                <input
                  ref={titleInputRef}
                  type="text"
                  value={editedTitle}
                  onChange={(e) => setEditedTitle(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSaveTitle();
                    if (e.key === 'Escape') {
                      setEditedTitle(boardData.title);
                      setIsEditingTitle(false);
                    }
                  }}
                  className={`text-2xl font-bold ${theme.text} ${theme.bg} border-2 ${theme.border} focus:border-sky-500 rounded px-3 py-1 outline-none`}
                />
                <button
                  onClick={handleSaveTitle}
                  className={`p-2 ${theme.accent} ${theme.accentButtonText} rounded-lg hover:opacity-80 transition-all duration-200 hover:scale-105`}
                >
                  <Check size={20} />
                </button>
                <button
                  onClick={() => {
                    setEditedTitle(boardData.title);
                    setIsEditingTitle(false);
                  }}
                  className={`p-2 ${theme.bgTertiary} ${theme.text} rounded-lg hover:opacity-80 transition-all duration-200`}
                >
                  <X size={20} />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 group">
                <h1 className={`text-2xl font-bold ${theme.text}`}>
                  {boardData.title || 'Bảng không có tiêu đề'}
                </h1>
                <button
                  onClick={() => setIsEditingTitle(true)}
                  className={`p-2 ${theme.bgTertiary} ${theme.textMuted} rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300 hover:${theme.accentText} hover:scale-110`}
                >
                  <Edit2 size={16} />
                </button>
              </div>
            )}
          </div>

          <button
            onClick={handleAddColumn}
            className={`flex items-center gap-2 ${theme.accent} ${theme.accentHover} ${theme.accentButtonText} px-5 py-2.5 rounded-xl font-semibold transition-all duration-300 hover:scale-105 hover:shadow-lg`}
          >
            <Plus size={20} />
            <span>Thêm cột</span>
          </button>
        </div>
      </div>

      {/* Board Content */}
      <div ref={boardContentRef} className="flex-1 overflow-x-auto overflow-y-hidden custom-scrollbar p-8">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="flex gap-6 h-full pb-4">
            <SortableContext
              items={boardData.columnOrder}
              strategy={horizontalListSortingStrategy}
            >
              {boardData.columnOrder.map((columnId) => {
                const column = boardData.columns[columnId];
                const tasks = column.taskIds.map(taskId => boardData.tasks[taskId]).filter(Boolean);

                return (
                  <KanbanColumn
                    key={column.id}
                    column={column}
                    tasks={tasks}
                    onAddTask={() => handleAddTask(column.id)}
                    onDeleteColumn={() => handleDeleteColumn(column.id)}
                    onUpdateTitle={(newTitle) => handleUpdateColumnTitle(column.id, newTitle)}
                    onDeleteTask={(taskId) => handleDeleteTask(taskId, column.id)}
                    onUpdateTask={handleUpdateTask}
                    newTaskId={newTaskId}
                  />
                );
              })}
            </SortableContext>
          </div>

          <DragOverlay>
            {activeTask ? (
              <div className="rotate-6 scale-110 drag-overlay">
                <KanbanCard task={activeTask} isDragging />
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>

      {/* Delete Column Confirmation Modal */}
      {showDeleteColumnConfirm && columnToDelete && (
        <div 
          className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200"
          onClick={cancelDeleteColumn}
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
                <h3 className={`text-2xl font-bold ${theme.text} mb-2`}>Xóa cột?</h3>
                <p className={`${theme.textMuted} text-sm`}>Hành động này không thể hoàn tác</p>
              </div>
            </div>
            
            <p className={`${theme.textSecondary} mb-8 leading-relaxed`}>
              Bạn có chắc chắn muốn xóa cột{' '}
              <span className={`font-bold ${theme.text}`}>"{columnToDelete.column.title || 'Không có tiêu đề'}"</span>?
              <br />
              <span className="text-red-400 font-semibold">Tất cả {columnToDelete.column.taskIds.length} thẻ trong cột sẽ bị xóa.</span>
            </p>
            
            <div className="flex gap-3">
              <button
                onClick={cancelDeleteColumn}
                className={`flex-1 px-6 py-3 ${theme.bgTertiary} hover:opacity-80 ${theme.text} rounded-xl font-semibold transition-all duration-200 hover:scale-105`}
              >
                Hủy
              </button>
              <button
                onClick={confirmDeleteColumn}
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

export default KanbanBoardPage;
