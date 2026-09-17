import React, { useRef, useEffect, useCallback } from 'react';
import { useStore } from '../store';
import { extractTags } from '../utils/markdown';

export default function Editor() {
  const { files, currentFileId, updateFile } = useStore();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const currentFile = files.find((f) => f.id === currentFileId);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      if (currentFileId) {
        const content = e.target.value;
        const tags = extractTags(content);
        updateFile(currentFileId, { content, tags });
      }
    },
    [currentFileId, updateFile]
  );

  useEffect(() => {
    if (textareaRef.current && currentFile) {
      textareaRef.current.value = currentFile.content || '';
    }
  }, [currentFileId]);

  // Handle tab key
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const textarea = e.currentTarget;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const value = textarea.value;
      const newValue = value.substring(0, start) + '  ' + value.substring(end);
      textarea.value = newValue;
      textarea.selectionStart = textarea.selectionEnd = start + 2;
      if (currentFileId) {
        updateFile(currentFileId, { content: newValue, tags: extractTags(newValue) });
      }
    }
  };

  if (!currentFile || currentFile.type === 'folder') {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#1e1e2e]">
        <div className="text-center text-gray-500">
          <p className="text-lg">Select a file to start editing</p>
          <p className="text-sm mt-2">Use Ctrl+P to open the command palette</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 h-full bg-[#1e1e2e]">
      <textarea
        ref={textareaRef}
        className="w-full h-full bg-transparent text-gray-200 p-6 resize-none outline-none font-mono text-sm leading-relaxed"
        defaultValue={currentFile.content || ''}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder="Start writing in Markdown..."
        spellCheck={false}
      />
    </div>
  );
}
