import React, { useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useStore } from '../store';

export default function Preview() {
  const { files, currentFileId, setCurrentFile, openTab } = useStore();
  const previewRef = useRef<HTMLDivElement>(null);
  const currentFile = files.find((f) => f.id === currentFileId);

  useEffect(() => {
    if (previewRef.current) {
      const links = previewRef.current.querySelectorAll('.wiki-link');
      links.forEach((link) => {
        link.addEventListener('click', (e) => {
          e.preventDefault();
          const targetName = (e.target as HTMLElement).getAttribute('data-link');
          if (targetName) {
            const targetFile = files.find((f) => f.name === targetName);
            if (targetFile) {
              setCurrentFile(targetFile.id);
              openTab(targetFile.id, targetFile.name);
            }
          }
        });
      });
    }
  }, [currentFile?.content, files, setCurrentFile, openTab]);

  if (!currentFile || currentFile.type === 'folder') {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#1e1e2e]">
        <p className="text-gray-500">No file selected</p>
      </div>
    );
  }

  // Process wiki links in content
  const processedContent = (currentFile.content || '').replace(
    /\[\[([^\]]+)\]\]/g,
    (_, name) => `[${name}](#wiki:${name})`
  );

  return (
    <div
      ref={previewRef}
      className="flex-1 h-full overflow-y-auto bg-[#1e1e2e] p-6 prose prose-invert max-w-none"
    >
      <div className="markdown-preview">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            a: ({ href, children, ...props }) => {
              if (href?.startsWith('#wiki:')) {
                const name = href.replace('#wiki:', '');
                return (
                  <a
                    href="#"
                    className="wiki-link text-purple-400 hover:text-purple-300 underline"
                    data-link={name}
                    {...props}
                  >
                    {children}
                  </a>
                );
              }
              return (
                <a
                  href={href}
                  className="text-blue-400 hover:text-blue-300 underline"
                  target="_blank"
                  rel="noopener noreferrer"
                  {...props}
                >
                  {children}
                </a>
              );
            },
            h1: ({ children }) => (
              <h1 className="text-3xl font-bold text-white mt-8 mb-4 border-b border-[#2a2d3e] pb-2">
                {children}
              </h1>
            ),
            h2: ({ children }) => (
              <h2 className="text-2xl font-semibold text-white mt-6 mb-3">
                {children}
              </h2>
            ),
            h3: ({ children }) => (
              <h3 className="text-xl font-semibold text-white mt-4 mb-2">
                {children}
              </h3>
            ),
            p: ({ children }) => (
              <p className="text-gray-300 leading-relaxed mb-3">{children}</p>
            ),
            code: ({ className, children, ...props }) => {
              const isInline = !className;
              if (isInline) {
                return (
                  <code className="bg-[#2a2d3e] text-purple-300 px-1.5 py-0.5 rounded text-sm font-mono">
                    {children}
                  </code>
                );
              }
              return (
                <code className={`${className} text-sm`} {...props}>
                  {children}
                </code>
              );
            },
            pre: ({ children }) => (
              <pre className="bg-[#0d0d1a] border border-[#2a2d3e] rounded-lg p-4 overflow-x-auto my-4">
                {children}
              </pre>
            ),
            blockquote: ({ children }) => (
              <blockquote className="border-l-4 border-purple-500 pl-4 my-4 text-gray-400 italic">
                {children}
              </blockquote>
            ),
            ul: ({ children }) => (
              <ul className="list-disc list-inside text-gray-300 mb-3 space-y-1">
                {children}
              </ul>
            ),
            ol: ({ children }) => (
              <ol className="list-decimal list-inside text-gray-300 mb-3 space-y-1">
                {children}
              </ol>
            ),
            li: ({ children }) => (
              <li className="text-gray-300">{children}</li>
            ),
            table: ({ children }) => (
              <div className="overflow-x-auto my-4">
                <table className="min-w-full border border-[#2a2d3e] rounded">
                  {children}
                </table>
              </div>
            ),
            th: ({ children }) => (
              <th className="border border-[#2a2d3e] px-4 py-2 bg-[#2a2d3e] text-left text-gray-200 font-semibold">
                {children}
              </th>
            ),
            td: ({ children }) => (
              <td className="border border-[#2a2d3e] px-4 py-2 text-gray-300">
                {children}
              </td>
            ),
            hr: () => <hr className="border-[#2a2d3e] my-6" />,
            input: ({ type, checked, ...props }) => {
              if (type === 'checkbox') {
                return (
                  <input
                    type="checkbox"
                    checked={checked}
                    className="mr-2 accent-purple-500"
                    readOnly
                    {...props}
                  />
                );
              }
              return <input type={type} {...props} />;
            },
          }}
        >
          {processedContent}
        </ReactMarkdown>
      </div>
    </div>
  );
}
