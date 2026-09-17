import React from 'react';
import { useStore } from '../store';
import { X } from 'lucide-react';

export default function TabBar() {
  const { tabs, setActiveTab, closeTab } = useStore();

  if (tabs.length === 0) return null;

  return (
    <div className="flex items-center bg-[#181825] border-b border-[#2a2d3e] overflow-x-auto">
      {tabs.map((tab) => (
        <div
          key={tab.id}
          className={`flex items-center gap-2 px-4 py-2 cursor-pointer border-r border-[#2a2d3e] min-w-0 max-w-[200px] group ${
            tab.isActive
              ? 'bg-[#1e1e2e] text-white border-t-2 border-t-purple-500'
              : 'text-gray-400 hover:bg-[#1e1e2e]/50'
          }`}
          onClick={() => setActiveTab(tab.id)}
        >
          <span className="truncate text-sm">{tab.fileName}</span>
          <button
            className="opacity-0 group-hover:opacity-100 p-0.5 hover:bg-[#2a2d3e] rounded transition-opacity flex-shrink-0"
            onClick={(e) => {
              e.stopPropagation();
              closeTab(tab.id);
            }}
          >
            <X size={12} />
          </button>
        </div>
      ))}
    </div>
  );
}
