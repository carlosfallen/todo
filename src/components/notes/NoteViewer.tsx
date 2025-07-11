import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Note } from '../../types';

interface NoteViewerProps {
  note: Note;
}
 
const NoteViewer: React.FC<NoteViewerProps> = ({ note }) => {
  return (
    <div className="h-full overflow-y-auto">
      <div className="surface-container">
        <div className="max-w-4xl mx-auto p-6 lg:p-8">
          <div className="prose prose-lg prose-invert max-w-none">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                h1: ({ children }) => (
                  <h1 className="text-display-small text-surface-300 mb-6 border-b border-surface-800 pb-4">
                    {children}
                  </h1>
                ),
                h2: ({ children }) => (
                  <h2 className="text-headline-medium text-surface-300 mt-8 mb-4">
                    {children}
                  </h2>
                ),
                h3: ({ children }) => (
                  <h3 className="text-headline-small text-surface-300 mt-6 mb-3">
                    {children}
                  </h3>
                ),
                h4: ({ children }) => (
                  <h4 className="text-title-large text-surface-300 mt-4 mb-2">
                    {children}
                  </h4>
                ),
                h5: ({ children }) => (
                  <h5 className="text-title-medium text-surface-300 mt-4 mb-2">
                    {children}
                  </h5>
                ),
                h6: ({ children }) => (
                  <h6 className="text-title-small text-surface-300 mt-4 mb-2">
                    {children}
                  </h6>
                ),
                p: ({ children }) => (
                  <p className="text-body-large text-surface-300 mb-4 leading-relaxed">
                    {children}
                  </p>
                ),
                strong: ({ children }) => (
                  <strong className="font-semibold text-surface-300">
                    {children}
                  </strong>
                ),
                em: ({ children }) => (
                  <em className="italic text-surface-300">
                    {children}
                  </em>
                ),
                code: ({ children, className }) => {
                  const isInline = !className;
                  if (isInline) {
                    return (
                      <code className="bg-surface-800 text-secondary-400 px-2 py-1 rounded text-body-medium font-mono">
                        {children}
                      </code>
                    );
                  }
                  return (
                    <code className="block bg-surface-800 text-secondary-400 p-4 rounded-xl text-body-medium font-mono overflow-x-auto">
                      {children}
                    </code>
                  );
                },
                pre: ({ children }) => (
                  <pre className="bg-surface-800 text-secondary-400 p-4 rounded-xl overflow-x-auto mb-4 border border-surface-700">
                    {children}
                  </pre>
                ),
                ul: ({ children }) => (
                  <ul className="list-disc list-inside mb-4 space-y-2 text-body-large text-surface-300">
                    {children}
                  </ul>
                ),
                ol: ({ children }) => (
                  <ol className="list-decimal list-inside mb-4 space-y-2 text-body-large text-surface-300">
                    {children}
                  </ol>
                ),
                li: ({ children }) => (
                  <li className="text-body-large text-surface-300">
                    {children}
                  </li>
                ),
                blockquote: ({ children }) => (
                  <blockquote className="border-l-4 border-primary-600 pl-4 py-2 mb-4 bg-surface-800 rounded-r-xl">
                    <div className="text-body-large text-surface-400 italic">
                      {children}
                    </div>
                  </blockquote>
                ),
                a: ({ href, children }) => (
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary-400 hover:text-primary-300 underline"
                  >
                    {children}
                  </a>
                ),
                table: ({ children }) => (
                  <div className="overflow-x-auto mb-4">
                    <table className="min-w-full border border-surface-700 rounded-xl">
                      {children}
                    </table>
                  </div>
                ),
                thead: ({ children }) => (
                  <thead className="bg-surface-800">
                    {children}
                  </thead>
                ),
                th: ({ children }) => (
                  <th className="px-4 py-2 text-left text-body-medium font-semibold text-surface-300 border-b border-surface-700">
                    {children}
                  </th>
                ),
                td: ({ children }) => (
                  <td className="px-4 py-2 text-body-medium text-surface-300 border-b border-surface-700">
                    {children}
                  </td>
                ),
                hr: () => (
                  <hr className="my-8 border-surface-700" />
                ),
                input: ({ type, checked, disabled }) => {
                  if (type === 'checkbox') {
                    return (
                      <input
                        type="checkbox"
                        checked={checked}
                        disabled={disabled}
                        className="mr-2 h-4 w-4 text-primary-600 rounded border-surface-700 focus:ring-primary-500 bg-surface-800"
                        readOnly
                      />
                    );
                  }
                  return null;
                }
              }}
            >
              {note.content}
            </ReactMarkdown>
          </div>

          {note.tags.length > 0 && (
            <div className="mt-8 pt-6 border-t border-surface-800">
              <h4 className="text-title-medium text-surface-300 mb-3">Tags</h4>
              <div className="flex flex-wrap gap-2">
                {note.tags.map((tag) => (
                  <span
                    key={tag}
                    className="bg-primary-600/20 text-primary-400 px-3 py-1 rounded-full text-label-medium"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="mt-8 pt-6 border-t border-surface-800 text-body-small text-surface-500">
            <p>
              Criado em {new Date(note.createdAt).toLocaleDateString('pt-BR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>
            {note.updatedAt !== note.createdAt && (
              <p>
                Atualizado em {new Date(note.updatedAt).toLocaleDateString('pt-BR', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NoteViewer;