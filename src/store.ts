import { create } from 'zustand';
import { FileNode, Tab, ViewMode, SidebarView, SyncStatus, Backlink } from './types';
import { v4 as uuidv4 } from 'uuid';

interface AppState {
  // Files
  files: FileNode[];
  currentFileId: string | null;
  tabs: Tab[];
  
  // UI State
  viewMode: ViewMode;
  sidebarView: SidebarView;
  sidebarOpen: boolean;
  rightPanelOpen: boolean;
  searchQuery: string;
  commandPaletteOpen: boolean;
  graphViewOpen: boolean;
  
  // Sync
  syncStatus: SyncStatus;
  
  // Backlinks
  backlinks: Backlink[];
  
  // Actions
  setFiles: (files: FileNode[]) => void;
  addFile: (file: FileNode) => void;
  updateFile: (id: string, updates: Partial<FileNode>) => void;
  deleteFile: (id: string) => void;
  setCurrentFile: (id: string | null) => void;
  
  // Tabs
  openTab: (fileId: string, fileName: string) => void;
  closeTab: (id: string) => void;
  setActiveTab: (id: string) => void;
  
  // UI
  setViewMode: (mode: ViewMode) => void;
  setSidebarView: (view: SidebarView) => void;
  toggleSidebar: () => void;
  toggleRightPanel: () => void;
  setSearchQuery: (query: string) => void;
  setCommandPaletteOpen: (open: boolean) => void;
  setGraphViewOpen: (open: boolean) => void;
  
  // Sync
  setSyncStatus: (status: Partial<SyncStatus>) => void;
  
  // Backlinks
  setBacklinks: (backlinks: Backlink[]) => void;
}

