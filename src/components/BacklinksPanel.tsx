import React, { useEffect } from 'react';
import { useStore } from '../store';
import { findBacklinks } from '../utils/markdown';
import { Link } from 'lucide-react';

export default function BacklinksPanel() {
  const { files, currentFileId, backlinks, setBacklinks, setCurrentFile, openTab } = useStore();
  const currentFile = files.find((f) => f.id === currentFileId);

  useEffect(() => {
    if (currentFile && currentFile.type === 'file') {
      const links = findBacklinks(files, currentFile.name);
      setBacklinks(links);
    } else {
      setBacklinks([]);
    }
  }, [currentFileId, files, currentFile, setBacklinks]);

  const handleBacklinkClick = (fileId: string, fileName: string) => {
    setCurrentFile(fileId);
    openTab(fileId, fileName);
  };

  return (
    <div className="h-full flex flex-col">
      <div className="px-3 py-2 border-b border-[#2a2d3e]">
        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
          Backlinks ({backlinks.length})
        </span>
      </div>
      <div className="flex-1 overflow-y-auto py-1">
        {backlinks.length === 0 ? (
          <div className="px-4 py-8 text-center text-gray-500 text-sm">
            No backlinks found
          </div>
        ) : (
          backlinks.map((backlink, idx) => (
            <div
              key={idx}
              className="px-3 py-2 cursor-pointer hover:bg-[#2a2d3e] rounded mx-1"
              onClick={() => handleBacklinkClick(backlink.fileId, backlink.fileName)}
            >
              <div className="flex items-center gap-2 mb-1">
                <Link size={12} className="text-purple-400" />
                <span className="text-sm text-gray-200 font-medium">
                  {backlink.fileName}
                </span>
              </div>
              <p className="text-xs text-gray-500 line-clamp-2 pl-5">
                {backlink.context}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
