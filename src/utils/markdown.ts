import { FileNode, Backlink } from '../types';

export function extractLinks(content: string): string[] {
  const linkRegex = /\[\[([^\]]+)\]\]/g;
  const links: string[] = [];
  let match;
  while ((match = linkRegex.exec(content)) !== null) {
    links.push(match[1]);
  }
  return links;
}

export function extractTags(content: string): string[] {
  const tagRegex = /#([a-zA-Z0-9_-]+)/g;
  const tags: string[] = [];
  let match;
  while ((match = tagRegex.exec(content)) !== null) {
    tags.push(match[1]);
  }
  return [...new Set(tags)];
}

export function findBacklinks(files: FileNode[], targetFileName: string): Backlink[] {
  const backlinks: Backlink[] = [];
  
  for (const file of files) {
    if (file.type === 'file' && file.content) {
      const links = extractLinks(file.content);
      if (links.includes(targetFileName)) {
        // Find context around the link
        const regex = new RegExp(`\\[\\[${targetFileName}\\]\\]`, 'g');
        let match;
        while ((match = regex.exec(file.content)) !== null) {
          const start = Math.max(0, match.index - 50);
          const end = Math.min(file.content.length, match.index + match[0].length + 50);
          const context = file.content.substring(start, end).replace(/\n/g, ' ');
          backlinks.push({
            fileId: file.id,
            fileName: file.name,
            context: `...${context}...`,
          });
          break; // Only one backlink per file
        }
      }
    }
  }
  
  return backlinks;
}

export function getAllTags(files: FileNode[]): { tag: string; count: number }[] {
  const tagMap = new Map<string, number>();
  
  for (const file of files) {
    if (file.type === 'file' && file.content) {
      const tags = extractTags(file.content);
      for (const tag of tags) {
        tagMap.set(tag, (tagMap.get(tag) || 0) + 1);
      }
    }
  }
  
  return Array.from(tagMap.entries())
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count);
}

export function searchFiles(files: FileNode[], query: string): FileNode[] {
  if (!query.trim()) return [];
  
  const lowerQuery = query.toLowerCase();
  return files.filter((file) => {
    if (file.type === 'folder') return false;
    const nameMatch = file.name.toLowerCase().includes(lowerQuery);
    const contentMatch = file.content?.toLowerCase().includes(lowerQuery);
    const tagMatch = file.tags?.some((t) => t.toLowerCase().includes(lowerQuery));
    return nameMatch || contentMatch || tagMatch;
  });
}

export function processWikiLinks(content: string, onLinkClick: (name: string) => void): string {
  return content.replace(
    /\[\[([^\]]+)\]\]/g,
    (_, name) => `<a href="#" class="wiki-link" data-link="${name}">${name}</a>`
  );
}

export function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
