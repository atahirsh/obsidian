import React from 'react';
import { useStore } from '../store';
import {
  PanelLeft,
  PanelRight,
  Columns,
  Eye,
  Edit3,
  GitBranch,
  Search,
  Hash,
  Link,
  Cloud,
  FolderOpen,
  Command,
} from 'lucide-react';
import { SidebarView } from '../types';

export default function Toolbar() {
  const {
    sidebarOpen,
    toggleSidebar,
    rightPanelOpen,
    toggleRightPanel,
    viewMode,
    setViewMode,
    setGraphViewOpen,
    sidebarView,
    setSidebarView,
    setCommandPaletteOpen,
    syncStatus,
  } = useStore();

  const sidebarButtons: { view: SidebarView; icon: React.ReactNode; label: string }[] = [
    { view: 'files', icon: <FolderOpen size={16} />, label: 'File Explorer' },
    { view: 'search', icon: <Search size={16} />, label: 'Search' },
    { view: 'graph', icon: <GitBranch size={16} />, label: 'Graph View' },
    { view: 'tags', icon: <Hash size={16} />, label: 'Tags' },
    { view: 'backlinks', icon: <Link size={16} />, label: 'Backlinks' },
  ];

  const handleSidebarButtonClick = (view: SidebarView) => {
    if (view === 'graph') {
      setGraphViewOpen(true);
    } else {
      setSidebarView(view);
      if (!sidebarOpen) toggleSidebar();
    }
  };

  return (
    <div className="flex items-center h-10 bg-[#181825] border-b border-[#2a2d3e] px-2">
      {/* Left section - Sidebar controls */}
      <div className="flex items-center gap-1">
        <button
          onClick={toggleSidebar}
          className={`p-1.5 rounded transition-colors ${
            sidebarOpen ? 'bg-[#2a2d3e] text-white' : 'text-gray-400 hover:text-gray-200'
          }`}
          title="Toggle Sidebar"
        >
          <PanelLeft size={16} />
        </button>
        {sidebarButtons.map(({ view, icon, label }) => (
          <button
            key={view}
            onClick={() => handleSidebarButtonClick(view)}
            className={`p-1.5 rounded transition-colors ${
              sidebarView === view && sidebarOpen
                ? 'bg-purple-600/20 text-purple-400'
                : 'text-gray-400 hover:text-gray-200 hover:bg-[#2a2d3e]'
            }`}
            title={label}
          >
            {icon}
          </button>
        ))}
      </div>

      {/* Center section - View mode */}
      <div className="flex-1 flex items-center justify-center gap-1">
        <button
          onClick={() => setViewMode('edit')}
          className={`p-1.5 rounded transition-colors ${
            viewMode === 'edit'
              ? 'bg-purple-600/20 text-purple-400'
              : 'text-gray-400 hover:text-gray-200 hover:bg-[#2a2d3e]'
          }`}
          title="Edit Mode"
        >
          <Edit3 size={16} />
        </button>
        <button
          onClick={() => setViewMode('split')}
          className={`p-1.5 rounded transition-colors ${
            viewMode === 'split'
              ? 'bg-purple-600/20 text-purple-400'
              : 'text-gray-400 hover:text-gray-200 hover:bg-[#2a2d3e]'
          }`}
          title="Split Mode"
        >
          <Columns size={16} />
        </button>
        <button
          onClick={() => setViewMode('preview')}
          className={`p-1.5 rounded transition-colors ${
            viewMode === 'preview'
              ? 'bg-purple-600/20 text-purple-400'
              : 'text-gray-400 hover:text-gray-200 hover:bg-[#2a2d3e]'
          }`}
          title="Preview Mode"
        >
          <Eye size={16} />
        </button>
      </div>

      {/* Right section */}
      <div className="flex items-center gap-1">
        <button
          onClick={() => setCommandPaletteOpen(true)}
          className="p-1.5 rounded text-gray-400 hover:text-gray-200 hover:bg-[#2a2d3e] transition-colors"
          title="Command Palette (Ctrl+P)"
        >
          <Command size={16} />
        </button>
        <div
          className={`p-1.5 rounded ${
            syncStatus.isConnected ? 'text-green-400' : 'text-gray-500'
          }`}
          title={syncStatus.isConnected ? 'Connected to Google Drive' : 'Not connected'}
        >
          <Cloud size={16} />
        </div>
        <button
          onClick={toggleRightPanel}
          className={`p-1.5 rounded transition-colors ${
            rightPanelOpen ? 'bg-[#2a2d3e] text-white' : 'text-gray-400 hover:text-gray-200'
          }`}
          title="Toggle Right Panel"
        >
          <PanelRight size={16} />
        </button>
      </div>
    </div>
  );
}
