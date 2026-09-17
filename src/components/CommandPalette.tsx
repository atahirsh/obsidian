import React, { useState, useEffect, useRef } from 'react';
import { useStore } from '../store';
import { FileNode } from '../types';
import { v4 as uuidv4 } from 'uuid';
import {
  FilePlus,
  FolderPlus,
  Settings,
  Moon,
  Sun,
  Download,
  Upload,
  Search,
  GitBranch,
  Layout,
  Columns,
  Eye,
  Edit3,
  Trash2,
} from 'lucide-react';

interface Command {
  id: string;
  name: string;
  icon: React.ReactNode;
  category: string;
  action: () => void;
}

export default function CommandPalette() {
  const {
    commandPaletteOpen,
    setCommandPaletteOpen,
    files,
    addFile,
    setCurrentFile,
    openTab,
    setViewMode,
    setGraphViewOpen,
    setFiles,
    deleteFile,
    currentFileId,
  } = useStore();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (commandPaletteOpen && inputRef.current) {
      inputRef.current.focus();
    }
    setQuery('');
    setSelectedIndex(0);
  }, [commandPaletteOpen]);

  const commands: Command[] = [
    {
      id: 'new-file',
      name: 'Create New Note',
      icon: <FilePlus size={16} />,
      category: 'File',
      action: () => {
        const newFile: FileNode = {
          id: uuidv4(),
          name: 'Untitled',
          type: 'file',
          content: '# Untitled\n\nStart writing here...\n',
          parentId: null,
          createdAt: Date.now(),
          updatedAt: Date.now(),
          tags: [],
        };
        addFile(newFile);
        setCurrentFile(newFile.id);
        openTab(newFile.id, newFile.name);
        setCommandPaletteOpen(false);
      },
    },
    {
      id: 'new-folder',
      name: 'Create New Folder',
      icon: <FolderPlus size={16} />,
      category: 'File',
      action: () => {
        const newFolder: FileNode = {
          id: uuidv4(),
          name: 'New Folder',
          type: 'folder',
          children: [],
          parentId: null,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };
        addFile(newFolder);
        setCommandPaletteOpen(false);
      },
    },
    {
      id: 'delete-file',
      name: 'Delete Current Note',
      icon: <Trash2 size={16} />,
      category: 'File',
      action: () => {
        if (currentFileId) {
          deleteFile(currentFileId);
        }
        setCommandPaletteOpen(false);
      },
    },
    {
      id: 'graph-view',
      name: 'Open Graph View',
      icon: <GitBranch size={16} />,
      category: 'View',
      action: () => {
        setGraphViewOpen(true);
        setCommandPaletteOpen(false);
      },
    },
    {
      id: 'view-edit',
      name: 'Switch to Edit Mode',
      icon: <Edit3 size={16} />,
      category: 'View',
      action: () => {
        setViewMode('edit');
        setCommandPaletteOpen(false);
      },
    },
    {
      id: 'view-preview',
      name: 'Switch to Preview Mode',
      icon: <Eye size={16} />,
      category: 'View',
      action: () => {
        setViewMode('preview');
        setCommandPaletteOpen(false);
      },
    },
    {
      id: 'view-split',
      name: 'Switch to Split Mode',
      icon: <Columns size={16} />,
      category: 'View',
      action: () => {
        setViewMode('split');
        setCommandPaletteOpen(false);
      },
    },
    {
      id: 'export-vault',
      name: 'Export Vault as JSON',
      icon: <Download size={16} />,
      category: 'Data',
      action: () => {
        const data = JSON.stringify(files, null, 2);
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'obsidian-vault.json';
        a.click();
        URL.revokeObjectURL(url);
        setCommandPaletteOpen(false);
      },
    },
    {
      id: 'import-vault',
      name: 'Import Vault from JSON',
      icon: <Upload size={16} />,
      category: 'Data',
      action: () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = (e) => {
          const file = (e.target as HTMLInputElement).files?.[0];
          if (file) {
            const reader = new FileReader();
            reader.onload = (ev) => {
              try {
                const data = JSON.parse(ev.target?.result as string);
                if (Array.isArray(data)) {
                  setFiles(data);
                }
              } catch (err) {
                console.error('Invalid JSON file');
              }
            };
            reader.readAsText(file);
          }
        };
        input.click();
        setCommandPaletteOpen(false);
      },
    },
    // Add file navigation commands
    ...files
      .filter((f) => f.type === 'file')
      .map((file) => ({
        id: `open-${file.id}`,
        name: `Open: ${file.name}`,
        icon: <Search size={16} />,
        category: 'Files',
        action: () => {
          setCurrentFile(file.id);
          openTab(file.id, file.name);
          setCommandPaletteOpen(false);
        },
      })),
  ];

  const filteredCommands = commands.filter(
    (cmd) =>
      cmd.name.toLowerCase().includes(query.toLowerCase()) ||
      cmd.category.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => Math.min(prev + 1, filteredCommands.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredCommands[selectedIndex]) {
        filteredCommands[selectedIndex].action();
      }
    } else if (e.key === 'Escape') {
      setCommandPaletteOpen(false);
    }
  };

  if (!commandPaletteOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]"
      onClick={() => setCommandPaletteOpen(false)}
    >
      <div
        className="w-full max-w-lg bg-[#1e1e2e] border border-[#2a2d3e] rounded-xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center px-4 py-3 border-b border-[#2a2d3e]">
          <Search size={18} className="text-gray-500 mr-3" />
          <input
            ref={inputRef}
            type="text"
            className="flex-1 bg-transparent text-white outline-none text-sm placeholder-gray-500"
            placeholder="Type a command or search..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
          />
        </div>
        <div className="max-h-80 overflow-y-auto py-2">
          {filteredCommands.length === 0 ? (
            <div className="px-4 py-8 text-center text-gray-500 text-sm">
              No results found
            </div>
          ) : (
            filteredCommands.map((cmd, idx) => (
              <button
                key={cmd.id}
                className={`w-full flex items-center gap-3 px-4 py-2 text-left text-sm transition-colors ${
                  idx === selectedIndex
                    ? 'bg-purple-600/20 text-white'
                    : 'text-gray-300 hover:bg-[#2a2d3e]'
                }`}
                onClick={cmd.action}
              >
                <span className="text-gray-400">{cmd.icon}</span>
                <span className="flex-1">{cmd.name}</span>
                <span className="text-xs text-gray-500">{cmd.category}</span>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
