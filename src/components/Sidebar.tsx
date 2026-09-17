import React, { useState } from 'react';
import { FileNode } from '../types';
import { useStore } from '../store';
import {
  FileText,
  Folder,
  FolderOpen,
  ChevronRight,
  ChevronDown,
  Plus,
  FolderPlus,
  Trash2,
  Edit3,
} from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

interface FileTreeItemProps {
  node: FileNode;
  depth: number;
}

function FileTreeItem({ node, depth }: FileTreeItemProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [isRenaming, setIsRenaming] = useState(false);
  const [newName, setNewName] = useState(node.name);
  const { setCurrentFile, openTab, updateFile, deleteFile, addFile } = useStore();

  const handleClick = () => {
    if (node.type === 'file') {
      setCurrentFile(node.id);
      openTab(node.id, node.name);
    } else {
      setIsOpen(!isOpen);
    }
  };

  const handleRename = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      updateFile(node.id, { name: newName });
      setIsRenaming(false);
    } else if (e.key === 'Escape') {
      setNewName(node.name);
      setIsRenaming(false);
    }
  };

  const handleNewFile = (e: React.MouseEvent) => {
    e.stopPropagation();
    const newFile: FileNode = {
      id: uuidv4(),
      name: 'Untitled',
      type: 'file',
      content: '# Untitled\n\nStart writing here...\n',
      parentId: node.id,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      tags: [],
    };
    addFile(newFile);
    setCurrentFile(newFile.id);
    openTab(newFile.id, newFile.name);
    setIsOpen(true);
  };

  const handleNewFolder = (e: React.MouseEvent) => {
    e.stopPropagation();
    const newFolder: FileNode = {
      id: uuidv4(),
      name: 'New Folder',
      type: 'folder',
      children: [],
      parentId: node.id,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    addFile(newFolder);
    setIsOpen(true);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(`Delete "${node.name}"?`)) {
      deleteFile(node.id);
    }
  };

  return (
    <div>
      <div
        className={`flex items-center gap-1 px-2 py-1 cursor-pointer hover:bg-[#2a2d2e] rounded text-sm group ${
          node.type === 'file' ? 'text-gray-300' : 'text-gray-200'
        }`}
        style={{ paddingLeft: `${depth * 16 + 8}px` }}
        onClick={handleClick}
        onDoubleClick={() => setIsRenaming(true)}
      >
        {node.type === 'folder' ? (
          <>
            {isOpen ? (
              <ChevronDown size={14} className="text-gray-500 flex-shrink-0" />
            ) : (
              <ChevronRight size={14} className="text-gray-500 flex-shrink-0" />
            )}
            {isOpen ? (
              <FolderOpen size={14} className="text-purple-400 flex-shrink-0" />
            ) : (
              <Folder size={14} className="text-purple-400 flex-shrink-0" />
            )}
          </>
        ) : (
          <>
            <span className="w-[14px] flex-shrink-0" />
            <FileText size={14} className="text-blue-400 flex-shrink-0" />
          </>
        )}
        {isRenaming ? (
          <input
            className="flex-1 bg-[#1a1a2e] text-white px-1 rounded border border-purple-500 outline-none text-sm"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={handleRename}
            onBlur={() => {
              updateFile(node.id, { name: newName });
              setIsRenaming(false);
            }}
            autoFocus
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          <span className="flex-1 truncate">{node.name}</span>
        )}
        <div className="hidden group-hover:flex items-center gap-0.5">
          {node.type === 'folder' && (
            <>
              <button
                onClick={handleNewFile}
                className="p-0.5 hover:bg-[#3a3d3e] rounded"
                title="New File"
              >
                <Plus size={12} className="text-gray-400" />
              </button>
              <button
                onClick={handleNewFolder}
                className="p-0.5 hover:bg-[#3a3d3e] rounded"
                title="New Folder"
              >
                <FolderPlus size={12} className="text-gray-400" />
              </button>
            </>
          )}
          <button
            onClick={() => setIsRenaming(true)}
            className="p-0.5 hover:bg-[#3a3d3e] rounded"
            title="Rename"
          >
            <Edit3 size={12} className="text-gray-400" />
          </button>
          <button
            onClick={handleDelete}
            className="p-0.5 hover:bg-[#3a3d3e] rounded"
            title="Delete"
          >
            <Trash2 size={12} className="text-gray-400" />
          </button>
        </div>
      </div>
      {node.type === 'folder' && isOpen && node.children && (
        <div>
          {node.children.map((child) => (
            <FileTreeItem key={child.id} node={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function Sidebar() {
  const { files, addFile, setCurrentFile, openTab } = useStore();

  const handleNewFile = () => {
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
  };

  const handleNewFolder = () => {
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
  };

  const rootFiles = files.filter((f) => !f.parentId);

  return (
    <div className="h-full flex flex-col bg-[#1e1e2e] border-r border-[#2a2d3e]">
      <div className="flex items-center justify-between px-3 py-2 border-b border-[#2a2d3e]">
        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
          Vault
        </span>
        <div className="flex items-center gap-1">
          <button
            onClick={handleNewFile}
            className="p-1 hover:bg-[#2a2d3e] rounded"
            title="New File"
          >
            <Plus size={14} className="text-gray-400" />
          </button>
          <button
            onClick={handleNewFolder}
            className="p-1 hover:bg-[#2a2d3e] rounded"
            title="New Folder"
          >
            <FolderPlus size={14} className="text-gray-400" />
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto py-1">
        {rootFiles.map((node) => (
          <FileTreeItem key={node.id} node={node} depth={0} />
        ))}
      </div>
    </div>
  );
}
