import React from 'react';
import { useStore } from '../store';
import { formatDate } from '../utils/markdown';

export default function StatusBar() {
  const { files, currentFileId, syncStatus } = useStore();
  const currentFile = files.find((f) => f.id === currentFileId);

  const fileCount = files.filter((f) => f.type === 'file').length;
  const wordCount = currentFile?.content
    ? currentFile.content.split(/\s+/).filter(Boolean).length
    : 0;
  const charCount = currentFile?.content?.length || 0;

  return (
    <div className="flex items-center justify-between h-6 bg-[#181825] border-t border-[#2a2d3e] px-3 text-xs text-gray-500">
      <div className="flex items-center gap-4">
        <span>{fileCount} notes</span>
        {currentFile && currentFile.type === 'file' && (
          <>
            <span>{wordCount} words</span>
            <span>{charCount} chars</span>
          </>
        )}
      </div>
      <div className="flex items-center gap-4">
        {currentFile && (
          <span>
            Modified: {formatDate(currentFile.updatedAt)}
          </span>
        )}
        {syncStatus.isConnected && (
          <span className="text-green-500">● Synced</span>
        )}
      </div>
    </div>
  );
}