const defaultFiles: FileNode[] = [
  {
    id: '1',
    name: 'Welcome',
    type: 'file',
    content: `# Welcome to Obsidian Web\n\nThis is a web-based clone of Obsidian, the powerful knowledge management tool.\n\n## Features\n\n- 📝 **Markdown Editor** with live preview\n- 📊 **Graph View** to visualize your knowledge connections\n- 🔗 **Backlinks** to see what links to your notes\n- 🏷️ **Tags** to organize your notes\n- 🔍 **Quick Search** to find anything\n- ⌨️ **Command Palette** (Ctrl+P) for quick actions\n- 📁 **File Explorer** for managing your vault\n- ☁️ **Google Drive Sync** to keep your notes safe\n\n## Getting Started\n\nCreate a new note using the command palette (Ctrl+P) or the file explorer.\n\nLink to other notes using [[Welcome]] or [[Getting Started]] syntax.\n\n#welcome #getting-started`,
    parentId: null,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    tags: ['welcome', 'getting-started'],
  },
  {
    id: '2',
    name: 'Getting Started',
    type: 'file',
    content: `# Getting Started\n\nWelcome to your new vault! Here's how to get started.\n\n## Creating Notes\n\nUse the command palette (Ctrl+P) and type "New Note" to create a new file.\n\n## Linking Notes\n\nUse wiki-style links to connect your notes:\n- [[Welcome]] - The welcome page\n- [[Markdown Guide]] - Learn markdown syntax\n\n## Tags\n\nAdd tags to your notes using #hashtags. Tags help organize your knowledge.\n\n## Graph View\n\nClick the graph icon in the sidebar to see how your notes are connected.\n\n#guide #tutorial`,
    parentId: null,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    tags: ['guide', 'tutorial'],
  },
  {
    id: '3',
    name: 'Markdown Guide',
    type: 'file',
    content: `# Markdown Guide\n\nThis is a guide to markdown syntax supported in this editor.\n\n## Text Formatting\n\n- **Bold text** using \\*\\*double asterisks\\*\\*\n- *Italic text* using \\*single asterisks\\*\n- ~~Strikethrough~~ using \\~\\~tildes\\~\\~\n- \`Inline code\` using backticks\n\n## Lists\n\n### Unordered\n- Item 1\n- Item 2\n  - Nested item\n  - Another nested item\n\n### Ordered\n1. First item\n2. Second item\n3. Third item\n\n## Links\n\n- [External link](https://example.com)\n- [[Welcome]] - Internal wiki link\n\n## Code Blocks\n\n\`\`\`javascript\nfunction hello() {\n  console.log("Hello, World!");\n}\n\`\`\`\n\n## Blockquotes\n\n> This is a blockquote.\n> It can span multiple lines.\n\n## Tables\n\n| Header 1 | Header 2 | Header 3 |\n|----------|----------|----------|\n| Cell 1   | Cell 2   | Cell 3   |\n| Cell 4   | Cell 5   | Cell 6   |\n\n## Task Lists\n\n- [x] Completed task\n- [ ] Incomplete task\n- [ ] Another task\n\n#markdown #guide #reference`,
    parentId: null,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    tags: ['markdown', 'guide', 'reference'],
  },
  {
    id: '4',
    name: 'Daily Notes',
    type: 'folder',
    children: [],
    parentId: null,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  {
    id: '5',
    name: 'Projects',
    type: 'folder',
    children: [],
    parentId: null,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
];

export const useStore = create<AppState>((set, get) => ({
  files: defaultFiles,
  currentFileId: '1',
  tabs: [{ id: 'tab-1', fileId: '1', fileName: 'Welcome', isActive: true }],
  
  viewMode: 'split',
  sidebarView: 'files',
  sidebarOpen: true,
  rightPanelOpen: false,
  searchQuery: '',
  commandPaletteOpen: false,
  graphViewOpen: false,
  
  syncStatus: {
    isConnected: false,
    lastSynced: null,
    isSyncing: false,
    error: null,
  },
  
  backlinks: [],
  
  setFiles: (files) => set({ files }),
  
  addFile: (file) => set((state) => ({ 
    files: [...state.files, file],
  })),
  
  updateFile: (id, updates) => set((state) => ({
    files: state.files.map((f) => 
      f.id === id ? { ...f, ...updates, updatedAt: Date.now() } : f
    ),
  })),
  
  deleteFile: (id) => set((state) => ({
    files: state.files.filter((f) => f.id !== id),
    tabs: state.tabs.filter((t) => t.fileId !== id),
    currentFileId: state.currentFileId === id ? null : state.currentFileId,
  })),
  
  setCurrentFile: (id) => set({ currentFileId: id }),
  
  openTab: (fileId, fileName) => set((state) => {
    const existing = state.tabs.find((t) => t.fileId === fileId);
    if (existing) {
      return {
        tabs: state.tabs.map((t) => ({ ...t, isActive: t.id === existing.id })),
        currentFileId: fileId,
      };
    }
    const newTab: Tab = {
      id: uuidv4(),
      fileId,
      fileName,
      isActive: true,
    };
    return {
      tabs: [...state.tabs.map((t) => ({ ...t, isActive: false })), newTab],
      currentFileId: fileId,
    };
  }),
  
  closeTab: (id) => set((state) => {
    const tab = state.tabs.find((t) => t.id === id);
    const newTabs = state.tabs.filter((t) => t.id !== id);
    let newCurrentFileId = state.currentFileId;
    
    if (tab?.isActive && newTabs.length > 0) {
      const idx = state.tabs.findIndex((t) => t.id === id);
      const newActive = newTabs[Math.min(idx, newTabs.length - 1)];
      newActive.isActive = true;
      newCurrentFileId = newActive.fileId;
    }
    
    return {
      tabs: newTabs,
      currentFileId: newTabs.length === 0 ? null : newCurrentFileId,
    };
  }),
  
  setActiveTab: (id) => set((state) => ({
    tabs: state.tabs.map((t) => ({ ...t, isActive: t.id === id })),
    currentFileId: state.tabs.find((t) => t.id === id)?.fileId || null,
  })),
  
  setViewMode: (mode) => set({ viewMode: mode }),
  setSidebarView: (view) => set({ sidebarView: view, sidebarOpen: true }),
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  toggleRightPanel: () => set((state) => ({ rightPanelOpen: !state.rightPanelOpen })),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setCommandPaletteOpen: (open) => set({ commandPaletteOpen: open }),
  setGraphViewOpen: (open) => set({ graphViewOpen: open }),
  
  setSyncStatus: (status) => set((state) => ({
    syncStatus: { ...state.syncStatus, ...status },
  })),
  
  setBacklinks: (backlinks) => set({ backlinks }),
}));
