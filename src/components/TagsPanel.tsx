import React, { useState } from 'react';
import { useStore } from '../store';
import { getAllTags } from '../utils/markdown';
import { Hash } from 'lucide-react';

export default function TagsPanel() {
  const { files, setCurrentFile, openTab } = useStore();
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const allTags = getAllTags(files);

  const filteredFiles = selectedTag
    ? files.filter(
        (f) => f.type === 'file' && f.tags?.includes(selectedTag)
      )
    : [];

  const handleFileClick = (fileId: string, fileName: string) => {
    setCurrentFile(fileId);
    openTab(fileId, fileName);
  };

  return (
    <div className="h-full flex flex-col">
      <div className="px-3 py-2 border-b border-[#2a2d3e]">
        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
          Tags
        </span>
      </div>
      <div className="flex-1 overflow-y-auto py-2">
        <div className="px-2 mb-3">
          {allTags.map(({ tag, count }) => (
            <button
              key={tag}
              className={`inline-flex items-center gap-1 px-2 py-1 mr-1 mb-1 rounded-full text-xs transition-colors ${
                selectedTag === tag
                  ? 'bg-purple-600 text-white'
                  : 'bg-[#2a2d3e] text-gray-300 hover:bg-[#3a3d4e]'
              }`}
              onClick={() =>
                setSelectedTag(selectedTag === tag ? null : tag)
              }
            >
              <Hash size={10} />
              {tag}
              <span className="text-gray-500 ml-0.5">{count}</span>
            </button>
          ))}
          {allTags.length === 0 && (
            <p className="text-sm text-gray-500 px-2">No tags found</p>
          )}
        </div>
        {selectedTag && (
          <div className="border-t border-[#2a2d3e] pt-2">
            <p className="px-3 py-1 text-xs text-gray-500">
              Notes tagged #{selectedTag}
            </p>
            {filteredFiles.map((file) => (
              <div
                key={file.id}
                className="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-[#2a2d3e] rounded mx-1"
                onClick={() => handleFileClick(file.id, file.name)}
              >
                <Hash size={12} className="text-purple-400" />
                <span className="text-sm text-gray-200">{file.name}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
