export interface FileNode {
  id: string;
  name: string;
  type: 'file' | 'folder';
  content?: string;
  children?: FileNode[];
  parentId?: string | null;
  createdAt: number;
  updatedAt: number;
  tags?: string[];
}

export interface Tab {
  id: string;
  fileId: string;
  fileName: string;
  isActive: boolean;
}

export interface GraphNode {
  id: string;
  name: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  links: string[];
  tags: string[];
}

export interface GraphLink {
  source: string;
  target: string;
}

export interface Backlink {
  fileId: string;
  fileName: string;
  context: string;
}

export interface SyncStatus {
  isConnected: boolean;
  lastSynced: number | null;
  isSyncing: boolean;
  error: string | null;
}

export type ViewMode = 'edit' | 'preview' | 'split';
export type SidebarView = 'files' | 'search' | 'graph' | 'tags' | 'backlinks';
