import React, { useEffect } from 'react';
import { useStore } from './store';
import Sidebar from './components/Sidebar';
import Toolbar from './components/Toolbar';
import TabBar from './components/TabBar';
import Editor from './components/Editor';
import Preview from './components/Preview';
import GraphView from './components/GraphView';
import CommandPalette from './components/CommandPalette';
import SearchPanel from './components/SearchPanel';
import BacklinksPanel from './components/BacklinksPanel';
import TagsPanel from './components/TagsPanel';
import GoogleDriveSync from './components/GoogleDriveSync';
import StatusBar from './components/StatusBar';

function App() {
  const {
    sidebarOpen,
    sidebarView,
    rightPanelOpen,
    viewMode,
    graphViewOpen,
    setCommandPaletteOpen,
    files,
    setFiles,
  } = useStore();

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('obsidian-vault');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        if (Array.isArray(data) && data.length > 0) {
          setFiles(data);
        }
      } catch (e) {
        console.error('Failed to load vault from localStorage');
      }
    }
  }, [setFiles]);

  // Save to localStorage on changes
  useEffect(() => {
    const timer = setTimeout(() => {
      localStorage.setItem('obsidian-vault', JSON.stringify(files));
    }, 500);
    return () => clearTimeout(timer);
  }, [files]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+P - Command Palette
      if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
        e.preventDefault();
        setCommandPaletteOpen(true);
      }
      // Ctrl+S - Save (prevent default)
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        localStorage.setItem('obsidian-vault', JSON.stringify(files));
      }
      // Ctrl+N - New Note
      if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault();
        // Will be handled by command palette
        setCommandPaletteOpen(true);
      }
      // Escape - Close modals
      if (e.key === 'Escape') {
        setCommandPaletteOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setCommandPaletteOpen, files]);

  const renderSidebarContent = () => {
    switch (sidebarView) {
      case 'search':
        return <SearchPanel />;
      case 'tags':
        return <TagsPanel />;
      case 'backlinks':
        return <BacklinksPanel />;
      default:
        return <Sidebar />;
    }
  };

  const renderRightPanel = () => {
    return <GoogleDriveSync />;
  };

  const renderEditorArea = () => {
    switch (viewMode) {
      case 'edit':
        return <Editor />;
      case 'preview':
        return <Preview />;
      case 'split':
        return (
          <div className="flex-1 flex h-full">
            <div className="flex-1 border-r border-[#2a2d3e]">
              <Editor />
            </div>
            <div className="flex-1">
              <Preview />
            </div>
          </div>
        );
    }
  };

  return (
    <div className="h-screen w-screen flex flex-col bg-[#1e1e2e] text-white overflow-hidden">
      {/* Toolbar */}
      <Toolbar />

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar */}
        {sidebarOpen && (
          <div className="w-64 flex-shrink-0 border-r border-[#2a2d3e]">
            {renderSidebarContent()}
          </div>
        )}

        {/* Editor Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <TabBar />
          <div className="flex-1 flex overflow-hidden">
            {renderEditorArea()}
          </div>
        </div>

        {/* Right Panel */}
        {rightPanelOpen && (
          <div className="w-72 flex-shrink-0 border-l border-[#2a2d3e]">
            {renderRightPanel()}
          </div>
        )}
      </div>

      {/* Status Bar */}
      <StatusBar />

      {/* Overlays */}
      <CommandPalette />
      {graphViewOpen && <GraphView />}
    </div>
  );
}

export default App;
