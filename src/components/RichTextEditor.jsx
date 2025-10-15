import React, { useState, useRef, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Type,
  Palette,
  AlignLeft,
  AlignCenter,
  AlignRight,
  List,
  ListOrdered
} from 'lucide-react';

const RichTextEditor = ({ value, onChange, placeholder }) => {
  const { theme, currentTheme } = useTheme();
  const editorRef = useRef(null);
  const [showToolbar, setShowToolbar] = useState(false);
  const [toolbarPosition, setToolbarPosition] = useState({ top: 0, left: 0 });
  const [selectedText, setSelectedText] = useState('');
  const [showColorPicker, setShowColorPicker] = useState(false);
  // Set default caret color based on theme: black for light mode, white for dark modes
  const [currentColor, setCurrentColor] = useState(currentTheme === 'light' ? '#000000' : '#ffffff');
  const [activeFormats, setActiveFormats] = useState({
    bold: false,
    italic: false,
    underline: false,
    strikeThrough: false,
    justifyLeft: false,
    justifyCenter: false,
    justifyRight: false,
    insertUnorderedList: false,
    insertOrderedList: false
  });

  // Font sizes
  const fontSizes = ['12px', '14px', '16px', '18px', '20px', '24px', '28px', '32px', '36px'];
  
  // Colors - adapt based on theme
  const colors = currentTheme === 'light' 
    ? ['#000000', '#1f2937', '#dc2626', '#16a34a', '#2563eb', '#ca8a04', '#9333ea', '#0891b2', '#ea580c', '#be123c']
    : ['#ffffff', '#e5e7eb', '#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff', '#ff8800', '#8800ff'];

  // Update caret color when theme changes
  useEffect(() => {
    setCurrentColor(currentTheme === 'light' ? '#000000' : '#ffffff');
  }, [currentTheme]);

  // Initialize content
  useEffect(() => {
    if (editorRef.current && value !== undefined && value !== null) {
      // Only update if content is different to avoid cursor jumping
      if (editorRef.current.innerHTML !== value) {
        const selection = window.getSelection();
        const isEditorFocused = editorRef.current.contains(document.activeElement);
        
        if (!isEditorFocused) {
          editorRef.current.innerHTML = value || '';
        }
      }
    }
  }, [value]);

  // Update active formats based on current selection
  const updateActiveFormats = () => {
    setActiveFormats({
      bold: document.queryCommandState('bold'),
      italic: document.queryCommandState('italic'),
      underline: document.queryCommandState('underline'),
      strikeThrough: document.queryCommandState('strikeThrough'),
      justifyLeft: document.queryCommandState('justifyLeft'),
      justifyCenter: document.queryCommandState('justifyCenter'),
      justifyRight: document.queryCommandState('justifyRight'),
      insertUnorderedList: document.queryCommandState('insertUnorderedList'),
      insertOrderedList: document.queryCommandState('insertOrderedList')
    });
  };

  // Handle text selection
  const handleSelection = () => {
    const selection = window.getSelection();
    const text = selection.toString();
    
    // Update active formats whenever selection changes
    if (editorRef.current && editorRef.current.contains(selection.anchorNode)) {
      updateActiveFormats();
    }
    
    if (text.length > 0 && editorRef.current.contains(selection.anchorNode)) {
      setSelectedText(text);
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      const editorRect = editorRef.current.getBoundingClientRect();
      
      setToolbarPosition({
        top: rect.top - editorRect.top - 50,
        left: rect.left - editorRect.left + rect.width / 2
      });
      setShowToolbar(true);
    } else {
      setShowToolbar(false);
    }
  };

  useEffect(() => {
    document.addEventListener('selectionchange', handleSelection);
    return () => {
      document.removeEventListener('selectionchange', handleSelection);
    };
  }, []);

  // Execute formatting command
  const execCommand = (command, value = null) => {
    document.execCommand(command, false, value);
    editorRef.current.focus();
    // Update active formats after command
    setTimeout(updateActiveFormats, 10);
  };

  // Handle content change
  const handleInput = () => {
    if (onChange) {
      onChange(editorRef.current.innerHTML);
    }
  };

  return (
    <div className="relative mb-6 max-w-4xl mx-auto">
      {/* Sticky Toolbar - Always visible when scrolling - Responsive */}
      <div 
        className={`sticky z-30 ${theme.bgSecondary} rounded-xl shadow-lg p-2 md:p-3 backdrop-blur-sm bg-opacity-95 mb-4 w-fit mx-auto`}
        style={{ 
          top: 'calc(var(--header-height, 72px) + 16px)',
          scrollbarWidth: 'thin'
        }}
      >
        <div className="flex items-center gap-0.5 md:gap-1.5 flex-wrap">
          {/* Bold */}
          <button
            onClick={() => execCommand('bold')}
            className={`p-1 md:p-2 ${activeFormats.bold ? theme.accent : theme.bgTertiary} hover:${theme.accent} ${theme.text} rounded-md md:rounded-lg transition-colors ${activeFormats.bold ? 'ring-1 md:ring-2 ring-sky-400' : ''}`}
            title="Bold (Ctrl+B)"
          >
            <Bold className="w-4 h-4 md:w-5 md:h-5" />
          </button>

          {/* Italic */}
          <button
            onClick={() => execCommand('italic')}
            className={`p-1 md:p-2 ${activeFormats.italic ? theme.accent : theme.bgTertiary} hover:${theme.accent} ${theme.text} rounded-md md:rounded-lg transition-colors ${activeFormats.italic ? 'ring-1 md:ring-2 ring-sky-400' : ''}`}
            title="Italic (Ctrl+I)"
          >
            <Italic className="w-4 h-4 md:w-5 md:h-5" />
          </button>

          {/* Underline */}
          <button
            onClick={() => execCommand('underline')}
            className={`p-1 md:p-2 ${activeFormats.underline ? theme.accent : theme.bgTertiary} hover:${theme.accent} ${theme.text} rounded-md md:rounded-lg transition-colors ${activeFormats.underline ? 'ring-1 md:ring-2 ring-sky-400' : ''}`}
            title="Underline (Ctrl+U)"
          >
            <Underline className="w-4 h-4 md:w-5 md:h-5" />
          </button>

          {/* Strikethrough */}
          <button
            onClick={() => execCommand('strikeThrough')}
            className={`p-1 md:p-2 ${activeFormats.strikeThrough ? theme.accent : theme.bgTertiary} hover:${theme.accent} ${theme.text} rounded-md md:rounded-lg transition-colors ${activeFormats.strikeThrough ? 'ring-1 md:ring-2 ring-sky-400' : ''}`}
            title="Strikethrough"
          >
            <Strikethrough className="w-4 h-4 md:w-5 md:h-5" />
          </button>

          <div className={`w-px h-6 ${theme.border} mx-1`}></div>

          {/* Font Size */}
          <select
            onChange={(e) => execCommand('fontSize', e.target.value)}
            className={`px-2 py-1 ${theme.bgTertiary} ${theme.text} rounded-lg text-xs md:text-sm border-none outline-none`}
            title="Font Size"
          >
            <option value="">Size</option>
            {fontSizes.map((size) => (
              <option key={size} value={size.replace('px', '')}>
                {size}
              </option>
            ))}
          </select>

          {/* Font Color */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowColorPicker(!showColorPicker)}
              className={`p-1 md:p-2 ${theme.bgTertiary} hover:${theme.accent} ${theme.text} rounded-md md:rounded-lg transition-colors`}
              title="Text Color"
            >
              <Palette className="w-4 h-4 md:w-5 md:h-5" />
            </button>
            {showColorPicker && (
              <div 
                onMouseLeave={() => setShowColorPicker(false)}
                className={`absolute top-full left-0 mt-2 ${theme.bgSecondary} border-2 ${theme.border} rounded-xl p-4 shadow-2xl z-[100] w-max`}
              >
                <div className="grid grid-cols-5 gap-3">
                  {colors.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        execCommand('foreColor', color);
                        setCurrentColor(color);
                        setShowColorPicker(false);
                      }}
                      className="w-10 h-10 rounded-lg border-2 border-gray-400 hover:scale-110 hover:border-white transition-all cursor-pointer"
                      style={{ backgroundColor: color }}
                      title={color}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className={`w-px h-6 ${theme.border} mx-1`}></div>

          {/* Align Left */}
          <button
            onClick={() => execCommand('justifyLeft')}
            className={`p-1 md:p-2 ${activeFormats.justifyLeft ? theme.accent : theme.bgTertiary} hover:${theme.accent} ${theme.text} rounded-md md:rounded-lg transition-colors ${activeFormats.justifyLeft ? 'ring-1 md:ring-2 ring-sky-400' : ''}`}
            title="Align Left"
          >
            <AlignLeft className="w-4 h-4 md:w-5 md:h-5" />
          </button>

          {/* Align Center */}
          <button
            onClick={() => execCommand('justifyCenter')}
            className={`p-1 md:p-2 ${activeFormats.justifyCenter ? theme.accent : theme.bgTertiary} hover:${theme.accent} ${theme.text} rounded-md md:rounded-lg transition-colors ${activeFormats.justifyCenter ? 'ring-1 md:ring-2 ring-sky-400' : ''}`}
            title="Align Center"
          >
            <AlignCenter className="w-4 h-4 md:w-5 md:h-5" />
          </button>

          {/* Align Right */}
          <button
            onClick={() => execCommand('justifyRight')}
            className={`p-1 md:p-2 ${activeFormats.justifyRight ? theme.accent : theme.bgTertiary} hover:${theme.accent} ${theme.text} rounded-md md:rounded-lg transition-colors ${activeFormats.justifyRight ? 'ring-1 md:ring-2 ring-sky-400' : ''}`}
            title="Align Right"
          >
            <AlignRight className="w-4 h-4 md:w-5 md:h-5" />
          </button>

          <div className={`w-px h-5 md:h-6 ${theme.border} mx-0.5 md:mx-1`}></div>

          {/* Bullet List */}
          <button
            onClick={() => execCommand('insertUnorderedList')}
            className={`p-1 md:p-2 ${activeFormats.insertUnorderedList ? theme.accent : theme.bgTertiary} hover:${theme.accent} ${theme.text} rounded-md md:rounded-lg transition-colors ${activeFormats.insertUnorderedList ? 'ring-1 md:ring-2 ring-sky-400' : ''}`}
            title="Bullet List"
          >
            <List className="w-4 h-4 md:w-5 md:h-5" />
          </button>

          {/* Numbered List */}
          <button
            onClick={() => execCommand('insertOrderedList')}
            className={`p-1 md:p-2 ${activeFormats.insertOrderedList ? theme.accent : theme.bgTertiary} hover:${theme.accent} ${theme.text} rounded-md md:rounded-lg transition-colors ${activeFormats.insertOrderedList ? 'ring-1 md:ring-2 ring-sky-400' : ''}`}
            title="Numbered List"
          >
            <ListOrdered className="w-4 h-4 md:w-5 md:h-5" />
          </button>
        </div>
      </div>

      {/* Editor */}
      <div
        ref={editorRef}
        contentEditable={true}
        onInput={handleInput}
        suppressContentEditableWarning={true}
        className={`w-full min-h-[500px] ${theme.bg} ${theme.text} px-6 py-4 outline-none border-none transition-all editor-content`}
        style={{
          lineHeight: '1.8',
          fontSize: '18px',
          caretColor: currentColor,
          boxShadow: 'none'
        }}
        data-placeholder={placeholder}
      />

      <style>{`
        [contenteditable]:empty:before {
          content: attr(data-placeholder);
          color: #64748b;
          pointer-events: none;
        }
        
        .editor-content {
          caret-color: ${currentColor};
        }
        
        .editor-content:focus {
          outline: none !important;
          border: none !important;
          box-shadow: none !important;
        }
      `}</style>
    </div>
  );
};

export default RichTextEditor;
