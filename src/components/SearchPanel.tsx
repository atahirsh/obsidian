import React, { useState } from 'react';
import { useStore } from '../store';
import { searchFiles } from '../utils/markdown';
import { FileText, Search } from 'lucide-react';

export default function SearchPanel() {
  const { files, setCurrentFile, openTab } = useStore();
  const [query, setQuery] = useState('');
  const results = searchFiles(files, query);

  const handleFileClick = (fileId: string, fileName: string) => {
    setCurrentFile(fileId);
    openTab(fileId, fileName);
  };

  return (
    <div className="h-full flex flex-col">
      <div className="px-3 py-2 border-b border-[#2a2d3e]">
        <div className="flex items-center gap-2 bg-[#2a2d3e] rounded-lg px-3 py-2">
          <Search size={14} className="text-gray-500" />
          <input
            type="text"
            className="flex-1 bg-transparent text-white text-sm outline-none placeholder-gray-500"
            placeholder="Search notes..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
          />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto py-1">
        {query && results.length === 0 && (
          <div className="px-4 py-8 text-center text-gray-500 text-sm">
            No results found
          </div>
        )}
        {results.map((file) => (
          <div
            key={file.id}
            className="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-[#2a2d3e] rounded mx-1"
            onClick={() => handleFileClick(file.id, file.name)}
          >
            <FileText size={14} className="text-blue-400 flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-sm text-gray-200 truncate">{file.name}</p>
              <p className="text-xs text-gray-500 truncate">
                {file.content?.substring(0, 80)}...
              </p>
            </div>
          </div>
        ))}
        {!query && (
          <div className="px-4 py-8 text-center text-gray-500 text-sm">
            Type to search your vault
          </div>
        )}
      </div>
    </div>
  );
}
